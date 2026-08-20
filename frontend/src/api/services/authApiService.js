import httpClient from '../httpClient.js';

/**
 * Email-OTP login. Not a CRUD resource, so this doesn't extend
 * ApiService (same reasoning as api/services/leaderboardApiService.js).
 * The session itself lives in an httpOnly cookie the backend sets on
 * verifyOtp (see backend/src/controllers/auth.controller.js) -- this
 * class never touches the token directly, it's not readable from JS by
 * design (see context/AuthContext.jsx for how the session is hydrated).
 */
class AuthApiService {
  /** Step 1: request a login code for `email`. */
  async requestOtp(email) {
    const { data } = await httpClient.post('/v1/auth/request-otp', { email });
    return data; // { success, data: { message, otp?, devNote? } }
  }

  /** Step 2: verify the code, establishing a session on success. */
  async verifyOtp(email, otp) {
    const { data } = await httpClient.post('/v1/auth/verify-otp', { email, otp });
    return data; // { success, data: User }
  }

  /** Clears the session cookie server-side. */
  async logout() {
    const { data } = await httpClient.post('/v1/auth/logout');
    return data;
  }

  /** The current session's full profile, or rejects if not authenticated. */
  async me() {
    const { data } = await httpClient.get('/v1/auth/me');
    return data; // { success, data: User }
  }
}

export default new AuthApiService();
