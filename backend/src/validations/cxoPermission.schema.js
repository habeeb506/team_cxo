import { z } from 'zod';

import { PERMISSION_ACTIONS } from '../config/constants.js';

import { objectIdSchema } from './common/objectId.schema.js';

export const cxoPermissionBodySchema = z.object({
  member: objectIdSchema,
  resource: z.string().trim().toLowerCase().min(1, 'resource is required'),
  actions: z.array(z.enum(PERMISSION_ACTIONS)).min(1, 'At least one action is required'),
  grantedBy: objectIdSchema.nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
});

export const createCxoPermissionSchema = z.object({ body: cxoPermissionBodySchema });

export const updateCxoPermissionSchema = z.object({ body: cxoPermissionBodySchema.partial() });

// CSV import row validation reuses cxoPermissionBodySchema directly
// inside CxoPermissionService (via its `bodySchema` option) — see
// validations/common/bulkImport.schema.js for the shared route-level
// shape (records: object[], mode: append|replace).
