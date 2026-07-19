# Architecture

This document explains the folder structure and the reasoning behind it. The
goal throughout: adding a new module (auth, notifications, dashboards,
reports, analytics, or anything else) should mean *adding files inside
existing folders*, never restructuring what's already there.

## Backend (`backend/src/`)

Request flow: `routes` -> `middlewares` (validation, later auth) -> `controllers` -> `services` -> `repositories` -> MongoDB.

| Folder | Purpose | Why it exists |
|---|---|---|
| `config/` | Env loading (`index.js`), app constants (`constants.js`), Mongo connection (`db.js`) | One source of truth for environment and app-wide values -- never read `process.env` outside this folder |
| `routes/v1/` | Thin Express routers, one file per resource | Versioned (`/api/v1`) so a `v2` or a separate client-facing API can be added later without breaking existing consumers |
| downstream bulk routes | Every resource router also registers `POST /import` and `POST /bulk-delete`, both validated by the one shared `validations/common/bulkImport.schema.js` / `bulkDelete.schema.js` | Backs the frontend's CSV import and bulk-delete features (see "Management pages" below) without duplicating per-record validation/uniqueness logic |
| `controllers/` | Parses `req`/`res`, calls a service, formats the response | `baseController.js` provides `createCrudController(service)` -- a full CRUD controller for a new resource in one line |
| `services/` | Business logic and orchestration | `BaseService.js` provides default CRUD business logic -- including `bulkCreate`/`bulkDelete`/`replaceAll`, which reuse the existing single-record `create`/`delete` so bulk operations get the exact same validation, uniqueness checks, and soft-delete behavior as single-record ones -- feature services extend it and override only what's actually custom (e.g. `CxoPermissionService` overrides `list`/`getById` to populate `member`) |
| `repositories/` | The only layer that touches Mongoose | `BaseRepository.js` provides generic paginated CRUD over any model, **and is the single place soft-delete is implemented** (`softDeleteById`/`softDeleteMany`/`restoreById`/`withDeletedFilter`) -- keeps persistence details swappable without touching services |
| `validations/` | Zod schemas per resource, plus `common/` for shared ones (`objectId`, `pagination`, `bulkDelete`, `bulkImport`) | Validation rules live next to each other, separate from the middleware that executes them |
| `middlewares/` | Cross-cutting Express concerns: `errorHandler`, `notFound`, `requestLogger`, `validateRequest` | Registered once in `app.js`; a future `auth.middleware.js` / `authorize.middleware.js` slots into the same chain |
| `models/` | Mongoose schemas, `plugins/auditableSchema.plugin.js` for shared audit/soft-delete *fields* | See "Data layer" below for the current collections |
| `events/` | `eventBus.js` -- a tiny internal pub/sub | Services can `emit()` domain events (`user.created`) without knowing who listens; a future notifications service just `.on()`s the event -- no existing service is touched |
| `utils/` | `logger`, `ApiError`, `asyncHandler`, `apiResponse`, `pagination` | Small, generic helpers used everywhere; prevents duplicated error/response/pagination logic per route |

Adding a feature (example: "reports"): `models/report.model.js` ->
`repositories/ReportRepository.js extends BaseRepository` ->
`services/ReportService.js extends BaseService` ->
`controllers/report.controller.js` (via `createCrudController`, plus any
custom aggregation endpoints) -> `validations/report.schema.js` ->
`routes/v1/report.routes.js`, registered in `routes/v1/index.js`. Nothing
above that list changes.

## Frontend (`frontend/src/`)

