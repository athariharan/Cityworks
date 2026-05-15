import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import StaffLayout from "../../../components/staff/StaffLayout";
import DispatcherService from "../../../services/DispatcherService";
import "../../../styles/WorkOrdersPage.css";

// ── Config ──────────────────────────────────────────────────────
const STATUS_CFG = {
  NOT_STARTED: { label: "Not Started", bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  IN_PROGRESS: { label: "In Progress", bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  COMPLETED:   { label: "Completed",   bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
  CANCELLED:   { label: "Cancelled",   bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
};

const PRIORITY_CFG = {
  LOW:      { label: "Low",      bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  MEDIUM:   { label: "Medium",   bg: "#fefce8", color: "#a16207", dot: "#eab308" },
  HIGH:     { label: "High",     bg: "#fff7ed", color: "#c2410c", dot: "#f97316" },
  CRITICAL: { label: "Critical", bg: "#fef2f2", color: "#991b1b", dot: "#ef4444" },
};

// ── Helpers ─────────────────────────────────────────────────────
function Badge({ cfg, value }) {
  const c = cfg[value] || { label: value, bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" };
  return (
    <span className="wop-badge" style={{ "--bg": c.bg, "--color": c.color, "--dot": c.dot }}>
      <span className="wop-badge-dot" />
      {c.label}
    </span>
  );
}

function fmt(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtShort(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ── Detail Panel ─────────────────────────────────────────────────
function DetailPanel({ wo, onClose, onStatusChange, updatingId, readOnly }) {
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

// ── Main Page ────────────────────────────────────────────────────
export default function WorkOrdersPage() {
  const { role } = useSelector(state => state.auth);
  const isReadOnly = role === "CREW";

  const [allOrders, setAllOrders]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(null);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilter]   = useState("ALL");
  const [selected, setSelected]     = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await DispatcherService.getAllWorkOrders();
      setAllOrders(res.data?.data || []);
    } catch {
      showToast("Failed to load work orders.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = allOrders.filter(wo => {
    const matchStatus = filterStatus === "ALL" || wo.status === filterStatus;
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      String(wo.workOrderId).includes(q) ||
      String(wo.requestId || "").includes(q) ||
      (wo.description || "").toLowerCase().includes(q) ||
      (wo.priority    || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = allOrders.reduce((acc, wo) => {
    acc[wo.status] = (acc[wo.status] || 0) + 1;
    return acc;
  }, {});

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await DispatcherService.updateWorkOrder(id, { status });
      setAllOrders(prev => prev.map(wo => wo.workOrderId === id ? { ...wo, status } : wo));
      setSelected(prev => prev?.workOrderId === id ? { ...prev, status } : prev);
      showToast("Status updated successfully.");
    } catch {
      showToast("Failed to update status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const FILTERS = [
    { key: "ALL",         label: "All" },
    { key: "NOT_STARTED", label: "Not Started" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "COMPLETED",   label: "Completed" },
    { key: "CANCELLED",   label: "Cancelled" },
  ];

  return (
    <StaffLayout>
      <div className="wop-root">

        {/* ── Header ── */}
        <div className="wop-header">
          <div>
            <h1 className="wop-title">Work Orders</h1>
            <p className="wop-subtitle">View and manage all work orders</p>
          </div>
          <button className="wop-btn-refresh" onClick={load} disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
            </svg>
            Refresh
          </button>
        </div>

        {toast && <div className={`wop-toast wop-toast--${toast.type}`}>{toast.msg}</div>}

        {/* ── Search ── */}
        <div className="wop-search-wrap">
          <svg className="wop-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="wop-search-input"
            type="text"
            placeholder="Search by Work Order ID, Request ID, description or priority…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="wop-search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        {/* ── Filter tabs ── */}
        <div className="wop-filters">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`wop-filter-btn ${filterStatus === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              {(f.key === "ALL" ? allOrders.length : counts[f.key]) > 0 && (
                <span className="wop-filter-count">
                  {f.key === "ALL" ? allOrders.length : counts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="wop-card">
          {loading ? (
            <div className="wop-empty">
              <div className="wop-spinner" />
              <p>Loading work orders…</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="wop-empty">
              <div className="wop-empty-icon">🔧</div>
              <p className="wop-empty-msg">
                {search || filterStatus !== "ALL"
                  ? "No work orders match your filter."
                  : "No work orders found."}
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
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(wo => (
                    <tr key={wo.workOrderId} className="wop-row">

                      {/* IDs column — WO# stacked above Req# */}
                      <td className="wop-td-ids">
                        <span className="wop-wo-id">WO #{wo.workOrderId}</span>
                        <span className="wop-req-id">Req #{wo.requestId || "—"}</span>
                      </td>

                      {/* Description */}
                      <td className="wop-td-desc">
                        <span className="wop-desc-text" title={wo.description}>
                          {wo.description
                            ? wo.description.length > 50
                              ? wo.description.slice(0, 50) + "…"
                              : wo.description
                            : "—"}
                        </span>
                      </td>

                      <td className="wop-td-badge">
                        <Badge cfg={PRIORITY_CFG} value={wo.priority} />
                      </td>

                      <td className="wop-td-badge">
                        <Badge cfg={STATUS_CFG} value={wo.status} />
                      </td>

                      <td className="wop-td-date">{fmtShort(wo.scheduledStart)}</td>
                      <td className="wop-td-date">{fmtShort(wo.createdAt)}</td>

                      <td className="wop-td-action">
                        <button
                          className="wop-btn-view"
                          onClick={() => setSelected(wo)}
                        >
                          View
                        </button>
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
          onStatusChange={handleStatusChange}
          updatingId={updatingId}
          readOnly={isReadOnly}
        />
      )}

    </StaffLayout>
  );
}
