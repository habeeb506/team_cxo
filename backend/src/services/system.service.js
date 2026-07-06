import os from 'node:os';

/**
 * Reads the OS-level identity of the machine running this backend
 * process (username + hostname). There's no authentication yet, so on
 * an internal tool run per-machine this stands in for "who is using
 * the app." A browser cannot read this itself — os-level identity is
 * not exposed to client-side JS — so the backend is the only layer
 * that can technically provide it.
 */
export function getMachineIdentity() {
  const { username } = os.userInfo();
  return {
    username,
    hostname: os.hostname(),
  };
}
