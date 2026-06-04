import { StatusBadge, UsageBadge, formatDateTime, formatRupees }   from "../../../utility/WorkLogHelpers";
import { buildWorklogPhotoUrl } from "../../../services/FileService";

export default function WorkLogDetailPanel({ log, usageRecords, onClose, onAddUsage }) {
  const hasUsage   = usageRecords.length > 0;
  const totalSpend = usageRecords.reduce((accumulator, record) => accumulator + (Number(record.totalCost) || 0), 0);

  return (
    <div className="wlv-overlay" onClick={event => event.target === event.currentTarget && onClose()}>
      <div className="wlv-panel">

        {/* Header */}
        <div className="wlv-panel-header">
          <div>
            <p className="wlv-panel-title">Work Log #{log.logId}</p>
            <p className="wlv-panel-sub">Work Order #{log.workOrderId ?? "—"}</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <StatusBadge value={log.status} />
            <button className="wlv-panel-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="wlv-panel-body">

          <div className="wlv-panel-grid">
            <div className="wlv-panel-field">
              <span className="wlv-panel-lbl">Log ID</span>
              <span className="wlv-panel-val">#{log.logId}</span>
            </div>
            <div className="wlv-panel-field">
              <span className="wlv-panel-lbl">Work Order</span>
              <span className="wlv-panel-val">#{log.workOrderId ?? "—"}</span>
            </div>
            <div className="wlv-panel-field">
              <span className="wlv-panel-lbl">Performed By</span>
              <span className="wlv-panel-val">Staff #{log.performedBy ?? "—"}</span>
            </div>
            <div className="wlv-panel-field">
              <span className="wlv-panel-lbl">Status</span>
              <span className="wlv-panel-val"><StatusBadge value={log.status} /></span>
            </div>
            <div className="wlv-panel-field">
              <span className="wlv-panel-lbl">Started At</span>
              <span className="wlv-panel-val">{formatDateTime(log.startAt)}</span>
            </div>
            <div className="wlv-panel-field">
              <span className="wlv-panel-lbl">Ended At</span>
              <span className="wlv-panel-val">{formatDateTime(log.endAt)}</span>
            </div>
            <div className="wlv-panel-field">
              <span className="wlv-panel-lbl">Captured At</span>
              <span className="wlv-panel-val">{formatDateTime(log.capturedAt)}</span>
            </div>
            <div className="wlv-panel-field">
              <span className="wlv-panel-lbl">Photo Evidence</span>
              <span className="wlv-panel-val">{log.photoUri ? "📷 Available" : "—"}</span>
            </div>
          </div>

          {/* Material Usage Section */}
          <div className="wlv-panel-usage-section">
            <div className="wlv-panel-usage-header">
              <div>
                <p className="wlv-panel-lbl">Material Usage</p>
                <p className="wlv-panel-usage-status">
                  {hasUsage
                    ? <><span style={{ color: "#10b981", fontWeight: 700 }}>✓ {usageRecords.length} record{usageRecords.length > 1 ? "s" : ""}</span> — Total: <strong style={{ color: "#0d9488" }}>{formatRupees(totalSpend)}</strong></>
                    : <span style={{ color: "#f59e0b", fontWeight: 600 }}>⚠ No material usage recorded yet</span>
                  }
                </p>
              </div>
              <button className="wlv-panel-add-usage" onClick={() => onAddUsage(log)}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Usage
              </button>
            </div>

            {hasUsage && (
              <div className="wlv-panel-usage-list">
                {usageRecords.map(record => (
                  <div key={record.usageId} className="wlv-panel-usage-row">
                    <div className="wlv-panel-usage-left">
                      <span className="wlv-panel-usage-id">#{record.usageId}</span>
                      <div>
                        <div className="wlv-panel-usage-meta">{record.materialName || "—"} · Qty {record.quantity}</div>
                      </div>
                    </div>
                    <div className="wlv-panel-usage-cost">{formatRupees(record.totalCost)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Photo */}
          {log.photoUri && (
            <div className="wlv-panel-photo-section">
              <p className="wlv-panel-lbl" style={{ marginBottom: 10 }}>Photo Evidence</p>
              <div className="wlv-photo-wrap">
                <img
                  src={buildWorklogPhotoUrl(log.photoUri)}
                  alt="Work log evidence"
                  className="wlv-photo"
                  onError={event => { event.target.style.display = "none"; }}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
