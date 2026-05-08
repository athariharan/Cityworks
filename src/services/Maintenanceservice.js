// maintenanceService.js
const BASE_URL = "http://localhost:8080/api";

export const maintenanceService = {
  /**
   * Schedule a maintenance task
   * POST /api/maintenance-tasks
   * @param {Object} data - CreateMaintenanceTaskRequest DTO
   *   { assetId, description, scheduledAt, status, nextDueDate }
   *   scheduledAt: ISO datetime string (future)
   *   nextDueDate: ISO date string (today or future)
   */
  async create(data) {
    const res = await fetch(`${BASE_URL}/maintenance-tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create maintenance task");
    }
    return res.json();
  },

  /**
   * Get all maintenance tasks
   * GET /api/maintenance-tasks
   */
  async getAll() {
    const res = await fetch(`${BASE_URL}/maintenance-tasks`);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
  },

  /**
   * Update a task status
   * PATCH /api/maintenance-tasks/:id/status
   */
  async updateStatus(id, status) {
    const res = await fetch(`${BASE_URL}/maintenance-tasks/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
  },
};