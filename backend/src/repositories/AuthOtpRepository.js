import { AuthOtp } from '../models/index.js';

import BaseRepository from './BaseRepository.js';

class AuthOtpRepository extends BaseRepository {
  constructor() {
    super(AuthOtp);
  }

  /** Most recent not-yet-consumed, not-yet-expired code requested for this email. */
  findActiveForEmail(email) {
    return this.model
      .findOne({ email, consumedAt: null, expiresAt: { $gt: new Date() } })
      .sort('-requestedAt')
      .exec();
  }

  /** Most recent request for this email regardless of state, to enforce the resend cooldown. */
  findMostRecentForEmail(email) {
    return this.model.findOne({ email }).sort('-requestedAt').exec();
  }

  /** Invalidates every still-active code for this email by marking it consumed. */
  invalidateActiveForEmail(email) {
    return this.model.updateMany(
      { email, consumedAt: null, expiresAt: { $gt: new Date() } },
      { consumedAt: new Date() },
    );
  }
}

export default AuthOtpRepository;
