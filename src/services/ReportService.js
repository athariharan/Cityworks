import api from "./api";

const ReportService = {
  create:               (data) => api.post("/api/report", data),
  getAll:              ()     => api.get("/api/report"),
  getById:             (id)   => api.get(`/api/report/${id}`),
  getByScope:          (scope) => api.get(`/api/report/scope/${scope}`),
  getByGeneratedBy:    (userId) => api.get(`/api/report/generated-by/${userId}`),
  update:              (id, data) => api.put(`/api/report/${id}`, data),
  remove:              (id)   => api.delete(`/api/report/${id}`),
};

export default ReportService;
