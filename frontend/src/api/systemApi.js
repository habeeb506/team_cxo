import httpClient from './httpClient.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

export async function getMachineIdentity() {
  const { data } = await httpClient.get(API_ENDPOINTS.systemIdentity);
  return data;
}
