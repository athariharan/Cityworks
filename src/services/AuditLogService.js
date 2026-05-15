import api from "./api";

const AuditLogService = {
  /** GET /api/audit — returns all logs newest-first */
  getAllLogs: () => api.get("/api/audit"),
};

export default AuditLogService;
