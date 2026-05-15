import api from "./api";

const KpiService = {
  create:  (data)      => api.post(`/api/kpis`, data),
  getAll:  ()          => api.get(`/api/kpis`),
  getById: (id)        => api.get(`/api/kpis/${id}`),
  update:  (id, data)  => api.put(`/api/kpis/${id}`, data),
  remove:  (id)        => api.delete(`/api/kpis/${id}`),
};

export default KpiService;