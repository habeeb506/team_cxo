import { AUTH_COOKIE_NAME } from '../config/constants.js';
import ApiError from '../utils/ApiError.js';
import { parseCookies } from '../utils/cookies.js';
import { verifyJwt } from '../utils/jwt.js';

/**
 * The single choke point every protected route goes through (see
 * routes/v1/index.js). Reads the signed session cookie, verifies it,
 * and attaches the *real, cryptographically-verified* identity to
 * `req.user` -- every controller downstream reads `req.user.id` for
 * "who is making this request" instead of trusting anything the client
 * sends in the body/query (which is exactly how the old mock "logged
 * in as" switcher could be used to view/act as anyone; see
 * controllers/ticket.controller.js's and task.controller.js's `getMine`
 * for where that mattered most).
 *
 * A missing or invalid/expired cookie is rejected with 401 rather than
 * silently treated as "no user" -- every route mounted behind this
 * requires a real session.
 */
export default function requireAuth(req, res, next) {
  const cookies = parseCookies(req);
  const token = cookies[AUTH_COOKIE_NAME];

  if (!token) {
    return next(ApiError.unauthorized('Not authenticated'));
  }

  try {
    const payload = verifyJwt(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch {
    // Clears whatever bad/expired cookie the browser sent, so a stale
    // cookie doesn't keep failing every request silently.
    res.clearCookie(AUTH_COOKIE_NAME, { httpOnly: true, sameSite: 'lax', path: '/' });
    return next(ApiError.unauthorized('Session expired -- please log in again'));
  }
}
