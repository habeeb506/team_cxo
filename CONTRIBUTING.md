# Contributing

This is the "how to work in this codebase" guide. **[ARCHITECTURE.md](./ARCHITECTURE.md)** explains *why* the codebase is shaped the way it is; this document explains the conventions to follow and the exact steps for adding a new module. Read ARCHITECTURE.md first if you haven't.

## Ground rules

- Every source file stays under 500 lines. Split by responsibility when a file approaches that, the way `useManagementPageState` composes six smaller hooks instead of being one large one.
- No duplicated logic. If you're about to copy a function between two resources, it belongs in `utils/`, a base class, or a shared hook instead.
- Every resource is validated the same way: a zod schema (`validations/`) at the API boundary, and the equivalent Mongoose-level rules (`required`, `unique`, `enum`, `maxlength`) as the database's own last line of defense. Both layers exist on purpose — see ARCHITECTURE.md's "Data layer" section.
- Soft delete is implemented exactly once, in `BaseRepository`. Never add a `delete`/`restore` method to a model or a service that bypasses it.
- No environment values read outside `backend/src/config/`. No hardcoded route strings outside `frontend/src/constants/routePaths.js`.
- Never use "tektreeinc", "tektree", or "tektreeinc.com" anywhere in this project — sample data, seed scripts, example emails/domains/URLs always use `sample`/`sample.com`.
- Run your usual lint (`npm run lint` in each package) and `node --check` on any backend file before considering a change done. This sandbox's editor has occasionally produced truncated file writes in the past — always re-verify a file parses after editing it, don't assume the edit tool's success message alone is enough.

## Naming conventions

**Backend.** A file's casing tells you what it exports:

| Casing | Used for | Example |
|---|---|---|
| PascalCase | Files exporting an ES6 **class** | `CxoTeam.model.js`, `CxoTeamRepository.js`, `CxoTeamService.js` |
| camelCase | Files exporting plain objects/functions | `cxoTeam.controller.js`, `cxoTeam.routes.js`, `cxoTeam.schema.js` |

A model's Mongoose name is PascalCase singular (`CxoTeam`); its MongoDB collection name is snake_case plural, passed explicitly as `mongoose.model('CxoTeam', schema, 'cxo_teams')`.

**Frontend.** Same PascalCase-class / camelCase-function split applies, with one nuance: `api/services/cxoTeamApiService.js` is camelCase even though it *contains* a PascalCase class (`CxoTeamApiService`), because the file's default export is a singleton **instance** of that class, not the class itself — standard instance-vs-class convention. Feature config files (`features/cxoTeams/cxoTeam.management.config.js`) are camelCase for the same reason: they export plain objects/arrays, not classes. Page components (`pages/CxoTeamsPage.jsx`) and everything under `components/` are PascalCase, since they export a component function.

**Folders vs. files are usually pluralized differently on purpose**: a feature folder is plural (`features/cxoTeams/`, matching the roster it represents) but the config file inside it is singular (`cxoTeam.management.config.js`, matching the one record shape it describes). The scaffold script (below) follows this automatically as long as you give it a singular PascalCase name and a plural kebab-case route segment.

## Adding a new module

Use `scripts/scaffold-module.mjs` for any new CRUD resource (Floor Leaders, Applications, Tasks, Appreciations, News Bulletin, Portfolios, Contributions, Distribution Lists, and — as a storage foundation, see "Non-CRUD modules" below — MOM Generator). It generates backend and frontend files in the exact shape as the existing `CxoTeam`/`BusinessTeam` modules, with `TODO` markers where the resource's real fields belong.

```bash
node scripts/scaffold-module.mjs <PascalCaseName> <kebab-route-segment>

# Example: a new "Tasks" module
node scripts/scaffold-module.mjs Task tasks
```

This creates:

