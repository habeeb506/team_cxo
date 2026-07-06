import mongoose from 'mongoose';

import { PERMISSION_ACTIONS } from '../config/constants.js';

import { auditableSchemaPlugin } from './plugins/auditableSchema.plugin.js';

const { Schema } = mongoose;

/**
 * cxo_permissions -- grants a set of actions to a team member on a
 * named resource. Actions are a validated array of strings, not one
 * boolean field per permission type (canCreate/canEdit/...), so adding
 * a new action later (e.g. 'approve', 'export', 'archive') means
 * adding one string to PERMISSION_ACTIONS -- never altering this schema
 * or migrating existing documents.
 */
const cxoPermissionSchema = new Schema(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: 'CxoTeam',
      required: [true, 'member is required'],
    },
    resource: {
      // e.g. 'cxo_teams', 'business_teams', 'tasks', or '*' for a
      // global grant. Free-form on purpose: new modules register
      // permissions under their own resource name without this schema
      // ever needing to change.
      type: String,
      required: [true, 'resource is required'],
      trim: true,
      lowercase: true,
    },
    actions: {
      type: [String],
      required: true,
      enum: {
        values: PERMISSION_ACTIONS,
        message: '{VALUE} is not a supported permission action',
      },
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one action is required',
      },
    },
    grantedBy: {
      type: Schema.Types.ObjectId,
      ref: 'CxoTeam',
      default: null,
    },
    // null = permanent grant; set for time-bound/elevated access.
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

cxoPermissionSchema.plugin(auditableSchemaPlugin, { userRef: 'CxoTeam' });

// One permission document per member per resource; also the primary
// lookup pattern ("what can member X do on resource Y"). Scoped to
// non-deleted documents so a "replace all data" import can soft-delete
// existing grants and re-insert the same member+resource pairs.
cxoPermissionSchema.index(
  { member: 1, resource: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } },
);

// Reverse lookup: "who has access to resource Y"
cxoPermissionSchema.index({ resource: 1 });

export default mongoose.model('CxoPermission', cxoPermissionSchema, 'cxo_permissions');
