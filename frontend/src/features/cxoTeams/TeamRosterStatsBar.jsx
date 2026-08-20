import { useState } from 'react';
import {
  Users,
  CheckCircle2,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  Rocket,
  Palmtree,
  Zap,
  CircleEllipsis,
} from 'lucide-react';

import KpiCard from '../../components/dashboard/KpiCard.jsx';
import Select from '../../components/ui/Select.jsx';
import Input from '../../components/ui/Input.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import teamRosterApiService from '../../api/services/teamRosterApiService.js';
import useFetch from '../../hooks/useFetch.js';

const PERIOD_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Stats bar for the Team Members page: total team size plus, for a
 * selectable Day/Week/Month period, how many distinct people had each
 * support value (Available / Training / Reconciliation / MFA / Dlaunch /
 * PTO / ePTO / Other) at some point in that period -- see
 * backend/src/services/TeamRosterService.getStats for how "distinct
 * people in range" is computed and why (not day-instances). Data comes
 * from the monthly roster upload (see useTeamRosterUpload.js); an empty
 * roster just shows zero counts everywhere except Total Team, which is
 * always the live cxo_teams headcount regardless of period.
 *
 * `refreshToken` lets the parent (TeamHierarchyPage) force a refetch
 * after a roster upload completes, by changing to a new value -- it's
 * included in useFetch's deps for exactly that reason.
 */
export default function TeamRosterStatsBar({ refreshToken }) {
  const [period, setPeriod] = useState('day');
  const [date, setDate] = useState(todayIsoDate());

  const { data, isLoading } = useFetch(
    () => teamRosterApiService.getStats({ period, date }),
    [period, date, refreshToken],
  );

  const stats = data?.data;
  const counts = stats?.counts || {};

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Roster Snapshot</h2>
          <p className="text-xs text-slate-500">
            {stats
              ? stats.start === stats.end
                ? `For ${stats.start}`
                : `${stats.start} to ${stats.end}`
              : 'Loading...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            options={PERIOD_OPTIONS}
            className="sm:max-w-[140px]"
          />
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          {isLoading && <Spinner size="sm" />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
        <KpiCard label="Total Team" value={stats?.totalTeamCount ?? '—'} icon={Users} />
        <KpiCard label="Available" value={counts.available ?? 0} icon={CheckCircle2} />
        <KpiCard label="Training" value={counts.training ?? 0} icon={GraduationCap} />
        <KpiCard label="Reconciliation" value={counts.reconciliation ?? 0} icon={RefreshCw} />
        <KpiCard label="MFA" value={counts.mfa ?? 0} icon={ShieldCheck} />
        <KpiCard label="Dlaunch" value={counts.dlaunch ?? 0} icon={Rocket} />
        <KpiCard label="PTO" value={counts.pto ?? 0} icon={Palmtree} />
        <KpiCard label="ePTO" value={counts.epto ?? 0} icon={Zap} />
        <KpiCard label="Other" value={counts.other ?? 0} icon={CircleEllipsis} />
      </div>
    </div>
  );
}
