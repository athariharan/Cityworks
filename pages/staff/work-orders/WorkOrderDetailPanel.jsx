// pages/staff/work-orders/WorkOrderDetailPanel.jsx
// Slide-over panel with full work order details and inline status controls.
// Used by Dispatcher / Admin; pass readOnly={true} to hide the status buttons.
import { STATUS_CFG, PRIORITY_CFG } from "../../../utility/WorkOrderConfig";
import { Badge, fmt } from "./WorkOrderHelpers";

export default function WorkOrderDetailPanel({ wo, onClose, onStatusChange, updatingId, readOnly }) {
  return (
    <div className="wop-overlay" onClick={event => event.target === event.currentTarget && onClose()}>
      <div className="wop-panel">

        <div className="wop-panel-header">
          <div className="wop-panel-ids">
            <span className="wop-panel-wo">Work Order #{wo.workOrderId}</span>
            <span className="wop-panel-req">Request #{wo.requestId || "—"}</span>
          </div>
          <div className="wop-panel-badges">
            <Badge cfg={PRIORITY_CFG} value={wo.priority} />
            <Badge cfg={STATUS_CFG}   value={wo.status} />
            <button className="wop-panel-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="wop-panel-body">
          <div className="wop-panel-grid">
            <div className="wop-panel-field wop-panel-field--full">
              <span className="wop-panel-lbl">Description</span>
              <span className="wop-panel-val">{wo.description || "—"}</span>
            </div>
            <div className="wop-panel-field">
              <span className="wop-panel-lbl">Asset Tag</span>
              <span className="wop-panel-val">{wo.assetTag || "—"}</span>
            </div>
            <div className="wop-panel-field">
              <span className="wop-panel-lbl">Asset ID</span>
              <span className="wop-panel-val">{wo.assetId || "—"}</span>
            </div>
            <div className="wop-panel-field">
              <span className="wop-panel-lbl">Assigned Workers</span>
              <span className="wop-panel-val">
                {wo.assignedFieldWorkerIds?.length
                  ? wo.assignedFieldWorkerIds.join(", ")
                  : "None assigned"}
              </span>
            </div>
            <div className="wop-panel-field">
              <span className="wop-panel-lbl">Scheduled Start</span>
              <span className="wop-panel-val">{fmt(wo.scheduledStart)}</span>
            </div>
            <div className="wop-panel-field">
              <span className="wop-panel-lbl">Scheduled End</span>
              <span className="wop-panel-val">{fmt(wo.scheduledEnd)}</span>
            </div>
            <div className="wop-panel-field">
              <span className="wop-panel-lbl">Created At</span>
              <span className="wop-panel-val">{fmt(wo.createdAt)}</span>
            </div>
          </div>

          {!readOnly && (
            <div className="wop-panel-status-section">
              <p className="wop-panel-lbl" style={{ marginBottom: 12 }}>Update Status</p>
              <div className="wop-panel-status-btns">
                {Object.entries(STATUS_CFG).map(([key, c]) => (
                  <button
                    key={key}
                    className={`wop-panel-status-btn ${wo.status === key ? "active" : ""}`}
                    style={{ "--bg": c.bg, "--color": c.color }}
                    onClick={() => onStatusChange(wo.workOrderId, key)}
                    disabled={wo.status === key || updatingId === wo.workOrderId}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
