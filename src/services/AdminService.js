import api from "./api";

const AdminService = {
  getAllUsers:      () => api.get("/api/user/all"),
  getAllStaff:      () => api.get("/api/staff"),
  getAllWorkOrders: () => api.get("/api/workorders"),
};

export default AdminService;
