import ManagementPage from '../components/management/ManagementPage.jsx';
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

/**
 * Reference implementation of the generic ManagementPage. Business
 * Teams and Permissions (see pages/BusinessTeamsPage.jsx and
 * pages/PermissionsPage.jsx) follow this exact shape with a different
 * config -- none of them re-implement fetching, modals, or bulk actions.
 */
export default function TeamHierarchyPage() {
  return (
    <ManagementPage
      title="Team Members"
      description="Leadership roster and reporting structure."
      columns={CXO_TEAM_COLUMNS}
      filters={CXO_TEAM_FILTERS}
      config={config}
    />
  );
}
