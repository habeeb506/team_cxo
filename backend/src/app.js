import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import config from './config/index.js';
import errorHandler from './middlewares/errorHandler.js';
import hostAllowlist from './middlewares/hostAllowlist.middleware.js';
import notFound from './middlewares/notFound.js';
import requestLogger from './middlewares/requestLogger.js';
import routes from './routes/index.js';

const app = express();

// Access gate: only requests to an approved Host header are served at
// all (see middlewares/hostAllowlist.middleware.js) -- mounted before
// everything else, including security headers, so a disallowed request
// is rejected as early as possible.
app.use(hostAllowlist);

// Security headers
app.use(helmet());

// CORS — restricted to the configured frontend origin
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Response compression
app.use(compression());

// HTTP request logging
app.use(requestLogger);

// Versioned API routes, e.g. /api/v1/health
app.use('/api', routes);

// 404 handler for unmatched routes
app.use(notFound);

// Central error handler — must be registered last
app.use(errorHandler);

export default app;
