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

Backend runs on `http://localhost:4000`, frontend on `http://localhost:3000` by default. Copy each `.env.example` to `.env` in `backend/` and `frontend/` before running. The backend also only accepts requests whose `Host` header is in `ALLOWED_HOSTS` (`backend/.env.example` defaults to `localhost:4000,127.0.0.1:4000`, matching the default port above) -- update it if you change the backend's port or hostname, or you'll see 403s from every request.

Once MongoDB is running, seed demo data (users, news bulletins, tickets, tasks, leaderboard snapshots) with:

```bash
npm run seed --prefix backend
```

The Dashboard needs this data to show anything meaningful — see "Current features" below.

## Logging in

There's no password — every seeded account (or any real one you add) logs in with a one-time code emailed to it:

1. Open the app and enter an email from the seed script's console output (or any `users` document's `email`).
2. The 6-digit code is delivered one of two ways, controlled by `OTP_DEV_MODE` in `backend/.env`: while it's `true` (the default until you fill in `SMTP_*`), the code is only logged to the backend console; once you set `OTP_DEV_MODE=false` with real `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` credentials (Gmail App Password, Outlook/Office365, or any other SMTP provider -- see `backend/.env.example`), it's actually emailed via `nodemailer`. Either way, the code is *also* shown right on the login page as a hint (`OTP_ECHO_IN_RESPONSE=true`, also the default) -- turn that off once you trust real delivery is working.
3. Enter that code within 5 minutes to sign in.

Set `OTP_ECHO_IN_RESPONSE=false` before this ever runs anywhere the login response could be seen by anyone but the account owner.

### Device lock: every account is tied to a computer

While the app is only run locally (backend and browser on the same machine, as today), **every** account's OTP login also requires the backend process's OS username to match that account's `alias` — this is not optional and applies to every seeded account, not just ones you configure.

`alias` defaults automatically to the part of the email before `@` (`jane.doe@sample.com` → alias `jane.doe`), so most accounts need no setup at all — they just work when logged into from the OS account matching their email prefix. Because of this, re-seeding (`npm run seed --prefix backend`) also creates a `Local Admin (<yourOsUsername>)` account with an email matching whatever OS username actually ran the seed script, so there's always at least one guaranteed-working login on this machine — check the seed script's console output for its exact email.

If a real person's OS username doesn't happen to match their email prefix, correct their `alias` with:

```
npm run set-alias --prefix backend -- <email> <yourOsUsername>
```

