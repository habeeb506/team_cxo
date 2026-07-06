import { Router } from 'express';

import config from '../../config/index.js';

const router = Router();

/**
 * Lightweight liveness/readiness check. No auth, no DB dependency —
 * used by load balancers, uptime monitors, and local sanity checks.
 */
router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'OK',
    env: config.env,
    apiVersion: config.apiVersion,
    timestamp: new Date().toISOString(),
  });
});

export default router;
