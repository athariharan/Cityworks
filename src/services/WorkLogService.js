import api from "./api";

const WorkLogService = {
  getAll:   ()          => api.get("/api/worklog"),
  create:   (formData)  => api.post("/api/worklog", formData, {
    headers: { "Content-Type": undefined },
  }),
  update:   (id, formData) => api.put(`/api/worklog/${id}`, formData, {
    headers: { "Content-Type": undefined },
  }),
};

export default WorkLogService;