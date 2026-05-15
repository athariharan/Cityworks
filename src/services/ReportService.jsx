import api from "./api";

const ReportService = {
  create:     (data) => api.post("/api/reports", data),
  getAll:     () => api.get("/api/reports"),
  getById:    (id) => api.get(`/api/reports/${id}`),
  update:     (id, data) => api.put(`/api/reports/${id}`, data),
  remove:     (id) => api.delete(`/api/reports/${id}`),
  getByType:  (type) => api.get(`/api/reports/type/${type}`),
};

export default ReportService;