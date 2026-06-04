import { STATUS_CFG, PRIORITY_CFG, fmt } from "../../../utility/CrewTasksConfig";

export default function TaskCard({ wo, onView, onLog }) {
  const statusConfig   = STATUS_CFG[wo.status]     || STATUS_CFG.NOT_STARTED;
  const priorityConfig = PRIORITY_CFG[wo.priority] || { label: wo.priority, bg: "#f1f5f9", color: "#64748b", bar: "#94a3b8" };

  return (
    <div className="mtask-card" style={{ "--status-border": statusConfig.border, "--status-bg": statusConfig.bg }}>

      {/* Coloured bar on the left edge indicates priority level */}
      <div className="mtask-priority-bar" style={{ background: priorityConfig.bar }} />

      <div className="mtask-card-body">

        {/* Top row — IDs and status/priority badges */}
        <div className="mtask-card-top">
          <div className="mtask-ids">
            <span className="mtask-wo-id">WO #{wo.workOrderId}</span>
            {wo.requestId && <span className="mtask-req-id">Req #{wo.requestId}</span>}
          </div>
          <div className="mtask-badges">
            <span className="mtask-badge" style={{ background: priorityConfig.bg, color: priorityConfig.color }}>{priorityConfig.label}</span>
            <span className="mtask-status-badge" style={{ background: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.border}` }}>
              {statusConfig.icon} {statusConfig.label}
            </span>
          </div>
        </div>

        <p className="mtask-desc" title={wo.description}>
          {wo.description || "No description provided."}
        </p>

        {/* Scheduled dates and linked asset */}
        <div className="mtask-dates">
          <div className="mtask-date-item">
            <span className="mtask-date-lbl">📅 Start</span>
            <span className="mtask-date-val">{fmt(wo.scheduledStart)}</span>
          </div>
          <div className="mtask-date-divider" />
          <div className="mtask-date-item">
            <span className="mtask-date-lbl">🏁 Due</span>
            <span className="mtask-date-val">{fmt(wo.scheduledEnd)}</span>
          </div>
          {wo.assetId && (
            <>
              <div className="mtask-date-divider" />
              <div className="mtask-date-item">
                <span className="mtask-date-lbl">🏗️ Asset</span>
                <span className="mtask-date-val">#{wo.assetId}</span>
              </div>
            </>
          )}
        </div>

        <div className="mtask-actions">
          <button className="mtask-btn mtask-btn--view" onClick={() => onView(wo)}>View Details</button>
          {wo.status !== "CANCELLED" && wo.status !== "COMPLETED" && (
            <button className="mtask-btn mtask-btn--log" onClick={() => onLog(wo)}>📷 Log Work</button>
          )}
        </div>
      </div>
    </div>
  );
}
