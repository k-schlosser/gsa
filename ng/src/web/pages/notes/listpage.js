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

import _ from 'gmp/locale.js';

import IconDivider from '../../components/layout/icondivider.js';

import PropTypes from '../../utils/proptypes.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import DashboardControls from '../../components/dashboard2/controls';

import ManualIcon from '../../components/icon/manualicon.js';
import NewIcon from '../../components/icon/newicon.js';

import FilterDialog from './filterdialog.js';
import NotesTable from './table.js';
import NoteComponent from './component.js';

import {NOTES_FILTER_FILTER} from 'gmp/models/filter.js';

import NotesDashboard, {NOTES_DASHBOARD_ID} from './dashboard/index.js';

const ToolBarIcons = ({onNoteCreateClick}, {capabilities}) => {
  return (
    <IconDivider>
      <ManualIcon
        page="vulnerabilitymanagement"
        anchor="notes"
        title={_('Help: Notes')}/>
      {capabilities.mayCreate('note') &&
        <NewIcon
          title={_('New Note')}
          onClick={onNoteCreateClick}/>
      }
    </IconDivider>
  );
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

ToolBarIcons.propTypes = {
  onNoteCreateClick: PropTypes.func,
};

const Page = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <NoteComponent
    onCreated={onChanged}
    onCloned={onChanged}
    onCloneError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
    onSaved={onChanged}
  >
    {({
      clone,
      create,
      delete: delete_func,
      download,
      edit,
    }) => (
      <EntitiesPage
        {...props}
        filterEditDialog={FilterDialog}
        sectionIcon="note.svg"
        table={NotesTable}
        title={_('Notes')}
        toolBarIcons={ToolBarIcons}
        onError={onError}
        onNoteCloneClick={clone}
        onNoteCreateClick={create}
        onNoteDeleteClick={delete_func}
        onNoteDownloadClick={download}
        onNoteEditClick={edit}
      />
    )}
  </NoteComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntitiesContainer('note', {
  dashboard2: NotesDashboard,
  dashboardControls: () => (
    <DashboardControls dashboardId={NOTES_DASHBOARD_ID}/>
  ),
  extraLoadParams: {details: 1},
  filtersFilter: NOTES_FILTER_FILTER,
})(Page);

// vim: set ts=2 sw=2 tw=80:
