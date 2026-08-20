import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Alert from '../../components/ui/Alert.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import cxoTeamApiService from '../../api/services/cxoTeamApiService.js';
import teamRosterApiService from '../../api/services/teamRosterApiService.js';
import useFetch from '../../hooks/useFetch.js';

import { CXO_TEAM_SUPPORT_OPTIONS } from './cxoTeam.constants.js';

const supportLabel = (value) => CXO_TEAM_SUPPORT_OPTIONS.find((option) => option.value === value)?.label || value;

// The backend's list-endpoint cap (see PAGINATION_DEFAULTS.MAX_LIMIT in
// backend/src/config/constants.js) -- passing a `limit` above this gets
// a 400 back instead of data, which used to fail silently here (the
// grid just fell back to "No team members found." with no visible
// error). 100 is still comfortably above the seeded team size; the grid
// needs every member as a row, not a paginated slice, so this is the
// most we can ask for in one request.
const FETCH_ALL_MEMBERS_PAGE_SIZE = 100;

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

/** `start` is 'YYYY-MM-DD' (Monday) -- returns the 7 'YYYY-MM-DD' dates of that week. */
function weekDates(start) {
  const anchor = new Date(`${start}T00:00:00Z`);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(anchor.getTime() + i * 24 * 60 * 60 * 1000);
    return day.toISOString().slice(0, 10);
  });
}

function formatDayHeader(isoDate, label) {
  const [, month, day] = isoDate.split('-');
  return `${label} ${Number(month)}/${Number(day)}`;
}

/**
 * MS Teams Shifts-style weekly schedule view for the Team Members page --
 * one row per person, one column per day (Monday-Sunday), each cell a
 * colored support block (via StatusBadge, most commonly "Available")
 * with the day's time slot underneath, or a blank dash on a day that
 * was never uploaded at all. This is a read-only view alongside the
 * existing ManagementPage CRUD table (see TeamHierarchyPage.jsx's
 * List/Schedule toggle) -- editing a day's support/shift/timeSlot still
 * happens through the monthly roster CSV upload (see
 * useTeamRosterUpload.js), the same data source the roster stats bar
 * reads from.
 *
 * Data comes from two independent fetches: the full team member list
 * (for row identity/ordering, since not everyone necessarily has a
 * roster entry for the shown week) and GET /team-roster/schedule (the
 * week's day-by-day entries), keyed below into a Map by `member|date`
 * for O(1) cell lookups instead of scanning the entry list per cell.
 */
export default function TeamShiftsGrid() {
  const [weekAnchor, setWeekAnchor] = useState(todayIsoDate());

  const {
    data: membersResponse,
    isLoading: isLoadingMembers,
    error: membersError,
  } = useFetch(() => cxoTeamApiService.getAll({ page: 1, limit: FETCH_ALL_MEMBERS_PAGE_SIZE, sort: 'name' }), []);
  const {
    data: scheduleResponse,
    isLoading: isLoadingSchedule,
    error: scheduleError,
  } = useFetch(() => teamRosterApiService.getWeeklySchedule({ date: weekAnchor }), [weekAnchor]);

  const members = membersResponse?.data || [];
  const schedule = scheduleResponse?.data;
  const loadError = membersError || scheduleError;

  const entriesByMemberAndDate = useMemo(() => {
    const map = new Map();
    for (const entry of schedule?.entries || []) {
      if (!entry.member?._id) continue;
      map.set(`${entry.member._id}|${entry.date}`, entry);
    }
    return map;
  }, [schedule]);

  const days = schedule ? weekDates(schedule.start) : [];
  const isLoading = isLoadingMembers || isLoadingSchedule;

  const shiftWeek = (deltaDays) => {
    const next = new Date(`${weekAnchor}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + deltaDays);
    setWeekAnchor(next.toISOString().slice(0, 10));
  };

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Weekly Schedule</h2>
          <p className="text-xs text-slate-500">{schedule ? `${schedule.start} to ${schedule.end}` : 'Loading...'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => shiftWeek(-7)} aria-label="Previous week">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setWeekAnchor(todayIsoDate())}>
            Today
          </Button>
          <Button variant="secondary" size="sm" onClick={() => shiftWeek(7)} aria-label="Next week">
            <ChevronRight className="h-4 w-4" />
          </Button>
          {isLoading && <Spinner size="sm" />}
        </div>
      </div>

      {loadError && (
        <Alert variant="error" className="mb-3">
          {loadError}
        </Alert>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[160px] border-b border-slate-200 bg-white p-2 text-left text-xs font-medium text-slate-500">
                Name
              </th>
              {days.map((isoDate, i) => (
                <th
                  key={isoDate}
                  className="min-w-[130px] border-b border-l border-slate-200 p-2 text-left text-xs font-medium text-slate-500"
                >
                  {formatDayHeader(isoDate, DAY_LABELS[i])}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member._id}>
                <td className="sticky left-0 z-10 border-b border-slate-100 bg-white p-2 font-medium text-slate-900">
                  {member.name}
                </td>
                {days.map((isoDate) => {
                  const entry = entriesByMemberAndDate.get(`${member._id}|${isoDate}`);
                  return (
                    <td key={isoDate} className="border-b border-l border-slate-100 p-2 align-top">
                      {entry ? (
                        <div className="flex flex-col gap-0.5">
                          <StatusBadge status={entry.support} label={supportLabel(entry.support)} />
                          {entry.timeSlot && <span className="text-xs text-slate-500">{entry.timeSlot}</span>}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {!isLoading && !loadError && members.length === 0 && (
              <tr>
                <td colSpan={days.length + 1} className="p-4 text-center text-sm text-slate-500">
                  No team members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
