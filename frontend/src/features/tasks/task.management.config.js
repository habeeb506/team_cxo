import { createElement } from 'react';

import TaskCompletionBadge from './TaskCompletionBadge.jsx';
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from './task.constants.js';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');
const priorityLabel = (value) => TASK_PRIORITY_OPTIONS.find((option) => option.value === value)?.label || value;

/**
 * Table columns for the Tasks management page. Status is colored
 * green/yellow/red for done tasks via TaskCompletionBadge -- see that
 * component's docblock for how `completionTimeliness` is computed
 * server-side and what each color means. This file stays a plain .js
 * module (like every other `*.management.config.js`), so the one JSX
 * element needed here is built with `createElement` instead of JSX
 * syntax, which Vite's default esbuild config only transforms for
 * .jsx/.tsx files.
 */
export const TASK_COLUMNS = [
  { key: 'title', header: 'Title' },
  { key: 'assignedTo', header: 'Assigned To', render: (row) => row.assignedTo?.name || '—' },
  { key: 'status', header: 'Status', render: (row) => createElement(TaskCompletionBadge, { task: row }) },
  { key: 'priority', header: 'Priority', render: (row) => priorityLabel(row.priority) },
  { key: 'dueDate', header: 'Due Date', render: (row) => formatDate(row.dueDate) },
  { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
];

export const TASK_FILTERS = [
  { name: 'status', label: 'All statuses', options: TASK_STATUS_OPTIONS },
  { name: 'priority', label: 'All priorities', options: TASK_PRIORITY_OPTIONS },
];

export const TASK_EMPTY_VALUES = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignedTo: '',
  dueDate: '',
};

/**
 * `assigneeOptions` is built at render time from the current `users`
 * roster (see pages/TasksPage.jsx), so this is a builder function
 * rather than a static export -- same pattern as
 * features/cxoPermissions/cxoPermission.management.config.js's
 * buildCxoPermissionFields.
 */
export function buildTaskFields(assigneeOptions) {
  return [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'text' },
    {
      name: 'assignedTo',
      label: 'Assigned To',
      type: 'select',
      options: assigneeOptions,
      required: true,
      placeholder: 'Select a team member',
      formatValue: (_value, record) => record.assignedTo?.name || '—',
    },
    { name: 'status', label: 'Status', type: 'select', options: TASK_STATUS_OPTIONS, required: true },
    { name: 'priority', label: 'Priority', type: 'select', options: TASK_PRIORITY_OPTIONS, required: true },
    { name: 'dueDate', label: 'Due Date', type: 'date', formatValue: (value) => formatDate(value) },
  ];
}

// Shown as the one example row in the downloadable import template.
// Shaped like a populated record (row.assignedTo as an object) to
// match what the exportFields' getValue functions below expect.
const TASK_TEMPLATE_SAMPLE_ROW = {
  title: 'Prepare weekly status summary',
  description: 'Summarize this week’s progress for the team sync.',
  assignedTo: { email: 'jane.doe@sample.com' },
  status: 'todo',
  priority: 'medium',
  dueDate: null,
};

/**
 * `emailToId` resolves an "Assignee Email" CSV column back into the
 * ObjectId the backend expects, built from the roster fetched by
 * pages/TasksPage.jsx -- same pattern as
 * cxoPermission.management.config.js's buildCxoPermissionCsvConfig.
 */
export function buildTaskCsvConfig(emailToId) {
  return {
    exportFields: [
      { header: 'Title', key: 'title' },
      { header: 'Description', key: 'description' },
      { header: 'Assignee Email', getValue: (row) => row.assignedTo?.email || '' },
      { header: 'Status', key: 'status' },
      { header: 'Priority', key: 'priority' },
      {
        header: 'Due Date',
        getValue: (row) => (row.dueDate ? new Date(row.dueDate).toISOString().slice(0, 10) : ''),
      },
    ],
    filenamePrefix: 'tasks',
    mapImportRow: (raw) => ({
      title: raw.Title,
      description: raw.Description || undefined,
      assignedTo: emailToId[(raw['Assignee Email'] || '').trim().toLowerCase()],
      status: raw.Status || 'todo',
      priority: raw.Priority || 'medium',
      dueDate: raw['Due Date'] || undefined,
    }),
    templateSampleRow: TASK_TEMPLATE_SAMPLE_ROW,
  };
}
