import config from '../config/index.js';
import ApiError from '../utils/ApiError.js';

/**
 * App-wide access gate: rejects any request whose `Host` header isn't
 * in the configured allowlist (`ALLOWED_HOSTS` in `.env`, parsed into
 * `config.allowedHosts`). Mounted first in app.js, before helmet/cors/
 * routing, so a request that doesn't match never reaches anything else
 * -- including the public `/auth/*` routes. This is a coarse, "how did
 * this request reach the server" check, distinct from `requireAuth`
 * (middlewares/auth.middleware.js), which verifies *who* is making an
 * already-admitted request; the two are independent layers.
 *
 * Guards against DNS-rebinding-style attacks and stray/unexpected
 * traffic reaching an internal tool via a raw IP or an unapproved
 * domain -- a request can only ever originate from a hostname this app
 * is explicitly meant to be reachable at.
 *
 * `config.allowedHosts` empty (nothing configured) disables this gate
 * entirely rather than rejecting everything, so a blank/misconfigured
 * `.env` fails open on this specific check instead of taking the whole
 * API down -- the required `JWT_SECRET` env var is still what prevents
 * the app from starting with no security at all.
 */
export default function hostAllowlist(req, res, next) {
  if (config.allowedHosts.length === 0) return next();

  const host = (req.headers.host || '').toLowerCase();
  if (config.allowedHosts.includes(host)) return next();

  return next(ApiError.forbidden(`Host '${host}' is not permitted to access this API`));
}
