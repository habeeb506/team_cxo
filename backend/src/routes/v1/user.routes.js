import { Router } from 'express';

import userController from '../../controllers/user.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { objectIdParamSchema, paginationQuerySchema } from '../../validations/index.js';

const router = Router();

// Registered before /:id so "demo-accounts" is never parsed as an id.
router.get('/demo-accounts', userController.getDemoAccounts);
router.get('/', validateRequest(paginationQuerySchema), userController.getAll);
router.get('/:id', validateRequest(objectIdParamSchema), userController.getById);

export default router;
