/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import React from 'react';

import _ from 'gmp/locale';

import {SECINFO_FILTER_FILTER} from 'gmp/models/filter';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import DashboardControls from 'web/components/dashboard/controls';

import ManualIcon from 'web/components/icon/manualicon';

import SecInfoFilterDialog from './filterdialog';
import SecInfosTable from './table';

import {
  SecInfoDashboard,
  SECINFO_DASHBOARD_ID,
} from './dashboard';

const ToolBarIcons = () => (
  <ManualIcon
    page="vulnerabilitymanagement"
    anchor="secinfo-management"
    title={_('Help: All SecInfo Information')}
  />
);

const Page = props => (
  <EntitiesPage
    {...props}
    createFilterType="info"
    dashboard2={SecInfoDashboard}
    dashboardControls={() => (
      <DashboardControls dashboardId={SECINFO_DASHBOARD_ID}/>
    )}
    filterEditDialog={SecInfoFilterDialog}
    filtersFilter={SECINFO_FILTER_FILTER}
    sectionIcon="allinfo.svg"
    table={SecInfosTable}
    title={_('All SecInfo Information')}
    toolBarIcons={ToolBarIcons}
  />
);

export default withEntitiesContainer('secinfo', {
})(Page);

// vim: set ts=2 sw=2 tw=80:
