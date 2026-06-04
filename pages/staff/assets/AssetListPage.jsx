// pages/staff/assets/AssetListPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate }    from "react-router-dom";
import StaffLayout        from "../../../components/staff/StaffLayout";
import { assetService }   from "../../../services/AssetService";
import "../../../styles/AssetManager.css";
import { STATUS_COLORS }  from "../../../utility/AssetConfig";
import { unwrap }         from "./AssetHelpers";
import AssetListPanel     from "./AssetListPanel";

export default function AssetListPage() {
  const navigate = useNavigate();

  const [assets,      setAssets]      = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState("All");

  const fetchAssets = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      setAssets(unwrap(await assetService.getAll()));
    } catch (fetchError) {
      setError(fetchError.message || "Failed to load assets.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  // ── Filter options (built from live data) ────────────────────
  const FILTER_TYPES = ["All", ...Array.from(new Set(assets.map(asset => asset.type).filter(Boolean)))];

  const filtered = assets
    .filter(asset => filter === "All" || asset.type === filter)
    .filter(asset =>
      !search ||
      (asset.assetTag || "").toLowerCase().includes(search.toLowerCase()) ||
      (asset.type     || "").toLowerCase().includes(search.toLowerCase())
    );

  // ── Panel computations ────────────────────────────────────────
  const activeCount   = assets.filter(asset => asset.status === "ACTIVE").length;
  const inactiveCount = assets.filter(asset => asset.status === "INACTIVE").length;
  const typeBreakdown = Array.from(
    assets.reduce((accumulator, asset) => {
      if (asset.type) accumulator.set(asset.type, (accumulator.get(asset.type) || 0) + 1);
      return accumulator;
    }, new Map())
  ).sort((assetA, assetB) => assetB[1] - assetA[1]).slice(0, 5);
  const maxType = Math.max(...typeBreakdown.map(([, count]) => count), 1);
  const total   = assets.length || 1;

  return (
    <StaffLayout>
      <div className="asp-layout">

            {/* // LEFT — Asset List */}
        <div className="asp-form">

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
                {isLoading ? "Loading…" : `${assets.length} asset${assets.length !== 1 ? "s" : ""} registered`}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-secondary" onClick={fetchAssets} disabled={isLoading}>
                {isLoading ? "Refreshing…" : "↻ Refresh"}
              </button>
              <button className="btn-primary" onClick={() => navigate("/staff/assets/registry")}>
                + Add Asset
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 12 }}>
              {error}
              <span className="alert-link" style={{ marginLeft: 12, cursor: "pointer" }} onClick={fetchAssets}>
                Retry →
              </span>
            </div>
          )}

          {isLoading ? (
            <div className="list-empty">
              <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }}/>
              <p>Loading assets…</p>
            </div>
          ) : !error && assets.length === 0 ? (
            <div className="list-empty">
              <div className="list-empty-icon">🏗</div>
              <h3>No assets registered yet</h3>
              <p>Start by registering your first municipal asset.</p>
              <button className="btn-primary" onClick={() => navigate("/staff/assets/registry")}>
                + Register Asset
              </button>
            </div>
          ) : (
            <>
              <div className="list-toolbar">
                <input
                  className="input list-search"
                  placeholder="Search by tag or type…"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                />
                <div className="list-filters">
                  {FILTER_TYPES.map(filterType => (
                    <button
                      key={filterType}
                      className={`filter-btn ${filter === filterType ? "filter-btn--active" : ""}`}
                      onClick={() => setFilter(filterType)}
                    >
                      {filterType.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: 0 }}>
                <table className="list-table">
                  <thead>
                    <tr>
                      <th>Asset Tag</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Install Date</th>
                      <th>Document Type</th>
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
                    ) : filtered.map(asset => {
                      const statusColors = STATUS_COLORS[asset.status] || { bg: "#f0f0f0", color: "#555" };
                      return (
                        <tr key={asset.assetId}>
                          <td><span className="list-tag">📦 {asset.assetTag}</span></td>
                          <td>{(asset.type || "—").replace(/_/g, " ")}</td>
                          <td>
                            <span className="status-pill" style={{ background: statusColors.bg, color: statusColors.color, marginTop: 0 }}>
                              {asset.status === "ACTIVE" ? "Active" : asset.status === "INACTIVE" ? "Inactive" : asset.status}
                            </span>
                          </td>
                          <td>{asset.installDate || "—"}</td>
                          <td>{asset.docType || "—"}</td>
                          <td className="list-time">#{asset.assetId}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>


            {/* RIGHT — Stat Panel */}

        <AssetListPanel
          totalCount={assets.length}
          filteredCount={filtered.length}
          activeCount={activeCount}
          inactiveCount={inactiveCount}
          typeBreakdown={typeBreakdown}
          maxType={maxType}
          total={total}
          filter={filter}
          onClearFilter={() => setFilter("All")}
          navigate={navigate}
        />
      </div>
    </StaffLayout>
  );
}
