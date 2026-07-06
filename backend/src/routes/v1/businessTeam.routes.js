import { Router } from 'express';

import businessTeamController from '../../controllers/businessTeam.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import {
  objectIdParamSchema,
  paginationQuerySchema,
  createBusinessTeamSchema,
  updateBusinessTeamSchema,
  bulkImportSchema,
  bulkDeleteSchema,
} from '../../validations/index.js';

const router = Router();

router.get('/', validateRequest(paginationQuerySchema), businessTeamController.getAll);
router.post('/import', validateRequest(bulkImportSchema), businessTeamController.bulkImport);
router.post('/bulk-delete', validateRequest(bulkDeleteSchema), businessTeamController.bulkRemove);
router.get('/:id', validateRequest(objectIdParamSchema), businessTeamController.getById);
router.post('/', validateRequest(createBusinessTeamSchema), businessTeamController.create);
router.patch(
  '/:id',
  validateRequest(objectIdParamSchema),
  validateRequest(updateBusinessTeamSchema),
  businessTeamController.update,
);
router.delete('/:id', validateRequest(objectIdParamSchema), businessTeamController.remove);

export default router;
