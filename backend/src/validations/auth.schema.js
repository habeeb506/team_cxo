import { z } from 'zod';

import { EMAIL_REGEX } from '../config/constants.js';

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .regex(EMAIL_REGEX, 'Invalid email format');

/** POST /auth/request-otp { email } */
export const requestOtpSchema = z.object({
  body: z.object({ email: emailField }),
});

/** POST /auth/verify-otp { email, otp } */
export const verifyOtpSchema = z.object({
  body: z.object({
    email: emailField,
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'Code must be a 6-digit number'),
  }),
});
