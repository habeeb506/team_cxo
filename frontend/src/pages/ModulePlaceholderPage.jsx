import { useParams, Link } from 'react-router-dom';

import { QUICK_LINKS } from '../constants/quickLinks.js';
import { ROUTE_PATHS } from '../constants/routePaths.js';
import Card from '../components/ui/Card.jsx';
import Alert from '../components/ui/Alert.jsx';

/**
 * Generic destination for any Quick Links tile whose real module isn't
 * built yet. Once a section (e.g. Tasks) gets a real page, change its
 * quickLinks.js entry's `path` to point there — this page keeps
 * serving every other not-yet-built section unchanged.
 */
export default function ModulePlaceholderPage() {
  const { moduleId } = useParams();
  const card = QUICK_LINKS.find((item) => item.id === moduleId);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card title={card?.title || 'Module'}>
        <Alert variant="info" title="Coming soon">
          {card?.description || 'This module is not available yet.'}
        </Alert>
        <Link
          to={ROUTE_PATHS.quickLinks}
          className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
        >
          &larr; Back to Quick Links
        </Link>
      </Card>
    </div>
  );
}
