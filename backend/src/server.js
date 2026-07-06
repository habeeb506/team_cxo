import app from './app.js';
import config from './config/index.js';
import { connectDB, disconnectDB } from './config/db.js';
import logger from './utils/logger.js';

let server;

async function start() {
  try {
    await connectDB();

    server = app.listen(config.port, () => {
      logger.info(`Server running in ${config.env} mode on port ${config.port}`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Graceful shutdown: stop accepting new connections, let in-flight
 * requests finish, then close the DB connection before exiting.
 */
async function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      await disconnectDB();
      logger.info('Shutdown complete');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  // Force-exit if shutdown hangs
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err.stack || err.message}`);
  process.exit(1);
});

start();
