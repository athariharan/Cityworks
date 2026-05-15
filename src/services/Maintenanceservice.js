// services/Maintenanceservice.js
import api from "./api";

const MaintenanceService = {
  /** POST /api/maintenancetask */
  create:  (data)      => api.post("/api/maintenancetask", data),

  /** GET /api/maintenancetask */
  getAll:  ()          => api.get("/api/maintenancetask"),

  /** GET /api/maintenancetask/:id */
  getById: (id)        => api.get(`/api/maintenancetask/${id}`),

  /** PUT /api/maintenancetask/:id */
  update:  (id, data)  => api.put(`/api/maintenancetask/${id}`, data),

  /** DELETE /api/maintenancetask/:id */
  remove:  (id)        => api.delete(`/api/maintenancetask/${id}`),
};

export default MaintenanceService;
export const maintenanceService = MaintenanceService;
