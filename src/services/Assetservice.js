// assetService.js
// Replace BASE_URL with your Spring Boot backend URL
const BASE_URL = "http://localhost:8080/api";

export const assetService = {
  /**
   * Create a new asset
   * POST /api/assets
   * @param {Object} data - AssetRequest DTO fields
   */
  async create(data) {
    const res = await fetch(`${BASE_URL}/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create asset");
    }
    return res.json();
  },

  /**
   * Get all assets (for dropdowns)
   * GET /api/assets
   */
  async getAll() {
    const res = await fetch(`${BASE_URL}/assets`);
    if (!res.ok) throw new Error("Failed to fetch assets");
    return res.json();
  },

  /**
   * Get a single asset by ID
   * GET /api/assets/:id
   */
  async getById(id) {
    const res = await fetch(`${BASE_URL}/assets/${id}`);
    if (!res.ok) throw new Error("Asset not found");
    return res.json();
  },

  /**
   * Update an existing asset
   * PUT /api/assets/:id
   */
  async update(id, data) {
    const res = await fetch(`${BASE_URL}/assets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update asset");
    }
    return res.json();
  },
};