| Folder | Purpose | Why it exists |
|---|---|---|
| `api/` | `httpClient.js` (shared axios instance), `baseApiService.js` (`ApiService` base class), `api/services/` (one class per CRUD resource); `healthApi.js`/`systemApi.js` (thin one-off functions for non-CRUD singleton endpoints) | One HTTP client with shared config/interceptors. Two deliberately different patterns: a CRUD resource gets an `ApiService` subclass; a one-off endpoint (health, system info) gets a plain exported function instead -- forcing the latter into a class with unused `create`/`update`/`delete` methods would be worse, not more consistent |
| `hooks/` | `useApiResource`, `useMutation`, `useFetch`, `useInfiniteList`, `usePagination`, `useForm`, `useDebounce`, `useToggle`, `useToast`, `useRowSelection`, `useCsvExport`, `useCsvImport`, `useCsvTemplate`, `useManagementPageState`, `useCurrentUser`, `useYearMonthFilter` | Generic, feature-agnostic state logic reused by every future page instead of re-implemented per component -- see "Frontend data layer", "Management pages", and "Dashboard and mock identity" below |
| `components/ui/` | `Button`, `Input`, `Select`, `CheckboxGroup`, `Card`, `Spinner`, `Alert`, `Modal`, `ConfirmDialog`, `EmptyState`, `DataTable`, `SearchBar`, `PaginationControls`, `StatusBadge` | Pure presentational primitives; every future page (auth forms, dashboards, report tables) is composed from these, not new one-off markup |
| `components/layout/` | `Header`, `TopNav`, `Footer` | The chrome around every internal page; a new nav item is one entry in `TopNav.jsx` |
| `components/management/` | `ManagementPage`, `ManagementToolbar`, `RecordFormModal`, `RecordViewModal`, `DynamicFormFields`, `ImportResultModal` | The generic, config-driven CRUD page -- see "Management pages" below |
| `components/quickLinks/` | `QuickLinksGrid`, `QuickLinkCard` | The tile grid rendered on `pages/QuickLinksPage.jsx` -- see "Dashboard and mock identity" below for why this moved off Dashboard |
| `components/dashboard/` | `NewsBulletinPanel` + `NewsBulletinModal`, `OpenTasksPanel`, `IndividualContributionPanel`, `LeaderboardPanel`, `KpiCard`, `YearMonthFilter` | Dashboard-only widgets -- see "Dashboard and mock identity" below |
| `components/ErrorBoundary.jsx` | Catches render errors app-wide | One broken widget can't blank the whole app |
| `features/<resource>/` | Per-resource config only -- `*.management.config.js` (columns, form fields, CSV mapping) and `*.constants.js` (option lists mirroring backend enums) -- currently `cxoTeams/`, `businessTeams/`, `cxoPermissions/`, `tasks/` | Keeps `components/management/` purely generic while each module's actual shape (its fields, columns, CSV headers) lives next to each other |
| `layouts/` | `MainLayout` (header + top nav + content, for the internal app, pinned via `h-screen`/`overflow-hidden` so only the content region scrolls), `AuthLayout` (centered, for future login/signup) | A new page picks a layout in `routeConfig.js`; no new layout code needed |
| `context/` | `ToastContext`, `CurrentUserContext` | App-wide transient notifications and the mock "logged in as" identity (see "Dashboard and mock identity" below); a future `AuthContext` registers the same way |
| `routes/` | `routeConfig.js` (data-driven route list), `AppRoutes.jsx` (renders from it), `ProtectedRoute.jsx` (currently a pass-through) | Adding a route is one entry in `routeConfig.js`; wiring real authentication later means editing `ProtectedRoute.jsx` alone |
| `constants/` | `apiEndpoints.js`, `routePaths.js`, `quickLinks.js`, `dateFilters.js` | No hardcoded path strings anywhere in the app |
| `utils/` | `cn.js` (class merging), `apiCache.js` (in-memory TTL cache, also used for request de-duplication -- see below), `formatDate.js` (shared date/time formatting) | Small helpers shared by UI components and hooks |

Adding a feature (example: "reports"): `api/services/reportApiService.js` (3-line
`ApiService` subclass) -> `features/reports/report.management.config.js` ->
`pages/ReportsPage.jsx` (renders `<ManagementPage config={...} />`) -> one
entry each in `constants/routePaths.js`, `routes/routeConfig.js`, and
`components/layout/TopNav.jsx`. Nothing else changes -- see "Management
pages" below for the full pattern.

## Frontend data layer

