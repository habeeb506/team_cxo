import { QUICK_LINKS } from '../../constants/quickLinks.js';
import QuickLinkCard from './QuickLinkCard.jsx';

/**
 * Responsive tile grid for every Quick Links section. Scales from one
 * column on small screens up to four on wide desktop layouts.
 */
export default function QuickLinksGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {QUICK_LINKS.map((card) => (
        <QuickLinkCard key={card.id} card={card} />
      ))}
    </div>
  );
}
