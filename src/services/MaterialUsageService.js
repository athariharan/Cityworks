import api from "./api";

const MaterialUsageService = {
  getAll:    ()          => api.get("/api/materialusage"),
  create:    (data)      => api.post("/api/materialusage", data),
  update:    (id, data)  => api.put(`/api/materialusage/${id}`, data),
  remove:    (id)        => api.delete(`/api/materialusage/${id}`),
};

export default MaterialUsageService;
