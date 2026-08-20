import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * auth_otps -- short-lived, one-time login codes for email-OTP
 * authentication (see services/AuthService.js, routes/v1/auth.routes.js).
 * Deliberately not a business/CRUD collection, so it doesn't use
 * auditableSchemaPlugin (no soft delete, no createdBy/updatedBy --
 * these documents are inherently ephemeral and never edited, only
 * created and consumed/expired).
 *
 * Only a salted hash of the code is ever stored (see utils/otp.js) --
 * never the code itself -- so a database read can't be used to log in
 * as someone else. `expiresAt` has a TTL index so Mongo automatically
 * removes expired documents; `attempts` bounds brute-force guesses per
 * requested code (see config.otpMaxAttempts).
 */
const authOtpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

// TTL index: MongoDB's background task removes a document once
// `expiresAt` is in the past, so old/used codes never accumulate.
authOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('AuthOtp', authOtpSchema, 'auth_otps');
