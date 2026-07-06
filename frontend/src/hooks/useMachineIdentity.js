import useFetch from './useFetch.js';
import { getMachineIdentity } from '../api/systemApi.js';

const CACHE_KEY = 'system/identity';
// The OS user/host running the backend process doesn't change during a
// session, so a long TTL is safe -- this is what lets Header and the
// Dashboard's MachineIdentityBanner (both mounted at once) share a
// single request instead of each firing their own (see useFetch's
// in-flight de-duplication + TTL cache).
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Resolves the OS username/hostname of the machine running the
 * backend (see backend/src/services/system.service.js). Used by the
 * Header chip and the Dashboard's identity banner.
 */
export default function useMachineIdentity() {
  const { data, error, isLoading } = useFetch(() => getMachineIdentity(), [], {
    cacheKey: CACHE_KEY,
    cacheTtlMs: CACHE_TTL_MS,
  });
  return { identity: data, error, isLoading };
}
