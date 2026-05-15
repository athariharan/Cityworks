// services/Inspectionservice.js
import api from "./api";

const InspectionService = {
  /** POST /api/inspectionrecords */
  create:     (data)     => api.post("/api/inspectionrecords", data),

  /** GET /api/inspectionrecords */
  getAll:     ()         => api.get("/api/inspectionrecords"),

  /** GET /api/inspectionrecords/:id */
  getById:    (id)       => api.get(`/api/inspectionrecords/${id}`),

  /** GET /api/inspectionrecords/asset/:assetId */
  getByAsset: (assetId)  => api.get(`/api/inspectionrecords/asset/${assetId}`),

  /** PUT /api/inspectionrecords/:id */
  update:     (id, data) => api.put(`/api/inspectionrecords/${id}`, data),

  /** DELETE /api/inspectionrecords/:id */
  remove:     (id)       => api.delete(`/api/inspectionrecords/${id}`),
};

export default InspectionService;
export const inspectionService = InspectionService;
