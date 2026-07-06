import QuickLinksGrid from '../components/quickLinks/QuickLinksGrid.jsx';

/**
 * Hub for every module tile (Team Hierarchy, Floor Leaders,
 * Applications, Tasks, ...). Moved off Dashboard so Dashboard can be
 * the role-based landing view instead. To add a new section, add one
 * entry to constants/quickLinks.js — this page and QuickLinksGrid
 * never need to change.
 */
export default function QuickLinksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Quick Links</h1>
        <p className="text-sm text-slate-500">Jump to any module.</p>
      </div>

      <QuickLinksGrid />
    </div>
  );
}
