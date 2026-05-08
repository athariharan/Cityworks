// inspectionService.js
const BASE_URL = "http://localhost:8080/api";

export const inspectionService = {
  /**
   * Save an inspection record
   * POST /api/inspections
   * @param {Object} data - InspectionRecordRequest DTO
   *   { assetId, inspectorId, performedAt, conditionRating, findings, photoUri, status }
   */
  async create(data) {
    const res = await fetch(`${BASE_URL}/inspections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to save inspection");
    }
    return res.json();
  },

  /**
   * Get all inspections for an asset
   * GET /api/inspections?assetId=:id
   */
  async getByAsset(assetId) {
    const res = await fetch(`${BASE_URL}/inspections?assetId=${assetId}`);
    if (!res.ok) throw new Error("Failed to fetch inspections");
    return res.json();
  },

  /**
   * Get all inspectors (users with INSPECTOR role)
   * GET /api/users?role=Inspector
   */
  async getInspectors() {
    const res = await fetch(`${BASE_URL}/users?role=Inspector`);
    if (!res.ok) throw new Error("Failed to fetch inspectors");
    return res.json();
  },
};