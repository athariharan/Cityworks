// pages/staff/assets/AssetDetailsPanel.jsx
// Right-side stat panel for the Asset Registration page.
import { NavCards, PanelInsight } from "./AssetPanelShared";

const QUICK_LINKS = [
  { ico: "📋", lbl: "View All Assets",      path: "/staff/assets/registry/list", bg: "#dbeafe" },
  { ico: "🔍", lbl: "Log Inspection",        path: "/staff/assets/inspections",   bg: "#e0f2fe" },
  { ico: "🛠️", lbl: "Schedule Maintenance",  path: "/staff/assets/maintenance",   bg: "#fee2e2" },
];

export default function AssetDetailsPanel({
  assetCount,
  activeCount,
  inspCount,
  maintCount,
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
        <div className="panel-hero-num">{assetCount}</div>
        <div className="panel-hero-label">Assets Registered</div>
        <div className="panel-hero-sub">{activeCount} currently active</div>
      </div>

      {/* ── Inventory at a Glance ── */}
      <div className="asp-panel-card">
        <div className="asp-panel-title">📊 Inventory at a Glance</div>
        <div className="stat-grid-2">
          <div className="stat-box">
            <div className="stat-box-icon" style={{ background: "#dbeafe" }}>📦</div>
            <div className="stat-box-num">{assetCount}</div>
            <div className="stat-box-lbl">Total Assets</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-icon" style={{ background: "#d1fae5" }}>✅</div>
            <div className="stat-box-num">{activeCount}</div>
            <div className="stat-box-lbl">Active</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-icon" style={{ background: "#e0f2fe" }}>🔍</div>
            <div className="stat-box-num">{inspCount}</div>
            <div className="stat-box-lbl">Inspections</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-icon" style={{ background: "#fee2e2" }}>🛠️</div>
            <div className="stat-box-num">{maintCount}</div>
            <div className="stat-box-lbl">Maint. Tasks</div>
          </div>
        </div>
      </div>

      {/* ── Tag Format Guide ── */}
      <div className="format-card">
        <div className="format-card-title">🏷️ Tag Format Guide</div>
        {[
          { tag: "RD-2024-001", desc: "Road"        },
          { tag: "SL-2024-042", desc: "Street Lamp" },
          { tag: "WT-2024-007", desc: "Water Tank"  },
        ].map(formatItem => (
          <div key={formatItem.tag} className="format-row">
            <span className="format-tag">{formatItem.tag}</span>
            <span className="format-arrow">→</span>
            <span className="format-desc">{formatItem.desc}</span>
          </div>
        ))}
        <p style={{ fontSize: "11px", color: "#64748b", margin: "8px 0 0", lineHeight: 1.5 }}>
          Pattern: <strong>TYPE-YEAR-SEQ</strong> · 3–50 chars · letters, numbers &amp; hyphens
        </p>
      </div>

      {/* ── Status Guide ── */}
      <div className="asp-panel-card">
        <div className="asp-panel-title">🏷️ Status Guide</div>
        {[
          { dot: "#2da44e", label: "Active",   msg: "Operational"    },
          { dot: "#64748b", label: "Inactive", msg: "Not in service" },
        ].map(statusItem => (
          <div key={statusItem.label} className="guide-row">
            <span className="guide-dot-lg" style={{ background: statusItem.dot }}/>
            <span className="guide-label">{statusItem.label}</span>
            <span className="guide-msg">{statusItem.msg}</span>
          </div>
        ))}
      </div>

      {/* ── Quick Links ── */}
      <div className="asp-panel-card">
        <div className="asp-panel-title">🔗 Quick Links</div>
        <NavCards links={QUICK_LINKS} navigate={navigate} />
      </div>

      {/* ── Insight ── */}
      <PanelInsight title="💡 Best Practice">
        Use <strong>TYPE-YEAR-SEQ</strong> tags for consistent tracking. Upload GeoJSON to unlock
        map-based city reporting.
      </PanelInsight>

    </aside>
  );
}
