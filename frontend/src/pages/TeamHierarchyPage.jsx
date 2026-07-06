import { useState } from 'react';

import ManagementPage from '../components/management/ManagementPage.jsx';
import OrgChartView from '../components/orgChart/OrgChartView.jsx';
import cxoTeamApiService from '../api/services/cxoTeamApiService.js';
import {
  CXO_TEAM_COLUMNS,
  CXO_TEAM_FILTERS,
  CXO_TEAM_FIELDS,
  CXO_TEAM_EMPTY_VALUES,
  CXO_TEAM_CSV_CONFIG,
} from '../features/cxoTeams/cxoTeam.management.config.js';

const config = {
  apiService: cxoTeamApiService,
  resourceLabel: 'Team Member',
  emptyValues: CXO_TEAM_EMPTY_VALUES,
  fields: CXO_TEAM_FIELDS,
  csv: CXO_TEAM_CSV_CONFIG,
  getRowLabel: (row) => row?.name,
};

const VIEWS = [
  { id: 'chart', label: 'Org Chart' },
  { id: 'table', label: 'Table' },
];

/**
 * Reference implementation of the generic ManagementPage, plus an Org
 * Chart view (components/orgChart/OrgChartView.jsx) for the same
 * cxo_teams data -- a top-down, pannable/zoomable reporting-hierarchy
 * chart built from the `manager` self-reference every record already
 * has. Business Teams and Permissions (see pages/BusinessTeamsPage.jsx
 * and pages/PermissionsPage.jsx) still follow ManagementPage's plain
 * shape -- the view toggle here is specific to this page, since a flat
 * roster only makes sense to chart when it has this kind of hierarchy.
 */
export default function TeamHierarchyPage() {
  const [view, setView] = useState('chart');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Team Members</h1>
          <p className="text-sm text-slate-500">Leadership roster and reporting structure.</p>
        </div>

        <div className="flex gap-1 border-b border-slate-200">
          {VIEWS.map((viewOption) => (
            <button
              key={viewOption.id}
              type="button"
              onClick={() => setView(viewOption.id)}
              className={`px-3 py-2 text-sm font-medium ${
                view === viewOption.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {viewOption.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'chart' ? (
        <OrgChartView />
      ) : (
        <ManagementPage
          title="Team Members"
          description="Leadership roster and reporting structure."
          columns={CXO_TEAM_COLUMNS}
          filters={CXO_TEAM_FILTERS}
          config={config}
          hideHeader
        />
      )}
    </div>
  );
}
