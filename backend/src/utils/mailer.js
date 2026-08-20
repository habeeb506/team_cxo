import nodemailer from 'nodemailer';

import config from '../config/index.js';
import logger from './logger.js';

/**
 * OTP email delivery. In dev mode (`config.isOtpDevMode`, the default
 * while `SMTP_*` env vars are unset) this just logs the code instead of
 * emailing it, so local login works with zero email setup. Once
 * `OTP_DEV_MODE=false` and real `SMTP_*` credentials are in `.env`, this
 * sends an actual email via the standard SMTP transport below -- works
 * with Gmail (App Password), Outlook/Office365, or any other SMTP
 * provider without code changes, just env vars (see config/index.js and
 * .env.example).
 *
 * Whether the code is *also* echoed back in the API response (so the
 * login page can still show it as a temporary convenience even after
 * real delivery is on) is a separate, independent decision -- see
 * `config.otpEchoInResponse` and services/AuthService.requestOtp.
 */
let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  cachedTransporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: { user: config.smtpUser, pass: config.smtpPass },
  });
  return cachedTransporter;
}

export async function sendOtpEmail({ to, otp, expiresInMinutes }) {
  if (config.isOtpDevMode) {
    logger.info(
      `[OTP_DEV_MODE] Login code for ${to}: ${otp} (expires in ${expiresInMinutes} minute${
        expiresInMinutes === 1 ? '' : 's'
      }). OTP_DEV_MODE=true, so no real email was sent -- see utils/mailer.js.`,
    );
    return { delivered: false, devMode: true };
  }

  if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
    // Fail loudly rather than silently pretending an email went out --
    // this only happens if OTP_DEV_MODE was switched off before SMTP_*
    // was actually filled in.
    throw new Error(
      'OTP_DEV_MODE is false but SMTP_HOST/SMTP_USER/SMTP_PASS are not fully set in .env. ' +
        'Fill in real SMTP credentials, or set OTP_DEV_MODE=true until you do.',
    );
  }

  const expiryText = `${expiresInMinutes} minute${expiresInMinutes === 1 ? '' : 's'}`;
  await getTransporter().sendMail({
    from: config.smtpFrom,
    to,
    subject: 'Your Technet login code',
    text: `Your login code is ${otp}. It expires in ${expiryText}.`,
    html: `<p>Your login code is <strong style="font-size:1.2em;letter-spacing:0.1em;">${otp}</strong>.</p><p>It expires in ${expiryText}.</p>`,
  });

  return { delivered: true, devMode: false };
}
