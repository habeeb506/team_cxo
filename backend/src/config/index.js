import dotenv from 'dotenv';

import { ENVIRONMENTS } from './constants.js';

dotenv.config();

/**
 * Required environment variables. Fail fast on startup if any are missing,
 * rather than surfacing confusing errors later at request time.
 */
const REQUIRED_ENV_VARS = ['MONGODB_URI'];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Copy .env.example to .env and fill in the values.',
    );
  }
}

validateEnv();

const config = {
  env: process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT,
  port: Number(process.env.PORT) || 5000,
  apiVersion: process.env.API_VERSION || 'v1',
  mongoUri: process.env.MONGODB_URI,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL || 'info',
};

export const isProduction = config.env === ENVIRONMENTS.PRODUCTION;
export const isDevelopment = config.env === ENVIRONMENTS.DEVELOPMENT;
export const isTest = config.env === ENVIRONMENTS.TEST;

export default config;
