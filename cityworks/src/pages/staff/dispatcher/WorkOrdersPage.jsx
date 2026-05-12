import { useState, useEffect, useCallback } from "react";
import StaffLayout from "../../../components/staff/StaffLayout";
import DispatcherService from "../../../services/DispatcherService";
import "../../../styles/WorkOrdersPage.css";

// ── Config ─────────────────────────────────────────────────────
const STATUS_CFG = {
  NOT_STARTED: { label: "Not Started", bg: "#f1f5f9", color: "#64748b" },
  IN_PROGRESS: { label: "In Progress", bg: "#dbeafe", color: "#1e40af" },
  COMPLETED:   { label: "Completed",   bg: "#d1fae5", color: "#065f46" },
  CANCELLED:   { label: "Cancelled",   bg: "#fee2e2", color: "#991b1b" },
};

const PRIORITY_CFG = {
  LOW:      { label: "Low",      bg: "#f1f5f9", color: "#64748b" },
  MEDIUM:   { label: "Medium",   bg: "#fef3c7", color: "#92400e" },
  HIGH:     { label: "High",     bg: "#fed7aa", color: "#9a3412" },
  CRITICAL: { label: "Critical", bg: "#fee2e2", color: "#991b1b" },
};

// ── Helpers ────────────────────────────────────────────────────
function Badge({ cfg, value }) {
  const c = cfg[value] || { label: value, bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "11px", fontWeight: 700,
      background: c.bg, color: c.color, whiteSpace: "nowrap",
    }}>
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

// ── Detail Panel ───────────────────────────────────────────────
function DetailPanel({ wo, onClose, onStatusChange, updatingId }) {
  return (
    <div className="wop-detail-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="wop-detail-panel">

        <div className="wop-detail-header">
          <div>
            <p className="wop-detail-title">Work Order #{wo.workOrderId}</p>
            <p className="wop-detail-sub">Request #{wo.requestId}</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Badge cfg={PRIORITY_CFG} value={wo.priority} />
            <Badge cfg={STATUS_CFG}   value={wo.status} />
            <button className="wop-detail-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="wop-detail-body">
          <div className="wop-detail-grid">
            <div className="wop-detail-field">
              <span className="wop-detail-label">Description</span>
              <span className="wop-detail-value">{wo.description || "—"}</span>
            </div>
            <div className="wop-detail-field">
              <span className="wop-detail-label">Asset ID</span>
              <span className="wop-detail-value">{wo.assetId || "—"}</span>
            </div>
            <div className="wop-detail-field">
              <span className="wop-detail-label">Scheduled Start</span>
              <span className="wop-detail-value">{fmt(wo.scheduledStart)}</span>
            </div>
            <div className="wop-detail-field">
              <span className="wop-detail-label">Scheduled End</span>
              <span className="wop-detail-value">{fmt(wo.scheduledEnd)}</span>
            </div>
            <div className="wop-detail-field">
              <span className="wop-detail-label">Created At</span>
              <span className="wop-detail-value">{fmt(wo.createdAt)}</span>
            </div>
            <div className="wop-detail-field">
              <span className="wop-detail-label">Assigned Workers</span>
              <span className="wop-detail-value">
                {wo.assignedFieldWorkerIds?.length
                  ? wo.assignedFieldWorkerIds.join(", ")
                  : "None assigned"}
              </span>
            </div>
          </div>

          <div className="wop-detail-status-section">
            <p className="wop-detail-label" style={{ marginBottom: 10 }}>Update Status</p>
            <div className="wop-status-btns">
              {Object.entries(STATUS_CFG).map(([key, c]) => (
                <button
                  key={key}
                  className={`wop-status-btn ${wo.status === key ? "active" : ""}`}
                  style={{ "--bg": c.bg, "--color": c.color }}
                  onClick={() => onStatusChange(wo.workOrderId, key)}
                  disabled={wo.status === key || updatingId === wo.workOrderId}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function WorkOrdersPage() {
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

  // ── Filter + search ──
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

  // ── Status counts for filter tabs ──
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
      setUpdatingId(null); }
  };

  return (
    <StaffLayout>
      <div className="wop-root">

        {/* Header */}
        <div className="wop-header">
          <div>
            <h1 className="wop-title">Work Orders</h1>
            <p className="wop-subtitle">View and manage all work orders</p>
          </div>
          <button className="wop-btn-refresh" onClick={load}>🔄 Refresh</button>
        </div>

        {toast && <div className={`wop-toast wop-toast--${toast.type}`}>{toast.msg}</div>}

        {/* Search bar */}
        <div className="wop-search-bar">
          <span className="wop-search-icon">🔍</span>
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

        {/* Status filter tabs */}
        <div className="wop-filters">
          {[
            { key: "ALL",         label: "All" },
            { key: "NOT_STARTED", label: "Not Started" },
            { key: "IN_PROGRESS", label: "In Progress" },
            { key: "COMPLETED",   label: "Completed" },
            { key: "CANCELLED",   label: "Cancelled" },
          ].map(f => (
            <button
              key={f.key}
              className={`wop-filter-btn ${filterStatus === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              {f.key === "ALL"
                ? <span className="wop-filter-count">{allOrders.length}</span>
                : counts[f.key]
                  ? <span className="wop-filter-count">{counts[f.key]}</span>
                  : null
              }
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="wop-card">
          {loading ? (
            <div className="wop-empty"><div className="wop-spinner" /><p>Loading…</p></div>
          ) : visible.length === 0 ? (
            <div className="wop-empty">
              <div style={{ fontSize: 40 }}>🔧</div>
              <p>{search || filterStatus !== "ALL" ? "No work orders match your filter." : "No work orders found."}</p>
            </div>
          ) : (
            <div className="wop-table-wrap">
              <table className="wop-table">
                <thead>
                  <tr>
                    <th>WO #</th>
                    <th>Request #</th>
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
                      <td className="wop-id">#{wo.workOrderId}</td>
                      <td className="wop-id">#{wo.requestId || "—"}</td>
                      <td className="wop-desc" title={wo.description}>
                        {wo.description
                          ? wo.description.length > 45
                            ? wo.description.slice(0, 45) + "…"
                            : wo.description
                          : "—"}
                      </td>
                      <td><Badge cfg={PRIORITY_CFG} value={wo.priority} /></td>
                      <td><Badge cfg={STATUS_CFG}   value={wo.status}   /></td>
                      <td className="wop-date">{fmt(wo.scheduledStart)}</td>
                      <td className="wop-date">{fmt(wo.createdAt)}</td>
                      <td>
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
        />
      )}

    </StaffLayout>
  );
}