- `backend/src/models/Task.model.js` — Mongoose schema (one placeholder `name` field, the audit plugin, one partial unique index, one text index)
- `backend/src/repositories/TaskRepository.js` — extends `BaseRepository`
- `backend/src/validations/task.schema.js` — zod `createTaskSchema`/`updateTaskSchema`
- `backend/src/services/TaskService.js` — extends `BaseService`
- `backend/src/controllers/task.controller.js` — via `createCrudController`
- `backend/src/routes/v1/task.routes.js` — full CRUD + `/import` + `/bulk-delete`
- `frontend/src/api/services/taskApiService.js` — `ApiService` subclass
- `frontend/src/features/tasks/task.management.config.js` — columns, form fields, CSV config
- `frontend/src/pages/TasksPage.jsx` — renders `<ManagementPage />`

It then prints a checklist of the small, fixed set of existing "registry" files that need exactly one line added each. The script does not touch these automatically — inserting a line into an existing file safely is riskier as a blind script edit than as a deliberate one-line change with the file open:

1. `backend/src/models/index.js` — add the model's export
2. `backend/src/repositories/index.js` — add the repository's export
3. `backend/src/services/index.js` — add the service's export
4. `backend/src/controllers/index.js` — add the controller's export
5. `backend/src/validations/index.js` — add the create/update schema exports
6. `backend/src/routes/v1/index.js` — import the router, `router.use('/tasks', taskRoutes)`
7. `frontend/src/api/services/index.js` — add the API service's export
8. `frontend/src/constants/routePaths.js` — add `tasks: '/tasks'`
9. `frontend/src/routes/routeConfig.js` — import the page, add `{ path: ROUTE_PATHS.tasks, element: TasksPage }` to the routes array (a component reference, not JSX — match the existing entries)
10. `frontend/src/components/layout/Sidebar.jsx` — add `{ label: 'Tasks', path: ROUTE_PATHS.tasks }` to `NAV_ITEMS`
11. `frontend/src/constants/quickLinks.js` — point the module's existing tile at `ROUTE_PATHS.tasks` instead of the `ModulePlaceholderPage` default

After wiring the registry files:

