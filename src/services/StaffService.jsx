import api from "./api";

const StaffService = {
  addStaff:     (data) => api.post("/api/staff", data),
  getAllStaff:  ()     => api.get("/api/staff"),
  getStaffById: (id)   => api.get(`/api/staff/${id}`),
  updateStaff:  (id, data) => api.put(`/api/staff/${id}`, data),
  deleteStaff:  (id)   => api.delete(`/api/staff/${id}`),
};

export default StaffService;