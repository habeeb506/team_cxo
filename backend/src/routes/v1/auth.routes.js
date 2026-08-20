import { Router } from 'express';

import authController from '../../controllers/auth.controller.js';
import requireAuth from '../../middlewares/auth.middleware.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { requestOtpSchema, verifyOtpSchema } from '../../validations/index.js';

const router = Router();

// Public -- these are how a session is obtained in the first place, so
// they can't themselves require one. Every other route in the API sits
// behind requireAuth (see routes/v1/index.js).
router.post('/request-otp', validateRequest(requestOtpSchema), authController.requestOtp);
router.post('/verify-otp', validateRequest(verifyOtpSchema), authController.verifyOtp);
// Logout just clears a cookie -- safe (and useful) to allow even with
// an already-expired/missing session, so it isn't gated behind requireAuth.
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
