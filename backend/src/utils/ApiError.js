/**
 * Standard operational error type for the whole API.
 * Throw this (or a subclass) anywhere in controllers/services instead of
 * a plain Error, so the central error handler can format a consistent
 * response and distinguish expected failures from bugs.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code to send.
   * @param {string} message - Human-readable message safe to expose to clients.
   * @param {object} [options]
   * @param {Array<{field?: string, message: string}>} [options.details] - Field-level errors (e.g. validation).
   * @param {boolean} [options.isOperational] - True for expected/handled errors vs. programming bugs.
   */
  constructor(statusCode, message, { details = [], isOperational = true } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) {
    return new ApiError(400, message, { details });
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message, details) {
    return new ApiError(409, message, { details });
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, { isOperational: false });
  }
}

export default ApiError;
