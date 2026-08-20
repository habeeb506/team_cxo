import config from '../config/index.js';
import ApiError from '../utils/ApiError.js';
import { signJwt } from '../utils/jwt.js';
import { sendOtpEmail } from '../utils/mailer.js';
import { generateOtp, generateOtpSalt, hashOtp, hashesMatch } from '../utils/otp.js';
import { getOsUsername } from '../utils/machineIdentity.js';
import AuthOtpRepository from '../repositories/AuthOtpRepository.js';
import UserRepository from '../repositories/UserRepository.js';

/**
 * Email-OTP authentication. Replaces the old frontend-only mock
 * "logged in as" switcher (which let a browser claim to be any seeded
 * user with no verification at all) with a real login: a one-time code
 * is emailed to the address, and only proving receipt of that code
 * issues a session (see controllers/auth.controller.js for how the
 * resulting JWT becomes an httpOnly cookie, and
 * middlewares/auth.middleware.js for how every other route then trusts
 * `req.user` instead of anything the client claims about itself).
 */
class AuthService {
  constructor() {
    this.otpRepository = new AuthOtpRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Issues a fresh OTP for `email` if that address has an account.
   * Responds identically whether or not the account exists (except when
   * `config.otpEchoInResponse` is on, where the code is echoed back --
   * see utils/mailer.js and config/index.js) so this endpoint can't be
   * used to discover which email addresses are registered.
   */
  async requestOtp(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const genericResponse = { message: 'If that email has an account, a login code has been sent.' };

    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) return genericResponse;

    const mostRecent = await this.otpRepository.findMostRecentForEmail(normalizedEmail);
    if (mostRecent) {
      const secondsSinceRequested = (Date.now() - mostRecent.requestedAt.getTime()) / 1000;
      if (secondsSinceRequested < config.otpRequestCooldownSeconds) {
        const waitSeconds = Math.ceil(config.otpRequestCooldownSeconds - secondsSinceRequested);
        throw ApiError.tooManyRequests(`Please wait ${waitSeconds}s before requesting another code`);
      }
    }

    // Only one active code per email at a time -- requesting a new one
    // invalidates any still-unused prior code.
    await this.otpRepository.invalidateActiveForEmail(normalizedEmail);

    const code = generateOtp();
    const salt = generateOtpSalt();
    const expiresAt = new Date(Date.now() + config.otpExpiresInMinutes * 60 * 1000);

    await this.otpRepository.create({
      email: normalizedEmail,
      codeHash: hashOtp(code, salt),
      salt,
      requestedAt: new Date(),
      expiresAt,
    });

    const deliveryResult = await sendOtpEmail({
      to: normalizedEmail,
      otp: code,
      expiresInMinutes: config.otpExpiresInMinutes,
    });

    // Echoing the code back is independent of whether it was actually
    // emailed (deliveryResult.devMode) -- see config.otpEchoInResponse's
    // docblock. `devNote` explains *why* it's shown differently in each
    // case so the login page's hint stays accurate either way.
    return {
      ...genericResponse,
      ...(config.otpEchoInResponse
        ? {
            otp: code,
            devNote: deliveryResult.devMode
              ? 'OTP_DEV_MODE is on -- no real email was sent.'
              : 'Also emailed to you -- shown here temporarily. Set OTP_ECHO_IN_RESPONSE=false once you confirm delivery works.',
          }
        : {}),
    };
  }

  /**
   * Verifies `otp` for `email`. On success, invalidates the code (so it
   * can't be reused), updates the user's `lastLoginAt`, and returns
   * `{ user, token }` -- `token` is a signed JWT the controller sets as
   * an httpOnly cookie. Throws ApiError.badRequest for any failure
   * (unknown email, no/expired code, wrong code, too many attempts) --
   * deliberately the same error shape for all of these so a caller
   * can't distinguish "wrong code" from "no code was ever requested".
   */
  async verifyOtp({ email, otp }) {
    const normalizedEmail = email.trim().toLowerCase();
    const invalidError = () => ApiError.badRequest('Invalid or expired code');

    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) throw invalidError();

    const activeOtp = await this.otpRepository.findActiveForEmail(normalizedEmail);
    if (!activeOtp) throw invalidError();

    if (activeOtp.attempts >= config.otpMaxAttempts) {
      throw ApiError.badRequest('Too many incorrect attempts -- request a new code');
    }

    const candidateHash = hashOtp(otp, activeOtp.salt);
    if (!hashesMatch(candidateHash, activeOtp.codeHash)) {
      await this.otpRepository.updateById(activeOtp._id, { attempts: activeOtp.attempts + 1 });
      throw invalidError();
    }

    // Device lock, mandatory for every account (see User.model.js's
    // `alias` -- auto-derived from the email's local part -- and
    // utils/machineIdentity.js): the OS username the backend process is
    // running under must match `user.alias`, case-insensitively, or the
    // login is rejected even with a correct OTP. Checked only after the
    // OTP itself is confirmed correct, so a wrong-device attempt never
    // reveals anything about the account to someone who doesn't already
    // have a valid code. On a shared machine (or once this backend is
    // no longer running on each person's own computer -- see
    // machineIdentity.js's docblock), this means only whoever is
    // currently signed into the OS as that alias can complete login,
    // regardless of who has the right email/OTP.
    const currentOsUsername = getOsUsername();
    const isAllowedDevice = currentOsUsername && currentOsUsername.toLowerCase() === user.alias?.toLowerCase();
    if (!isAllowedDevice) {
      throw ApiError.forbidden('This account can only sign in from its assigned computer');
    }

    await this.otpRepository.updateById(activeOtp._id, { consumedAt: new Date() });
    await this.userRepository.updateById(user._id, { lastLoginAt: new Date() });

    const token = signJwt({ sub: String(user._id), email: user.email, role: user.role });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        jobTitle: user.jobTitle,
        lastLoginAt: new Date(),
      },
      token,
    };
  }
}

export default AuthService;
