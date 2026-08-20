import { Router } from 'express';

import userController from '../../controllers/user.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { objectIdParamSchema, paginationQuerySchema } from '../../validations/index.js';

const router = Router();

router.get('/', validateRequest(paginationQuerySchema), userController.getAll);
router.get('/:id', validateRequest(objectIdParamSchema), userController.getById);

export default router;
