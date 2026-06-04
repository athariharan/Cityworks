// pages/staff/inspections/InspectionListPage.jsx
// Table listing all logged inspection records — filterable by condition rating
// and searchable by asset tag, findings, or inspector ID.
import { useState, useEffect, useCallback } from "react";
import { useNavigate }                       from "react-router-dom";
import { inspectionService }                 from "../../../services/InspectionService";
import { assetService }                      from "../../../services/AssetService";
import StaffLayout                           from "../../../components/staff/StaffLayout";
import InspectionListPanel                   from "./InspectionListPanel";
import "../../../styles/AssetManager.css";
import { COND_COLORS, COND_ORDER } from "../../../utility/InspectionConfig";
import { unwrap }                  from "../../../utility/ApiHelpers";

export default function InspectionListPage() {
  const navigate = useNavigate();

  const [inspections, setInspections] = useState([]);
  const [assetMap,    setAssetMap]    = useState({});
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState("");
  const [filter,      setFilter]      = useState("All");
  const [search,      setSearch]      = useState("");

  const fetchInspections = useCallback(async () => {
    setIsLoading(true); setError("");
    try {
      const [inspResult, assetResult] = await Promise.allSettled([
        inspectionService.getAll(),
        assetService.getAll(),
      ]);
      if (inspResult.status === "fulfilled") {
        setInspections(unwrap(inspResult.value));
      } else {
        setError("Failed to load inspections.");
      }
      if (assetResult.status === "fulfilled") {
        const map = {};
        unwrap(assetResult.value).forEach(asset => { map[asset.assetId || asset.id] = asset.assetTag; });
        setAssetMap(map);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchInspections(); }, [fetchInspections]);

  const criticalCount = inspections.filter(inspection => (inspection.conditionRating || "").toUpperCase() === "CRITICAL").length;
  const poorCount     = inspections.filter(inspection => (inspection.conditionRating || "").toUpperCase() === "POOR").length;

  const condBreakdown = COND_ORDER.map(condKey => ({
    key:   condKey,
    count: inspections.filter(inspection => (inspection.conditionRating || "").toUpperCase() === condKey).length,
    ...COND_COLORS[condKey],
  }));

  const maxCond = Math.max(...condBreakdown.map(condEntry => condEntry.count), 1);

  const filtered = inspections.filter(inspection => {
    const matchesFilter = filter === "All" || (inspection.conditionRating || "").toUpperCase() === filter;
    const tag    = assetMap[inspection.assetId] || "";
    const query  = search.toLowerCase();
    const matchesSearch = !query ||
      tag.toLowerCase().includes(query) ||
      (inspection.findings || "").toLowerCase().includes(query) ||
      String(inspection.inspectorId || "").includes(query);
    return matchesFilter && matchesSearch;
  });

  return (
    <StaffLayout>
      <div className="asp-layout">

        {/* ── Left — Inspections List ── */}
        <div className="asp-form">

          <button className="page-back-btn" onClick={() => navigate("/staff/assets")}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to Asset Management
          </button>

          <div className="page-header">
            <div className="header-icon header-icon--inspection">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div>
              <h1 className="page-title">Inspection Records</h1>
              <p className="page-sub">
                {isLoading ? "Loading…" : `${inspections.length} record${inspections.length !== 1 ? "s" : ""} logged`}
                {criticalCount > 0 && !isLoading && ` · ${criticalCount} critical`}
              </p>
            </div>
            <div className="header-actions">
              <button className="btn-secondary btn-sm" onClick={fetchInspections} disabled={isLoading}>↻ Refresh</button>
              <button className="btn-primary" onClick={() => navigate("/staff/assets/inspections")}>+ New Inspection</button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
              </svg>
              {error} <span className="alert-link" onClick={fetchInspections}>Retry</span>
            </div>
          )}

          {criticalCount > 0 && !isLoading && !error && (
            <div className="alert alert-error">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
              </svg>
              {criticalCount} critical asset{criticalCount > 1 ? "s need" : " needs"} immediate attention.
            </div>
          )}

          {isLoading ? (
            <div className="loading-state">
              <div className="spinner spinner--lg" />
              <p>Loading inspections…</p>
            </div>
          ) : inspections.length === 0 && !error ? (
            <div className="list-empty">
              <div className="list-empty-icon">🔍</div>
              <h3>No inspections logged yet</h3>
              <p>Start by recording your first asset inspection.</p>
              <button className="btn-primary" onClick={() => navigate("/staff/assets/inspections")}>+ New Inspection</button>
            </div>
          ) : (
            <>
              <div className="list-toolbar">
                <div className="list-filters">
                  {["All", "EXCELLENT", "GOOD", "FAIR", "POOR", "CRITICAL"].map(filterValue => {
                    const colors   = COND_COLORS[filterValue];
                    const isActive = filter === filterValue;
                    return (
                      <button key={filterValue}
                        className={`filter-btn ${isActive ? "filter-btn--active" : ""}`}
                        style={isActive && colors ? { background: colors.bg, color: colors.color, borderColor: colors.dot } : {}}
                        onClick={() => setFilter(filterValue)}>
                        {filterValue === "All" ? "All" : filterValue.charAt(0) + filterValue.slice(1).toLowerCase()}
                        {filterValue === "CRITICAL" && criticalCount > 0 && <span className="filter-badge">{criticalCount}</span>}
                        {filterValue === "POOR"     && poorCount > 0     && <span className="filter-badge">{poorCount}</span>}
                      </button>
                    );
                  })}
                </div>
                <input className="input list-search--sm" placeholder="Search asset, inspector…"
                  value={search} onChange={event => setSearch(event.target.value)} />
              </div>

              <div className="card card--no-pad">
                <table className="list-table">
                  <thead>
                    <tr>
                      <th>Asset</th><th>Inspector ID</th><th>Condition</th>
                      <th>Status</th><th>Performed At</th><th>Findings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} className="td-empty">No results</td></tr>
                    ) : filtered.map(inspection => {
                      const inspectionId = inspection.inspectionId ?? inspection.id;
                      const tag          = assetMap[inspection.assetId] || `Asset #${inspection.assetId}`;
                      const colors       = COND_COLORS[(inspection.conditionRating || "").toUpperCase()]
                                           || { bg: "#f0f0f0", color: "#555", dot: "#888" };
                      return (
                        <tr key={inspectionId}>
                          <td><span className="list-tag">🔍 {tag}</span></td>
                          <td>{inspection.inspectorId ? `#${inspection.inspectorId}` : "—"}</td>
                          <td>
                            <span className="status-pill" style={{ background: colors.bg, color: colors.color }}>
                              <span className="condition-dot--sm" style={{ background: colors.dot }} />
                              {inspection.conditionRating || "—"}
                            </span>
                          </td>
                          <td>{(inspection.status || "—").replace(/_/g, " ")}</td>
                          <td className="td-date">
                            {inspection.performedAt ? new Date(inspection.performedAt).toLocaleString("en-IN") : "—"}
                          </td>
                          <td className="td-findings">{inspection.findings || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* ── Right — Stats Panel ── */}
        <InspectionListPanel
          inspections={inspections}
          filtered={filtered}
          criticalCount={criticalCount}
          condBreakdown={condBreakdown}
          maxCond={maxCond}
          loading={isLoading}
          navigate={navigate}
        />

      </div>
    </StaffLayout>
  );
}
