import { Link } from 'react-router-dom';

import Card from '../ui/Card.jsx';

/**
 * Renders one Quick Links tile from a config entry (see
 * constants/quickLinks.js). This component never changes when a new
 * section is added — only the config array does.
 */
export default function QuickLinkCard({ card }) {
  const { title, description, icon: Icon, path } = card;

  return (
    <Link to={path} className="group block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
