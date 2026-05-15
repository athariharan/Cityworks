// services/Assetservice.js
import api from "./api";

const AssetService = {
  /** POST /api/asset */
  create:  (data) => api.post("/api/asset", data),

  /** GET /api/asset */
  getAll:  () => api.get("/api/asset"),

  /** GET /api/asset/:id */
  getById: (id) => api.get(`/api/asset/${id}`),

  /** PUT /api/asset/:id */
  update:  (id, data) => api.put(`/api/asset/${id}`, data),

  /** DELETE /api/asset/:id */
  remove:  (id) => api.delete(`/api/asset/${id}`),
};

export default AssetService;
export const assetService = AssetService;
