import { HTTP_STATUS } from '../config/constants.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getMachineIdentity } from '../services/system.service.js';

/**
 * Not a CRUD resource, so this bypasses BaseService/createCrudController
 * and stays a plain controller — that pattern is reserved for actual
 * data entities backed by a repository.
 */
export const getIdentity = asyncHandler(async (_req, res) => {
  sendSuccess(res, HTTP_STATUS.OK, getMachineIdentity());
});
