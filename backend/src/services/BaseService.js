import ApiError from '../utils/ApiError.js';

/**
 * Generic business-logic layer sitting between controllers and
 * repositories. Controllers call services; services call repositories.
 * This is where feature-specific rules (authorization checks, side
 * effects, cross-entity logic) get added by overriding these methods --
 * the CRUD defaults below cover the common case with no extra code.
 *
 * `options.uniqueFields` declares which fields must be unique for this
 * resource, enforced with a friendly 409 before the database's own
 * unique-index error would otherwise surface. Each entry is either a
 * field name (single-field uniqueness, e.g. 'emailId') or an array of
 * field names (compound uniqueness, e.g. ['member', 'resource']).
 * Fields absent from the incoming data are skipped, so partial updates
 * that don't touch a unique field never trigger a false conflict.
 *
 * `options.bodySchema` is the resource's zod "create" schema (the same
 * one used for single-record POST requests). When provided, bulkCreate
 * validates each CSV/import row against it individually -- a bad row is
 * reported and skipped instead of failing (or silently letting through)
 * the whole batch.
 *
 * Feature services extend this, e.g.:
 *   class UserService extends BaseService {
 *     constructor() { super(new UserRepository(), 'User', { uniqueFields: ['email'], bodySchema: userBodySchema }); }
 *   }
 */
class BaseService {
  constructor(repository, resourceName = 'Resource', options = {}) {
    this.repository = repository;
    this.resourceName = resourceName;
    this.uniqueFields = options.uniqueFields || [];
    this.bodySchema = options.bodySchema || null;
  }

  async assertUnique(data, excludeId = null) {
    for (const fieldSpec of this.uniqueFields) {
      const fields = Array.isArray(fieldSpec) ? fieldSpec : [fieldSpec];
      const filter = {};
      let hasAllValues = true;

      for (const field of fields) {
        const value = data[field];
        if (value === undefined || value === null || value === '') {
          hasAllValues = false;
          break;
        }
        filter[field] = value;
      }

      if (!hasAllValues) continue;
      if (excludeId) filter._id = { $ne: excludeId };

      const exists = await this.repository.exists(filter);
      if (exists) {
        throw ApiError.conflict(
          `${this.resourceName} with this ${fields.join(' + ')} already exists`,
          fields.map((field) => ({ field, message: 'Duplicate value' })),
        );
      }
    }
  }

  /**
   * Validates one record against `bodySchema` (if configured), the same
   * way `validateRequest` validates a single-record API request -- same
   * error shape ({ field, message }[]), so a CSV row failure reads
   * exactly like a form field error. Returns the zod-parsed data (with
   * trimming/coercion already applied) so callers insert the cleaned
   * value, not the raw CSV strings. A no-op passthrough when this
   * resource hasn't configured a bodySchema.
   */
  validateRecord(data) {
    if (!this.bodySchema) return data;

    const result = this.bodySchema.safeParse(data);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || '(root)',
        message: issue.message,
      }));
      throw ApiError.badRequest('Validation failed', details);
    }
    return result.data;
  }

  async create(data) {
    const validated = this.validateRecord(data);
    await this.assertUnique(validated);
    return this.repository.create(validated);
  }

  async getById(id) {
    const doc = await this.repository.findById(id);
    if (!doc) throw ApiError.notFound(`${this.resourceName} not found`);
    return doc;
  }

  async list(queryOptions) {
    return this.repository.findMany(queryOptions?.filter, queryOptions);
  }

  async update(id, data) {
    await this.assertUnique(data, id);
    const doc = await this.repository.updateById(id, data);
    if (!doc) throw ApiError.notFound(`${this.resourceName} not found`);
    return doc;
  }

  /** Soft delete by default -- the record stops appearing in normal
   * reads but isn't permanently destroyed (see models/plugins/auditableSchema.plugin.js). */
  async delete(id) {
    const doc = await this.repository.softDeleteById(id);
    if (!doc) throw ApiError.notFound(`${this.resourceName} not found`);
    return doc;
  }

  /**
   * Creates many records (e.g. from a CSV import), reusing this.create
   * per row so validation and duplicate-prevention apply identically
   * to a single create. One bad row doesn't fail the whole batch --
   * failures are collected and reported per row instead.
   */
  async bulkCreate(records) {
    const created = [];
    const failed = [];

    for (let i = 0; i < records.length; i++) {
      try {
        const doc = await this.create(records[i]);
        created.push(doc);
      } catch (err) {
        failed.push({ row: i + 1, message: err.message, details: err.details || [] });
      }
    }

    return { created, failed };
  }

  /**
   * "Replace all data": soft-deletes every existing (non-deleted)
   * record for this resource, then bulkCreate()s the new set -- reusing
   * the exact same per-row validation and duplicate handling as an
   * append-mode import. Nothing is physically destroyed (see
   * BaseRepository.softDeleteMany and models/plugins/auditableSchema.plugin.js),
   * so this is safe to run repeatedly and is fully auditable/reversible
   * by an administrator with direct database access.
   */
  async replaceAll(records) {
    await this.repository.softDeleteMany();
    return this.bulkCreate(records);
  }

  /**
   * Soft-deletes many records by id, reusing this.delete per id so a
   * missing/already-deleted id is reported instead of failing the batch.
   */
  async bulkDelete(ids) {
    const deleted = [];
    const failed = [];

    for (const id of ids) {
      try {
        await this.delete(id);
        deleted.push(id);
      } catch (err) {
        failed.push({ id, message: err.message });
      }
    }

    return { deleted, failed };
  }
}

export default BaseService;
