// pages/staff/inspections/InspectionDetailsPanel.jsx
// Right-side info panel on the inspection form — shows live inspection counts,
// critical asset alerts, a condition rating guide, and quick navigation links.

// What each condition rating means and what action is needed.
const CONDITION_GUIDE = [
  { dot: "#2da44e", label: "Excellent", msg: "No action"       },
  { dot: "#3fb950", label: "Good",      msg: "Routine check"   },
  { dot: "#d29922", label: "Fair",      msg: "Monitor closely" },
  { dot: "#e25c2c", label: "Poor",      msg: "Schedule soon"   },
  { dot: "#dc2626", label: "Critical",  msg: "Act immediately" },
];

const QUICK_LINKS = [
  { ico: "📋", lbl: "View All Records",     path: "/staff/assets/inspections/list", bg: "#cffafe" },
  { ico: "🏗️", lbl: "Register Asset",       path: "/staff/assets/registry",         bg: "#d1fae5" },
  { ico: "🛠️", lbl: "Schedule Maintenance", path: "/staff/assets/maintenance",       bg: "#fee2e2" },
];

export default function InspectionDetailsPanel({ totalInsp, assetsCount, criticalCount, navigate }) {
  return (
    <aside className="asp-panel">

      {/* Live KPI — total inspections logged and assets being monitored */}
      <div className="panel-hero" style={{ background: "linear-gradient(135deg,#0e7490 0%,#06b6d4 100%)" }}>
        <svg className="panel-hero-deco" width="90" height="90" viewBox="0 0 24 24" fill="white">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <div className="panel-hero-icon">🔍</div>
        <div className="panel-hero-num">{totalInsp}</div>
        <div className="panel-hero-label">Inspections Logged</div>
        <div className="panel-hero-sub">{assetsCount} assets monitored</div>
      </div>

      {/* Warning banner — only visible when at least one asset is critical */}
      {criticalCount > 0 && (
        <div className="panel-alert panel-alert--red">
          <div className="panel-alert-icon"><span className="pulse">⚠️</span></div>
          <div className="panel-alert-body">
            <div className="panel-alert-title">Critical Condition</div>
            <div className="panel-alert-num">{criticalCount}</div>
            <div className="panel-alert-desc">
              asset{criticalCount > 1 ? "s" : ""} need{criticalCount === 1 ? "s" : ""} immediate attention
            </div>
          </div>
        </div>
      )}

      {/* Explains what each colour-coded condition rating means */}
      <div className="asp-panel-card">
        <div className="asp-panel-title">🎯 Condition Guide</div>
        {CONDITION_GUIDE.map(guideEntry => (
          <div key={guideEntry.label} className="guide-row">
            <span className="guide-dot-lg" style={{ background: guideEntry.dot }} />
            <span className="guide-label">{guideEntry.label}</span>
            <span className="guide-msg">{guideEntry.msg}</span>
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
        <div className="panel-insight-title">💡 Reminder</div>
        <p>Critical assets must be re-inspected within <strong>7 days</strong>. Always attach photo evidence — it protects against audit disputes.</p>
      </div>

    </aside>
  );
}
