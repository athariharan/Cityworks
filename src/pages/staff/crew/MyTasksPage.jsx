// pages/staff/crew/MyTasksPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import StaffLayout       from "../../../components/staff/StaffLayout";
import WorkOrderService  from "../../../services/WorkOrderService";
import DispatcherService from "../../../services/DispatcherService";
import "../../../styles/MyTasksPage.css";

// ── Config ───────────────────────────────────────────────────────
const STATUS_CFG = {
  NOT_STARTED: { label: "Not Started", bg: "#f1f5f9", color: "#475569", border: "#cbd5e1", dot: "#94a3b8", icon: "🕐" },
  IN_PROGRESS:  { label: "In Progress", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6", icon: "⚡" },
  COMPLETED:    { label: "Completed",   bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", dot: "#22c55e", icon: "✅" },
  CANCELLED:    { label: "Cancelled",   bg: "#fef2f2", color: "#b91c1c", border: "#fecaca", dot: "#ef4444", icon: "✕" },
};

const PRIORITY_CFG = {
  LOW:      { label: "Low",      bg: "#f0fdf4", color: "#15803d", bar: "#22c55e" },
  MEDIUM:   { label: "Medium",   bg: "#fefce8", color: "#a16207", bar: "#eab308" },
  HIGH:     { label: "High",     bg: "#fff7ed", color: "#c2410c", bar: "#f97316" },
  CRITICAL: { label: "Critical", bg: "#fef2f2", color: "#991b1b", bar: "#ef4444" },
};

function fmt(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Task Card ────────────────────────────────────────────────────
function TaskCard({ wo, onView, onLog }) {
  const st = STATUS_CFG[wo.status]   || STATUS_CFG.NOT_STARTED;
  const pr = PRIORITY_CFG[wo.priority] || { label: wo.priority, bg: "#f1f5f9", color: "#64748b", bar: "#94a3b8" };

  return (
    <div className="mtask-card" style={{ "--status-border": st.border, "--status-bg": st.bg }}>

      {/* Priority bar on left edge */}
      <div className="mtask-priority-bar" style={{ background: pr.bar }} />

      <div className="mtask-card-body">

        {/* Top row — IDs + badges */}
        <div className="mtask-card-top">
          <div className="mtask-ids">
            <span className="mtask-wo-id">WO #{wo.workOrderId}</span>
            {wo.requestId && <span className="mtask-req-id">Req #{wo.requestId}</span>}
          </div>
          <div className="mtask-badges">
            <span className="mtask-badge" style={{ background: pr.bg, color: pr.color }}>
              {pr.label}
            </span>
            <span className="mtask-status-badge" style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
              {st.icon} {st.label}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="mtask-desc" title={wo.description}>
          {wo.description || "No description provided."}
        </p>

        {/* Dates row */}
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

        {/* Actions */}
        <div className="mtask-actions">
          <button className="mtask-btn mtask-btn--view" onClick={() => onView(wo)}>
            View Details
          </button>
          {wo.status !== "CANCELLED" && wo.status !== "COMPLETED" && (
            <button className="mtask-btn mtask-btn--log" onClick={() => onLog(wo)}>
              📷 Log Work
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Detail Slide Panel ───────────────────────────────────────────
function DetailPanel({ wo, onClose, onLog }) {
  const st = STATUS_CFG[wo.status]   || STATUS_CFG.NOT_STARTED;
  const pr = PRIORITY_CFG[wo.priority] || { label: wo.priority, bg: "#f1f5f9", color: "#64748b", bar: "#94a3b8" };

  return (
    <div className="mtask-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mtask-panel">

        {/* Panel header */}
        <div className="mtask-panel-header" style={{ borderBottom: `3px solid ${pr.bar}` }}>
          <div>
            <h2 className="mtask-panel-title">Work Order #{wo.workOrderId}</h2>
            <p className="mtask-panel-sub">Request #{wo.requestId || "—"}</p>
          </div>
          <button className="mtask-panel-close" onClick={onClose}>✕</button>
        </div>

        <div className="mtask-panel-body">

          {/* Status + Priority pills */}
          <div className="mtask-panel-pills">
            <span className="mtask-status-badge" style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
              {st.icon} {st.label}
            </span>
            <span className="mtask-badge" style={{ background: pr.bg, color: pr.color }}>
              {pr.label} Priority
            </span>
          </div>

          {/* Description */}
          <div className="mtask-panel-section">
            <p className="mtask-panel-lbl">Description</p>
            <p className="mtask-panel-text">{wo.description || "—"}</p>
          </div>

          {/* Details grid */}
          <div className="mtask-panel-grid">
            {[
              { lbl: "Scheduled Start", val: fmt(wo.scheduledStart) },
              { lbl: "Scheduled End",   val: fmt(wo.scheduledEnd) },
              { lbl: "Asset ID",        val: wo.assetId ? `#${wo.assetId}` : "—" },
              { lbl: "Crew Members",    val: wo.assignedFieldWorkerIds?.length ? `${wo.assignedFieldWorkerIds.length} assigned` : "—" },
            ].map(f => (
              <div key={f.lbl} className="mtask-panel-field">
                <span className="mtask-panel-lbl">{f.lbl}</span>
                <span className="mtask-panel-val">{f.val}</span>
              </div>
            ))}
          </div>

          {/* Action */}
          {wo.status !== "CANCELLED" && wo.status !== "COMPLETED" && (
            <button className="mtask-panel-log-btn" onClick={() => onLog(wo)}>
              📷 Upload Evidence / Log Work
            </button>
          )}
          {wo.status === "COMPLETED" && (
            <div className="mtask-panel-done">
              ✅ This work order has been completed.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function MyTasksPage() {
  const navigate   = useNavigate();
  const { userId } = useSelector(state => state.auth);

  const [allOrders, setAllOrders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const [search,    setSearch]    = useState("");
  const [filterSt,  setFilterSt]  = useState("ALL");
  const [selected,  setSelected]  = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const fwRes = await DispatcherService.getFieldWorkerByStaffId(userId);
      const fwId  = fwRes.data?.data?.fieldWorkerId;

      if (!fwId) {
        showToast("Field worker profile not found for your account.", "error");
        setAllOrders([]);
        return;
      }

      const woRes = await WorkOrderService.getAll();
      const all   = woRes.data?.data ?? [];
      const mine  = all.filter(wo => wo.assignedFieldWorkerIds?.includes(Number(fwId)));
      setAllOrders(mine);
    } catch {
      showToast("Failed to load your tasks.", "error");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const counts = {
    ALL:         allOrders.length,
    NOT_STARTED: allOrders.filter(o => o.status === "NOT_STARTED").length,
    IN_PROGRESS:  allOrders.filter(o => o.status === "IN_PROGRESS").length,
    COMPLETED:   allOrders.filter(o => o.status === "COMPLETED").length,
    CANCELLED:   allOrders.filter(o => o.status === "CANCELLED").length,
  };

  const FILTERS = [
    { key: "ALL",         label: "All" },
    { key: "NOT_STARTED", label: "Not Started" },
    { key: "IN_PROGRESS",  label: "In Progress" },
    { key: "COMPLETED",   label: "Completed" },
    { key: "CANCELLED",   label: "Cancelled" },
  ];

  const visible = allOrders.filter(wo => {
    const matchSt = filterSt === "ALL" || wo.status === filterSt;
    const q = search.trim().toLowerCase();
    const matchQ = !q
      || String(wo.workOrderId).includes(q)
      || (wo.description || "").toLowerCase().includes(q)
      || (wo.priority    || "").toLowerCase().includes(q);
    return matchSt && matchQ;
  });

  const handleLog = (wo) => navigate("/staff/crew/evidence", { state: { workOrderId: wo.workOrderId } });

  return (
    <StaffLayout>
      <div className="mtask-root">

        {/* ── Header ── */}
        <div className="mtask-header">
          <div>
            <h1 className="mtask-title">My Tasks</h1>
            <p className="mtask-subtitle">
              {allOrders.length > 0
                ? `${allOrders.length} work order${allOrders.length > 1 ? "s" : ""} assigned to you`
                : "Work orders assigned to you"}
            </p>
          </div>
          <button className="mtask-btn-refresh" onClick={load} disabled={loading}>
            🔄 Refresh
          </button>
        </div>

        {toast && <div className={`mtask-toast mtask-toast--${toast.type}`}>{toast.msg}</div>}

        {/* ── Search ── */}
        <div className="mtask-search">
          <span className="mtask-search-icon">🔍</span>
          <input
            className="mtask-search-input"
            type="text"
            placeholder="Search by Work Order ID, description or priority…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="mtask-search-clear" onClick={() => setSearch("")}>✕</button>}
        </div>

        {/* ── Status Filters ── */}
        <div className="mtask-filters">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`mtask-filter-btn ${filterSt === f.key ? "active" : ""}`}
              onClick={() => setFilterSt(f.key)}
            >
              {f.label}
              {counts[f.key] > 0 && (
                <span className="mtask-filter-count">{counts[f.key]}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Cards ── */}
        {loading ? (
          <div className="mtask-loading">
            <div className="mtask-spinner" />
            <p>Loading your tasks…</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="mtask-empty">
            <div className="mtask-empty-icon">🔧</div>
            <p className="mtask-empty-title">
              {search || filterSt !== "ALL" ? "No tasks match your filter." : "No tasks assigned to you yet."}
            </p>
            <p className="mtask-empty-sub">Check back later or contact your dispatcher.</p>
          </div>
        ) : (
          <div className="mtask-grid">
            {visible.map(wo => (
              <TaskCard
                key={wo.workOrderId}
                wo={wo}
                onView={setSelected}
                onLog={handleLog}
              />
            ))}
          </div>
        )}

      </div>

      {selected && (
        <DetailPanel
          wo={selected}
          onClose={() => setSelected(null)}
          onLog={wo => { setSelected(null); handleLog(wo); }}
        />
      )}
    </StaffLayout>
  );
}
