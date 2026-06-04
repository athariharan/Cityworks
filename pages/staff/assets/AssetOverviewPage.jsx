// pages/staff/asset/AssetOverviewPage.jsx
import { useState, useEffect } from "react";
import { useNavigate }          from "react-router-dom";
import StaffLayout              from "../../../components/staff/StaffLayout";
import { assetService }         from "../../../services/AssetService";
import { inspectionService }    from "../../../services/InspectionService";
import { maintenanceService }   from "../../../services/MaintenanceService";
import "../../../styles/AssetLanding.css";
import { TIPS, ACTIVITY_ICONS } from "../../../utility/AssetConfig";
import { unwrap }               from "./AssetHelpers";
import { buildModules }         from "./AssetOverviewModules";

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
    ]).then(([assetResult, inspResult, maintResult]) => {
      if (assetResult.status === "fulfilled") setAssets(unwrap(assetResult.value));
      if (inspResult.status  === "fulfilled") setInspections(unwrap(inspResult.value));
      if (maintResult.status === "fulfilled") setMaintenance(unwrap(maintResult.value));
    });
  }, []);

  // ── Derived data ──────────────────────────────────────────────
  const toMs = (dateString) => dateString ? new Date(dateString).getTime() : 0;

  const recentActivity = [
    ...assets.map(asset => ({
      type:  "asset",
      label: `Asset registered: ${asset.assetTag || "—"}`,
      sub:   (asset.type || asset.assetType || "").replace(/_/g, " "),
      time:  toMs(asset.createdAt),
    })),
    ...inspections.map(inspection => ({
      type:  "inspection",
      label: `Inspection logged: Asset #${inspection.assetId || "—"}`,
      sub:   inspection.conditionRating,
      time:  toMs(inspection.performedAt),
    })),
    ...maintenance.map(maintenanceItem => ({
      type:  "maintenance",
      label: `Task scheduled: Asset #${maintenanceItem.assetId || "—"}`,
      sub:   (maintenanceItem.status || "").replace(/_/g, " "),
      time:  toMs(maintenanceItem.scheduledAt),
    })),
  ]
    .sort((itemA, itemB) => itemB.time - itemA.time)
    .slice(0, 6);

  const overdueCount = maintenance.filter(
    maintenanceItem => maintenanceItem.status === "Overdue" || maintenanceItem.status === "OVERDUE"
  ).length;

  const MODULES = buildModules({
    assetCount:  assets.length,
    inspCount:   inspections.length,
    maintCount:  maintenance.length,
    navigate,
  });

  return (
    <StaffLayout>
      <div className="al-root">

        {/* ── Header ── */}
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
            <p className="al-subtitle">
              Manage municipal infrastructure assets, inspections, and maintenance schedules
            </p>
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
              <span className="al-total-num">
                {assets.length + inspections.length + maintenance.length}
              </span>
              <span className="al-total-label">total records</span>
            </div>
          </div>
        </div>

        {/* ── Overdue alert ── */}
        {overdueCount > 0 && (
          <div className="al-summary-bar">
            <span
              className="al-summary-item al-summary-warn"
              onClick={() => navigate("/staff/assets/maintenance/list?filter=Overdue")}
            >
              <span className="al-summary-dot" style={{ background: "#dc2626" }}/>
              <span className="al-summary-label">Overdue tasks:</span>
              <span className="al-summary-value" style={{ color: "#dc2626" }}>{overdueCount}</span>
            </span>
          </div>
        )}

        {/* ── Module Cards ── */}
        <div className="al-cards-grid">
          {MODULES.map((module, index) => (
            <div
              key={module.key}
              className="al-module-card"
              style={{ animationDelay: `${index * 0.08}s` }}
              onClick={() => navigate(module.path)}
            >
              <div className="al-card-band" style={{ background: module.gradient }}>
                <div className="al-card-icon">{module.icon}</div>
                <div className="al-card-band-text">
                  <div className="al-card-title">{module.title}</div>
                  <div className="al-card-subtitle">{module.subtitle}</div>
                </div>
                {module.count > 0 && (
                  <div className="al-card-count-badge">
                    <span className="al-card-count-num">{module.count}</span>
                    <span className="al-card-count-label">{module.countLabel}</span>
                  </div>
                )}
                <div className="al-card-arrow">
                  <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>

              <div className="al-card-body">
                <p className="al-card-desc">{module.description}</p>
                <div className="al-card-actions">
                  <button
                    className="al-chip al-chip--primary"
                    style={{ background: module.light, color: module.color, borderColor: module.accent }}
                    onClick={event => { event.stopPropagation(); module.primaryBtn.action(); }}
                  >
                    {module.primaryBtn.label}
                  </button>
                  {module.otherBtns.map(btn => (
                    <button
                      key={btn.label}
                      className="al-chip al-chip--ghost"
                      onClick={event => { event.stopPropagation(); btn.action(); }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="al-card-glow" style={{ background: module.light }}/>
            </div>
          ))}
        </div>

        {/* ── Bottom Row ── */}
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
                {recentActivity.map((activityItem, index) => {
                  const activityIcon = ACTIVITY_ICONS[activityItem.type];
                  return (
                    <div key={index} className="al-activity-item">
                      <div className="al-activity-icon" style={{ background: activityIcon.bg, color: activityIcon.color }}>
                        {activityIcon.symbol}
                      </div>
                      <div className="al-activity-text">
                        <div className="al-activity-label">{activityItem.label}</div>
                        <div className="al-activity-sub">{activityItem.sub}</div>
                      </div>
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
                  <line x1="12" y1="8"  x2="12" y2="12"/>
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
                {MODULES.map(module => (
                  <button
                    key={module.key}
                    className="al-quick-link"
                    style={{ "--accent": module.accent }}
                    onClick={() => navigate(module.path)}
                  >
                    <span className="al-quick-dot" style={{ background: module.accent }}/>
                    {module.title}
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
