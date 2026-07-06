import { z } from 'zod';

import { EMAIL_REGEX, TEAM_MEMBER_STATUS } from '../config/constants.js';

import { objectIdSchema } from './common/objectId.schema.js';

export const cxoTeamBodySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150),
  emailId: z
    .string()
    .trim()
    .toLowerCase()
    .regex(EMAIL_REGEX, 'Invalid email format'),
  empIdOld: z.string().trim().optional(),
  empIdNew: z.string().trim().min(1, 'Employee ID is required'),
  level: z.string().trim().optional(),
  designation: z.string().trim().min(1, 'Designation is required').max(150),
  location: z.string().trim().optional(),
  place: z.string().trim().optional(),
  profilePicture: z.string().trim().optional(),
  lead: objectIdSchema.nullable().optional(),
  manager: objectIdSchema.nullable().optional(),
  group: z.string().trim().optional(),
  status: z.enum(TEAM_MEMBER_STATUS).optional(),
  joiningDate: z.coerce.date().optional(),
});

export const createCxoTeamSchema = z.object({ body: cxoTeamBodySchema });

// Partial: PATCH only validates fields actually present in the payload.
export const updateCxoTeamSchema = z.object({ body: cxoTeamBodySchema.partial() });

// CSV import row validation reuses cxoTeamBodySchema directly inside
// CxoTeamService (via its `bodySchema` option) — see
// validations/common/bulkImport.schema.js for the shared route-level
// shape (records: object[], mode: append|replace).
