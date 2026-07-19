import {
  Users,
  UserCog,
  LayoutGrid,
  CheckSquare,
  Award,
  Newspaper,
  FileText,
  Briefcase,
  TrendingUp,
  Gift,
  Send,
} from 'lucide-react';

import { moduleRoute, ROUTE_PATHS } from './routePaths.js';

/**
 * Single source of truth for every Quick Links tile, rendered on
 * QuickLinksPage (see components/quickLinks/QuickLinksGrid.jsx) —
 * adding a new section means adding one entry here, nothing else.
 *
 * `path` defaults to the generic module placeholder route; once a
 * section gets a real page (like Team Hierarchy and Tasks below),
 * point its `path` there instead.
 *
 * Every entry below is an extension point for a planned module (Team
 * Hierarchy, Floor Leaders, Applications, Tasks, Appreciations, News
 * Bulletin, MOM Generator, Portfolios, Progress Dashboard,
 * Contributions, Distribution Lists). To build one: run
 * `node scripts/scaffold-module.mjs <Name> <route-segment>`, then
 * follow CONTRIBUTING.md's "Adding a new module" walkthrough — the
 * last step of that walkthrough is repointing the tile's `path` here.
 *
 * Formerly rendered directly on the Dashboard — moved to its own
 * "Quick Links" page/nav item so Dashboard could become the role-based
 * landing view (news bulletin, individual contribution, leaderboard).
 */
export const QUICK_LINKS = [
  {
    id: 'team-hierarchy',
    title: 'Team Hierarchy',
    description: 'View the organizational structure and reporting lines.',
    icon: Users,
    path: ROUTE_PATHS.teamHierarchy,
  },
  {
    id: 'floor-leaders',
    title: 'Floor Leaders',
    description: 'See designated floor leads and their coverage areas.',
    icon: UserCog,
  },
  {
    id: 'applications',
    title: 'Applications',
    description: 'Access internal applications and tools.',
    icon: LayoutGrid,
  },
  {
    id: 'tasks',
    title: 'Tasks',
    description: 'Track assigned tasks and their progress.',
    icon: CheckSquare,
    path: ROUTE_PATHS.tasks,
  },
  {
    id: 'appreciations',
    title: 'Appreciations',
    description: 'Recognize and celebrate team achievements.',
    icon: Award,
  },
  {
    id: 'news-bulletin',
    title: 'News Bulletin',
    description: 'Stay updated with company announcements.',
    icon: Newspaper,
  },
  {
    id: 'mom-generator',
    title: 'MOM Generator',
    description: 'Create and share minutes of meeting.',
    icon: FileText,
  },
  {
    id: 'portfolios',
    title: 'Portfolios',
    description: 'Browse team member portfolios and skills.',
    icon: Briefcase,
  },
  {
    id: 'progress-dashboard',
    title: 'Progress Dashboard',
    description: 'Monitor project and team progress at a glance.',
    icon: TrendingUp,
  },
  {
    id: 'contributions',
    title: 'Contributions',
    description: 'Track individual and team contributions.',
    icon: Gift,
  },
  {
    id: 'distribution-lists',
    title: 'Distribution Lists',
    description: 'Manage email distribution groups.',
    icon: Send,
  },
].map((card) => ({ ...card, path: card.path || moduleRoute(card.id) }));
