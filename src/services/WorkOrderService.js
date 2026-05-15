import api from "./api";

const WorkOrderService = {
  getAll:   ()        => api.get(`/api/workorders`),
  getById:  (id)      => api.get(`/api/workorders/${id}`),
  update:   (id, data) => api.put(`/api/workorders/${id}`, data),
};

export default WorkOrderService;