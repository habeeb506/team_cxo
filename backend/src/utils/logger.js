import winston from 'winston';

import config, { isProduction } from '../config/index.js';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return `${ts} [${level}]: ${stack || message}`;
  }),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

/**
 * Centralized logger. Every module should log through this instead of
 * console.log, so log format/destination can change in one place.
 */
const logger = winston.createLogger({
  level: config.logLevel,
  format: isProduction ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

/**
 * Stream adapter so morgan (HTTP request logging) can pipe into winston.
 */
export const httpLogStream = {
  write: (message) => logger.http(message.trim()),
};

export default logger;
