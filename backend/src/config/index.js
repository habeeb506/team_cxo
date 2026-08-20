import dotenv from 'dotenv';

import { ENVIRONMENTS } from './constants.js';

dotenv.config();

/**
 * Required environment variables. Fail fast on startup if any are missing,
 * rather than surfacing confusing errors later at request time.
 */
const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET'];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Copy .env.example to .env and fill in the values.',
    );
  }
}

validateEnv();

const config = {
  env: process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT,
  port: Number(process.env.PORT) || 4000,
  apiVersion: process.env.API_VERSION || 'v1',
  mongoUri: process.env.MONGODB_URI,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Auth (email-OTP login -- see routes/v1/auth.routes.js). JWT_SECRET
  // is required (see REQUIRED_ENV_VARS above) since it signs every
  // session token (utils/jwt.js) -- there's no safe default for it.
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresInSeconds: Number(process.env.JWT_EXPIRES_IN_SECONDS) || 60 * 60 * 8, // 8 hours
  otpExpiresInMinutes: Number(process.env.OTP_EXPIRES_IN_MINUTES) || 5,
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS) || 5,
  otpRequestCooldownSeconds: Number(process.env.OTP_REQUEST_COOLDOWN_SECONDS) || 30,
  // Dev mode: with no SMTP configured, the OTP is logged (utils/mailer.js)
  // and echoed back in the API response instead of emailed, so local
  // development works with zero email setup. Set OTP_DEV_MODE=false once
  // SMTP_* below is filled in with real credentials, so utils/mailer.js
  // actually emails the code instead of just logging it.
  isOtpDevMode: process.env.OTP_DEV_MODE !== 'false',

  // SMTP transport for real OTP email delivery (utils/mailer.js), used
  // whenever isOtpDevMode is false. Works with any standard SMTP
  // provider (Gmail with an App Password, Outlook/Office365, a
  // transactional provider's SMTP endpoint, ...) -- no code changes
  // needed to switch providers, just these env vars.
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  // Most providers: 465 = implicit TLS (secure=true), 587 = STARTTLS
  // (secure=false, still encrypted -- nodemailer upgrades the connection).
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || process.env.SMTP_USER || '',

  // Temporary: keep echoing the OTP in the request-otp API response (and
  // showing it on the login page) even after real SMTP delivery is
  // turned on, so login can still be tested/demoed without reading an
  // inbox. Independent of isOtpDevMode -- this is a "trust, but verify"
  // step for the transition to real email, not dev-only. Flip to false
  // once real delivery is confirmed working, before this is ever used
  // somewhere the response could be seen by anyone but the account owner.
  otpEchoInResponse: process.env.OTP_ECHO_IN_RESPONSE !== 'false',

  // App-wide access gate (see middlewares/hostAllowlist.middleware.js):
  // only requests whose Host header matches one of these are served at
  // all -- everything else gets a 403 before auth/routing even runs.
  // Comma-separated, case-insensitive, port included when non-default
  // (e.g. "technet.internal.example.com,localhost:4000"). An empty list
  // (nothing configured) disables the gate rather than locking everyone
  // out, since a misconfigured allowlist would otherwise take the whole
  // API down.
  allowedHosts: (process.env.ALLOWED_HOSTS || '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean),
};

export const isProduction = config.env === ENVIRONMENTS.PRODUCTION;
export const isDevelopment = config.env === ENVIRONMENTS.DEVELOPMENT;
export const isTest = config.env === ENVIRONMENTS.TEST;

export default config;
