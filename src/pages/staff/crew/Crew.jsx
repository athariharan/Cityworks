// pages/staff/crew/Crew.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import StaffLayout       from "../../../components/staff/StaffLayout";
import WorkOrderService  from "../../../services/WorkOrderService";
import WorkLogService    from "../../../services/WorkLogService";
import DispatcherService from "../../../services/DispatcherService";
import "../../../styles/WorkOrdersPage.css";   // reuse existing styles

/* ── Config (same as WorkOrdersPage) ─────────────────────── */
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

/* ── Work Log Modal ──────────────────────────────────────── */
function WorkLogModal({ wo, staffId, onClose, onSuccess, showToast }) {
  const fileRef = useRef();
  const [form,      setForm]      = useState({ startAt: "", endAt: "", status: "COMPLETED" });
  const [photoFile, setPhotoFile] = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [saving,    setSaving]    = useState(false);

  const handleFile = e => {
    const f = e.target.files[0] || null;
    setPhotoFile(f);
    if (f) { const r = new FileReader(); r.onload = ev => setPreview(ev.target.result); r.readAsDataURL(f); }
    else setPreview(null);
  };

  const handleSubmit = async () => {
    if (!form.startAt) { showToast("Start Time is required.", "error"); return; }
    if (form.endAt && new Date(form.endAt) < new Date(form.startAt)) {
      showToast("End Time cannot be before Start Time.", "error"); return;
    }
    const fd = new FormData();
    fd.append("workOrderId", wo.workOrderId);
    fd.append("performedBy", staffId);
    fd.append("startAt", new Date(form.startAt).toISOString());
    if (form.endAt) fd.append("endAt", new Date(form.endAt).toISOString());
    fd.append("status", form.status);
    if (photoFile) fd.append("photoFile", photoFile);

    setSaving(true);
    try {
      const res   = await WorkLogService.create(fd);
      const logId = res.data?.data?.logId;
      onSuccess(wo.workOrderId, logId);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create work log.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wop-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="wop-panel" style={{ width: 460 }}>

        <div className="wop-panel-header">
          <div className="wop-panel-ids">
            <span className="wop-panel-wo">Work Log — WO #{wo.workOrderId}</span>
            <span className="wop-panel-req">
              {wo.description?.slice(0, 55) || "No description"}{wo.description?.length > 55 ? "…" : ""}
            </span>
          </div>
          <button className="wop-panel-close" onClick={onClose}>✕</button>
        </div>

        <div className="wop-panel-body">

          <div className="wop-panel-grid">
            <div className="wop-panel-field">
              <span className="wop-panel-lbl">Start Time *</span>
              <input type="datetime-local" value={form.startAt}
                onChange={e => setForm(p => ({ ...p, startAt: e.target.value }))}
                style={{ padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div className="wop-panel-field">
              <span className="wop-panel-lbl">End Time</span>
              <input type="datetime-local" value={form.endAt}
                onChange={e => setForm(p => ({ ...p, endAt: e.target.value }))}
                style={{ padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div className="wop-panel-field wop-panel-field--full">
              <span className="wop-panel-lbl">Status *</span>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                style={{ padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff", width: "100%" }}>
                <option value="COMPLETED">COMPLETED</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div className="wop-panel-field wop-panel-field--full">
              <span className="wop-panel-lbl">Photo Evidence</span>
              <label style={{
                display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
                border: "1.5px dashed #e2e8f0", borderRadius: 8, cursor: "pointer",
                background: "#f8fafc", fontSize: 13, color: "#64748b",
              }}>
                📎 {photoFile ? photoFile.name : "Click to attach photo (optional)"}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
              </label>
              {preview && (
                <div style={{ position: "relative", display: "inline-block", marginTop: 8 }}>
                  <img src={preview} alt="preview"
                    style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <button onClick={() => { setPhotoFile(null); setPreview(null); }}
                    style={{
                      position: "absolute", top: 5, right: 5, background: "rgba(0,0,0,0.55)",
                      color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20,
                      cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>✕</button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
            <button onClick={handleSubmit} disabled={saving} style={{
              flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
              background: saving ? "#93c5fd" : "#1e40af", color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
            }}>
              {saving ? "Submitting…" : "✅ Create Work Log"}
            </button>
            <button onClick={onClose} style={{
              padding: "10px 20px", borderRadius: 8, border: "1.5px solid #e2e8f0",
              background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>Cancel</button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE — My Tasks
══════════════════════════════════════════════════════════ */
export default function CrewOperationsPage() {
  const navigate        = useNavigate();
  const { userId, user } = useSelector(s => s.auth);
  const staffId         = Number(userId);

  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);
  const [search,   setSearch]   = useState("");
  const [filterSt, setFilterSt] = useState("ALL");
  const [selected, setSelected] = useState(null);  // work order for detail panel
  const [logModal, setLogModal] = useState(null);   // work order for work log modal

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  /* ── Load work orders assigned to this crew member ── */
  const load = useCallback(() => {
    setLoading(true);
    Promise.allSettled([
      DispatcherService.getFieldWorkerByStaffId(staffId),
      WorkOrderService.getAll(),
    ]).then(([fwRes, woRes]) => {
      const fw    = fwRes.status === "fulfilled" ? (fwRes.value.data?.data ?? null) : null;
      const fwId  = fw?.fieldWorkerId;
      const all   = woRes.status === "fulfilled" ? (woRes.value.data?.data ?? []) : [];

      const mine = fwId != null
        ? all.filter(wo => wo.assignedFieldWorkerIds?.map(Number).includes(Number(fwId)))
        : [];

      if (fwRes.status === "rejected") showToast("Could not load your field worker profile.", "error");
      setOrders(mine);
    }).finally(() => setLoading(false));
  }, [staffId, showToast]);

  useEffect(() => { load(); }, [load]);

  /* ── Derived stats ── */
  const counts = {
    ALL:         orders.length,
    NOT_STARTED: orders.filter(o => o.status === "NOT_STARTED").length,
    IN_PROGRESS:  orders.filter(o => o.status === "IN_PROGRESS").length,
    COMPLETED:   orders.filter(o => o.status === "COMPLETED").length,
  };

  const FILTERS = [
    { key: "ALL",         label: "All" },
    { key: "NOT_STARTED", label: "Not Started" },
    { key: "IN_PROGRESS",  label: "In Progress" },
    { key: "COMPLETED",   label: "Completed" },
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

  /* ── Work log submit success ── */
  const handleLogSuccess = (workOrderId, logId) => {
    showToast(`Work Log #${logId} created for WO #${workOrderId} ✅`);
    setLogModal(null);
    setSelected(null);
    load(); // refresh
  };

  const name = user?.email?.split("@")[0] || "Crew";

  return (
    <StaffLayout>
      <div className="wop-root">

        {/* ── Header ── */}
        <div className="wop-header">
          <div>
            <h1 className="wop-title">My Tasks</h1>
            <p className="wop-subtitle">
              Work orders assigned to you · Welcome, {name}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="wop-btn-refresh"
              onClick={() => navigate("/staff/crew/evidence")}
            >
              📷 Upload Evidence
            </button>
            <button className="wop-btn-refresh" onClick={load} disabled={loading}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M8 16H3v5"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* ── Toast ── */}
        {toast && <div className={`wop-toast wop-toast--${toast.type}`}>{toast.msg}</div>}

        {/* ── Stat chips ── */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "Assigned",    value: counts.ALL,         bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" },
            { label: "Not Started", value: counts.NOT_STARTED, bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
            { label: "In Progress",  value: counts.IN_PROGRESS,  bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
            { label: "Completed",   value: counts.COMPLETED,   bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
          ].map(s => (
            <div key={s.label} style={{
              padding: "12px 20px", borderRadius: 10,
              background: s.bg, border: `1px solid ${s.border}`,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="wop-search-wrap">
          <svg className="wop-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="wop-search-input"
            type="text"
            placeholder="Search by ID, description, priority…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="wop-search-clear" onClick={() => setSearch("")}>✕</button>}
        </div>

        {/* ── Filter tabs ── */}
        <div className="wop-filters">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`wop-filter-btn ${filterSt === f.key ? "active" : ""}`}
              onClick={() => setFilterSt(f.key)}
            >
              {f.label}
              {counts[f.key] > 0 && <span className="wop-filter-count">{counts[f.key]}</span>}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="wop-card">
          {loading ? (
            <div className="wop-empty">
              <div className="wop-spinner" />
              <p>Loading your work orders…</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="wop-empty">
              <div className="wop-empty-icon">📋</div>
              <p className="wop-empty-msg">
                {orders.length === 0
                  ? "No work orders assigned to you yet."
                  : "No work orders match your search or filter."}
              </p>
            </div>
          ) : (
            <div className="wop-table-wrap">
              <table className="wop-table">
                <thead>
                  <tr>
                    <th>Work Order</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Scheduled Start</th>
                    <th>Due</th>
                    <th>Actions</th>
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
                          {wo.description
                            ? wo.description.length > 55 ? wo.description.slice(0, 55) + "…" : wo.description
                            : "—"}
                        </span>
                      </td>

                      <td className="wop-td-badge">
                        <Badge cfg={PRIORITY_CFG} value={wo.priority} />
                      </td>

                      <td className="wop-td-badge">
                        <Badge cfg={STATUS_CFG} value={wo.status} />
                      </td>

                      <td className="wop-td-date">{fmt(wo.scheduledStart)}</td>
                      <td className="wop-td-date">{fmt(wo.scheduledEnd)}</td>

                      <td className="wop-td-action" style={{ display: "flex", gap: 6, whiteSpace: "nowrap" }}>
                        <button className="wop-btn-view" onClick={() => setSelected(wo)}>
                          View
                        </button>
                        <button
                          onClick={() => setLogModal(wo)}
                          style={{
                            padding: "5px 10px", borderRadius: 6, border: "1.5px solid #a7f3d0",
                            background: "#ecfdf5", color: "#065f46",
                            fontSize: 12, fontWeight: 600, cursor: "pointer",
                            transition: "all 0.15s", whiteSpace: "nowrap",
                          }}
                        >
                          📷 Work Log
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

      {/* ── Detail Panel ── */}
      {selected && (
        <div className="wop-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="wop-panel">
            <div className="wop-panel-header">
              <div className="wop-panel-ids">
                <span className="wop-panel-wo">Work Order #{selected.workOrderId}</span>
                <span className="wop-panel-req">Request #{selected.requestId || "—"}</span>
              </div>
              <div className="wop-panel-badges">
                <Badge cfg={PRIORITY_CFG} value={selected.priority} />
                <Badge cfg={STATUS_CFG}   value={selected.status} />
                <button className="wop-panel-close" onClick={() => setSelected(null)}>✕</button>
              </div>
            </div>

            <div className="wop-panel-body">
              <div className="wop-panel-grid">
                <div className="wop-panel-field wop-panel-field--full">
                  <span className="wop-panel-lbl">Description</span>
                  <span className="wop-panel-val">{selected.description || "—"}</span>
                </div>
                <div className="wop-panel-field">
                  <span className="wop-panel-lbl">Scheduled Start</span>
                  <span className="wop-panel-val">{fmt(selected.scheduledStart)}</span>
                </div>
                <div className="wop-panel-field">
                  <span className="wop-panel-lbl">Scheduled End</span>
                  <span className="wop-panel-val">{fmt(selected.scheduledEnd)}</span>
                </div>
                <div className="wop-panel-field">
                  <span className="wop-panel-lbl">Asset ID</span>
                  <span className="wop-panel-val">{selected.assetId || "—"}</span>
                </div>
                <div className="wop-panel-field">
                  <span className="wop-panel-lbl">Assigned Workers</span>
                  <span className="wop-panel-val">
                    {selected.assignedFieldWorkerIds?.length
                      ? selected.assignedFieldWorkerIds.join(", ")
                      : "None"}
                  </span>
                </div>
              </div>

              <div className="wop-panel-status-section">
                <p className="wop-panel-lbl" style={{ marginBottom: 12 }}>Actions</p>
                <button
                  onClick={() => { setSelected(null); setLogModal(selected); }}
                  style={{
                    width: "100%", padding: "10px 0", borderRadius: 8,
                    border: "none", background: "#1e40af", color: "#fff",
                    fontWeight: 700, fontSize: 14, cursor: "pointer",
                  }}
                >
                  📷 Create Work Log / Upload Evidence
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Work Log Modal ── */}
      {logModal && (
        <WorkLogModal
          wo={logModal}
          staffId={staffId}
          onClose={() => setLogModal(null)}
          onSuccess={handleLogSuccess}
          showToast={showToast}
        />
      )}

    </StaffLayout>
  );
}
