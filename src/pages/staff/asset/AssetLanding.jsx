// pages/staff/asset/AssetLanding.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { assetService }        from "../../../services/Assetservice";
import { inspectionService }  from "../../../services/Inspectionservice";
import { maintenanceService } from "../../../services/MaintenanceService";
import "../../../styles/AssetLanding.css";
import StaffLayout from "../../../components/staff/StaffLayout";

const TIPS = [
  "Tag assets consistently — use format TYPE-YEAR-SEQ (e.g. RD-2024-001) for easy filtering.",
  "Schedule inspections before monsoon season to catch drainage and road condition issues early.",
  "Critical condition assets should be re-inspected within 7 days of the initial finding.",
  "Upload GeoJSON coordinates for every asset to enable map-based reporting.",
  "Maintenance tasks marked Overdue automatically escalate to the Operations Manager.",
  "Use photo evidence on every inspection — it protects against audit disputes.",
];

const ACTIVITY_ICONS = {
  asset:       { bg: "#dbeafe", color: "#1e40af", symbol: "🏗" },
  inspection:  { bg: "#dbeafe", color: "#1a4971", symbol: "🔍" },
  maintenance: { bg: "#fee2e2", color: "#7c2d12", symbol: "🛠" },
};

function unwrap(res) {
  // res is an Axios response: res.data is the parsed body
  // body may be the array itself, or ApiResponse { data: [...] }
  const raw = res?.data ?? res;
  if (Array.isArray(raw))              return raw;
  if (Array.isArray(raw?.data))        return raw.data;
  if (Array.isArray(raw?.data?.data))  return raw.data.data;
  return [];
}

