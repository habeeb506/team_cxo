import morgan from 'morgan';

import { isDevelopment } from '../config/index.js';
import { httpLogStream } from '../utils/logger.js';

/**
 * HTTP request logging middleware, piped through the central logger
 * so all logs (app + HTTP) share the same format and destination.
 */
const requestLogger = morgan(isDevelopment ? 'dev' : 'combined', {
  stream: httpLogStream,
});

export default requestLogger;
