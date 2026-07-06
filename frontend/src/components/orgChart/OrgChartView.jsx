import { useEffect, useMemo, useState } from 'react';
import { Background, Controls, MiniMap, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Alert from '../ui/Alert.jsx';
import Spinner from '../ui/Spinner.jsx';
import cxoTeamApiService from '../../api/services/cxoTeamApiService.js';
import { fetchAllRecords } from '../../utils/csv.js';

import OrgChartNode from './OrgChartNode.jsx';
import OrgChartLegend from './OrgChartLegend.jsx';
import { buildOrgChartGraph } from './orgChartLayout.js';

const NODE_TYPES = { orgMember: OrgChartNode };

/**
 * Team Hierarchy's org chart view: the entire cxo_teams roster (not
 * just one page of it -- reuses utils/csv.js's fetchAllRecords, the
 * same "every page, not just one" fetch CSV export already relies on)
 * laid out top-down by `manager` (see orgChartLayout.js) and rendered
 * on an @xyflow/react canvas -- mouse-drag pan and scroll/pinch zoom
 * are that library's default canvas behavior, `<Controls />` adds
 * zoom in/out/fit-view buttons, and `<MiniMap />` gives an at-a-glance
 * view of the entire org while zoomed into one part of it.
 */
export default function OrgChartView() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetchAllRecords(cxoTeamApiService, { sort: 'name' })
      .then((data) => {
        if (isMounted) setRecords(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load team hierarchy');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const { nodes, edges, groupColorMap } = useMemo(() => buildOrgChartGraph(records), [records]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Couldn't load team hierarchy">
        {error}
      </Alert>
    );
  }

  if (records.length === 0) {
    return (
      <Alert variant="info" title="No team members yet">
        Import a roster (CSV) or run the backend seed script (npm run seed --prefix backend) to populate the org
        chart.
      </Alert>
    );
  }

  return (
    <div className="relative h-[75vh] min-h-[520px] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        minZoom={0.05}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant="dots" gap={20} size={1} color="#e1e0d9" />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable nodeColor={(node) => node.data.color} maskColor="rgba(241,245,249,0.7)" />
      </ReactFlow>

      <OrgChartLegend groupColorMap={groupColorMap} />
    </div>
  );
}
