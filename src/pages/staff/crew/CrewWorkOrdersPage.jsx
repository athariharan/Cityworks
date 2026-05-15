// pages/staff/crew/CrewWorkOrdersPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout      from "../../../components/staff/StaffLayout";
import WorkOrderService from "../../../services/WorkOrderService";
import "../../../styles/WorkOrdersPage.css";

const STATUS_CFG = {
  NOT_STARTED: { label: "Not Started", bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  IN_PROGRESS:  { label: "In Progress", bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  COMPLETED:    { label: "Completed",   bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
  CANCELLED:    { label: "Cancelled",   bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
};
const PRIORITY_CFG = {
  LOW:      { label: "Low",      bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  MEDIUM:   { label: "Medium",   bg: "#fefce8", color: "#a16207", dot: "#eab308" },
  HIGH:     { label: "High",     bg: "#fff7ed", color: "#c2410c", dot: "#f97316" },
  CRITICAL: { label: "Critical", bg: "#fef2f2", color: "#991b1b", dot: "#ef4444" },
};

function Badge({ cfg, value }) {
  const c = cfg[value] || { label: value || "—", bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" };
  return (
    <span className="wop-badge" style={{ "--bg": c.bg, "--color": c.color, "--dot": c.dot }}>
      <span className="wop-badge-dot" />
      {c.label}
    </span>
  );
}
function fmt(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function DetailPanel({ wo, onClose, onEvidence }) {
  return (
    <div className="wop-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
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
              <span className="wop-panel-lbl">Scheduled Start</span>
              <span className="wop-panel-val">{fmt(wo.scheduledStart)}</span>
            </div>
            <div className="wop-panel-field">
              <span className="wop-panel-lbl">Scheduled End</span>
              <span className="wop-panel-val">{fmt(wo.scheduledEnd)}</span>
            </div>
            <div className="wop-panel-field">
              <span className="wop-panel-lbl">Asset ID</span>
              <span className="wop-panel-val">{wo.assetId || "—"}</span>
            </div>
            <div className="wop-panel-field">
              <span className="wop-panel-lbl">Assigned Workers</span>
              <span className="wop-panel-val">
                {wo.assignedFieldWorkerIds?.length ? wo.assignedFieldWorkerIds.join(", ") : "None"}
              </span>
            </div>
          </div>
          {wo.status === "COMPLETED" && (
            <div className="wop-panel-status-section">
              <button onClick={() => onEvidence(wo)} style={{
                width: "100%", padding: "10px 0", borderRadius: 8,
                border: "none", background: "#1e40af", color: "#fff",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}>
                📷 Upload Evidence / Work Log
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CrewWorkOrdersPage() {
  const navigate    = useNavigate();
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const [search,    setSearch]    = useState("");
  const [filterSt,  setFilterSt]  = useState("ALL");
  const [selected,  setSelected]  = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(() => {
    setLoading(true);
    WorkOrderService.getAll()
      .then(res => setOrders(res.data?.data ?? []))
      .catch(() => showToast("Failed to load work orders.", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts = {
    ALL:         orders.length,
    NOT_STARTED: orders.filter(o => o.status === "NOT_STARTED").length,
    IN_PROGRESS:  orders.filter(o => o.status === "IN_PROGRESS").length,
    COMPLETED:   orders.filter(o => o.status === "COMPLETED").length,
    CANCELLED:   orders.filter(o => o.status === "CANCELLED").length,
  };

  const FILTERS = [
    { key: "ALL",         label: "All" },
    { key: "NOT_STARTED", label: "Not Started" },
    { key: "IN_PROGRESS",  label: "In Progress" },
    { key: "COMPLETED",   label: "Completed" },
    { key: "CANCELLED",   label: "Cancelled" },
  ];

  const visible = orders.filter(wo => {
    const matchSt = filterSt === "ALL" || wo.status === filterSt;
    const q = search.trim().toLowerCase();
    const matchQ = !q ||
      String(wo.workOrderId).includes(q) ||
      (wo.description || "").toLowerCase().includes(q) ||
      (wo.priority    || "").toLowerCase().includes(q);
    return matchSt && matchQ;
  });

  return (
    <StaffLayout>
      <div className="wop-root">
        {toast && <div className={`wop-toast wop-toast--${toast.type}`}>{toast.msg}</div>}

        <div className="wop-search-wrap">
          <svg className="wop-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input className="wop-search-input" type="text"
            placeholder="Search by Work Order ID, description or priority…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="wop-search-clear" onClick={() => setSearch("")}>✕</button>}
        </div>

        <div className="wop-filters">
          {FILTERS.map(f => (
            <button key={f.key}
              className={`wop-filter-btn ${filterSt === f.key ? "active" : ""}`}
              onClick={() => setFilterSt(f.key)}>
              {f.label}
              {counts[f.key] > 0 && <span className="wop-filter-count">{counts[f.key]}</span>}
            </button>
          ))}
        </div>

        <div className="wop-card">
          {loading ? (
            <div className="wop-empty"><div className="wop-spinner" /><p>Loading work orders…</p></div>
          ) : visible.length === 0 ? (
            <div className="wop-empty">
              <div className="wop-empty-icon">🔧</div>
              <p className="wop-empty-msg">
                {search || filterSt !== "ALL" ? "No work orders match your filter." : "No work orders found."}
              </p>
            </div>
          ) : (
            <div className="wop-table-wrap">
              <table className="wop-table">
                <thead>
                  <tr>
                    <th>IDs</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Scheduled Start</th>
                    <th>Due Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(wo => (
                    <tr key={wo.workOrderId} className="wop-row">
                      <td className="wop-td-ids">
                        <span className="wop-wo-id">WO #{wo.workOrderId}</span>
                        <span className="wop-req-id">Req #{wo.requestId || "—"}</span>
                      </td>
                      <td className="wop-td-desc">
                        <span className="wop-desc-text" title={wo.description}>
                          {wo.description ? (wo.description.length > 55 ? wo.description.slice(0, 55) + "…" : wo.description) : "—"}
                        </span>
                      </td>
                      <td className="wop-td-badge"><Badge cfg={PRIORITY_CFG} value={wo.priority} /></td>
                      <td className="wop-td-badge"><Badge cfg={STATUS_CFG}   value={wo.status} /></td>
                      <td className="wop-td-date">{fmt(wo.scheduledStart)}</td>
                      <td className="wop-td-date">{fmt(wo.scheduledEnd)}</td>
                      <td className="wop-td-action" style={{ display: "flex", gap: 6 }}>
                        <button className="wop-btn-view" onClick={() => setSelected(wo)}>View</button>
                        {wo.status === "COMPLETED" && (
                          <button
                            onClick={() => navigate("/staff/crew/evidence", { state: { workOrderId: wo.workOrderId } })}
                            style={{
                              padding: "5px 10px", borderRadius: 6,
                              border: "1.5px solid #a7f3d0", background: "#ecfdf5",
                              color: "#065f46", fontSize: 12, fontWeight: 600, cursor: "pointer",
                            }}>
                            📷 Log
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <DetailPanel
          wo={selected}
          onClose={() => setSelected(null)}
          onEvidence={wo => { setSelected(null); navigate("/staff/crew/evidence", { state: { workOrderId: wo.workOrderId } }); }}
        />
      )}
    </StaffLayout>
  );
}
