import { Outlet } from 'react-router-dom';

import Header from '../components/layout/Header.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import Footer from '../components/layout/Footer.jsx';

/**
 * Shell for every internal, authenticated page: header + sidebar +
 * content + footer. Every future module (dashboard, reports,
 * analytics, notifications, settings) renders inside this via
 * routeConfig — none of them need their own page chrome.
 */
export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-slate-50 p-4">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
