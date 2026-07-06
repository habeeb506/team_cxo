import httpClient from './httpClient.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

/**
 * Example API module -- the pattern every future *one-off, non-CRUD*
 * endpoint (health, system info, ...) should follow: a thin function
 * that calls httpClient and returns response data, kept separate from
 * the class-based `ApiService` pattern (api/baseApiService.js) used for
 * actual CRUD resources -- see ARCHITECTURE.md's "API layer" section for
 * when to use which. Not currently wired into any page/hook; kept as a
 * living reference for the pattern and for manual backend-reachability
 * checks (e.g. via browser devtools) rather than dead code to delete.
 */
export async function getHealthStatus() {
  const { data } = await httpClient.get(API_ENDPOINTS.health);
  return data;
}