`<yourOsUsername>` is the OS account name — on Windows, the folder name under `C:\Users\`. Reset an account back to the email-derived default with `npm run set-alias --prefix backend -- <email> --reset`. This check stops meaning anything once the backend is deployed somewhere shared rather than run on each person's own machine — see `backend/src/utils/machineIdentity.js`'s docblock before relying on it in a real multi-user deployment.

## Current features

- **Team Members**, **Business Teams**, **Permissions**, and **Tasks** are full CRUD management pages: create/edit/view/delete, search, filter, pagination, CSV template download/import/export (with append or replace modes, per-row validation errors, and duplicate prevention), and bulk delete. These live under **Quick Links**, alongside placeholder tiles for modules not built yet (Floor Leaders, Applications, ...). Team Members' table is trimmed to just Name, Location, Place/Floor, Shift, Support, and Time Slot (every other field is still captured in the create/edit form, just not shown in the list) — but its CSV template covers the *opposite* set: Name, Email Id, Emp Id Old, Emp Id New, Level, Designation, Location, Place/Floor, and Group (every core identity/org field, none of Support/Shift/Time Slot, which are roster-driven and belong to the separate Team Roster template instead — see the Team roster bullet below). It also has a roster snapshot bar above the table (Total Team plus Available/Training/Reconciliation/MFA/Dlaunch/PTO/ePTO/Other counts for a selectable day/week/month), an "Upload Monthly Roster" CSV control — see the Team roster bullet below — and a List/Schedule view toggle — see the Weekly schedule bullet below.
- **Team roster**: each team member's Support value (Available/Training/Reconciliation/MFA/Dlaunch/PTO/ePTO/Other — Available is the everyday, nothing-special-to-report state, PTO/ePTO cover a person being off), Shift, and Time Slot (the time range the current value applies to, e.g. "9:00 AM - 1:00 PM" or "Full day") are driven by a monthly roster upload rather than edited by hand — one row per person per day (Employee Email, Date, Support, Shift, Time Slot), uploaded from the Team Members page. "Download Roster Template" downloads a real `.xlsx` workbook (not a CSV) so the Support column can carry an actual clickable Excel dropdown constrained to the six valid values, rather than just documenting them in a comment; "Upload Monthly Roster" accepts either that filled-in `.xlsx` back or a plain `.csv`. Uploading updates each person's current support/shift/time slot and feeds the roster stats bar's day/week/month counts (a distinct-people-in-range count, so someone on Reconciliation for three days of a week counts once, not three times). Re-uploading a corrected month overwrites the same days rather than duplicating them.
- **Weekly schedule grid**: the Team Members page's "Schedule" view (next to "List") shows an MS Teams Shifts-style weekly grid — one row per person, one column per day Monday through Sunday, each cell a colored support badge with that day's time slot underneath (or a blank dash on a day that was never uploaded), with Prev/Today/Next week navigation. It's read-only and additive — the existing "List" CRUD table is unchanged and still the only place to add/edit/delete a team member or bulk-import via CSV; a day's support/shift/time slot is still only changed through the monthly roster upload described above.
- **Authentication** is real: email-OTP login (no passwords), a signed session cookie the backend verifies on every request, and every API route requiring that verified session. See "Logging in" above and `ARCHITECTURE.md`'s "Authentication" section for how it's built.
- **Dashboard** is the landing page: signed-in user's Individual Contribution (a six-tab history, in this order — Appointments, Tickets, Tasks, VOCs, Shout-outs, Awards — each with its own detail columns and its own pair of KPI cards that switch to match whichever tab is active; every tab, including Tasks, shows the complete history regardless of status), Open Tasks (todo or in-progress only, no date filter — it's a status view, not a time range; half-height compared to the other three widgets), a company-wide Leaderboard (rank, tickets, tasks, VOCs, shout-outs, awards, overall score — column order matches the Individual Contribution tabs), and a News Bulletin panel (lazy-loaded, latest first, with a full-detail "View more" modal, also half-height) — laid out as two 2-column rows. Individual Contribution and Leaderboard share a multi-select Year/Month filter with a "Select all" option per axis and a "Clear all" link; Individual Contribution defaults to the current year/month, Leaderboard defaults to "All". Open Tasks lets a user change a task's status inline (a live dropdown, not just a badge) — the backend automatically stamps the completion date/time the moment a task is marked done, using the system clock, never a client-supplied value. Individual Contribution's Tasks tab is read-only (status can only be changed from Open Tasks), but still updates live the moment a task is marked done — no page refresh needed on either widget. Both widgets also have a View button per task, opening the same read-only detail modal the Tasks admin page's own View button uses. A done task's Status badge always reads "Done", colored green/yellow/red (on time / delayed / overdue), computed server-side against its due date while excluding weekends and a seeded holiday calendar — shown on both Individual Contribution's Tasks tab and the Tasks admin page.

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the full folder-by-folder breakdown, the reusable "management page" pattern every CRUD module is built from, and the database schema/indexing rationale. See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for naming conventions and the step-by-step guide (backed by `scripts/scaffold-module.mjs`) for adding a new module without touching existing code.

## Conventions

- API routes are versioned (`/api/v1/...`) so new versions can be added without breaking existing consumers.
- Backend: config, logging, and error handling are centralized; feature modules live under `src/routes`, `src/models`, `src/services`, `src/controllers` as they're added.
- Frontend: API calls, hooks, and presentational components are kept in separate layers (`api/`, `hooks/`, `components/`); every CRUD page is a config object rendered through the shared `ManagementPage` component (see ARCHITECTURE.md).
- Every source file stays under 500 lines; split logically when it grows past that.

## Not yet implemented

Authorization (restricting *what* a signed-in user can do, beyond just verifying *who* they are), automated tests, and a CI pipeline don't exist yet — see ARCHITECTURE.md's closing sections for what's deliberately deferred and recommended next steps.

This project is being built incrementally — see commit/session history for what's scaffolded so far.
