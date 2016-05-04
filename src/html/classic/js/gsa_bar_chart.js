/*
 * Greenbone Security Assistant
 * $Id$
 * Description: Base JavaScript for graphics in GSA.
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2014 - 2016 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

(function(global, window, d3, console, gsa) {
  'use strict';

  gsa.register_chart_generator('bar', BarChartGenerator);

  function default_bar_style(d) {
    return ('');
  }

  /* Main chart generator */
  function BarChartGenerator() {
    // call super constructor
    gsa.BaseChartGenerator.call(this, 'bar');
  }

  BarChartGenerator.prototype = Object.create(gsa.BaseChartGenerator.prototype);
  BarChartGenerator.prototype.constructor = BarChartGenerator;

  BarChartGenerator.prototype.init = function() {
    this.margin = {top: 40, right: 20, bottom: 40, left: 60};

    this.x_scale = d3.scale.ordinal();
    this.y_scale = d3.scale.linear();

    this.x_axis = d3.svg.axis().scale(this.x_scale).orient('bottom');
    this.y_axis = d3.svg.axis().scale(this.y_scale).orient('left');

    this.x_label = '';
    this.y_label = '';

    this.x_field = 'value';
    this.y_field = 'count';

    this.show_stat_type = true;

    this.setBarStyle(default_bar_style);
    this.setTitleGenerator(gsa.title_static(
      gsa._('Loading bar chart ...'), gsa._('Bar Chart')));
  };

  BarChartGenerator.prototype.generate = function(controller, data,
      gen_params) {
    var display = controller.display();
    var update = this.mustUpdate(display);

    var self = this;

    this.noChartLinks = controller.display().dashboard().noChartLinks();

    // evaluate options set by gen_params
    if (gen_params.x_field) {
      this.x_field = gen_params.x_field;
    }

    if (gen_params.y_fields && gen_params.y_fields[0]) {
      this.y_field = gen_params.y_fields[0];
    }

    if (gen_params.extra.show_stat_type) {
      this.show_stat_type = !!JSON.parse(gen_params.extra.show_stat_type);
    }

    var records = data.records;
    display.setTitle(this.title_generator(data));

    var x_data = records.map(function(d) { return d[self.x_field]; });
    var y_data = records.map(function(d) { return d[self.y_field]; });

    var y_sum = 0;

    for (var i in y_data) {
      y_sum += y_data[i];
    }

    var y_max = Math.max.apply(null, y_data);

    // Setup display parameters
    var height = display.svg().attr('height') - this.margin.top -
      this.margin.bottom;
    var width = display.svg().attr('width') - this.margin.left -
      this.margin.right;

    this.x_scale.rangeRoundBands([0, width], 0.125);
    this.y_scale.range([height, 0]);

    this.x_scale.domain(x_data);
    this.y_scale.domain([0, Math.max.apply(null, y_data)]).nice(10);

    if (!update) {
      display.svg().text('');
      this.svg = display.svg().append('g');

      display.svg().on('mousemove', null);
      display.svg().on('mouseleave', null);

      this.svg.attr('transform', 'translate(' + this.margin.left + ',' +
            this.margin.top + ')');

      this.x_axis_elem = this.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(this.x_axis);

      this.y_axis_elem = this.svg.append('g')
        .attr('class', 'y axis')
        .call(this.y_axis);

      this.tip = d3.tip()
        .attr('class', 'd3-tip')
        .style('font-weight', 'normal')
        .offset([-10, 0])
        .html(function(d) {
          var x, extra;
          if (d[self.x_field + '~long']) {
            x = d[self.x_field + '~long'];
          }
          else {
            x = d[self.x_field];
          }

          extra = '';
          if (gen_params.extra && gen_params.extra.extra_tooltip_field_1) {
            var index = 1;

            while (gen_params.extra ['extra_tooltip_field_' + index] !==
                   undefined) {
              var field = gen_params.extra ['extra_tooltip_field_' + index];
              var label = gen_params.extra ['extra_tooltip_label_' + index]

              if (label) {
                extra += '<br/><strong>' + label + ':</strong> ';
              }
              else {
                extra += '<br/>'
              }

              if (gsa.is_date (d[field])) {
                extra += gsa.datetime_format (d[field]);
              }
              else {
                extra += d[field]
              }

              index ++;
            }
          }

          if (self.y_field === 'count') {
            if (self.y_label !== '') {
              return '<strong>' + self.y_label + ' (' + x +
                  '):</strong><br/> ' + d[self.y_field] + ' (' +
                  (100 * d[self.y_field] / y_sum).toFixed(1) + '%)' +
                  extra;
            }
            else {
              return '<strong>' + x + ':</strong><br/> ' + d[self.y_field] +
                  ' (' + (100 * d[self.y_field] / y_sum).toFixed(1) + '%)' +
                  extra;
            }
          }
          else if (self.y_field.indexOf ('severity') !== -1) {
            if (self.y_label !== '') {
              return '<strong>' + self.y_label + ' (' + x +
                  '):</strong><br/> ' + d[self.y_field].toFixed(1) +
                  ' (' + gsa.severity_level(d[self.y_field]) + ')' +
                  extra;
            }
            else {
              return '<strong>' + x + ':</strong><br/> ' +
                  d[self.y_field].toFixed(1) +
                  ' (' + gsa.severity_level(d[self.y_field]) + ')' +
                  extra;
            }
          }
          else {
            if (self.y_label !== '') {
              return '<strong>' + self.y_label + ' (' + x +
                  '):</strong><br/> ' + d[self.y_field] + ' (' +
                  (100 * d[self.y_field] / y_max).toFixed(1) + '%)' +
                  extra;
            }
            else {
              return '<strong>' + x + ':</strong><br/> ' + d[self.y_field] +
                  ' (' + (100 * d[self.y_field] / y_max).toFixed(1) + '%)' +
                  extra;
            }
          }
        });
    }

    // Function to generate link URLs
    function generateLink(d, i) {
      if (self.noChartLinks) {
        return null;
      }
      var column = data.column_info.columns.value.column;
      var type = data.column_info.columns.value.type;
      var value = d.value;

      if (column === 'uuid') {
        return gsa.details_page_url(type, value, data.filter_info);
      } else {
        return gsa.filtered_list_url(type, column, value, data.filter_info);
      }
    }

    // Add new bars
    this.svg.selectAll('.bar')
      .data(records).enter().insert('a')
        .attr('class', 'bar')
        .attr('xlink:href', generateLink)
        .insert('rect', '.x.axis')
          .attr('x', function(d) { return self.x_scale(d[self.x_field]); })
          .attr('y', function(d) { return self.y_scale(0); })
          .attr('width', function(d) { return self.x_scale.rangeBand(); })
          .attr('height', function(d) {
            return height - self.y_scale(0);
          })
          .on('mouseover', this.tip.show)
          .on('mouseout', this.tip.hide);

    // Update bar widths and x axis
    this.svg.selectAll('.bar rect')
      .data(records)
        .transition().delay(0).duration(250).ease('sin-in-out')
          .attr('x', function(d) { return self.x_scale(d[self.x_field]); })
          .attr('width', self.x_scale.rangeBand());

    this.x_axis_elem.transition().delay(0).duration(250).ease('sin-in-out')
      .call(this.x_axis).delay(250).duration(125).attr(
        'transform', 'translate(0,' + height + ')');

    // Update heights and y axis
    this.svg.selectAll('.bar rect')
      .data(records)
        .transition().delay(250).duration(250).ease('sin-in-out')
          .attr('y', function(d) { return self.y_scale(d[self.y_field]); })
          .attr('height', function(d) {
            return height - self.y_scale(d[self.y_field]);
          })
          .attr('style', this.bar_style);

    this.y_axis_elem.transition().delay(250).duration(125).ease('sin-in-out')
      .call(this.y_axis);

    // Fade out and remove unused bars
    this.svg.selectAll('.bar rect')
      .data(records)
        .exit()
          .transition().delay(0).duration(250).ease('sin-in-out')
            .style('opacity', 0)
            .remove();

    this.svg.call(this.tip);
  };

  BarChartGenerator.prototype.generateData = function(controller, original_data,
      gen_params) {
    // Extract records and column info
    var cmd = controller.data_src().command();
    if (cmd === 'get_aggregate') {
      return this.transformData(original_data, gen_params);
    }
    else {
      console.error('Unsupported command:' + cmd);
      return null;
    }
  };

  BarChartGenerator.prototype.generateCsvData = function(controller, data) {
    var cols = data.column_info.columns;
    return gsa.csv_from_records(data.records, data.column_info,
        [this.x_field, this.y_field],
        [gsa.column_label(cols[this.x_field], true, false, this.show_stat_type),
        gsa.column_label(cols[this.y_field], true, false, this.show_stat_type)],
        controller.display().header().text());

  };

  BarChartGenerator.prototype.generateHtmlTableData = function(controller,
      data) {
    var cols = data.column_info.columns;
    return gsa.html_table_from_records(data.records, data.column_info,
        [this.x_field, this.y_field],
        [gsa.column_label(cols[this.x_field], true, false, this.show_stat_type),
        gsa.column_label(cols[this.y_field], true, false, this.show_stat_type)],
        controller.display().header().text(),
        controller.data_src().param('filter'));
  };

})(window, window, window.d3, window.console, window.gsa);

// vim: set ts=2 sw=2 tw=80:
