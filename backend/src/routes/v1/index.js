import { Router } from 'express';

import requireAuth from '../../middlewares/auth.middleware.js';

import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import cxoTeamRoutes from './cxoTeam.routes.js';
import cxoPermissionRoutes from './cxoPermission.routes.js';
import businessTeamRoutes from './businessTeam.routes.js';
import userRoutes from './user.routes.js';
import newsBulletinRoutes from './newsBulletin.routes.js';
import ticketRoutes from './ticket.routes.js';
import taskRoutes from './task.routes.js';
import leaderboardRoutes from './leaderboard.routes.js';
import appointmentRoutes from './appointment.routes.js';
import vocRoutes from './voc.routes.js';
import shoutOutRoutes from './shoutOut.routes.js';
import awardRoutes from './award.routes.js';
import holidayRoutes from './holiday.routes.js';
import teamRosterRoutes from './teamRoster.routes.js';

const router = Router();

/**
 * v1 route registry. Add new feature routers here as they're built.
 *
 * `/health` and `/auth` are the only public routers -- everything else
 * is mounted behind `requireAuth` (see middlewares/auth.middleware.js),
 * so every resource route now requires a real, verified session instead
 * of trusting whatever identity the client claims in its request. This
 * is a router-level `use`, not per-route, specifically so a future new
 * feature router is protected automatically just by being registered
 * here -- no route can accidentally ship unauthenticated.
 */
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/cxo-teams', requireAuth, cxoTeamRoutes);
router.use('/cxo-permissions', requireAuth, cxoPermissionRoutes);
router.use('/business-teams', requireAuth, businessTeamRoutes);
router.use('/users', requireAuth, userRoutes);
router.use('/news-bulletins', requireAuth, newsBulletinRoutes);
router.use('/tickets', requireAuth, ticketRoutes);
router.use('/tasks', requireAuth, taskRoutes);
router.use('/leaderboard', requireAuth, leaderboardRoutes);
router.use('/appointments', requireAuth, appointmentRoutes);
router.use('/vocs', requireAuth, vocRoutes);
router.use('/shout-outs', requireAuth, shoutOutRoutes);
router.use('/awards', requireAuth, awardRoutes);
router.use('/holidays', requireAuth, holidayRoutes);
router.use('/team-roster', requireAuth, teamRosterRoutes);

export default router;
