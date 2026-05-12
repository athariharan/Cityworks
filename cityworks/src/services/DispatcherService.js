import api from "./api";

const DispatcherService = {
  // ── Service Requests ───────────────────────────────────
  getPendingRequests:   ()   => api.get("/api/staff/servicereq/pending"),
  getValidatedRequests: ()   => api.get("/api/staff/servicereq/validated"),
  getRequestById:       (id) => api.get(`/api/staff/servicereq/${id}`),
  validateRequest:      (id) => api.patch(`/api/staff/servicereq/${id}/validate`),
  rejectRequest:        (id) => api.patch(`/api/staff/servicereq/${id}/reject`),

  // ── Work Orders ────────────────────────────────────────
  createWorkOrder: (data) =>
    api.post("/api/workorders", data, {
      headers: { "USER-ID": localStorage.getItem("userId") || "0" },
    }),
  getAllWorkOrders:  ()         => api.get("/api/workorders"),
  getWorkOrderById: (id)       => api.get(`/api/workorders/${id}`),
  updateWorkOrder:  (id, data) => api.put(`/api/workorders/${id}`, data),
  deleteWorkOrder:  (id)       => api.delete(`/api/workorders/${id}`),

  // ── Field Workers (Crews) ──────────────────────────────
  getAllFieldWorkers: () => api.get("/api/fieldworker"),
};

export default DispatcherService;