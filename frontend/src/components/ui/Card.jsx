import { cn } from '../../utils/cn.js';

/**
 * Generic content container. Dashboards, forms, and detail pages all
 * wrap their content in this rather than repeating border/shadow
 * classes throughout the app.
 */
export default function Card({ children, className, title, actions }) {
  return (
    <div className={cn('min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          {title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {/* min-w-0 matters when a Card is used inside a flex/grid layout (e.g.
          Dashboard widgets) -- without it, a wide table inside would force
          this box (and everything above it, up to the page) to widen
          instead of the table just scrolling internally. */}
      <div className="min-w-0 p-4">{children}</div>
    </div>
  );
}
