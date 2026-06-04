import { useState, useEffect } from "react";
import WorkOrderService from "../../../services/WorkOrderService";
import WorkLogService   from "../../../services/WorkLogService";
import { OM_STAT_CONFIG, OM_ACTIONS } from "../../../utility/StaffHomeConfig";

export default function OperationsManagerView({ navigate }) {
  const [stats, setStats] = useState({
    totalOrders:    "…",
    activeOrders:   "…",
    completionRate: "…",
    totalLogs:      "…",
  });

  useEffect(() => {
    Promise.allSettled([
      WorkOrderService.getAll(),
      WorkLogService.getAll(),
    ]).then(([workOrderResponse, workLogResponse]) => {
      const orders    = workOrderResponse.status === "fulfilled" ? (workOrderResponse.value.data?.data ?? []) : [];
      const logs      = workLogResponse.status   === "fulfilled" ? (workLogResponse.value.data?.data   ?? []) : [];
      const total     = orders.length;
      const active    = orders.filter(order => order.status === "NOT_STARTED" || order.status === "IN_PROGRESS").length;
      const completed = orders.filter(order => order.status === "COMPLETED").length;
      const rate      = total > 0 ? Math.round((completed / total) * 100) + "%" : "0%";
      setStats({ totalOrders: total, activeOrders: active, completionRate: rate, totalLogs: logs.length });
    });
  }, []);

  const omStats = OM_STAT_CONFIG.map(statConfig => ({
    ...statConfig,
    value: stats[statConfig.statKey],
  }));

  return (
    <>
      <div className="sh-om-stats">
        {omStats.map(operationsStat => (
          <div key={operationsStat.label} className="sh-om-card" style={{ borderColor: operationsStat.border }}>
            <div className="sh-om-icon" style={{ background: operationsStat.bg, color: operationsStat.color }}>{operationsStat.icon}</div>
            <div>
              <div className="sh-om-value" style={{ color: operationsStat.color }}>{operationsStat.value}</div>
              <div className="sh-om-label">{operationsStat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sh-section">
        <h2 className="sh-section-title">Quick Actions</h2>
        <div className="sh-om-actions">
          {OM_ACTIONS.map(action => (
            <button
              key={action.label}
              className="sh-om-action-btn"
              style={{ "--ac": action.color, "--abg": action.bg }}
              onClick={() => navigate(action.path)}
            >
              <span className="sh-om-action-icon" style={{ background: action.bg, color: action.color }}>
                {action.icon}
              </span>
              <span className="sh-om-action-label">{action.label}</span>
              <svg width="14" height="14" fill="none" stroke={action.color} strokeWidth="2" viewBox="0 0 24 24" style={{ marginLeft: "auto", opacity: 0.7 }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
