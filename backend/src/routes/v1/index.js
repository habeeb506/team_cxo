import { Router } from 'express';

import healthRoutes from './health.routes.js';
import systemRoutes from './system.routes.js';
import cxoTeamRoutes from './cxoTeam.routes.js';
import cxoPermissionRoutes from './cxoPermission.routes.js';
import businessTeamRoutes from './businessTeam.routes.js';
import userRoutes from './user.routes.js';
import newsBulletinRoutes from './newsBulletin.routes.js';
import ticketRoutes from './ticket.routes.js';
import taskRoutes from './task.routes.js';
import leaderboardRoutes from './leaderboard.routes.js';

const router = Router();

/**
 * v1 route registry. Add new feature routers here as they're built, e.g.:
 *   import userRoutes from './user.routes.js';
 *   router.use('/users', userRoutes);
 *
 * Keeping this file as a pure registry (no logic) means adding a module
 * never touches app.js or any other feature's routes.
 */
router.use('/health', healthRoutes);
router.use('/system', systemRoutes);
router.use('/cxo-teams', cxoTeamRoutes);
router.use('/cxo-permissions', cxoPermissionRoutes);
router.use('/business-teams', businessTeamRoutes);
router.use('/users', userRoutes);
router.use('/news-bulletins', newsBulletinRoutes);
router.use('/tickets', ticketRoutes);
router.use('/tasks', taskRoutes);
router.use('/leaderboard', leaderboardRoutes);

export default router;