**`ApiService`** (`api/baseApiService.js`) is the frontend mirror of the backend's `BaseRepository`/`BaseService`: a resource's entire HTTP client is a subclass declaring only its base path (see `api/services/cxoTeamApiService.js`). `getAll` forwards params straight through as query string, so it lines up with the backend's pagination/filter/search query shape with no translation layer.

**`useApiResource(apiService, options)`** (`hooks/useApiResource.js`) is the one hook every list/table page is built on: it fetches through the given `ApiService` and briefly caches responses (`utils/apiCache.js`, a deliberately small in-memory TTL cache -- a seam for a real caching library later, not a replacement for one). Page/limit state is delegated to `usePagination` (`hooks/usePagination.js`) rather than re-declared inline, so the same pagination primitive is available standalone for a future client-side-only list that doesn't go through an `ApiService`. A future module's list page changes only the `apiService` instance passed in.

**`useFetch(fetcher, deps, options)`** (`hooks/useFetch.js`) is the lighter-weight counterpart for a single one-off request (health check, machine identity, a leaderboard period) rather than a paginated list. Pass `{ cacheKey, cacheTtlMs }` to reuse the same `apiCache.js` TTL cache `useApiResource` uses -- and `useFetch` also de-duplicates concurrent in-flight requests for the same `cacheKey`, so two components that both call a hook built on it at the same time share one network request instead of firing a duplicate. `useMachineIdentity` (`hooks/useMachineIdentity.js`) is the example of this.

**`useMutation(fn)`** (`hooks/useMutation.js`) wraps create/update/delete calls with `isLoading`/`error` state and rethrows on failure so callers can react (show a toast, keep a modal open). `hooks/useForm.js`'s `handleSubmit` catches that rethrow and maps the backend's `ApiError.details` (`{ field, message }[]`) onto the right form field automatically -- this only works because `httpClient.js`'s error interceptor preserves `details`/`statusCode` on the thrown `Error` instead of discarding them.

## Management pages

Team Members, Business Teams, Permissions, and Tasks are full CRUD pages (create, edit, view, delete, search, filter, pagination, CSV import/export, bulk delete) built entirely from **one generic component plus a config object** -- no page hand-rolls fetching, modals, or bulk-action wiring.

**`useManagementPageState(config)`** (`hooks/useManagementPageState.js`) is the single stateful hook behind every management page. It composes the hooks already described above -- `useApiResource` (list/pagination/filter/search), `useMutation` x4 (create/update/delete/bulk-delete), `useRowSelection`, `useCsvExport`, `useCsvImport`, `useCsvTemplate`, `useToggle` x4, `useToast` -- into one state object. `config` is `{ apiService, resourceLabel, emptyValues, fields, csv, getRowId?, mapRecordToFormValues?, transformSubmitValues?, getRowLabel? }`; the last three are optional escape hatches for a resource whose record shape doesn't map 1:1 onto its form (see Permissions below).

**`ManagementPage`** (`components/management/ManagementPage.jsx`) is the presentational half: it calls `useManagementPageState(config)` and renders `ManagementToolbar` (search + filter dropdowns + Add/Template/Import/Export/bulk-delete buttons) + `DataTable` (selectable, with an auto-appended View/Edit/Delete actions column) + `PaginationControls` + `RecordFormModal` (create/edit) + `RecordViewModal` (read-only detail) + two `ConfirmDialog`s (single delete, bulk delete) + `ImportResultModal`. A resource's page is just: build a `config`, render `<ManagementPage title=... columns={...} filters={...} config={config} />`.

**`fields`** is the one config array that drives both the create/edit form (via `DynamicFormFields`, which renders `text`/`email`/`number`/`date`/`select`/`multiselect` inputs from `{ name, label, type, options?, required? }`) and the read-only view modal -- a resource never maintains two separate field lists.