1. Replace every `TODO` in the generated files with the resource's real fields. Keep the Mongoose schema and the zod schema describing the same shape.
2. Set `uniqueFields` in the service and `allowedFilters`/`searchableFields` in the controller to match the real fields.
3. Fill in `*_COLUMNS`, `*_FILTERS`, `*_FIELDS`, and the CSV `mapImportRow`/`templateSampleRow` in the generated `*.management.config.js` — this one file drives the table, the form, the view modal, and CSV import/export, so there's nothing else to wire on the frontend.
4. `cd backend && node --check src/models/Task.model.js` (repeat per generated backend file, or just run the package's lint script).
5. Run each package's lint script and confirm no file crossed 500 lines.

## Non-CRUD modules

Nine of the eleven planned modules (Floor Leaders, Applications, Tasks, Appreciations, News Bulletin, Portfolios, Progress-adjacent rosters, Contributions, Distribution Lists) are naturally CRUD rosters and fit the scaffold above directly. Two don't, and shouldn't be forced into `ManagementPage` just because it's available:

- **MOM Generator** is a document-generation tool, not just a roster. Scaffold it normally for the storage layer (a `MomRecord` resource: title, date, attendees, notes), but add a custom controller action alongside the generated CRUD ones for the actual "generate" behavior (e.g. `POST /mom-records/:id/generate`), and a bespoke frontend page rather than plain `ManagementPage` if the generation UI needs more than a form.
- **Progress Dashboard** is a read-only aggregation view over other collections (task completion %, contribution counts), not a roster of its own records. It doesn't need a scaffolded model at all — build a custom controller endpoint that aggregates from the relevant existing resources, and a custom page composed from the same `components/ui/` kit (cards, `DataTable`, etc.) rather than `ManagementPage`.

In both cases, `BaseService`/`BaseController` are designed to be extended, not replaced: add the extra method next to the inherited CRUD ones, the same way `CxoPermissionService` overrides `list`/`getById` for its one custom need while everything else stays inherited.

**Read-only resources.** `users`, `news_bulletins`, `tickets`, `tasks`, and `leaderboard` (the Dashboard's backing data) follow this same "don't build UI nobody asked for" principle from the other direction: the scaffold's model/repository/service layering applies, but only `GET` routes are registered — no create/update/delete/import routes exist yet, since only the Dashboard reads them today. If one of these needs a real admin UI later, add the missing validation schemas + routes + a `*.management.config.js`/page the same way any scaffolded resource would, rather than inventing a new pattern.

## Adding demo/seed data

`backend/scripts/seed.mjs` (with helpers in `backend/scripts/seeders/`) populates local MongoDB with dummy data for the Dashboard: `users` (100 total, 20 flagged `isDemoAccount` for the frontend's mock "logged in as" switcher — see ARCHITECTURE.md's "Dashboard and mock identity"), `news_bulletins`, `tickets`/`tasks` per demo user, and `leaderboard_entries` snapshots. Run it with `npm run seed --prefix backend`; it's safe to re-run (every affected collection is cleared first). If you add a new seed-worthy resource, add a `seeders/seedX.mjs` following the same pattern (accepts already-created dependencies as arguments, returns the created documents) and wire it into `seed.mjs`'s `run()`.

## API standards

- Every route is versioned under `/api/v1/...`. A breaking change gets a `v2` router, not a modification to `v1`.
- List endpoints (`GET /`) accept `page`, `limit` (capped by `PAGINATION_DEFAULTS.MAX_LIMIT`), `sort`, `search`, and whatever `allowedFilters` the controller declares.
- Every resource gets `POST /import` (`{ records, mode: 'append' | 'replace' }`) and `POST /bulk-delete` (`{ ids }`) for free from `BaseService`/`BaseController` — no per-resource bulk code (unless deliberately omitted for a read-only resource — see above).
- Responses use the shared `apiResponse` envelope (`{ success, message, data, pagination? }`) via `utils/apiResponse.js`; errors are normalized by `middlewares/errorHandler.js` into `{ success: false, message, details? }` regardless of whether a zod schema, a Mongoose validator, or a duplicate-key error caught the problem.

## Database standards

- Every collection uses `models/plugins/auditableSchema.plugin.js` for `isDeleted`/`deletedAt`/`createdBy`/`updatedBy`/`schemaVersion`/`metadata`.
- Any field that must be unique uses a **partial unique index** scoped to `{ isDeleted: { $ne: true } }`, not a plain `unique: true` — otherwise CSV "replace" mode (which soft-deletes before reinserting) collides with the soft-deleted rows at the index level. The scaffolded model includes one example of this on the placeholder `name` field.
- Enum-like values that are likely to grow (permission actions, status values, roles) are modeled as a constant array in `config/constants.js`, validated against with zod/Mongoose `enum`, rather than hardcoded in multiple places.
- Fields that don't yet warrant a real schema addition can go in the plugin's `metadata` object rather than triggering a migration for a one-off need.
- A snapshot-style collection (like `leaderboard_entries`) never stores a derived/computed field (like rank) that could drift from the values it's derived from — compute it at read time in the service instead.

## Before you open a PR / hand off work

There's no CI or automated test suite yet (see ARCHITECTURE.md's "Suggested improvements" for the recommended plan), so this checklist is the manual substitute:

1. `npm run lint` in both `backend/` and `frontend/` — zero errors, zero warnings.
2. No file over 500 lines (`wc -l` the ones you touched).
3. `node --check` on every backend `.js`/`.mjs` file you added or edited.
4. If you touched a Mongoose schema, confirm the matching zod schema still describes the same fields.
5. If you added a resource, confirm both directions of the "registry files" checklist the scaffold script printed are done — a missing route registration fails silently as a 404, not a build error.
