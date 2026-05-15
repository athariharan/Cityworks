// pages/staff/finance/WorkLogsViewPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../../components/staff/StaffLayout";
import WorkLogService        from "../../../services/WorkLogService";
import MaterialUsageService  from "../../../services/MaterialUsageService";
import "../../../styles/WorkLogsViewPage.css";

// ── Config ────────────────────────────────────────────────────────
const STATUS_CFG = {
  PENDING:     { label: "Pending",     bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  IN_PROGRESS: { label: "In Progress", bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  COMPLETED:   { label: "Completed",   bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
  FAILED:      { label: "Failed",      bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
};

// ── Helpers ───────────────────────────────────────────────────────
function StatusBadge({ value }) {
  const c = STATUS_CFG[value] || { label: value || "—", bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
  return (
    <span className="wlv-badge" style={{ "--bg": c.bg, "--color": c.color, "--dot": c.dot }}>
      <span className="wlv-badge-dot" />
      {c.label}
    </span>
  );
}

function UsageBadge({ hasUsage, usageRecords }) {
  if (hasUsage) {
    return (
      <span className="wlv-usage-badge wlv-usage-badge--yes" title={`${usageRecords.length} usage record(s)`}>
        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Recorded ({usageRecords.length})
      </span>
    );
  }
  return (
    <span className="wlv-usage-badge wlv-usage-badge--no">
      <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      Not Recorded
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

const fmtRs = (n) =>
  n == null ? "—" : `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

// ── Detail Panel ──────────────────────────────────────────────────
function DetailPanel({ log, usageRecords, onClose, onAddUsage }) {
  const hasUsage = usageRecords.length > 0;
  const totalSpend = usageRecords.reduce((s, r) => s + (Number(r.totalCost) || 0), 0);

  return (
    <div className="wlv-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
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

          {/* Work log details */}
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
              <span className="wlv-panel-val">{fmt(log.startAt)}</span>
            </div>
            <div className="wlv-panel-field">
              <span className="wlv-panel-lbl">Ended At</span>
              <span className="wlv-panel-val">{fmt(log.endAt)}</span>
            </div>
            <div className="wlv-panel-field">
              <span className="wlv-panel-lbl">Captured At</span>
              <span className="wlv-panel-val">{fmt(log.capturedAt)}</span>
            </div>
            <div className="wlv-panel-field">
              <span className="wlv-panel-lbl">Photo Evidence</span>
              <span className="wlv-panel-val">{log.photoUri ? "📷 Available" : "—"}</span>
            </div>
          </div>

          {/* ── Material Usage Section ── */}
          <div className="wlv-panel-usage-section">
            <div className="wlv-panel-usage-header">
              <div>
                <p className="wlv-panel-lbl">Material Usage</p>
                <p className="wlv-panel-usage-status">
                  {hasUsage
                    ? <><span style={{ color: "#10b981", fontWeight: 700 }}>✓ {usageRecords.length} record{usageRecords.length > 1 ? "s" : ""}</span> — Total: <strong style={{ color: "#0d9488" }}>{fmtRs(totalSpend)}</strong></>
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
                {usageRecords.map(r => (
                  <div key={r.usageId} className="wlv-panel-usage-row">
                    <div className="wlv-panel-usage-left">
                      <span className="wlv-panel-usage-id">#{r.usageId}</span>
                      <div>
                        <div className="wlv-panel-usage-meta">Asset #{r.assetId} · Qty {r.quantity}</div>
                        {r.partId && <div className="wlv-panel-usage-sub">Part #{r.partId}</div>}
                      </div>
                    </div>
                    <div className="wlv-panel-usage-cost">{fmtRs(r.totalCost)}</div>
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
                  src={`http://localhost:1000/${log.photoUri}`}
                  alt="Work log evidence"
                  className="wlv-photo"
                  onError={e => { e.target.style.display = "none"; }}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function WorkLogsViewPage() {
  const navigate = useNavigate();
  const [logs,     setLogs]     = useState([]);
  const [usages,   setUsages]   = useState([]);   // all material usage records
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("ALL");
  const [usageFilter, setUsageFilter] = useState("ALL"); // ALL | RECORDED | PENDING
  const [selected, setSelected] = useState(null);
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [wlRes, muRes] = await Promise.allSettled([
        WorkLogService.getAll(),
        MaterialUsageService.getAll(),
      ]);
      setLogs(wlRes.status   === "fulfilled" ? (wlRes.value.data?.data  ?? []) : []);
      setUsages(muRes.status === "fulfilled" ? (muRes.value.data?.data  ?? []) : []);
    } catch {
      showToast("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // build a map: logId → [usageRecords]
  const usageMap = usages.reduce((acc, u) => {
    const key = u.logId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(u);
    return acc;
  }, {});

  // stats
  const total      = logs.length;
  const completed  = logs.filter(l => l.status === "COMPLETED").length;
  const inProg     = logs.filter(l => l.status === "IN_PROGRESS").length;
  const recorded   = logs.filter(l => (usageMap[l.logId] ?? []).length > 0).length;
  const notRecorded = total - recorded;

  // filter + search
  const visible = logs.filter(l => {
    const matchStatus = filter === "ALL" || l.status === filter;
    const hasUsage    = (usageMap[l.logId] ?? []).length > 0;
    const matchUsage  = usageFilter === "ALL"
      || (usageFilter === "RECORDED" && hasUsage)
      || (usageFilter === "PENDING"  && !hasUsage);
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      String(l.logId).includes(q) ||
      String(l.workOrderId ?? "").includes(q) ||
      String(l.performedBy ?? "").includes(q);
    return matchStatus && matchUsage && matchSearch;
  });

  const statusCounts = logs.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});

  const STATUS_FILTERS = [
    { key: "ALL",         label: "All" },
    { key: "PENDING",     label: "Pending" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "COMPLETED",   label: "Completed" },
    { key: "FAILED",      label: "Failed" },
  ];

  const USAGE_FILTERS = [
    { key: "ALL",      label: "All Logs",         count: total },
    { key: "RECORDED", label: "Usage Recorded",   count: recorded },
    { key: "PENDING",  label: "Not Yet Recorded", count: notRecorded },
  ];

  // navigate to materials page with logId pre-filled
  const handleAddUsage = (log) => {
    navigate("/staff/materials", { state: { prefillLogId: log.logId, prefillWoId: log.workOrderId } });
  };

  return (
    <StaffLayout>
      <div className="wlv-root">

        {/* ── Hero ── */}
        <div className="wlv-hero">
          <div className="wlv-hero-blob wlv-hero-blob--1" />
          <div className="wlv-hero-blob wlv-hero-blob--2" />
          <div className="wlv-hero-content">
            <div>
              <div className="wlv-hero-breadcrumb">Dashboard · Finance · Work Logs</div>
              <h1 className="wlv-hero-title">Work Logs</h1>
              <p className="wlv-hero-sub">View work logs and track material usage status for each</p>
            </div>
            <div className="wlv-hero-chips">
              <div className="wlv-hero-chip">
                <span className="wlv-hero-chip-val">{total}</span>
                <span className="wlv-hero-chip-lbl">Total</span>
              </div>
              <div className="wlv-hero-chip wlv-hero-chip--green">
                <span className="wlv-hero-chip-val">{completed}</span>
                <span className="wlv-hero-chip-lbl">Completed</span>
              </div>
              <div className="wlv-hero-chip wlv-hero-chip--blue">
                <span className="wlv-hero-chip-val">{inProg}</span>
                <span className="wlv-hero-chip-lbl">In Progress</span>
              </div>
              <div className="wlv-hero-chip wlv-hero-chip--teal">
                <span className="wlv-hero-chip-val">{recorded}</span>
                <span className="wlv-hero-chip-lbl">Usage Recorded</span>
              </div>
              <div className="wlv-hero-chip wlv-hero-chip--amber">
                <span className="wlv-hero-chip-val">{notRecorded}</span>
                <span className="wlv-hero-chip-lbl">Not Recorded</span>
              </div>
            </div>
          </div>
        </div>

        {toast && <div className={`wlv-toast wlv-toast--${toast.type}`}>{toast.msg}</div>}

        {/* ── Usage filter pills ── */}
        <div className="wlv-usage-pills">
          {USAGE_FILTERS.map(f => (
            <button
              key={f.key}
              className={`wlv-usage-pill ${usageFilter === f.key ? "active" : ""}`}
              onClick={() => setUsageFilter(f.key)}
            >
              {f.key === "RECORDED" && <span className="wlv-pill-dot wlv-pill-dot--green" />}
              {f.key === "PENDING"  && <span className="wlv-pill-dot wlv-pill-dot--amber" />}
              {f.label}
              <span className="wlv-pill-count">{f.count}</span>
            </button>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="wlv-toolbar">
          <div className="wlv-search-wrap">
            <svg className="wlv-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="wlv-search-input"
              placeholder="Search by Log ID, Work Order ID, Staff ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="wlv-search-clear" onClick={() => setSearch("")}>✕</button>}
          </div>

          {/* Status filter */}
          <div className="wlv-status-filters">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.key}
                className={`wlv-filter-btn ${filter === f.key ? "active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                {(f.key === "ALL" ? logs.length : statusCounts[f.key]) > 0 && (
                  <span className="wlv-filter-count">
                    {f.key === "ALL" ? logs.length : statusCounts[f.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button className="wlv-btn-refresh" onClick={load} disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Table ── */}
        <div className="wlv-card">
          {loading ? (
            <div className="wlv-empty">
              <div className="wlv-spinner" /><p>Loading work logs…</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="wlv-empty">
              <div className="wlv-empty-icon">📋</div>
              <p>{search || filter !== "ALL" || usageFilter !== "ALL" ? "No logs match your filter." : "No work logs found."}</p>
            </div>
          ) : (
            <div className="wlv-table-wrap">
              <table className="wlv-table">
                <thead>
                  <tr>
                    <th>IDs</th>
                    <th>Staff</th>
                    <th>Status</th>
                    <th>Started At</th>
                    <th>Material Usage</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(l => {
                    const logUsages = usageMap[l.logId] ?? [];
                    const hasUsage  = logUsages.length > 0;
                    return (
                      <tr key={l.logId} className={`wlv-row ${!hasUsage ? "wlv-row--warn" : ""}`}>
                        {/* IDs — Log# stacked over WO# */}
                        <td className="wlv-td-ids">
                          <span className="wlv-log-id">Log #{l.logId}</span>
                          <span className="wlv-wo-sub">WO #{l.workOrderId ?? "—"}</span>
                        </td>
                        <td className="wlv-td-plain">#{l.performedBy ?? "—"}</td>
                        <td><StatusBadge value={l.status} /></td>
                        <td className="wlv-td-date">{fmt(l.startAt)}</td>
                        <td>
                          <UsageBadge hasUsage={hasUsage} usageRecords={logUsages} />
                        </td>
                        <td className="wlv-td-actions">
                          <button className="wlv-btn-view" onClick={() => setSelected(l)}>
                            Details
                          </button>
                          {!hasUsage && (
                            <button className="wlv-btn-add-usage" onClick={() => handleAddUsage(l)}>
                              + Usage
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {selected && (
        <DetailPanel
          log={selected}
          usageRecords={usageMap[selected.logId] ?? []}
          onClose={() => setSelected(null)}
          onAddUsage={handleAddUsage}
        />
      )}
    </StaffLayout>
  );
}