export default function AssetLanding() {
  const navigate = useNavigate();
  const [assets,      setAssets]      = useState([]);
  const [inspections, setInspections] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  useEffect(() => {
    Promise.allSettled([
      assetService.getAll(),
      inspectionService.getAll(),
      maintenanceService.getAll(),
    ]).then(([aRes, iRes, mRes]) => {
      if (aRes.status === "fulfilled") setAssets(unwrap(aRes.value));
      if (iRes.status === "fulfilled") setInspections(unwrap(iRes.value));
      if (mRes.status === "fulfilled") setMaintenance(unwrap(mRes.value));
    });
  }, []);

  const toMs = (v) => v ? new Date(v).getTime() : 0;

  const recentActivity = [
    ...assets.map((a)      => ({ type:"asset",       label:`Asset registered: ${a.assetTag || "—"}`,        sub: (a.type || a.assetType || "").replace(/_/g," "), time: toMs(a.createdAt) })),
    ...inspections.map((i) => ({ type:"inspection",  label:`Inspection logged: Asset #${i.assetId || "—"}`, sub: i.conditionRating, time: toMs(i.performedAt) })),
    ...maintenance.map((m) => ({ type:"maintenance", label:`Task scheduled: Asset #${m.assetId || "—"}`,    sub: (m.status || "").replace(/_/g," "), time: toMs(m.scheduledAt) })),
  ]
    .sort((a, b) => b.time - a.time)
    .slice(0, 6);

  const overdue = maintenance.filter(m => m.status === "Overdue" || m.status === "OVERDUE").length;

  const MODULES = [
    {
      key: "registry",
      path: "/staff/assets/registry",
      icon: (
        <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M9 9h6M9 12h6M9 15h4"/>
        </svg>
      ),
      title: "Asset Registry",
      subtitle: "Register & manage assets",
      description: "Add new municipal assets, update statuses, attach documents, and maintain the complete inventory with geolocation data.",
      count: assets.length,
      countLabel: "Registered",
      color: "#1e40af", light: "#dbeafe", accent: "#3b82f6",
      gradient: "linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)",
      primaryBtn: { label: "+ Add Asset", action: () => navigate("/staff/assets/registry") },
      otherBtns: [
        { label: "View All", action: () => navigate("/staff/assets/registry/list") },
      ],
    },
    {
      key: "inspection",
      path: "/staff/assets/inspections",
      icon: (
        <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
      title: "Inspection Records",
      subtitle: "Track asset conditions",
      description: "Record inspection findings, condition ratings, and upload photo evidence. Monitor asset health across the entire infrastructure.",
      count: inspections.length,
      countLabel: "Logged",
      color: "#1a4971", light: "#dbeafe", accent: "#3b82f6",
      gradient: "linear-gradient(135deg, #1a4971 0%, #1d6096 100%)",
      primaryBtn: { label: "+ New Inspection", action: () => navigate("/staff/assets/inspections") },
      otherBtns: [
        { label: "View Records", action: () => navigate("/staff/assets/inspections/list") },
      ],
    },
    {
      key: "maintenance",
      path: "/staff/assets/maintenance",
      icon: (
        <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8"  y1="2" x2="8"  y2="6"/>
          <line x1="3"  y1="10" x2="21" y2="10"/>
        </svg>
      ),
      title: "Maintenance Tasks",
      subtitle: "Schedule & track work",
      description: "Plan preventive maintenance, schedule tasks, set due dates, and track completion status for all municipal infrastructure assets.",
      count: maintenance.length,
      countLabel: "Scheduled",
      color: "#7c2d12", light: "#fee2e2", accent: "#ef4444",
      gradient: "linear-gradient(135deg, #7c2d12 0%, #b45309 100%)",
      primaryBtn: { label: "+ Schedule Task", action: () => navigate("/staff/assets/maintenance") },
      otherBtns: [
        { label: "View Calendar", action: () => navigate("/staff/assets/maintenance/list") },
      ],
    },
  ];

  return (
    <StaffLayout>
      <div className="al-root">

        {/* Header */}
        <div className="al-header">
          <div>
            <div className="al-breadcrumb">
              <span>Staff</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <span className="al-breadcrumb-active">Assets</span>
            </div>
            <h1 className="al-title">Asset Management</h1>
            <p className="al-subtitle">Manage municipal infrastructure assets, inspections, and maintenance schedules</p>
          </div>
          <div className="al-header-right">
            <div className="al-header-badge">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <path d="M9 9h6M9 12h6M9 15h4"/>
              </svg>
              Asset Manager Panel
            </div>
            <div className="al-total-pill">
              <span className="al-total-num">{assets.length + inspections.length + maintenance.length}</span>
              <span className="al-total-label">total records</span>
            </div>
          </div>
        </div>

        {/* Module Cards */}
        <div className="al-cards-grid">
          {MODULES.map((mod, i) => (
            <div key={mod.key} className="al-module-card"
              style={{ animationDelay:`${i * 0.08}s` }}
              onClick={() => navigate(mod.path)}>

              <div className="al-card-band" style={{ background: mod.gradient }}>
                <div className="al-card-icon">{mod.icon}</div>
                <div className="al-card-band-text">
                  <div className="al-card-title">{mod.title}</div>
                  <div className="al-card-subtitle">{mod.subtitle}</div>
                </div>
                {mod.count > 0 && (
                  <div className="al-card-count-badge">
                    <span className="al-card-count-num">{mod.count}</span>
                    <span className="al-card-count-label">{mod.countLabel}</span>
                  </div>
                )}
                <div className="al-card-arrow">
                  <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>

              <div className="al-card-body">
                <p className="al-card-desc">{mod.description}</p>
                <div className="al-card-actions">
                  <button className="al-chip al-chip--primary"
                    style={{ background: mod.light, color: mod.color, borderColor: mod.accent }}
                    onClick={e => { e.stopPropagation(); mod.primaryBtn.action(); }}>
                    {mod.primaryBtn.label}
                  </button>
                  {mod.otherBtns.map(b => (
                    <button key={b.label} className="al-chip al-chip--ghost"
                      onClick={e => { e.stopPropagation(); b.action(); }}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="al-card-glow" style={{ background: mod.light }} />
            </div>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="al-bottom-row">

          {/* Recent Activity */}
          <div className="al-activity-card">
            <div className="al-widget-header">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              Recent Activity
            </div>
            {recentActivity.length === 0 ? (
              <div className="al-empty-state">
                <svg width="32" height="32" fill="none" stroke="#bfdbfe" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                <p>No activity yet. Start by adding an asset or logging an inspection.</p>
              </div>
            ) : (
              <div className="al-activity-list">
                {recentActivity.map((a, i) => {
                  const ic = ACTIVITY_ICONS[a.type];
                  return (
                    <div key={i} className="al-activity-item">
                      <div className="al-activity-icon" style={{ background: ic.bg, color: ic.color }}>
                        {ic.symbol}
                      </div>
                      <div className="al-activity-text">
                        <div className="al-activity-label">{a.label}</div>
                        <div className="al-activity-sub">{a.sub}</div>
                      </div>
                      <div className="al-activity-time">just now</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="al-right-col">

            {/* Pro Tip */}
            <div className="al-tip-card">
              <div className="al-widget-header">
                <svg width="15" height="15" fill="none" stroke="#1e40af" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Pro Tip
              </div>
              <p className="al-tip-text">"{tip}"</p>
            </div>

            {/* Quick Jump */}
            <div className="al-quick-nav">
              <div className="al-quick-nav-title">Quick Jump</div>
              <div className="al-quick-nav-links">
                {MODULES.map(mod => (
                  <button key={mod.key} className="al-quick-link"
                    style={{ "--accent": mod.accent }}
                    onClick={() => navigate(mod.path)}>
                    <span className="al-quick-dot" style={{ background: mod.accent }} />
                    {mod.title}
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </StaffLayout>
  );
}