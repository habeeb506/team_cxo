/**
 * REMOVED -- the machine-identity stand-in (OS user running the
 * backend process) is gone now that real authentication exists (see
 * hooks/useAuth.js, components/layout/Header.jsx). See
 * context/CurrentUserContext.jsx's docblock for why this file still
 * exists as an empty stub instead of being deleted; please delete it
 * (and api/systemApi.js, backend/src/routes/v1/system.routes.js,
 * backend/src/controllers/system.controller.js,
 * backend/src/services/system.service.js) manually.
 */
export {};
