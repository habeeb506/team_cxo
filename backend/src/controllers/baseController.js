import { HTTP_STATUS } from '../config/constants.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { buildListQueryOptions } from '../utils/queryOptions.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * Builds a standard set of CRUD Express handlers from any BaseService
 * (or subclass). Controllers stay declarative -- feature routers wire
 * these into routes, and override/extend only what's actually
 * different for that resource.
 *
 * `listQueryConfig.allowedFilters` / `.searchableFields` configure
 * filtering and searching for the list endpoint (see utils/queryOptions.js)
 * without any resource needing its own getAll implementation.
 *
 * Usage:
 *   const teamController = createCrudController(new CxoTeamService(), {
 *     allowedFilters: ['status', 'group'],
 *     searchableFields: ['name', 'emailId'],
 *   });
 */
export function createCrudController(service, listQueryConfig = {}) {
  const { allowedFilters = [], searchableFields = [], dateRangeField } = listQueryConfig;

  return {
    create: asyncHandler(async (req, res) => {
      const doc = await service.create(req.body);
      sendSuccess(res, HTTP_STATUS.CREATED, doc);
    }),

    getAll: asyncHandler(async (req, res) => {
      const { page, limit, sort, filter } = buildListQueryOptions(req.query, {
        allowedFilters,
        searchableFields,
        dateRangeField,
      });
      const { data, pagination } = await service.list({ page, limit, sort, filter });
      sendSuccess(res, HTTP_STATUS.OK, data, { pagination });
    }),

    getById: asyncHandler(async (req, res) => {
      const doc = await service.getById(req.params.id);
      sendSuccess(res, HTTP_STATUS.OK, doc);
    }),

    update: asyncHandler(async (req, res) => {
      const doc = await service.update(req.params.id, req.body);
      sendSuccess(res, HTTP_STATUS.OK, doc);
    }),

    remove: asyncHandler(async (req, res) => {
      await service.delete(req.params.id);
      sendSuccess(res, HTTP_STATUS.NO_CONTENT);
    }),

    // POST /:resource/import  { records: [...], mode?: 'append'|'replace' }
    // `records` shape is checked (non-empty array of objects) by the
    // shared bulkImportSchema before this handler runs; each record's
    // actual fields are validated per-row inside the service (so one bad
    // row is reported and skipped instead of rejecting the whole file).
    // mode 'replace' soft-deletes the existing dataset first -- see
    // BaseService.replaceAll.
    bulkImport: asyncHandler(async (req, res) => {
      const { records, mode = 'append' } = req.body;
      if (!Array.isArray(records) || records.length === 0) {
        throw ApiError.badRequest('records must be a non-empty array');
      }
      const result =
        mode === 'replace' ? await service.replaceAll(records) : await service.bulkCreate(records);
      sendSuccess(res, HTTP_STATUS.OK, { ...result, mode });
    }),

    // POST /:resource/bulk-delete  { ids: [...] }
    bulkRemove: asyncHandler(async (req, res) => {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        throw ApiError.badRequest('ids must be a non-empty array');
      }
      const result = await service.bulkDelete(ids);
      sendSuccess(res, HTTP_STATUS.OK, result);
    }),
  };
}
