/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import uuid from 'uuid/v4';

import {for_each} from '../utils/array';

import logger from '../log.js';

import HttpCommand from './http';
import GmpCommand from './gmp';
import registerCommand from '../command';

const log = logger.getLogger('gmp.commands.dashboards');

const createRow = (items, height) => ({
  id: uuid(),
  height,
  items,
});

const createItem = props => {
  const id = uuid();

  return {
    id,
    ...props,
  };
};

const settingsV1toDashboardSettings = ({data: rows} = {}) => ({
  rows: rows.map(({height, data}) =>
    createRow(data.map(item => createItem({
      name: item.name,
      filterId: item.filt_id,
    })), height)),
  });

const convertLoadedSettings = (settings = {}) => {
  if (settings.version === 1) {
    return settingsV1toDashboardSettings(settings);
  }
  return settings;
};

class DashboardsCommand extends HttpCommand {

  currentSettings(options = {}) {
    return this.httpGet({
      cmd: 'get_dashboard_settings',
    }, options,
    ).then(response => {
      const {setting: prefs} = response.data.get_dashboard_settings
        .get_settings_response;

      log.debug('DashboardSettings loaded', prefs);

      const allSettings = {};

      for_each(prefs, pref => {
        const {_id: id, value} = pref;

        let settings;
        try {
          settings = JSON.parse(value);
        }
        catch (e) {
          log.warn('Could not parse dashboard setting', pref);
          return;
        }

        try {
          allSettings[id] = convertLoadedSettings(settings);
        }
        catch (e) {
          log.warn('Could not convert dashboard setting', settings);
          return;
        }
      });

      return response.setData(allSettings);
    });
  }
}

class DashboardCommand extends GmpCommand {

  saveSetting(id, settings) {
    log.debug('Saving dashboard settings', id, settings);
    return this.action({
      setting_id: id,
      setting_value: JSON.stringify(settings),
      cmd: 'save_setting',
    });
  }

}

registerCommand('dashboard', DashboardCommand);
registerCommand('dashboards', DashboardsCommand);

// vim: set ts=2 sw=2 tw=80:
