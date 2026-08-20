import { z } from 'zod';

import { EMAIL_REGEX, TEAM_MEMBER_SUPPORT_TYPES } from '../config/constants.js';

import { objectIdSchema } from './common/objectId.schema.js';

export const cxoTeamBodySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150),
  emailId: z
    .string()
    .trim()
    .toLowerCase()
    .regex(EMAIL_REGEX, 'Invalid email format'),
  // Numeric, by request -- see CxoTeam.model.js's docblock on empIdOld/
  // empIdNew for why these switched from free-text strings.
  empIdOld: z.coerce.number().optional(),
  empIdNew: z.coerce.number({ required_error: 'Employee ID is required' }),
  level: z.string().trim().optional(),
  careerLevel: z.string().trim().optional(),
  designation: z.string().trim().min(1, 'Designation is required').max(150),
  location: z.string().trim().optional(),
  place: z.string().trim().optional(),
  profilePicture: z.string().trim().optional(),
  lead: objectIdSchema.nullable().optional(),
  manager: objectIdSchema.nullable().optional(),
  group: z.string().trim().optional(),
  priorExperience: z.coerce.number().min(0).optional(),
  lastPromotionDate: z.coerce.date().optional(),
  backupTeamMember: z.string().trim().optional(),
  coach: z.string().trim().optional(),
  primaryPortfolio: z.string().trim().optional(),
  secondaryPortfolio: z.string().trim().optional(),
  otherPortfolio: z.string().trim().optional(),
  learningHours: z.coerce.number().min(0).optional(),
  businessChemistry: z.string().trim().optional(),
  certificationsPlanned: z.string().trim().optional(),
  ceBaseline: z.string().trim().optional(),
  mobile: z.string().trim().optional(),
  // `shift` was previously missing here -- a plain zod .object() silently
  // strips unknown keys, so any manual shift edit via the create/edit
  // form was accepted by the client but dropped before it ever reached
  // the database. Added alongside `timeSlot` below while touching this
  // file for the new team-member status/time-slot work.
  shift: z.string().trim().optional(),
  support: z.enum(TEAM_MEMBER_SUPPORT_TYPES).optional(),
  timeSlot: z.string().trim().optional(),
  joiningDate: z.coerce.date().optional(),
  // firmExperience/overallExperience/timeInRole are deliberately NOT
  // declared here -- they're server-computed, read-only fields (see
  // CxoTeamService.attachExperienceFields), never something a client
  // submits. Zod silently strips any unknown keys from the payload, so
  // even if a stale form value for one of them were ever submitted, it
  // would be dropped here rather than persisted.
});

export const createCxoTeamSchema = z.object({ body: cxoTeamBodySchema });

// Partial: PATCH only validates fields actually present in the payload.
export const updateCxoTeamSchema = z.object({ body: cxoTeamBodySchema.partial() });

// CSV import row validation reuses cxoTeamBodySchema directly inside
// CxoTeamService (via its `bodySchema` option) — see
// validations/common/bulkImport.schema.js for the shared route-level
// shape (records: object[], mode: append|replace).
