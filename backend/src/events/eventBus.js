import { EventEmitter } from 'node:events';

import logger from '../utils/logger.js';

/**
 * App-wide event bus. Services emit domain events (e.g. 'user.created')
 * without knowing who — if anyone — is listening. This is what lets a
 * future notifications module (or audit logging, or analytics) hook
 * into existing services without those services being modified.
 *
 * Usage:
 *   eventBus.emit('user.created', { userId });
 *   eventBus.on('user.created', (payload) => { ...send a notification... });
 */
class AppEventBus extends EventEmitter {}

const eventBus = new AppEventBus();

eventBus.on('error', (err) => {
  logger.error(`Unhandled event bus error: ${err.stack || err.message}`);
});

export default eventBus;
