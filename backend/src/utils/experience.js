/**
 * Tenure/experience math shared by CxoTeamService's computed fields
 * (firmExperience, overallExperience, timeInRole -- see
 * CxoTeam.model.js's docblock for why none of those three are stored).
 */

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

/**
 * Years between `startDate` and `endDate` (default now), rounded to one
 * decimal place. Returns 0 for a missing/invalid/future `startDate`
 * rather than a negative or NaN value -- every caller here treats "no
 * date on record yet" the same as "no time has accrued yet".
 */
export function yearsBetween(startDate, endDate = new Date()) {
  if (!startDate) return 0;
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return 0;

  const ms = endDate.getTime() - start.getTime();
  if (ms <= 0) return 0;

  return Math.round((ms / MS_PER_YEAR) * 10) / 10;
}
