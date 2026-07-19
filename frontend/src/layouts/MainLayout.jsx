import { Outlet } from 'react-router-dom';

import Header from '../components/layout/Header.jsx';
import TopNav from '../components/layout/TopNav.jsx';
import Footer from '../components/layout/Footer.jsx';

/**
 * Shell for every internal, authenticated page: header, a horizontal
 * top nav (formerly a left sidebar -- moved to give wide page content,
 * like the Dashboard's multi-widget layout, the full page width),
 * content, and footer. Every future module renders inside this via
 * routeConfig -- none of them need their own page chrome.
 *
 * The outer div is pinned to the viewport height (`h-screen`,
 * `overflow-hidden`) so Header + TopNav never move; they're normal
 * (non-growing) flex children sized to their own content. Only the
 * region below them scrolls -- it's the `flex-1 overflow-y-auto`
 * wrapper, and Footer lives inside it (scrolls with the page content)
 * rather than being pinned like the nav.
 */
export default function MainLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <TopNav />
      <div className="min-w-0 flex-1 overflow-y-auto bg-slate-50">
        <main className="min-w-0 p-4">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
