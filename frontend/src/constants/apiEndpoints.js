/**
 * Central registry of backend API paths. Feature modules import from
 * here instead of hardcoding path strings, so a route rename or version
 * bump happens in one place.
 */
export const API_VERSION = 'v1';

export const API_ENDPOINTS = {
  health: `/${API_VERSION}/health`,
};
