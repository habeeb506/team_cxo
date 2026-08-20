export { default as errorHandler } from './errorHandler.js';
export { default as hostAllowlist } from './hostAllowlist.middleware.js';
export { default as notFound } from './notFound.js';
export { default as requestLogger } from './requestLogger.js';
export { default as requireAuth } from './auth.middleware.js';
export { default as validateRequest } from './validateRequest.js';

/**
 * Future cross-cutting middleware (e.g. a role/permission-based
 * `authorize.middleware.js` built on `cxo_permissions`) registers here
 * the same way.
 */
