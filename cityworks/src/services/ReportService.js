import api from "./api";

const ReportService = {
  // ── Auto-generated reports from work orders ────────────
  getAllWorkOrderReports:   ()   => api.get("/api/workorders"),
  getWorkOrderWithDetails: (id)  => api.get(`/api/workorders/${id}`),
  getWorkLogsForOrder: (workOrderId) => api.get(`/api/worklog`),   // filter client-side by workOrderId

  // ── Service requests ───────────────────────────────────
  getAllServiceRequests: ()   => api.get("/api/staff/servicereq/validated"),
  getServiceRequest:    (id)  => api.get(`/api/staff/servicereq/${id}`),

  // ── Stored report records (Report entity) ─────────────
  create:     (data)      => api.post("/api/report", data),
  getAll:     ()          => api.get("/api/report"),
  getById:    (id)        => api.get(`/api/report/${id}`),
  update:     (id, data)  => api.put(`/api/report/${id}`, data),
  remove:     (id)        => api.delete(`/api/report/${id}`),
  getByScope: (scope)     => api.get(`/api/report/scope/${scope}`),
  getByUser:  (userId)    => api.get(`/api/report/generated-by/${userId}`),
};

export default ReportService;
