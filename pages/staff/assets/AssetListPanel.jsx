// pages/staff/assets/AssetListPanel.jsx
// Right-side stat panel for the Asset List page.
import { NavCards, PanelInsight } from "./AssetPanelShared";

const QUICK_LINKS = [
  { ico: "🏗️", lbl: "Register Asset",      path: "/staff/assets/registry",   bg: "#d1fae5" },
  { ico: "🔍", lbl: "Log Inspection",       path: "/staff/assets/inspections", bg: "#e0f2fe" },
  { ico: "🛠️", lbl: "Schedule Maintenance", path: "/staff/assets/maintenance", bg: "#fee2e2" },
];

export default function AssetListPanel({
  totalCount,
  filteredCount,
  activeCount,
  inactiveCount,
  typeBreakdown,
  maxType,
  total,
  filter,
  onClearFilter,
  navigate,
}) {
  return (
    <aside className="asp-panel">

      {/* ── Hero KPI ── */}
      <div className="panel-hero" style={{ background: "linear-gradient(135deg,#1e40af 0%,#3b82f6 100%)" }}>
        <svg className="panel-hero-deco" width="90" height="90" viewBox="0 0 24 24" fill="white">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M9 9h6M9 12h6M9 15h4"/>
        </svg>
        <div className="panel-hero-icon">📦</div>
        <div className="panel-hero-num">{totalCount}</div>
        <div className="panel-hero-label">Total Assets</div>
        <div className="panel-hero-sub">Showing {filteredCount} of {totalCount}</div>
      </div>

      {/* ── Inventory Summary ── */}
      <div className="asp-panel-card">
        <div className="asp-panel-title">📊 Inventory Summary</div>
        <div className="stat-grid-2">
          <div className="stat-box">
            <div className="stat-box-icon" style={{ background: "#d1fae5" }}>✅</div>
            <div className="stat-box-num">{activeCount}</div>
            <div className="stat-box-lbl">Active</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-icon" style={{ background: "#f0f0f0" }}>⏸️</div>
            <div className="stat-box-num">{inactiveCount}</div>
            <div className="stat-box-lbl">Inactive</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-icon" style={{ background: "#dbeafe" }}>🗂️</div>
            <div className="stat-box-num">{typeBreakdown.length}</div>
            <div className="stat-box-lbl">Types</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-icon" style={{ background: "#fef9c3" }}>🔎</div>
            <div className="stat-box-num">{filteredCount}</div>
            <div className="stat-box-lbl">Showing</div>
          </div>
        </div>

        {/* Status distribution bar */}
        {totalCount > 0 && (
          <div className="seg-bar-wrap" style={{ marginTop: 14 }}>
            <div className="seg-bar-title">Status Distribution</div>
            <div className="seg-bar">
              <div className="seg-bar-chunk" style={{ width: `${(activeCount   / total) * 100}%`, background: "#2da44e" }}/>
              <div className="seg-bar-chunk" style={{ width: `${(inactiveCount / total) * 100}%`, background: "#94a3b8" }}/>
            </div>
            <div className="seg-bar-legend">
              <div className="seg-legend-item">
                <span className="seg-legend-dot" style={{ background: "#2da44e" }}/> Active ({activeCount})
              </div>
              <div className="seg-legend-item">
                <span className="seg-legend-dot" style={{ background: "#94a3b8" }}/> Inactive ({inactiveCount})
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Top Asset Types ── */}
      {typeBreakdown.length > 0 && (
        <div className="asp-panel-card">
          <div className="asp-panel-title">🏗️ Top Asset Types</div>
          {typeBreakdown.map(([assetType, count]) => (
            <div key={assetType} className="breakdown-item">
              <div className="breakdown-header">
                <div className="breakdown-label-group">
                  <span className="breakdown-dot" style={{ background: "#3b82f6" }}/>
                  <span className="breakdown-label">{assetType.replace(/_/g, " ")}</span>
                </div>
                <span className="breakdown-count" style={{ background: "#dbeafe", color: "#1e40af" }}>
                  {count}
                </span>
              </div>
              <div className="breakdown-bar-track">
                <div className="breakdown-bar-fill" style={{ background: "#3b82f6", width: `${(count / maxType) * 100}%` }}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Active Filter indicator ── */}
      {filter !== "All" && (
        <div className="asp-panel-card" style={{ border: "1px solid #bfdbfe", background: "#eff6ff" }}>
          <div className="asp-panel-title" style={{ color: "#1e40af" }}>🔍 Active Filter</div>
          <p style={{ fontSize: "12px", color: "#334155", margin: "0 0 10px" }}>
            Showing <strong>{filteredCount}</strong> asset{filteredCount !== 1 ? "s" : ""} of type{" "}
            <strong>{filter.replace(/_/g, " ")}</strong>
          </p>
          <button
            className="nav-card"
            onClick={onClearFilter}
            style={{ background: "#fee2e2", borderColor: "#fca5a5" }}
          >
            <div className="nav-card-ico" style={{ background: "#fecaca" }}>✕</div>
            <span className="nav-card-lbl" style={{ color: "#dc2626" }}>Clear Filter</span>
          </button>
        </div>
      )}

      {/* ── Quick Links ── */}
      <div className="asp-panel-card">
        <div className="asp-panel-title">🔗 Quick Links</div>
        <NavCards links={QUICK_LINKS} navigate={navigate} />
      </div>

      {/* ── Insight ── */}
      <PanelInsight title="💡 Tip">
        Use the type filter to drill down by category. Search by tag or type name to find assets instantly.
      </PanelInsight>

    </aside>
  );
}
