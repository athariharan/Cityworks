import api from "./api";

const NotificationService = {
  getAll:          ()          => api.get("/api/notifications"),
  getById:         (id)        => api.get(`/api/notifications/${id}`),
  getByUserId:     (userId)    => api.get(`/api/notifications/user/${userId}`),
  getUnreadCount:  (userId)    => api.get(`/api/notifications/user/${userId}/unread-count`),
  markAsRead:      (id)        => api.put(`/api/notifications/${id}/read`),
  create:          (data)      => api.post("/api/notifications", data),
  update:          (id, data)  => api.put(`/api/notifications/${id}`, data),
  remove:          (id)        => api.delete(`/api/notifications/${id}`),
};

export default NotificationService;
