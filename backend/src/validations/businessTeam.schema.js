import { z } from 'zod';

import { EMAIL_REGEX } from '../config/constants.js';

export const businessTeamBodySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150),
  emailId: z
    .string()
    .trim()
    .toLowerCase()
    .regex(EMAIL_REGEX, 'Invalid email format'),
  business: z.string().trim().min(1, 'Business unit is required'),
  location: z.string().trim().optional(),
  place: z.string().trim().optional(),
  room: z.string().trim().optional(),
});

export const createBusinessTeamSchema = z.object({ body: businessTeamBodySchema });

export const updateBusinessTeamSchema = z.object({ body: businessTeamBodySchema.partial() });

// CSV import row validation reuses businessTeamBodySchema directly
// inside BusinessTeamService (via its `bodySchema` option) — see
// validations/common/bulkImport.schema.js for the shared route-level
// shape (records: object[], mode: append|replace).
