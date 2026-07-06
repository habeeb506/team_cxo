import mongoose from 'mongoose';

/**
 * Reusable Mongoose plugin adding the fields every enterprise collection
 * needs: soft delete, an audit trail of who changed a record, a schema
 * version for future migrations, and a free-form metadata bag for
 * fields that don't warrant a schema change yet. Applied via:
 *
 *   schema.plugin(auditableSchemaPlugin, { userRef: 'CxoTeam' });
 *
 * Centralizing this here means every new collection gets this behavior
 * for free and consistently, instead of each model re-declaring these
 * fields.
 *
 * Deliberately fields-only: soft-delete/restore *operations* and
 * deleted-filtering *queries* live on BaseRepository
 * (softDeleteById/softDeleteMany/restoreById/withDeletedFilter), not
 * here as document methods or query helpers. Repositories are the only
 * layer allowed to touch Mongoose (see repositories/BaseRepository.js),
 * so that's the single place soft delete is implemented -- adding a
 * second implementation on the schema itself would just be two
 * competing ways to do the same thing.
 */
export function auditableSchemaPlugin(schema, options = {}) {
  const userRef = options.userRef || 'CxoTeam';

  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: userRef,
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: userRef,
      default: null,
    },
    // Bumped when a breaking shape change is made to this document type,
    // so a future migration script can target specific versions.
    schemaVersion: {
      type: Number,
      default: 1,
    },
    // Escape hatch for enterprise-specific fields that come up later
    // without requiring a schema change for every minor addition.
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
  });
}
