import { useRef, useState } from 'react';
import { LayoutList, CalendarDays } from 'lucide-react';

import ManagementPage from '../components/management/ManagementPage.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import ImportResultModal from '../components/management/ImportResultModal.jsx';
import cxoTeamApiService from '../api/services/cxoTeamApiService.js';
import {
  CXO_TEAM_COLUMNS,
  CXO_TEAM_FILTERS,
  CXO_TEAM_FIELDS,
  CXO_TEAM_EMPTY_VALUES,
  CXO_TEAM_CSV_CONFIG,
} from '../features/cxoTeams/cxoTeam.management.config.jsx';
import { CXO_TEAM_SUPPORT_OPTIONS } from '../features/cxoTeams/cxoTeam.constants.js';
import TeamRosterStatsBar from '../features/cxoTeams/TeamRosterStatsBar.jsx';
import TeamShiftsGrid from '../features/cxoTeams/TeamShiftsGrid.jsx';
import useTeamRosterUpload from '../features/cxoTeams/useTeamRosterUpload.js';
import { downloadExcelTemplate } from '../utils/excelTemplate.js';
import useToast from '../hooks/useToast.js';

// Toggle between the full CRUD table (search/filter/pagination/CSV/
// bulk-delete/Add/Edit/Delete, via the generic ManagementPage) and the
// read-only MS Teams Shifts-style weekly grid (TeamShiftsGrid.jsx).
// Deliberately not a route change -- both views are the same resource,
// just a different shape of the same data, so a plain local toggle
// keeps things simple.
const VIEW_MODES = [
  { value: 'list', label: 'List', icon: LayoutList },
  { value: 'schedule', label: 'Schedule', icon: CalendarDays },
];

const config = {
  apiService: cxoTeamApiService,
  resourceLabel: 'Team Member',
  emptyValues: CXO_TEAM_EMPTY_VALUES,
  fields: CXO_TEAM_FIELDS,
  csv: CXO_TEAM_CSV_CONFIG,
  getRowLabel: (row) => row?.name,
  // Overrides ManagementToolbar's generic "Download Template" label --
  // this page also has a "Download Roster Template" button right above
  // it (see ROSTER_EXPORT_FIELDS below), so the generic label alone
  // would be ambiguous about which template it downloads.
  templateLabel: 'Download Team Template',
  // Wider than ManagementPage's/Modal's default -- CXO_TEAM_FIELDS is by
  // far the longest field list of any resource (nearly 30 fields, after
  // adding the career/development profile block), so it reads more
  // comfortably a bit wider even though Modal now scrolls internally
  // instead of overflowing.
  formClassName: 'max-w-lg',
};

// The roster template's own header/sample row -- deliberately separate
// from CXO_TEAM_CSV_CONFIG (that one creates/edits team members
// themselves, covering every core identity/org field except Support/
// Shift/Time Slot; this one is a day-by-day roster log covering exactly
// those three plus Employee Email + Date, for members that already
// exist, resolved by email -- see useTeamRosterUpload.js). Upload one
// row per person per day -- `Support` is required per row and includes
// "Available" for a normal day with nothing special to report, so every
// day gets a row, not just special-task ones.
//
// This template downloads as a real .xlsx (not CSV, see
// utils/excelTemplate.js) specifically so `Support` can carry a real
// clickable Excel dropdown (`options` below) -- a plain CSV file has no
// concept of cell-level validation, so a CSV template could only ever
// document the valid values in a comment, never actually offer them as
// a dropdown the way the Team Members form's own Support field does.
const ROSTER_EXPORT_FIELDS = [
  { header: 'Employee Email', key: 'email' },
  { header: 'Date', key: 'date' },
  { header: 'Support', key: 'support', options: CXO_TEAM_SUPPORT_OPTIONS },
  { header: 'Shift', key: 'shift' },
  { header: 'Time Slot', key: 'timeSlot' },
];
const ROSTER_TEMPLATE_SAMPLE_ROW = {
  email: 'jane.doe@sample.com',
  date: new Date().toISOString().slice(0, 10),
  support: 'Available',
  shift: '9:00 AM to 6:00 PM',
  timeSlot: 'Full day',
};

