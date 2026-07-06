import { Router } from 'express';

import { getIdentity } from '../../controllers/system.controller.js';

const router = Router();

router.get('/identity', getIdentity);

export default router;
