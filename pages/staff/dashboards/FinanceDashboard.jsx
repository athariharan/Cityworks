import { useState, useEffect } from "react";
import MaterialUsageService from "../../../services/MaterialUsageService";
import WorkLogService       from "../../../services/WorkLogService";
import { FO_STAT_CONFIG, FO_ACTIONS } from "../../../utility/StaffHomeConfig";

export default function FinanceOfficerView({ navigate }) {
  const [records,  setRecords]  = useState([]);
  const [worklogs, setWorklogs] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      MaterialUsageService.getAll(),
      WorkLogService.getAll(),
    ]).then(([materialResponse, workLogResponse]) => {
      setRecords(materialResponse.status  === "fulfilled" ? (materialResponse.value.data?.data  ?? []) : []);
      setWorklogs(workLogResponse.status  === "fulfilled" ? (workLogResponse.value.data?.data   ?? []) : []);
      setIsLoaded(true);
    });
  }, []);

  const formatRupees = (n) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const totalSpend   = records.reduce((accumulator, record) => accumulator + (Number(record.totalCost) || 0), 0);
  const avgCost      = records.length > 0 ? totalSpend / records.length : 0;
  const wlCompleted  = worklogs.filter(workLog => workLog.status === "COMPLETED").length;
  const recent5      = [...records].slice(-5).reverse();

  const foStatsValues = {
    recordCount: isLoaded ? records.length        : "…",
    totalSpend:  isLoaded ? formatRupees(totalSpend) : "…",
    avgCost:     isLoaded ? formatRupees(avgCost)    : "…",
    wlCompleted: isLoaded ? wlCompleted           : "…",
  };
  const foStats = FO_STAT_CONFIG.map(statConfig => ({ ...statConfig, value: foStatsValues[statConfig.statKey] }));

  return (
    <>
      {/* Hero Banner */}
      <div className="sh-fo-hero">
        <div className="sh-fo-hero-blob sh-fo-hero-blob--1" />
        <div className="sh-fo-hero-blob sh-fo-hero-blob--2" />
        <div className="sh-fo-hero-inner">
          <div>
            <div className="sh-fo-hero-eyebrow">Finance Officer · Overview</div>
            <div className="sh-fo-hero-headline">Financial Overview</div>
            <div className="sh-fo-hero-desc">Track material costs, work log expenditure and operational spending</div>
          </div>
          <button className="sh-fo-hero-cta" onClick={() => navigate("/staff/materials")}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Material Record
          </button>
        </div>
        <div className="sh-fo-hero-spend">
          <div className="sh-fo-hero-spend-lbl">Total Spend</div>
          <div className="sh-fo-hero-spend-val">{isLoaded ? formatRupees(totalSpend) : "…"}</div>
          <div className="sh-fo-hero-spend-sub">
            {isLoaded ? `across ${records.length} record${records.length !== 1 ? "s" : ""}` : "loading…"}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="sh-om-stats">
        {foStats.map(financeStat => (
          <div key={financeStat.label} className="sh-om-card" style={{ borderColor: financeStat.border }}>
            <div className="sh-om-icon" style={{ background: financeStat.bg, color: financeStat.color }}>{financeStat.icon}</div>
            <div>
              <div className="sh-om-value" style={{ color: financeStat.color }}>{financeStat.value}</div>
              <div className="sh-om-label">{financeStat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row: actions + recent records */}
      <div className="sh-fo-bottom">

        <div className="sh-section sh-fo-actions-card">
          <h2 className="sh-section-title">Quick Actions</h2>
          <div className="sh-om-actions">
            {FO_ACTIONS.map(action => (
              <button
                key={action.label}
                className="sh-om-action-btn"
                style={{ "--ac": action.color, "--abg": action.bg }}
                onClick={() => navigate(action.path)}
              >
                <span className="sh-om-action-icon" style={{ background: action.bg, color: action.color }}>{action.icon}</span>
                <span className="sh-om-action-label">{action.label}</span>
                <svg width="14" height="14" fill="none" stroke={action.color} strokeWidth="2" viewBox="0 0 24 24" style={{ marginLeft: "auto", opacity: 0.7 }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="sh-section sh-fo-recent-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 className="sh-section-title" style={{ margin: 0 }}>Recent Material Usage</h2>
            <button className="sh-fo-see-all" onClick={() => navigate("/staff/materials")}>See all →</button>
          </div>
          {!isLoaded ? (
            <div className="sh-fo-loading">Loading…</div>
          ) : recent5.length === 0 ? (
            <div className="sh-fo-empty">
              No records yet.{" "}
              <span onClick={() => navigate("/staff/materials")} style={{ color: "#4f46e5", cursor: "pointer" }}>
                Create one →
              </span>
            </div>
          ) : (
            <div className="sh-fo-recent-list">
              {recent5.map(record => (
                <div key={record.usageId} className="sh-fo-recent-row">
                  <div className="sh-fo-recent-left">
                    <span className="sh-fo-recent-id">#{record.usageId}</span>
                    <div>
                      <div className="sh-fo-recent-meta">Log #{record.logId} · WO #{record.workOrderId}</div>
                      <div className="sh-fo-recent-sub">Asset #{record.assetId} · Qty {record.quantity}</div>
                    </div>
                  </div>
                  <div className="sh-fo-recent-cost">{record.totalCost ? formatRupees(record.totalCost) : "—"}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
