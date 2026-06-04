// pages/staff/inspections/InspectionListPanel.jsx
// Right-side info panel for the inspections list — shows total / critical KPIs,
// a segmented condition distribution bar, breakdown bars per condition, and quick links.

export default function InspectionListPanel({
  inspections, filtered, criticalCount, condBreakdown, maxCond, loading, navigate,
}) {
  const requiresActionCount = inspections.filter(inspection => inspection.status === "REQUIRES_ACTION").length;
  const poorCount           = inspections.filter(inspection => (inspection.conditionRating || "").toUpperCase() === "POOR").length;
  const total               = inspections.length || 1;

  const QUICK_LINKS = [
    { ico: "➕", lbl: "Log New Inspection",   path: "/staff/assets/inspections",  bg: "#cffafe" },
    { ico: "🏗️", lbl: "Register Asset",       path: "/staff/assets/registry",     bg: "#d1fae5" },
    { ico: "🛠️", lbl: "Schedule Maintenance", path: "/staff/assets/maintenance",  bg: "#fee2e2" },
  ];

  return (
    <aside className="asp-panel">

      {/* Live KPI — total records and how many currently match the active filter */}
      <div className="panel-hero" style={{ background: "linear-gradient(135deg,#0e7490 0%,#06b6d4 100%)" }}>
        <svg className="panel-hero-deco" width="90" height="90" viewBox="0 0 24 24" fill="white">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <div className="panel-hero-icon">🔍</div>
        <div className="panel-hero-num">{inspections.length}</div>
        <div className="panel-hero-label">Total Records</div>
        <div className="panel-hero-sub">
          {filtered.length !== inspections.length
            ? `${filtered.length} matching filter`
            : "All records shown"}
        </div>
      </div>

      {/* Warning banner — only visible when critical assets exist */}
      {criticalCount > 0 && !loading && (
        <div className="panel-alert panel-alert--red">
          <div className="panel-alert-icon"><span className="pulse">🚨</span></div>
          <div className="panel-alert-body">
            <div className="panel-alert-title">Critical Alert</div>
            <div className="panel-alert-num">{criticalCount}</div>
            <div className="panel-alert-desc">
              asset{criticalCount > 1 ? "s" : ""} in critical condition — re-inspect within 7 days
            </div>
          </div>
        </div>
      )}

      {/* 2×2 grid of key counts */}
      <div className="asp-panel-card">
        <div className="asp-panel-title">📊 Overview</div>
        <div className="stat-grid-2">
          <div className="stat-box">
            <div className="stat-box-icon" style={{ background: "#cffafe" }}>📋</div>
            <div className="stat-box-num">{inspections.length}</div>
            <div className="stat-box-lbl">Records</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-icon" style={{ background: "#fef9c3" }}>⚡</div>
            <div className={`stat-box-num ${requiresActionCount > 0 ? "warn" : ""}`}>{requiresActionCount}</div>
            <div className="stat-box-lbl">Req. Action</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-icon" style={{ background: "#fee2e2" }}>🚨</div>
            <div className={`stat-box-num ${criticalCount > 0 ? "warn" : ""}`}>{criticalCount}</div>
            <div className="stat-box-lbl">Critical</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-icon" style={{ background: "#ffe4d0" }}>⚠️</div>
            <div className={`stat-box-num ${poorCount > 0 ? "warn" : ""}`}>{poorCount}</div>
            <div className="stat-box-lbl">Poor</div>
          </div>
        </div>

        {/* Horizontal bar split by condition colour */}
        {inspections.length > 0 && (
          <div className="seg-bar-wrap" style={{ marginTop: 14 }}>
            <div className="seg-bar-title">Condition Distribution</div>
            <div className="seg-bar">
              {condBreakdown.map(condEntry => (
                <div key={condEntry.key} className="seg-bar-chunk"
                  style={{ width: `${(condEntry.count / total) * 100}%`, background: condEntry.dot }}
                  title={`${condEntry.key}: ${condEntry.count}`}
                />
              ))}
            </div>
            <div className="seg-bar-legend">
              {condBreakdown.filter(condEntry => condEntry.count > 0).map(condEntry => (
                <div key={condEntry.key} className="seg-legend-item">
                  <span className="seg-legend-dot" style={{ background: condEntry.dot }} />
                  {condEntry.key.charAt(0) + condEntry.key.slice(1).toLowerCase()} ({condEntry.count})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Individual progress bars per condition rating */}
      <div className="asp-panel-card">
        <div className="asp-panel-title">🎯 Condition Breakdown</div>
        {condBreakdown.map(condEntry => (
          <div key={condEntry.key} className="breakdown-item">
            <div className="breakdown-header">
              <div className="breakdown-label-group">
                <span className="breakdown-dot" style={{ background: condEntry.dot }} />
                <span className="breakdown-label">{condEntry.key.charAt(0) + condEntry.key.slice(1).toLowerCase()}</span>
              </div>
              <span className="breakdown-count" style={{ background: condEntry.bg, color: condEntry.color }}>{condEntry.count}</span>
            </div>
            <div className="breakdown-bar-track">
              <div className="breakdown-bar-fill" style={{ background: condEntry.dot, width: `${(condEntry.count / maxCond) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Shortcut buttons to related pages */}
      <div className="asp-panel-card">
        <div className="asp-panel-title">🔗 Quick Links</div>
        <div className="nav-cards">
          {QUICK_LINKS.map(navLink => (
            <button key={navLink.path} className="nav-card" onClick={() => navigate(navLink.path)}>
              <div className="nav-card-ico" style={{ background: navLink.bg }}>{navLink.ico}</div>
              <span className="nav-card-lbl">{navLink.lbl}</span>
              <span className="nav-card-arr">›</span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel-insight">
        <div className="panel-insight-title">💡 Tip</div>
        <p>Critical assets must be re-inspected within <strong>7 days</strong>. Use the condition filter to prioritise high-risk assets first.</p>
      </div>

    </aside>
  );
}
