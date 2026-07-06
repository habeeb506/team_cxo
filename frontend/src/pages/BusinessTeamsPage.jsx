import ManagementPage from '../components/management/ManagementPage.jsx';
import businessTeamApiService from '../api/services/businessTeamApiService.js';
import {
  BUSINESS_TEAM_COLUMNS,
  BUSINESS_TEAM_FILTERS,
  BUSINESS_TEAM_FIELDS,
  BUSINESS_TEAM_EMPTY_VALUES,
  BUSINESS_TEAM_CSV_CONFIG,
} from '../features/businessTeams/businessTeam.management.config.js';

const config = {
  apiService: businessTeamApiService,
  resourceLabel: 'Business Team Member',
  emptyValues: BUSINESS_TEAM_EMPTY_VALUES,
  fields: BUSINESS_TEAM_FIELDS,
  csv: BUSINESS_TEAM_CSV_CONFIG,
  getRowLabel: (row) => row?.name,
};

export default function BusinessTeamsPage() {
  return (
    <ManagementPage
      title="Business Teams"
      description="Business-unit roster, independent of the leadership hierarchy."
      columns={BUSINESS_TEAM_COLUMNS}
      filters={BUSINESS_TEAM_FILTERS}
      config={config}
    />
  );
}
