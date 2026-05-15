import api from "./api";

const NotificationService = {
  getAll:       ()     => api.get("/api/notifications"),
  getById:      (id)   => api.get(`/api/notifications/${id}`),
  create:       (data) => api.post("/api/notifications", data),
  update:       (id, data) => api.put(`/api/notifications/${id}`, data),
  remove:       (id)   => api.delete(`/api/notifications/${id}`),
};

export default NotificationService;
