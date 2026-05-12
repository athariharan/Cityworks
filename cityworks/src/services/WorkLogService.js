import api from "./api";

const WorkLogService = {
  getAll:  ()     => api.get(`/api/worklog`),
  create:  (data) => api.post(`/api/worklog`, data),
};

export default WorkLogService;