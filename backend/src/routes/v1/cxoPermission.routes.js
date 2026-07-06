import { Router } from 'express';

import cxoPermissionController from '../../controllers/cxoPermission.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import {
  objectIdParamSchema,
  paginationQuerySchema,
  createCxoPermissionSchema,
  updateCxoPermissionSchema,
  bulkImportSchema,
  bulkDeleteSchema,
} from '../../validations/index.js';

const router = Router();

router.get('/', validateRequest(paginationQuerySchema), cxoPermissionController.getAll);
router.post('/import', validateRequest(bulkImportSchema), cxoPermissionController.bulkImport);
router.post('/bulk-delete', validateRequest(bulkDeleteSchema), cxoPermissionController.bulkRemove);
router.get('/:id', validateRequest(objectIdParamSchema), cxoPermissionController.getById);
router.post('/', validateRequest(createCxoPermissionSchema), cxoPermissionController.create);
router.patch(
  '/:id',
  validateRequest(objectIdParamSchema),
  validateRequest(updateCxoPermissionSchema),
  cxoPermissionController.update,
);
router.delete('/:id', validateRequest(objectIdParamSchema), cxoPermissionController.remove);

export default router;