**CSV import/export/template** is generic on both ends: `utils/csv.js` has no external dependency (`parseCsv` handles quoted/comma/newline fields by hand; `fetchAllRecords` pages through the full result set so export isn't capped at one page; `buildCsvTemplate` builds a downloadable header row, optionally with one example row). A resource supplies `csv: { exportFields, filenamePrefix, mapImportRow, templateSampleRow? }` -- the same `exportFields` list doubles as the template's columns, so there's no separate header list to maintain. `mapImportRow` adapts raw CSV string columns into a create payload. Import actually persists through the backend's bulk endpoints (`POST /import`, `POST /bulk-delete`), not N sequential client-side requests.

**Validation, duplicates, and per-row error reporting**: the route-level `bulkImportSchema` only checks that `records` is a non-empty array of objects -- it deliberately does *not* validate each record's exact shape, so one malformed CSV row can't reject the entire file before any row is even looked at. Real per-record validation happens one row at a time inside `BaseService.bulkCreate` (via `this.create()` -> `this.validateRecord()`, which runs the resource's own zod `bodySchema` -- the same schema a single-record POST uses) and duplicate prevention runs the same way (`assertUnique`, checked per row, so a duplicate against the database *or* against an earlier row in the same file is caught identically). A bad row is skipped and reported -- `{ row, message, details }` -- while every valid row still gets inserted; `ImportResultModal` (`components/management/ImportResultModal.jsx`) surfaces that list to the admin with the exact row number and reason, automatically, whenever an import has any failures.

**Append vs. replace**: `POST /import` accepts `mode: 'append' | 'replace'` (default `append`). `replace` calls `BaseService.replaceAll`, which soft-deletes every existing record for that resource (`BaseRepository.softDeleteMany`) and then runs the normal `bulkCreate` -- nothing is physically destroyed, so it's reversible by an administrator and fully audited like every other delete in this app. This is why `CxoTeam.emailId`/`empIdNew`/`empIdOld`, `BusinessTeam.emailId`, and `CxoPermission`'s `member+resource` compound index are all declared as **partial unique indexes** scoped to `{ isDeleted: { $ne: true } }` instead of plain `unique: true` -- a plain unique index is enforced across soft-deleted documents too, which would make "replace with the same emails" fail with a database-level duplicate-key error even though the app's own uniqueness check already ignores deleted rows. `ManagementToolbar` exposes the choice as a small mode selector next to the Import button and confirms before a `replace` actually runs, since it's the one destructive option.

**Reference implementation -- Team Members** (`pages/TeamHierarchyPage.jsx` + `features/cxoTeams/cxoTeam.management.config.js`): the simplest case -- static fields/columns/filters, no cross-resource lookups.

**Business Teams** (`pages/BusinessTeamsPage.jsx` + `features/businessTeams/businessTeam.management.config.js`): same shape with no filter dropdowns, since `business`/`location`/`room` are free text rather than fixed enums -- search covers it instead.

**Permissions** (`pages/PermissionsPage.jsx` + `features/cxoPermissions/cxoPermission.management.config.js`) is the one case needing extra wiring, and demonstrates the escape hatches:
- The `member` field's options come from the live `cxo_teams` roster, fetched in the page via `useApiResource` and passed into `buildCxoPermissionFields(memberOptions)` -- a builder function instead of a static export, since the options aren't known until the roster loads.
- The backend populates `member` on read (`CxoPermissionService.list`/`getById`), so a record's `member` is an object when *viewing* but must be a raw id string when *editing*; `config.mapRecordToFormValues` unwraps `record.member?._id || record.member` before the edit form opens.
- CSV import needs to resolve a human-readable "Member Email" column back into an `ObjectId`; the page builds an `emailToId` lookup from the same roster and passes it into `buildCxoPermissionCsvConfig(emailToId)`.
- An empty `expiresAt` (optional date) would fail the backend's `z.coerce.date().optional()` validation -- an empty string isn't treated as "absent," it's coerced into an invalid `Date` and rejected. `config.transformSubmitValues` normalizes `''` to `undefined` right before every create/update call.

**Tasks** (`pages/TasksPage.jsx` + `features/tasks/task.management.config.js`) is a second case needing the Permissions-style roster lookup, and is also the app's worked example of upgrading a read-only resource into a full one (see CONTRIBUTING.md's "Read-only resources" section): `tasks` shipped for the Dashboard first (read-only, `GET` only), then gained `validations/task.schema.js`, the remaining CRUD routes, and this page once assigning tasks to people needed a real UI.
- `assignedTo` is a select of the `users` roster (not `cxo_teams` -- tasks were already scoped to `User` via the Dashboard's Individual Contribution/Open Tasks panels, so assignment reuses that same link rather than introducing a second "person" concept). The roster comes from a new `GET /users` list route (`userController.getAll`), added alongside the existing `/demo-accounts` and `/:id` routes.
- `TaskService.list`/`getById` populate `assignedTo` (`name email jobTitle`) the same way `CxoPermissionService` populates `member` -- the Dashboard's own task queries are unaffected since neither Open Tasks nor Individual Contribution renders `assignedTo` (they're already scoped to one person).
- CSV import resolves an "Assignee Email" column back into an `ObjectId` via the same `emailToId` pattern Permissions uses.

Every future module (Applications, Floor Leaders, ...) follows this same pattern: a `*.management.config.js`, a thin page, and -- only if the resource needs it -- a `mapRecordToFormValues`/`transformSubmitValues` override. `ManagementPage`, `useManagementPageState`, and the shared UI kit never change.

## Dashboard and mock identity

Team Members, Business Teams, Permissions, and Tasks are reached directly from `components/layout/TopNav.jsx`'s top-level nav (not nested under Quick Links). Quick Links (`pages/QuickLinksPage.jsx`, `constants/quickLinks.js`) is a separate tile grid for the remaining planned modules that don't have a real page yet -- each tile points at `pages/ModulePlaceholderPage.jsx` (via `constants/routePaths.js`'s `modulePattern`) until it does; Team Hierarchy's and Tasks' tiles already point at their real routes instead, since both got a real page.

**Mock identity.** Real authentication doesn't exist yet (see "Suggested improvements" below), but the Dashboard needs *a* current user to scope tickets/tasks/leaderboard rank to. `backend/scripts/seeders/seedUsers.mjs` seeds 100 `users`, 20 of them flagged `isDemoAccount: true`; the frontend's `context/CurrentUserContext.jsx` loads that subset (`GET /users/demo-accounts`) and persists the choice in `localStorage` so it survives a reload (there's no visible switcher any more -- see `components/layout/Header.jsx`'s docblock -- but the context still resolves automatically). Every widget that needs "the current user" reads it via `hooks/useCurrentUser.js` rather than re-fetching the account list itself. `currentUser.role` is the seam a future per-role visibility rule would read -- every Dashboard section today is shown to every role.

**Backend read-only resources.** `users`, `news_bulletins`, and `tickets` follow the same model/repository/service layering as every other resource, but are deliberately read-only for now (no create/update/delete/import routes registered -- see each `routes/v1/*.routes.js`) since the Dashboard only needs to display them and inventing an admin UI for undefined requirements would be unnecessary complexity (`users` did gain one addition, though -- a plain `GET /` list route, added so the Tasks management page's assignee picker has a roster to select from; it's still create/update/delete-free). `tasks` used to be in this list too until an admin UI was actually needed for it -- see "Management pages" above and CONTRIBUTING.md's "Read-only resources" section for that upgrade path, which `tickets` would follow identically if it ever needs the same treatment. `leaderboard` is the one fully custom read endpoint: `LeaderboardService.getEntriesForPeriod` resolves a specific `date`, or a `year`/`month` period's most recent snapshot, or (with neither) the latest snapshot overall, then computes rank at read time by sorting that snapshot's `leaderboard_entries` by `overallScore` (never stored -- see `LeaderboardEntry.model.js`), since a snapshot is small and bounded (100 people) rather than something a live aggregation needs to reconstruct.

**Dashboard layout.** Open Tasks, Individual Contribution, and News Bulletin sit in one 3-column row; Leaderboard is one big, full-width widget below that row (see `pages/DashboardPage.jsx`). Open Tasks, Individual Contribution, and Leaderboard each carry a Year/Month filter (`components/dashboard/YearMonthFilter.jsx` + `hooks/useYearMonthFilter.js`) -- News Bulletin doesn't, since it isn't scoped to a time period. Tickets/tasks are filtered by `createdAt` via a generic `dateRangeField` option on `utils/queryOptions.js`'s `buildListQueryOptions` (wired to `createdAt` in `ticket.controller.js`/`task.controller.js`); the Leaderboard resolves the period's latest snapshot via `LeaderboardEntryRepository.getLatestDateInRange`. A `?year=YYYY&month=M` query shape (`validations/common/yearMonthQuery.schema.js`) is shared across all three routes via zod's `.extend()`.

**News Bulletin panel** (`components/dashboard/NewsBulletinPanel.jsx`) is lazy-loaded via `hooks/useInfiniteList.js` -- the accumulating-pagination counterpart to `useApiResource` (which replaces its page; this appends), reusable by any future activity/notification feed. Each item is clamped to 3 lines (Tailwind's `line-clamp-3`); "View more" opens `NewsBulletinModal.jsx` with the already-fetched full description -- no second request, since the list endpoint always returns the full text.

**Individual Contribution panel** (`components/dashboard/IndividualContributionPanel.jsx`) fetches the current user's tickets and tasks once each (via `useApiResource` with `assignedTo` as a filter, updated via `setFilters` whenever the Year/Month selection changes), derives both KPI cards and the tabbed table from that same fetched data, and is rendered with `key={userId}` by `DashboardPage` so switching the mock user cleanly remounts and refetches instead of needing manual filter-update plumbing.

**Open Tasks panel** (`components/dashboard/OpenTasksPanel.jsx`) is deliberately a *different, leaner* view over the same `tasks` data Individual Contribution already fetches -- not a duplicate. It fetches the current user's tasks the same way, then filters client-side to `status !== 'done'` and sorts by `dueDate` ascending, since "open, most urgent first" isn't a query shape worth a new backend endpoint for. Overdue rows (`dueDate` in the past) are highlighted via `DataTable`'s `getRowClassName`.

**Leaderboard panel** (`components/dashboard/LeaderboardPanel.jsx`) uses the shared Year/Month filter (rather than a specific-date picker) and highlights/auto-scrolls to the current user's row. This needed two small, generic additions to `components/ui/DataTable.jsx`: optional `getRowClassName(row)` and `getRowRef(row)`, both no-ops unless passed -- any future table wanting per-row styling or a scroll-to target reuses the same props instead of a new table implementation.

## Data layer (MongoDB -- database `cxodb`)

Every collection is built on `models/plugins/auditableSchema.plugin.js`, applied via `schema.plugin(auditableSchemaPlugin)`. It adds `isDeleted`/`deletedAt` (soft delete), `createdBy`/`updatedBy` (audit trail, nullable until auth exists), `schemaVersion` (future migrations), and a free-form `metadata` object (escape hatch for fields that don't warrant a schema change yet) -- once, in one place, instead of every model re-declaring these fields. Combined with Mongoose's own `{ timestamps: true }` (`createdAt`/`updatedAt`), every collection has full audit coverage for free.

The plugin only adds *fields* -- it deliberately does not add Mongoose document methods or query helpers for soft delete. That behavior lives entirely in `BaseRepository` (`softDeleteById`, `softDeleteMany`, `restoreById`, and the `withDeletedFilter` helper that every read method merges into its filter), since repositories are the only layer allowed to touch Mongoose. Keeping soft delete in one place -- rather than splitting it between schema-level methods and repository-level filtering -- means there's exactly one way to soft-delete or query "including deleted" records, not two that could quietly drift apart.

**`cxo_teams`** -- the leadership/reporting-hierarchy roster. `lead` and `manager` are `ObjectId` references back into the same collection, which is what makes org-chart traversal (a member's direct reports, or their manager chain) possible without a separate hierarchy table. `emailId`, `empIdNew`, and `empIdOld` are each unique via a **partial unique index** scoped to `{ isDeleted: { $ne: true } }` (see "Append vs. replace" above) instead of a plain `unique: true` -- `empIdOld`'s partial filter also requires the field to exist, replacing what used to be a plain `sparse: true` (not every member has a legacy ID). `level` and `group` are free-form strings rather than hardcoded enums, since org-level codes and group names vary by company and change independently of the schema. Indexes: `lead`, `manager` (hierarchy lookups), compound `group + level` (common dashboard filter), and a text index on `name + designation` (search). `backend/scripts/seeders/seedCxoTeams.mjs` seeds a 25-person, 4-level hierarchy (1 CEO -> 4 Directors -> 8 Managers -> 12 individual contributors) with pre-generated `_id`s so `lead`/`manager` can reference a person earlier in the same `insertMany` batch.

**`cxo_permissions`** -- grants a set of actions to a member on a named `resource` string (e.g. `cxo_teams`, `business_teams`, or `*` for global). Deliberately *not* modeled as one boolean field per permission type (`canCreate`, `canEdit`, ...) -- `actions` is an array of strings validated against `PERMISSION_ACTIONS` in `config/constants.js`. Adding a new permission type later (`approve`, `export`, `archive`) is a one-line addition to that constant; the schema and every existing document are untouched. A partial unique compound index on `member + resource` (scoped to non-deleted documents) both prevents duplicate grants and is the primary query pattern ("what can member X do on resource Y"); a single index on `resource` supports the reverse lookup ("who can access Y"). `expiresAt` supports time-bound grants without a separate table. `backend/scripts/seeders/seedCxoPermissions.mjs` seeds a representative spread of grants over the `cxo_teams` roster it's handed (a global grant for the CEO, roster/business-roster grants for each Director, ticket/task grants split across the Managers).

**`business_teams`** -- a business-unit roster, independent of `cxo_teams` (no reference between them -- a person can appear in both, linked only by the shared `emailId`, since the two collections represent different views of the org rather than a parent/child relationship). `emailId` is unique via the same partial-index pattern as `cxo_teams`. Also indexed on `business + location` (common filter) and a text index on `name`. `backend/scripts/seeders/seedBusinessTeams.mjs` seeds 25 members across 5 business units.

**`users`** -- app accounts backing the Dashboard's mock identity (see "Dashboard and mock identity" above). `role` (`USER_ROLES` in `config/constants.js`) and `isDemoAccount` are the two fields that exist purely for this mock: once real authentication exists, `isDemoAccount` and the seed script disappear but `role` becomes the real thing. `email` is unique via the same partial-index pattern as every other resource.

**`news_bulletins`** -- Dashboard announcements. `description` always holds the full text; truncating to a 3-line preview is a frontend display concern (`line-clamp-3`), not something the API does, so the "View more" modal never needs a second request. Indexed on `publishedAt` descending (latest-first is the only read pattern) and a text index on `title`.

**`tickets`** / **`tasks`** -- a person's raw activity log, scoped to them via `assignedTo` (`ObjectId` ref `User`). Deliberately separate from `leaderboard_entries` rather than the source of a live leaderboard computation -- see the next paragraph. Both indexed on `assignedTo + createdAt` (the Individual Contribution panel's read pattern) and `status`.

**`leaderboard_entries`** -- one scored snapshot per user per date, not a live aggregation over `tickets`/`tasks`/etc. on every request. A snapshot gives the panel a stable, comparable "as of this date" view (with a Year/Month filter to look at earlier snapshots) for the cost of a cheap sort over a bounded collection (100 people), instead of reconstructing an expensive point-in-time aggregation across several collections on every page load. `overallScore` is a pre-computed weighted total (see `backend/scripts/seeders/seedLeaderboard.mjs` for the seed-time weighting); **rank is intentionally not stored** -- `LeaderboardService.getEntriesForPeriod`/`getEntriesForDate` sorts by `overallScore` and computes rank at read time, so it can never silently drift from the score the way a separately-stored rank field could. A partial unique compound index on `user + snapshotDate` prevents duplicate snapshots and is the primary query pattern.

**Validation** happens at two layers deliberately: zod schemas (`validations/`) reject bad input before it reaches a service, and Mongoose schema-level rules (`required`, `unique`, `match` against a shared `EMAIL_REGEX`, `enum`, `maxlength`) are the database's own last-line guarantee, independent of whatever validated the same rules upstream. `middlewares/errorHandler.js` normalizes whichever one catches a problem (a raw Mongoose `ValidationError`/`CastError`/duplicate-key error) into the same `{ success: false, message, details }` shape as a zod rejection, so API consumers never see two different error formats depending on which layer caught the issue.

**Scalability**: no collection hardcodes anything that's likely to change shape -- permission types, org levels, and future one-off fields all go through arrays/free-form strings/the `metadata` bag instead of new columns. Every collection is soft-deletable and audit-tracked from day one, so retention/compliance requirements later don't require a migration. Adding a new collection means one model file using the same plugin -- no changes to existing ones.

## What was deliberately left out

No login form, no real authentication/authorization, no notification
templates -- only the generic scaffolding (including the `users` collection
and mock identity described above) that lets those be added later without
restructuring. Auth becomes a middleware + a service; notifications become an
`eventBus` subscriber; further dashboards/reports/analytics become new
controllers + pages built from the same base classes and UI kit already in
place.

## Suggested improvements for long-term maintainability

Recommendations from the most recent architecture review, roughly in the
order they'll matter most as the app and team grow:

1. **Automated tests.** None exist yet on either side. Recommended stack:
   Vitest + React Testing Library for frontend hooks/components; Vitest (or
   Jest) + Supertest + `mongodb-memory-server` for backend route/service
   tests. `BaseService`/`BaseRepository`/`ManagementPage` are exactly the
   kind of shared, high-leverage code worth testing once and trusting
   everywhere else.
2. **CI pipeline** (GitHub Actions or equivalent) running `npm run lint` and
   the above tests on every push/PR for both packages -- currently lint-clean
   code depends entirely on a human remembering to run it.
3. **Pre-commit hooks** (husky + lint-staged) so ESLint/Prettier run before a
   commit lands, not just on demand.
4. **Rate limiting** (`express-rate-limit` or similar) on the backend,
   particularly the bulk-import endpoints, before this API is ever reachable
   from outside a trusted internal network.
5. **API documentation** (OpenAPI/Swagger, generated from or alongside the
   existing zod schemas) once there's more than one frontend consuming this
   API, or any external integration.
6. **A real query cache** (React Query or SWR) to replace `utils/apiCache.js`
   -- already a deliberate, documented seam for exactly this swap, not a
   design that needs to be undone first.
7. **Migration tooling** (e.g. `migrate-mongo`) once `schemaVersion` bumps
   start actually happening -- the field exists today but nothing consumes
   it yet.
8. **Authentication and authorization.** The single biggest deferred piece.
   `cxo_permissions` already models the shape a real authorization check
   needs (member + resource + actions), and the `users` collection (currently
   mock/dummy accounts -- see "Dashboard and mock identity") already models
   the shape a real account needs; adding auth means a new
   `auth.middleware.js`/`authorize.middleware.js` (slots into the existing
   middleware chain), a login page under `AuthLayout` (already provisioned
   and currently unused), and `ProtectedRoute.jsx` (already a documented
   pass-through waiting to become a real guard) -- no other file changes.
9. **Correlation/request IDs** in `requestLogger`/`logger` once there is more
   than one backend instance, to make it possible to trace one request's
   logs across a load-balanced deployment.
10. **Rate-limit/paginate the leaderboard's snapshot growth.** `leaderboard_entries`
    grows by (participant count) per snapshot date -- fine at today's weekly
    cadence and 100 participants, but worth revisiting (e.g. archiving old
    snapshots) if the cadence increases or the population grows substantially.
