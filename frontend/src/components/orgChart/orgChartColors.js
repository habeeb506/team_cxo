/**
 * Eight-hue fixed-order categorical palette (see the dataviz skill /
 * ARCHITECTURE.md's design conventions) -- validated for CVD-safe
 * adjacent separation. Used to color-code the org chart by `group`
 * (department), never by `level` -- level is already encoded by the
 * chart's vertical position, so reusing color for it would spend the
 * identity channel on something position already shows.
 */
const CATEGORICAL_COLORS = [
  '#2a78d6', // blue
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
  '#e87ba4', // magenta
  '#eb6834', // orange
];

// The MD (no group of their own) and any group beyond the 8 fixed slots
// share a neutral gray rather than cycling hues -- cycling would break
// the fixed ordering that keeps adjacent colors CVD-distinguishable.
const NEUTRAL_COLOR = '#64748b';
const OVERFLOW_COLOR = '#94a3b8';

/**
 * Assigns each distinct `group` value one fixed hue, in alphabetical
 * order so a given group always gets the same color across reloads and
 * CSV re-imports regardless of fetch/insert order.
 */
export function buildGroupColorMap(records) {
  const uniqueGroups = [...new Set(records.map((record) => record.group).filter(Boolean))].sort();
  const map = new Map();
  uniqueGroups.forEach((group, index) => {
    map.set(group, CATEGORICAL_COLORS[index] ?? OVERFLOW_COLOR);
  });
  return map;
}

export function colorForGroup(group, groupColorMap) {
  if (!group) return NEUTRAL_COLOR;
  return groupColorMap.get(group) ?? OVERFLOW_COLOR;
}
