import os from 'node:os';

/**
 * Returns the OS username the backend Node process is running under
 * (Node's built-in `os.userInfo()` -- no extra dependency). Used by
 * AuthService.verifyOtp to mandatorily require a login's device to
 * match the account's `User.alias` (auto-derived from the email's
 * local part -- see User.model.js).
 *
 * IMPORTANT scope limitation: this only identifies anything meaningful
 * while the backend runs *locally, on the same machine as the person
 * logging in* (e.g. `npm run dev` on your own laptop, as this app does
 * today) -- in that setup, the Node process's OS user genuinely is the
 * signed-in Windows/macOS/Linux account making the request. The moment
 * this backend is deployed anywhere shared (a server, a container, a
 * cloud host reachable by more than one person), `os.userInfo()` just
 * returns that server's single service account for *every* visitor,
 * regardless of who they are -- it stops distinguishing anyone and this
 * check becomes meaningless as a security control. Do not rely on this
 * once the backend is no longer running on each user's own machine; a
 * real device/identity check at that point needs something that
 * actually reaches the client (e.g. a client certificate, an OS-level
 * SSO/Kerberos handshake, or an installed desktop agent), not this.
 */
export function getOsUsername() {
  try {
    return os.userInfo().username;
  } catch {
    // os.userInfo() can throw in some restricted/container environments
    // with no OS user info available -- treat as "unknown" rather than
    // crashing the login flow.
    return null;
  }
}
