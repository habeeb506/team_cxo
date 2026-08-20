import axios from 'axios';

/**
 * Shared axios instance for the whole app. Feature-specific API modules
 * (e.g. src/api/services/cxoTeamApiService.js) should import and use
 * this instead of creating their own axios instances, so base URL,
 * headers, and interceptors stay consistent.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const httpClient = axios.create({
  // Every backend route is mounted under /api (see backend/src/app.js),
  // so it's appended here once instead of every api/ module repeating it.
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const responseData = error.response?.data;
    const message = responseData?.message || error.message || 'Unexpected error';

    const normalizedError = new Error(message);
    // Preserves the backend's field-level validation errors
    // ({ field, message }[], see backend ApiError) so hooks/useForm.js
    // can map them onto the right form fields instead of only showing
    // a generic message.
    normalizedError.details = responseData?.details || [];
    normalizedError.statusCode = error.response?.status;

    return Promise.reject(normalizedError);
  },
);

export default httpClient;
