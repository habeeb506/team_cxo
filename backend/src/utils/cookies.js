/**
 * Minimal incoming-cookie parser. Express only exposes `req.cookies`
 * when the `cookie-parser` middleware is installed; rather than add
 * that dependency for reading one cookie, this parses the raw `Cookie`
 * request header directly. Setting cookies on responses doesn't need
 * this -- `res.cookie()` is built into Express already (see
 * controllers/auth.controller.js).
 */
export function parseCookies(req) {
  const header = req.headers?.cookie;
  if (!header) return {};

  return header.split(';').reduce((cookies, pair) => {
    const separatorIndex = pair.indexOf('=');
    if (separatorIndex === -1) return cookies;

    const name = pair.slice(0, separatorIndex).trim();
    const value = pair.slice(separatorIndex + 1).trim();
    if (!name) return cookies;

    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
    return cookies;
  }, {});
}
