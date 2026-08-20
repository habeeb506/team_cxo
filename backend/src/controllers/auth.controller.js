import { AUTH_COOKIE_NAME, HTTP_STATUS } from '../config/constants.js';
import config, { isProduction } from '../config/index.js';
import AuthService from '../services/AuthService.js';
import UserService from '../services/UserService.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

const authService = new AuthService();
const userService = new UserService();

/**
 * Shared cookie options for setting/clearing the session cookie.
 * `httpOnly` keeps the token unreadable by any page JS (immune to XSS
 * token theft); `sameSite: 'lax'` blocks it being sent on cross-site
 * requests initiated by other sites; `secure` is required in
 * production (cookie only sent over HTTPS) but left off in dev since
 * localhost isn't served over TLS.
 */
function getCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  };
}

const authController = {
  // POST /auth/request-otp { email }
  requestOtp: asyncHandler(async (req, res) => {
    const result = await authService.requestOtp(req.body.email);
    sendSuccess(res, HTTP_STATUS.OK, result);
  }),

  // POST /auth/verify-otp { email, otp }
  verifyOtp: asyncHandler(async (req, res) => {
    const { user, token } = await authService.verifyOtp(req.body);
    res.cookie(AUTH_COOKIE_NAME, token, {
      ...getCookieOptions(),
      maxAge: config.jwtExpiresInSeconds * 1000,
    });
    sendSuccess(res, HTTP_STATUS.OK, user);
  }),

  // POST /auth/logout
  logout: asyncHandler(async (_req, res) => {
    res.clearCookie(AUTH_COOKIE_NAME, getCookieOptions());
    sendSuccess(res, HTTP_STATUS.OK, { message: 'Logged out' });
  }),

  // GET /auth/me -- requires middlewares/auth.middleware.js's requireAuth,
  // which attaches the minimal { id, email, role } from the verified JWT
  // to req.user; this route fetches the full profile the frontend hydrates
  // its session from on load.
  me: asyncHandler(async (req, res) => {
    const user = await userService.getById(req.user.id).catch(() => null);
    if (!user) throw ApiError.unauthorized('Session is no longer valid');
    sendSuccess(res, HTTP_STATUS.OK, user);
  }),
};

export default authController;
