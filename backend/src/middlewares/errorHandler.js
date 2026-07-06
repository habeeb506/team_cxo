import { HTTP_STATUS } from '../config/constants.js';
import { isProduction } from '../config/index.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Normalizes any thrown error (ApiError, mongoose errors, or unexpected
 * bugs) into an ApiError so the response shape is always consistent.
 */
function normalizeError(err) {
  if (err instanceof ApiError) return err;

  // Mongoose validation errors
  if (err.name === 'ValidationError' && err.errors) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.badRequest('Validation failed', details);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return ApiError.conflict(`Duplicate value for field: ${field || 'unknown'}`);
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    return ApiError.badRequest(`Invalid value for field: ${err.path}`);
  }

  return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message || 'Internal server error', {
    isOperational: false,
  });
}

/**
 * Central error-handling middleware. Must be registered last, after all
 * routes. Every error in the app (sync, async via asyncHandler, or from
 * notFound) ends up here.
 */
// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
  const apiError = normalizeError(err);

  if (!apiError.isOperational) {
    logger.error(`${req.method} ${req.originalUrl} - ${err.stack || err.message}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${apiError.message}`);
  }

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    details: apiError.details,
    ...(isProduction ? {} : { stack: err.stack }),
  });
}
