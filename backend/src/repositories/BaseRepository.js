/**
 * Generic data-access layer over a single Mongoose model.
 *
 * This is the ONLY layer allowed to talk to Mongoose directly. Services
 * must go through a repository instead of importing models themselves --
 * that keeps business logic storage-agnostic and makes it possible to
 * change persistence details (indexes, caching, a different query
 * shape) without touching any service.
 *
 * Every read here excludes soft-deleted documents by default (see
 * withDeletedFilter below) -- pass { includeDeleted: true } to bypass,
 * e.g. for a future admin "show deleted records" view.
 *
 * Feature repositories extend this, e.g.:
 *   class UserRepository extends BaseRepository {
 *     constructor() { super(UserModel); }
 *     findByEmail(email) { return this.model.findOne({ email }); }
 *   }
 */
class BaseRepository {
  constructor(model) {
    if (!model) throw new Error('BaseRepository requires a Mongoose model');
    this.model = model;
  }

  /**
   * Merges the caller's filter with the default "exclude soft-deleted"
   * condition. Safe even for models without an `isDeleted` field --
   * { isDeleted: { $ne: true } } matches documents where the field is
   * simply absent.
   */
  withDeletedFilter(filter, includeDeleted) {
    return includeDeleted ? filter : { ...filter, isDeleted: { $ne: true } };
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id, { select, populate, includeDeleted = false } = {}) {
    let query = this.model.findOne(this.withDeletedFilter({ _id: id }, includeDeleted));
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    return query.exec();
  }

  async findOne(filter = {}, { select, populate, includeDeleted = false } = {}) {
    let query = this.model.findOne(this.withDeletedFilter(filter, includeDeleted));
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    return query.exec();
  }

  /**
   * Paginated list. Returns a shape ready to hand straight to
   * utils/apiResponse's paginated response helper.
   */
  async findMany(
    filter = {},
    { page = 1, limit = 20, sort = '-createdAt', select, populate, includeDeleted = false } = {},
  ) {
    const skip = (page - 1) * limit;
    const fullFilter = this.withDeletedFilter(filter, includeDeleted);

    let query = this.model.find(fullFilter).sort(sort).skip(skip).limit(limit);
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);

    const [data, total] = await Promise.all([query.exec(), this.model.countDocuments(fullFilter)]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async updateById(
    id,
    update,
    { new: returnNew = true, runValidators = true, includeDeleted = false } = {},
  ) {
    const filter = this.withDeletedFilter({ _id: id }, includeDeleted);
    return this.model.findOneAndUpdate(filter, update, { new: returnNew, runValidators }).exec();
  }

  /** Permanent removal. Most callers want softDeleteById instead. */
  async deleteById(id) {
    return this.model.findByIdAndDelete(id).exec();
  }

  async softDeleteById(id) {
    return this.updateById(id, { isDeleted: true, deletedAt: new Date() });
  }

  /**
   * Soft-deletes every currently-non-deleted document matching `filter`
   * (default: all of them) in one operation. Used by BaseService.replaceAll
   * to implement "replace existing data" CSV imports -- clearing the
   * current roster before inserting a fresh one, without a per-document
   * round trip and without physically destroying anything.
   */
  async softDeleteMany(filter = {}) {
    return this.model.updateMany(this.withDeletedFilter(filter, false), {
      isDeleted: true,
      deletedAt: new Date(),
    });
  }

  async restoreById(id) {
    return this.updateById(id, { isDeleted: false, deletedAt: null }, { includeDeleted: true });
  }

  async count(filter = {}, { includeDeleted = false } = {}) {
    return this.model.countDocuments(this.withDeletedFilter(filter, includeDeleted));
  }

  async exists(filter = {}, { includeDeleted = false } = {}) {
    return Boolean(await this.model.exists(this.withDeletedFilter(filter, includeDeleted)));
  }
}

export default BaseRepository;
