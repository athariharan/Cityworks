import { STATUS_CFG, PRIORITY_CFG, fmt } from "../../../utility/CrewTasksConfig";

export default function CrewTaskDetailPanel({ wo, onClose, onLog }) {
  const statusConfig   = STATUS_CFG[wo.status]     || STATUS_CFG.NOT_STARTED;
  const priorityConfig = PRIORITY_CFG[wo.priority] || { label: wo.priority, bg: "#f1f5f9", color: "#64748b", bar: "#94a3b8" };

  return (
    <div className="mtask-overlay" onClick={event => event.target === event.currentTarget && onClose()}>
      <div className="mtask-panel">

        <div className="mtask-panel-header" style={{ borderBottom: `3px solid ${priorityConfig.bar}` }}>
          <div>
            <h2 className="mtask-panel-title">Work Order #{wo.workOrderId}</h2>
            <p className="mtask-panel-sub">Request #{wo.requestId || "—"}</p>
          </div>
          <button className="mtask-panel-close" onClick={onClose}>✕</button>
        </div>

        <div className="mtask-panel-body">

          <div className="mtask-panel-pills">
            <span className="mtask-status-badge" style={{ background: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.border}` }}>
              {statusConfig.icon} {statusConfig.label}
            </span>
            <span className="mtask-badge" style={{ background: priorityConfig.bg, color: priorityConfig.color }}>
              {priorityConfig.label} Priority
            </span>
          </div>

          <div className="mtask-panel-section">
            <p className="mtask-panel-lbl">Description</p>
            <p className="mtask-panel-text">{wo.description || "—"}</p>
          </div>

          <div className="mtask-panel-grid">
            {[
              { lbl: "Scheduled Start", val: fmt(wo.scheduledStart) },
              { lbl: "Scheduled End",   val: fmt(wo.scheduledEnd) },
              { lbl: "Asset ID",        val: wo.assetId ? `#${wo.assetId}` : "—" },
              { lbl: "Crew Members",    val: wo.assignedFieldWorkerIds?.length ? `${wo.assignedFieldWorkerIds.length} assigned` : "—" },
            ].map(field => (
              <div key={field.lbl} className="mtask-panel-field">
                <span className="mtask-panel-lbl">{field.lbl}</span>
                <span className="mtask-panel-val">{field.val}</span>
              </div>
            ))}
          </div>

          {wo.status !== "CANCELLED" && wo.status !== "COMPLETED" && (
            <button className="mtask-panel-log-btn" onClick={() => onLog(wo)}>
              📷 Upload Evidence / Log Work
            </button>
          )}
          {wo.status === "COMPLETED" && (
            <div className="mtask-panel-done">✅ This work order has been completed.</div>
          )}
        </div>
      </div>
    </div>
  );
}
