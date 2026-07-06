import { Router } from 'express';

import newsBulletinController from '../../controllers/newsBulletin.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { paginationQuerySchema } from '../../validations/index.js';

const router = Router();

// GET only -- news bulletins are seeded/managed directly for now (see
// CONTRIBUTING.md's "Admin UI scope" note). Default sort is by
// publishedAt via the ?sort=-publishedAt param the frontend always
// sends (see api/services/newsBulletinApiService.js).
router.get('/', validateRequest(paginationQuerySchema), newsBulletinController.getAll);

export default router;
