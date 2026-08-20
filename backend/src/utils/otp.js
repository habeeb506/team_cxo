import crypto from 'node:crypto';

/**
 * OTP generation/hashing helpers backing email-based login (see
 * models/AuthOtp.model.js, services/AuthService.js). The code itself is
 * never stored -- only a salted SHA-256 hash of it -- so a database
 * read (or leak) never exposes a usable login code. `crypto.randomInt`
 * (cryptographically secure) is used instead of `Math.random`, which is
 * not safe for anything security-sensitive.
 */

const OTP_LENGTH = 6;
const OTP_MIN = 10 ** (OTP_LENGTH - 1); // 100000
const OTP_MAX = 10 ** OTP_LENGTH; // 1000000 (exclusive upper bound for randomInt)

/** A cryptographically-random 6-digit numeric code, as a string (preserves leading digits). */
export function generateOtp() {
  return String(crypto.randomInt(OTP_MIN, OTP_MAX));
}

/** A random per-OTP salt, so identical codes never hash to the same value. */
export function generateOtpSalt() {
  return crypto.randomBytes(16).toString('hex');
}

/** Deterministic salted hash of an OTP code, for storage/comparison. */
export function hashOtp(code, salt) {
  return crypto.createHash('sha256').update(`${salt}:${code}`).digest('hex');
}

/** Constant-time comparison of two hash strings, to avoid timing side-channels. */
export function hashesMatch(hashA, hashB) {
  const bufferA = Buffer.from(hashA);
  const bufferB = Buffer.from(hashB);
  return bufferA.length === bufferB.length && crypto.timingSafeEqual(bufferA, bufferB);
}
