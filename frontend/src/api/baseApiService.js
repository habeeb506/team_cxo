import httpClient from './httpClient.js';

/**
 * Base REST client for a single resource, mirroring the backend's
 * BaseRepository/BaseService pattern. Every future resource's whole API
 * layer is a 3-line subclass:
 *
 *   class UserApiService extends ApiService {
 *     constructor() { super('/v1/users'); }
 *   }
 *   export default new UserApiService();
 *
 * `getAll` forwards params straight through as query string, so it lines
 * up with the backend's pagination/filter/search query shape with no
 * translation layer.
 */
export class ApiService {
  constructor(resourcePath) {
    if (!resourcePath) throw new Error('ApiService requires a resourcePath');
    this.resourcePath = resourcePath;
  }

  async getAll(params = {}) {
    const { data } = await httpClient.get(this.resourcePath, { params });
    return data; // { success, data, pagination }
  }

  async getById(id) {
    const { data } = await httpClient.get(`${this.resourcePath}/${id}`);
    return data; // { success, data }
  }

  async create(payload) {
    const { data } = await httpClient.post(this.resourcePath, payload);
    return data;
  }

  async update(id, payload) {
    const { data } = await httpClient.patch(`${this.resourcePath}/${id}`, payload);
    return data;
  }

  async remove(id) {
    const { data } = await httpClient.delete(`${this.resourcePath}/${id}`);
    return data;
  }

  /**
   * CSV import: records already parsed into plain objects client-side.
   * `mode` is 'append' (default, add alongside existing data) or
   * 'replace' (soft-delete existing records first, then insert these).
   */
  async bulkImport(records, mode = 'append') {
    const { data } = await httpClient.post(`${this.resourcePath}/import`, { records, mode });
    return data; // { success, data: { created, failed, mode } }
  }

  async bulkDelete(ids) {
    const { data } = await httpClient.post(`${this.resourcePath}/bulk-delete`, { ids });
    return data; // { success, data: { deleted, failed } }
  }
}

export default ApiService;
