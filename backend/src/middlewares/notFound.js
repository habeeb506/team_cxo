import ApiError from '../utils/ApiError.js';

/**
 * Catches any request that didn't match a route and forwards a
 * consistent 404 ApiError to the central error handler.
 */
export default function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}
