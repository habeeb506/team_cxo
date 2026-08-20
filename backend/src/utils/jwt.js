import crypto from 'node:crypto';

import config from '../config/index.js';

/**
 * Minimal, dependency-free JWT (HS256 only) built on Node's built-in
 * `crypto` module instead of pulling in the `jsonwebtoken` package.
 * Deliberately narrow: signing always uses HMAC-SHA256 with
 * `config.jwtSecret` and verification never reads `alg` from the token
 * itself, so there's no "algorithm confusion" surface to worry about
 * (a real risk with general-purpose JWT libraries that trust the
 * token's own header). If broader JWT/JWKS support (RS256, rotation,
 * third-party issuers) is ever needed, swap this file for
 * `jsonwebtoken` -- every caller here only depends on
 * `signJwt`/`verifyJwt`'s signatures, not the token format.
 */

function base64UrlEncode(input) {
  return Buffer.from(input).toString('base64url');
}

function base64UrlEncodeJson(value) {
  return base64UrlEncode(JSON.stringify(value));
}

function base64UrlDecodeJson(segment) {
  return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));
}

function sign(headerAndPayload) {
  return crypto.createHmac('sha256', config.jwtSecret).update(headerAndPayload).digest('base64url');
}

/**
 * Signs `payload` into a compact JWT string, valid for
 * `expiresInSeconds` (default: config.jwtExpiresInSeconds).
 */
export function signJwt(payload, expiresInSeconds = config.jwtExpiresInSeconds) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);

  const fullPayload = { ...payload, iat: now, exp: now + expiresInSeconds };

  const headerSegment = base64UrlEncodeJson(header);
  const payloadSegment = base64UrlEncodeJson(fullPayload);
  const signatureSegment = sign(`${headerSegment}.${payloadSegment}`);

  return `${headerSegment}.${payloadSegment}.${signatureSegment}`;
}

/**
 * Verifies a JWT string's signature and expiry, returning the decoded
 * payload. Throws a plain Error (callers -- see middlewares/auth.middleware.js
 * -- translate this into the appropriate ApiError) on any failure:
 * malformed token, bad signature, or expired.
 */
export function verifyJwt(token) {
  if (typeof token !== 'string' || !token) {
    throw new Error('Token is missing');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Token is malformed');
  }
  const [headerSegment, payloadSegment, signatureSegment] = parts;

  const expectedSignature = sign(`${headerSegment}.${payloadSegment}`);
  const providedSignatureBuffer = Buffer.from(signatureSegment);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  const signaturesMatch =
    providedSignatureBuffer.length === expectedSignatureBuffer.length &&
    crypto.timingSafeEqual(providedSignatureBuffer, expectedSignatureBuffer);

  if (!signaturesMatch) {
    throw new Error('Token signature is invalid');
  }

  const payload = base64UrlDecodeJson(payloadSegment);
  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && nowInSeconds >= payload.exp) {
    throw new Error('Token has expired');
  }

  return payload;
}
