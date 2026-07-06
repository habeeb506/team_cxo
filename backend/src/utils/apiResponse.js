import { HTTP_STATUS } from '../config/constants.js';

/**
 * Single response envelope used by every controller, so every endpoint
 * — today's health check, tomorrow's dashboards/reports/analytics —
 * returns the same shape and frontend code can rely on it unconditionally.
 *
 * Success: { success: true, data, meta? }
 * Errors are handled separately by middlewares/errorHandler.js.
 */
export function sendSuccess(res, statusCode = HTTP_STATUS.OK, data = null, meta = {}) {
  if (statusCode === HTTP_STATUS.NO_CONTENT) {
    return res.status(statusCode).end();
  }
  return res.status(statusCode).json({
    success: true,
    data,
    ...meta,
  });
}
