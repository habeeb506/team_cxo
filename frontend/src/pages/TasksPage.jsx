import { useMemo } from 'react';

import ManagementPage from '../components/management/ManagementPage.jsx';
import useApiResource from '../hooks/useApiResource.js';
import userApiService from '../api/services/userApiService.js';
import taskApiService from '../api/services/taskApiService.js';
import {
  TASK_COLUMNS,
  TASK_FILTERS,
  TASK_EMPTY_VALUES,
  buildTaskFields,
  buildTaskCsvConfig,
} from '../features/tasks/task.management.config.js';

/**
 * Same shape as pages/PermissionsPage.jsx: this resource needs a
 * supporting lookup (the `users` roster) before it can render its
 * form -- `assignedTo` is a select of team members, and CSV import
 * resolves "Assignee Email" back into an ObjectId via `emailToId`.
 * Everything else is the same generic ManagementPage every other
 * resource uses.
 */
export default function TasksPage() {
  const roster = useApiResource(userApiService, { pageSize: 200, initialSort: 'name' });
  const users = useMemo(() => roster.data || [], [roster.data]);

  const assigneeOptions = useMemo(
    () => users.map((user) => ({ value: user._id, label: `${user.name} (${user.email})` })),
    [users],
  );

  const emailToId = useMemo(() => {
    const map = {};
    users.forEach((user) => {
      map[user.email.toLowerCase()] = user._id;
    });
    return map;
  }, [users]);

  const config = {
    apiService: taskApiService,
    resourceLabel: 'Task',
    emptyValues: TASK_EMPTY_VALUES,
    fields: buildTaskFields(assigneeOptions),
    csv: buildTaskCsvConfig(emailToId),
    mapRecordToFormValues: (record) => ({
      ...record,
      assignedTo: record.assignedTo?._id || record.assignedTo,
      dueDate: record.dueDate ? String(record.dueDate).slice(0, 10) : '',
    }),
    transformSubmitValues: (values) => ({
      ...values,
      dueDate: values.dueDate || undefined,
    }),
    getRowLabel: (row) => row?.title,
  };

  return (
    <ManagementPage
      title="Tasks"
      description="Create tasks and assign them to any team member."
      columns={TASK_COLUMNS}
      filters={TASK_FILTERS}
      config={config}
    />
  );
}