/**
 * Reference implementation of the generic ManagementPage, extended with
 * Team Members-specific additions that don't belong in the generic
 * component: the roster stats bar (TeamRosterStatsBar.jsx), the monthly
 * roster upload control, and a List/Schedule view toggle. All three sit
 * above/around <ManagementPage /> -- none reach into its internals, so
 * ManagementPage stays reusable by every other resource unchanged.
 * Business Teams and Permissions (see pages/BusinessTeamsPage.jsx and
 * pages/PermissionsPage.jsx) don't need any of this and render the plain
 * component directly.
 *
 * `viewMode` picks between the full CRUD table (ManagementPage, "List")
 * and the read-only MS Teams Shifts-style weekly grid (TeamShiftsGrid,
 * "Schedule") -- see VIEW_MODES above. Both stay mounted-on-demand
 * (only the active one renders) rather than both always rendering
 * hidden, so switching views doesn't pay for two sets of network
 * requests up front.
 */
export default function TeamHierarchyPage() {
  const fileInputRef = useRef(null);
  const [rosterRefreshToken, setRosterRefreshToken] = useState(0);
  const [viewMode, setViewMode] = useState('list');
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const { uploadFile, isImporting, result, clearResult } = useTeamRosterUpload();
  const { addToast } = useToast();

  const handleDownloadRosterTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      await downloadExcelTemplate({
        fields: ROSTER_EXPORT_FIELDS,
        sampleRow: ROSTER_TEMPLATE_SAMPLE_ROW,
        filename: 'team-roster-template.xlsx',
        sheetName: 'Team Roster',
      });
    } catch (err) {
      // Without this, a failure here (e.g. the exceljs bundle failing to
      // load/execute) previously reset the button's spinner with zero
      // visible feedback -- the exact "button flashes, nothing happens"
      // shape every other silently-swallowed error in this app has
      // turned out to be. See browser devtools console for the full
      // stack; this toast at least surfaces that something went wrong.
      console.error('Roster template download failed:', err);
      addToast(err?.message || 'Could not generate the roster template', { variant: 'error' });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    const summary = await uploadFile(file);
    // Bumps TeamRosterStatsBar's useFetch deps so the stats bar reflects
    // the just-uploaded roster immediately, without a page reload --
    // same "cause an event, subscriber refetches" shape as the
    // Dashboard's task-status sync (see hooks/useTaskStatusSync.js),
    // just a plain counter here since there's only ever one subscriber.
    if (summary) setRosterRefreshToken((token) => token + 1);
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3">
          <TeamRosterStatsBar refreshToken={rosterRefreshToken} />
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
          <span className="text-xs text-slate-500">Monthly roster (one row per person per day):</span>
          <Button
            variant="secondary"
            size="sm"
            isLoading={isDownloadingTemplate}
            onClick={handleDownloadRosterTemplate}
          >
            Download Roster Template
          </Button>
          <Button variant="secondary" size="sm" isLoading={isImporting} onClick={() => fileInputRef.current?.click()}>
            Upload Monthly Roster
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </Card>

      <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 w-fit">
        {VIEW_MODES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setViewMode(value)}
            className={
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ' +
              (viewMode === value ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100')
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {viewMode === 'list' ? (
        <ManagementPage
          title="Team Members"
          description="Leadership roster and reporting structure."
          columns={CXO_TEAM_COLUMNS}
          filters={CXO_TEAM_FILTERS}
          config={config}
        />
      ) : (
        <TeamShiftsGrid />
      )}

      <ImportResultModal isOpen={Boolean(result)} result={result} resourceLabel="Roster" onClose={clearResult} />
    </div>
  );
}
