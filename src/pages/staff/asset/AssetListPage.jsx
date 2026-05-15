// pages/staff/asset/AssetListPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { assetService } from "../../../services/Assetservice";
import "../../../styles/assetmanager.css";
import StaffLayout from "../../../components/staff/StaffLayout";

// ── AssetType enum (mirrors backend com.cts.enums.AssetType) ──────────────
const ASSET_CATEGORIES = [
  {
    label: "Lighting",
    color: "#f59e0b", bg: "#fef3c7",
    types: ["STREET_LAMP", "TRAFFIC_SIGNAL", "PEDESTRIAN_LIGHT"],
  },
  {
    label: "Roads & Transport",
    color: "#3b82f6", bg: "#dbeafe",
    types: ["ROAD", "BRIDGE", "FOOTPATH", "SPEED_BREAKER", "BUS_STOP", "PARKING_LOTS"],
  },
  {
    label: "Water & Sanitation",
    color: "#06b6d4", bg: "#cffafe",
    types: ["WATER_TAP", "WATER_PIPELINE", "WATER_TANK", "SEWAGE", "DRAINAGE", "MANHOLE", "STORM_DRAIN", "PUBLIC_TOILET"],
  },
  {
    label: "Electrical",
    color: "#8b5cf6", bg: "#ede9fe",
    types: ["TRANSFORMER", "ELECTRIC_POLE", "SUBSTATION", "GENERATOR"],
  },
  {
    label: "Public Spaces",
    color: "#10b981", bg: "#d1fae5",
    types: ["PARK", "PLAYGROUND", "GARDEN", "MARKET", "LIBRARY"],
  },
  {
    label: "Waste Management",
    color: "#84cc16", bg: "#ecfccb",
    types: ["GARBAGE_BIN", "WASTE_COLLECTION_POINT", "RECYCLING_STATION", "COMPOST_UNIT"],
  },
  {
    label: "Buildings",
    color: "#6366f1", bg: "#e0e7ff",
    types: ["HEALTH_CENTER", "SCHOOL_BUILDING"],
  },
  {
    label: "Signage & Safety",
    color: "#ef4444", bg: "#fee2e2",
    types: ["ROAD_SIGN", "BOUNDARY_WALL", "CCTV_CAMERA"],
  },
];

// flat lookup: type → category meta
const TYPE_CATEGORY = {};
ASSET_CATEGORIES.forEach(cat => {
  cat.types.forEach(t => { TYPE_CATEGORY[t] = cat; });
});

const STATUS_COLORS = {
  ACTIVE:   { bg: "#d1fae5", color: "#065f46" },
  INACTIVE: { bg: "#f0f0f0", color: "#555" },
};

