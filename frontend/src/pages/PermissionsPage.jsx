import { useMemo } from 'react';

import ManagementPage from '../components/management/ManagementPage.jsx';
import useApiResource from '../hooks/useApiResource.js';
import cxoTeamApiService from '../api/services/cxoTeamApiService.js';
import cxoPermissionApiService from '../api/services/cxoPermissionApiService.js';
import {
  CXO_PERMISSION_COLUMNS,
  CXO_PERMISSION_FILTERS,
  CXO_PERMISSION_EMPTY_VALUES,
  buildCxoPermissionFields,
  buildCxoPermissionCsvConfig,
} from '../features/cxoPermissions/cxoPermission.management.config.js';

/**
 * Unlike Team Members/Business Teams, this page needs a supporting
 * lookup (the team roster) before it can render its form: `member` is
 * a select of team members, and CSV import resolves "Member Email"
 * back into an ObjectId via `emailToId`. Everything else is the same
 * generic ManagementPage every other resource uses.
 */
export default function PermissionsPage() {
  const roster = useApiResource(cxoTeamApiService, { pageSize: 200, initialSort: 'name' });
  const members = useMemo(() => roster.data || [], [roster.data]);

  const memberOptions = useMemo(
    () => members.map((member) => ({ value: member._id, label: `${member.name} (${member.emailId})` })),
    [members],
  );

  const emailToId = useMemo(() => {
    const map = {};
    members.forEach((member) => {
      map[member.emailId.toLowerCase()] = member._id;
    });
    return map;
  }, [members]);

  const config = {
    apiService: cxoPermissionApiService,
    resourceLabel: 'Permission Grant',
    emptyValues: CXO_PERMISSION_EMPTY_VALUES,
    fields: buildCxoPermissionFields(memberOptions),
    csv: buildCxoPermissionCsvConfig(emailToId),
    mapRecordToFormValues: (record) => ({
      ...record,
      member: record.member?._id || record.member,
      expiresAt: record.expiresAt ? String(record.expiresAt).slice(0, 10) : '',
    }),
    transformSubmitValues: (values) => ({
      ...values,
      expiresAt: values.expiresAt || undefined,
    }),
    getRowLabel: (row) => row?.member?.name || row?.resource,
  };

  return (
    <ManagementPage
      title="Permissions"
      description="Control who can create, edit, or delete records for each resource."
      columns={CXO_PERMISSION_COLUMNS}
      filters={CXO_PERMISSION_FILTERS}
      config={config}
    />
  );
}
