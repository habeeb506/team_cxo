import { buildGroupColorMap, colorForGroup } from './orgChartColors.js';

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 88;
const HORIZONTAL_GAP = 32;
const VERTICAL_GAP = 100;

/**
 * Lays out a flat cxo_teams roster as a top-down tree using `manager`
 * as the parent link (see CxoTeam.model.js / ARCHITECTURE.md's "cxo_teams"
 * section). A reporting hierarchy is always a strict tree, so this is a
 * small hand-rolled recursive algorithm rather than a general graph
 * layout library: every leaf gets the next sequential x slot in
 * left-to-right (alphabetical) DFS order, and every parent's x is the
 * midpoint of its children's x range -- the standard "tidy tree"
 * centering approach.
 *
 * Records whose `manager` is missing, or points at a record not in
 * this same result set, are treated as roots (defensive: a bad CSV
 * import or a manual edit shouldn't be able to orphan a whole subtree
 * out of the chart). A genuine manager cycle -- which can't happen via
 * this app's own CRUD/import today, but isn't schema-enforced either
 * -- would leave those records with no computed position, so they're
 * dropped from the chart rather than crashing it.
 */
export function buildOrgChartGraph(records) {
  const byId = new Map(records.map((record) => [record._id, record]));
  const childrenByManagerId = new Map();

  records.forEach((record) => {
    const managerId = record.manager && byId.has(record.manager) ? record.manager : null;
    if (!childrenByManagerId.has(managerId)) childrenByManagerId.set(managerId, []);
    childrenByManagerId.get(managerId).push(record);
  });

  const groupColorMap = buildGroupColorMap(records);
  const positionById = new Map();
  let nextLeafSlot = 0;

  function layout(record, depth) {
    const children = (childrenByManagerId.get(record._id) || [])
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));

    if (children.length === 0) {
      const x = nextLeafSlot * (NODE_WIDTH + HORIZONTAL_GAP);
      nextLeafSlot += 1;
      positionById.set(record._id, { x, depth });
      return x;
    }

    const childXs = children.map((child) => layout(child, depth + 1));
    const x = (Math.min(...childXs) + Math.max(...childXs)) / 2;
    positionById.set(record._id, { x, depth });
    return x;
  }

  (childrenByManagerId.get(null) || [])
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((root) => layout(root, 0));

  const nodes = records
    .filter((record) => positionById.has(record._id))
    .map((record) => {
      const { x, depth } = positionById.get(record._id);
      return {
        id: record._id,
        type: 'orgMember',
        position: { x, y: depth * (NODE_HEIGHT + VERTICAL_GAP) },
        // Explicit width/height (not just the node's own CSS) so
        // <MiniMap> -- which draws from each node's declared size, not
        // a post-mount DOM measurement -- can actually render its rects.
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        draggable: false,
        data: { ...record, color: colorForGroup(record.group, groupColorMap) },
      };
    });

  const edges = records
    .filter((record) => record.manager && byId.has(record.manager) && positionById.has(record._id))
    .map((record) => ({
      id: `${record.manager}-${record._id}`,
      source: record.manager,
      target: record._id,
      type: 'smoothstep',
      style: { stroke: '#c3c2b7', strokeWidth: 1.5 },
    }));

  return { nodes, edges, groupColorMap };
}