export default function AssetListPage() {
  const navigate = useNavigate();
  const [assets,   setAssets]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");   // category label or "All"
  const [typeFilter, setTypeFilter] = useState("All"); // specific type or "All"

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await assetService.getAll();
      const raw  = res?.data ?? res;
      const list = Array.isArray(raw)            ? raw
                 : Array.isArray(raw?.data)       ? raw.data
                 : Array.isArray(raw?.data?.data) ? raw.data.data
                 : [];
      setAssets(list);
    } catch (err) {
      setError(err.message || "Failed to load assets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // When category changes, reset type filter
  const handleCategoryClick = (cat) => {
    setCategory(cat);
    setTypeFilter("All");
  };

  // active category meta (for sub-type button colours)
  const activeCat = ASSET_CATEGORIES.find(c => c.label === category);

  // types available in selected category that actually exist in the loaded data
  const availableTypes = activeCat
    ? activeCat.types.filter(t => assets.some(a => a.type === t))
    : [];

  const filtered = assets
    .filter(a => {
      if (category === "All") return true;
      return TYPE_CATEGORY[a.type]?.label === category;
    })
    .filter(a => typeFilter === "All" || a.type === typeFilter)
    .filter(a =>
      !search ||
      (a.assetTag || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.type     || "").toLowerCase().includes(search.toLowerCase()) ||
      String(a.assetId || "").includes(search)
    );

  return (
    <StaffLayout>
      <div className="page-wrapper">

        <button className="page-back-btn" onClick={() => navigate("/staff/assets")}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Asset Management
        </button>

        <div className="page-header">
          <div className="header-icon">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <path d="M9 9h6M9 12h6M9 15h4"/>
            </svg>
          </div>
          <div>
            <h1 className="page-title">All Assets</h1>
            <p className="page-sub">
              {loading
                ? "Loading…"
                : `${filtered.length} of ${assets.length} asset${assets.length !== 1 ? "s" : ""} shown`}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" onClick={load} disabled={loading}>
              {loading ? "Refreshing…" : "↻ Refresh"}
            </button>
            <button className="btn-primary" onClick={() => navigate("/staff/assets/registry")}>
              + Add Asset
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 12 }}>
            {error}
            <span className="alert-link" style={{ marginLeft: 12, cursor: "pointer" }} onClick={load}>
              Retry →
            </span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="list-empty">
            <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
            <p>Loading assets…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && assets.length === 0 && (
          <div className="list-empty">
            <div className="list-empty-icon">🏗</div>
            <h3>No assets registered yet</h3>
            <p>Start by registering your first municipal asset.</p>
            <button className="btn-primary" onClick={() => navigate("/staff/assets/registry")}>
              + Register Asset
            </button>
          </div>
        )}

        {/* Filters + Table */}
        {!loading && !error && assets.length > 0 && (
          <>
            {/* Search */}
            <div className="list-toolbar" style={{ marginBottom: 8 }}>
              <input
                className="input list-search"
                placeholder="Search by tag, type or ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Category filter row */}
            <div className="list-filters" style={{ flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              <button
                className={`filter-btn ${category === "All" ? "filter-btn--active" : ""}`}
                onClick={() => handleCategoryClick("All")}
              >
                All
              </button>
              {ASSET_CATEGORIES.map(cat => {
                const count = assets.filter(a => TYPE_CATEGORY[a.type]?.label === cat.label).length;
                if (count === 0) return null; // hide empty categories
                return (
                  <button
                    key={cat.label}
                    className={`filter-btn ${category === cat.label ? "filter-btn--active" : ""}`}
                    style={category === cat.label
                      ? { background: cat.bg, color: cat.color, borderColor: cat.color }
                      : {}}
                    onClick={() => handleCategoryClick(cat.label)}
                  >
                    {cat.label}
                    <span style={{
                      marginLeft: 5,
                      background: category === cat.label ? cat.color : "#e2e8f0",
                      color: category === cat.label ? "#fff" : "#64748b",
                      borderRadius: 10, padding: "1px 6px", fontSize: 11, fontWeight: 600,
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sub-type filter row (only when a category is selected) */}
            {activeCat && availableTypes.length > 1 && (
              <div className="list-filters" style={{ flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                <button
                  className={`filter-btn ${typeFilter === "All" ? "filter-btn--active" : ""}`}
                  style={typeFilter === "All"
                    ? { background: activeCat.bg, color: activeCat.color, borderColor: activeCat.color, fontSize: 12 }
                    : { fontSize: 12 }}
                  onClick={() => setTypeFilter("All")}
                >
                  All {activeCat.label}
                </button>
                {availableTypes.map(t => (
                  <button
                    key={t}
                    className={`filter-btn ${typeFilter === t ? "filter-btn--active" : ""}`}
                    style={typeFilter === t
                      ? { background: activeCat.bg, color: activeCat.color, borderColor: activeCat.color, fontSize: 12 }
                      : { fontSize: 12 }}
                    onClick={() => setTypeFilter(t)}
                  >
                    {t.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            )}

            {/* Table */}
            <div className="card" style={{ padding: 0 }}>
              <table className="list-table">
                <thead>
                  <tr>
                    <th>Asset Tag</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Install Date</th>
                    <th>Asset ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                        No results found
                      </td>
                    </tr>
                  ) : filtered.map(a => {
                    const sc  = STATUS_COLORS[a.status] || { bg: "#f0f0f0", color: "#555" };
                    const cat = TYPE_CATEGORY[a.type];
                    return (
                      <tr key={a.assetId}>
                        <td><span className="list-tag">📦 {a.assetTag}</span></td>
                        <td>
                          {cat ? (
                            <span className="status-pill" style={{
                              background: cat.bg, color: cat.color, marginTop: 0, fontSize: 11,
                            }}>
                              {cat.label}
                            </span>
                          ) : "—"}
                        </td>
                        <td>{(a.type || "—").replace(/_/g, " ")}</td>
                        <td>
                          <span className="status-pill" style={{ background: sc.bg, color: sc.color, marginTop: 0 }}>
                            {a.status === "ACTIVE" ? "Active" : a.status === "INACTIVE" ? "Inactive" : (a.status || "—")}
                          </span>
                        </td>
                        <td>{a.installDate || "—"}</td>
                        <td className="list-time">#{a.assetId}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>
    </StaffLayout>
  );
}
