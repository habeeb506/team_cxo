import { Router } from 'express';

import cxoTeamController from '../../controllers/cxoTeam.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import {
  objectIdParamSchema,
  paginationQuerySchema,
  createCxoTeamSchema,
  updateCxoTeamSchema,
  bulkImportSchema,
  bulkDeleteSchema,
} from '../../validations/index.js';

const router = Router();

router.get('/', validateRequest(paginationQuerySchema), cxoTeamController.getAll);
router.post('/import', validateRequest(bulkImportSchema), cxoTeamController.bulkImport);
router.post('/bulk-delete', validateRequest(bulkDeleteSchema), cxoTeamController.bulkRemove);
router.get('/:id', validateRequest(objectIdParamSchema), cxoTeamController.getById);
router.post('/', validateRequest(createCxoTeamSchema), cxoTeamController.create);
router.patch(
  '/:id',
  validateRequest(objectIdParamSchema),
  validateRequest(updateCxoTeamSchema),
  cxoTeamController.update,
);
router.delete('/:id', validateRequest(objectIdParamSchema), cxoTeamController.remove);

export default router;
