/**
 * Wraps an async route/controller function so rejected promises are
 * forwarded to Express's error-handling middleware, instead of requiring
 * a try/catch in every handler.
 *
 * Usage: router.get('/', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
