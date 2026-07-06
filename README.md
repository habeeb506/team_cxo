# Project

Enterprise MERN stack application.

- **Frontend**: React (Vite) + Tailwind CSS — `frontend/`
- **Backend**: Node.js + Express — `backend/`
- **Database**: MongoDB (local instance)

## Structure

```
technet/
├── backend/     # Express API, versioned under /api/v1
└── frontend/    # React SPA
```

## Getting started

Prerequisites: Node.js 18+, a local MongoDB instance running (default `mongodb://127.0.0.1:27017`).

```bash
# install everything
npm run install:all

# run backend and frontend together
npm run dev
```

Backend runs on `http://localhost:5000`, frontend on `http://localhost:5173` by default. Copy each `.env.example` to `.env` in `backend/` and `frontend/` before running.

Once MongoDB is running, seed demo data (dummy users, news bulletins, tickets, tasks, leaderboard snapshots) with:

```bash
npm run seed --prefix backend
```

The Dashboard needs this data to show anything meaningful — see "Current features" below.

## Current features

- **Team Members**, **Business Teams**, and **Permissions** are full CRUD management pages: create/edit/view/delete, search, filter, pagination, CSV template download/import/export (with append or replace modes, per-row validation errors, and duplicate prevention), and bulk delete. These live under **Quick Links** in the sidebar, alongside placeholder tiles for modules not built yet (Floor Leaders, Applications, Tasks, ...).
- **Dashboard** is the landing page: a role-based view (via a mock "logged in as" switcher in the header, since real authentication doesn't exist yet) showing the current user's Individual Contribution (ticket/task KPIs and history), a company-wide Leaderboard (rank, tasks, tickets, VOCs, shout-outs, recognitions, overall score, with a date picker), and a News Bulletin panel (lazy-loaded, latest first, with a full-detail "View more" modal).

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the full folder-by-folder breakdown, the reusable "management page" pattern every CRUD module is built from, and the database schema/indexing rationale. See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for naming conventions and the step-by-step guide (backed by `scripts/scaffold-module.mjs`) for adding a new module without touching existing code.

## Conventions

- API routes are versioned (`/api/v1/...`) so new versions can be added without breaking existing consumers.
- Backend: config, logging, and error handling are centralized; feature modules live under `src/routes`, `src/models`, `src/services`, `src/controllers` as they're added.
- Frontend: API calls, hooks, and presentational components are kept in separate layers (`api/`, `hooks/`, `components/`); every CRUD page is a config object rendered through the shared `ManagementPage` component (see ARCHITECTURE.md).
- Every source file stays under 500 lines; split logically when it grows past that.

## Not yet implemented

No authentication, no automated tests, and no CI pipeline exist yet — see ARCHITECTURE.md's closing sections for what's deliberately deferred and recommended next steps.

This project is being built incrementally — see commit/session history for what's scaffolded so far.
