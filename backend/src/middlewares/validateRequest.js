import ApiError from '../utils/ApiError.js';

/**
 * Generic request validator. Takes a zod schema shaped like
 * { body?, query?, params? } and validates the matching parts of the
 * request, replacing them with the parsed (and type-coerced) values.
 *
 * Every feature route reuses this one middleware instead of writing
 * bespoke validation logic:
 *   router.post('/', validateRequest(createUserSchema), userController.create);
 */
export default function validateRequest(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(ApiError.badRequest('Validation failed', details));
    }

    if (result.data.body) req.body = result.data.body;
    if (result.data.params) req.params = result.data.params;
    // req.query is read-only in some Express versions; only patch known keys.
    if (result.data.query) Object.assign(req.query, result.data.query);

    next();
  };
}
