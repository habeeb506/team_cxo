import { Router } from 'express';

import config from '../config/index.js';

import v1Routes from './v1/index.js';

const router = Router();

/**
 * API versioning entry point. Each version is fully isolated under its
 * own prefix, so a v2 can be introduced later without touching v1
 * consumers (relevant once a client-facing API is added alongside the
 * internal one).
 */
router.use(`/${config.apiVersion}`, v1Routes);

export default router;
