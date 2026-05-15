// pages/staff/compliance/AuditLogPage.jsx
import { useState, useEffect, useCallback } from "react";
import StaffLayout from "../../../components/staff/StaffLayout";
import AuditLogService from "../../../services/AuditLogService";
import "../../../styles/AuditLog.css";

// ── Config ────────────────────────────────────────────────────
// Maps action/module keys to CSS class suffixes — no inline styles needed.

const ACTION_CLS = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
};

const MODULE_CLS = {
  "Service Requests": "requests",
  "Work Orders":      "workorders",
  "Assets":           "assets",
  "Inspections":      "inspections",
  "Maintenance":      "maintenance",
  "Work Logs":        "worklogs",
  "Field Workers":    "fieldworkers",
  "Material Usage":   "material",
  "Staff":            "staff",
  "KPI":              "kpi",
  "Notifications":    "notifications",
  "System":           "system",
};

const MODULES = [
  "All Modules","Service Requests","Work Orders","Assets",
  "Inspections","Maintenance","Work Logs","Field Workers",
  "Material Usage","Staff","KPI","Notifications","System",
];
const ROLES = [
  "All Roles","ADMINISTRATOR","DISPATCHER","OPERATIONS_MANAGER",
  "ASSET_MANAGER","FINANCE_OFFICER","COMPLIANCE_OFFICER","CREW","USER",
];

// ── Helpers ───────────────────────────────────────────────────

function actionCls(action)  { return ACTION_CLS[action]  || "other"; }
function moduleCls(module)  { return MODULE_CLS[module]  || "system"; }

// ── Badges ────────────────────────────────────────────────────

function ActionBadge({ action }) {
  return (
    <span className={`al-badge al-badge--${actionCls(action)}`}>
      {action || "OTHER"}
    </span>
  );
}

function ModuleBadge({ module }) {
  return (
    <span className={`al-badge al-module--${moduleCls(module)}`}>
      {module || "System"}
    </span>
  );
}

function RoleBadge({ role }) {
  return (
    <span className="al-role-badge">
      {role?.replace(/_/g, " ") || "—"}
    </span>
  );
}

// ── Formatters ────────────────────────────────────────────────

function fmtWhen(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function fmtFullDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}
function fmtTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

// ── Detail Modal ──────────────────────────────────────────────

function DetailModal({ log, onClose }) {
  const [techOpen, setTechOpen] = useState(false);

  return (
    <div className="al-backdrop" onClick={onClose}>
      <div className="al-modal" onClick={e => e.stopPropagation()}>

        <div className="al-modal-top">
          <div className="al-modal-badges">
            <ActionBadge action={log.action} />
            <ModuleBadge module={log.module} />
          </div>
          <button className="al-modal-x" onClick={onClose}>✕</button>
        </div>

        <h2 className="al-modal-title">{log.activity || "Action performed"}</h2>

        <div className="al-modal-body">

          {/* WHO */}
          <div className="al-section">
            <p className="al-section-label">WHO PERFORMED THIS</p>
            <div className="al-fields">
              <div className="al-field">
                <span className="al-fkey">Email</span>
                <span className="al-fval">{log.email || "—"}</span>
              </div>
              <div className="al-field">
                <span className="al-fkey">Role</span>
                <span className="al-fval"><RoleBadge role={log.role} /></span>
              </div>
              <div className="al-field">
                <span className="al-fkey">Account Type</span>
                <span className="al-fval">{log.staffType || "—"}</span>
              </div>
            </div>
          </div>

          {/* WHEN */}
          <div className="al-section">
            <p className="al-section-label">WHEN IT HAPPENED</p>
            <div className="al-fields">
              <div className="al-field">
                <span className="al-fkey">Date</span>
                <span className="al-fval">{fmtFullDate(log.performedAt)}</span>
              </div>
              <div className="al-field">
                <span className="al-fkey">Time</span>
                <span className="al-fval">{fmtTime(log.performedAt)}</span>
              </div>
              <div className="al-field">
                <span className="al-fkey">Log ID</span>
                <span className="al-fval al-logid">#{log.auditId}</span>
              </div>
            </div>
          </div>

          {/* WHAT */}
          <div className="al-section">
            <p className="al-section-label">WHAT WAS AFFECTED</p>
            <div className="al-fields">
              <div className="al-field">
                <span className="al-fkey">Module</span>
                <span className="al-fval"><ModuleBadge module={log.module} /></span>
              </div>
              <div className="al-field">
                <span className="al-fkey">Action Type</span>
                <span className="al-fval"><ActionBadge action={log.action} /></span>
              </div>
              {log.recordRef && (
                <div className="al-field">
                  <span className="al-fkey">Affected Record</span>
                  <span className="al-fval al-logid">#{log.recordRef}</span>
                </div>
              )}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="al-section">
            <p className="al-section-label">FULL DESCRIPTION</p>
            <p className="al-desc-text">{log.description || "No description available."}</p>
          </div>

          {/* TECHNICAL (collapsible) */}
          <div className="al-tech-wrap">
            <button className="al-tech-toggle" onClick={() => setTechOpen(p => !p)}>
              <span>{techOpen ? "▼" : "▶"}</span> Technical Info
            </button>
            {techOpen && (
              <div className="al-tech-body">
                <div className="al-field">
                  <span className="al-fkey">Entity Class</span>
                  <span className="al-fval al-mono">{log.entityName || "—"}</span>
                </div>
                <div className="al-field">
                  <span className="al-fkey">Method</span>
                  <span className="al-fval al-mono">{log.methodName || "—"}</span>
                </div>
                <div className="al-field">
                  <span className="al-fkey">Raw Details</span>
                  <span className="al-fval al-mono al-raw">{log.rawDetails || "—"}</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────

export default function AuditLogPage() {
  const [logs,     setLogs]     = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [selected, setSelected] = useState(null);

  const [search,   setSearch]   = useState("");
  const [modF,     setModF]     = useState("All Modules");
  const [actF,     setActF]     = useState("ALL");
  const [roleF,    setRoleF]    = useState("All Roles");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await AuditLogService.getAllLogs();
      const data = res.data?.data ?? [];
      setLogs(data); setFiltered(data);
    } catch {
      setError("Failed to load audit logs.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let r = [...logs];
    if (modF  !== "All Modules") r = r.filter(l => l.module === modF);
    if (actF  !== "ALL")         r = r.filter(l => l.action === actF);
    if (roleF !== "All Roles")   r = r.filter(l => l.role   === roleF);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(l =>
        l.email?.toLowerCase().includes(q)       ||
        l.activity?.toLowerCase().includes(q)    ||
        l.description?.toLowerCase().includes(q)
      );
    }
    if (dateFrom) r = r.filter(l => new Date(l.performedAt) >= new Date(dateFrom));
    if (dateTo)   r = r.filter(l => new Date(l.performedAt) <= new Date(dateTo + "T23:59:59"));
    setFiltered(r);
  }, [logs, modF, actF, roleF, search, dateFrom, dateTo]);

  return (
    <StaffLayout>
      <div className="al-root">

        <div className="al-header">
          <div>
            <h1 className="al-title">Audit Logs</h1>
            <p className="al-subtitle">Complete record of every action performed across the system</p>
          </div>
          <button className="al-btn-refresh" onClick={load}>Refresh</button>
        </div>

        {error && <div className="al-error">{error}</div>}

        {/* Filters */}
        <div className="al-filters">
          <input
            className="al-input"
            placeholder="Search by email or activity..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="al-select" value={modF}  onChange={e => setModF(e.target.value)}>
            {MODULES.map(m => <option key={m}>{m}</option>)}
          </select>
          <select className="al-select" value={actF}  onChange={e => setActF(e.target.value)}>
            <option value="ALL">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
          <select className="al-select" value={roleF} onChange={e => setRoleF(e.target.value)}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
          <input
            className="al-input al-date"
            type="date"
            value={dateFrom}
            title="From date"
            onChange={e => setDateFrom(e.target.value)}
          />
          <input
            className="al-input al-date"
            type="date"
            value={dateTo}
            title="To date"
            onChange={e => setDateTo(e.target.value)}
          />
          <span className="al-count">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="al-card">
          {loading ? (
            <div className="al-empty">
              <div className="al-spinner" />
              <p>Loading audit logs...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty-icon">📜</div>
              <p>No audit logs found.</p>
            </div>
          ) : (
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Event</th>
                    <th>By</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(log => (
                    <tr
                      key={log.auditId}
                      className="al-row"
                      onClick={() => setSelected(log)}
                      title="Click to view full details"
                    >
                      <td className="al-id">{log.auditId}</td>
                      <td>
                        <div className="al-event-cell">
                          <span className={`al-dot al-dot--${actionCls(log.action)}`} />
                          <span className="al-event-text">{log.activity || "Action performed"}</span>
                        </div>
                      </td>
                      <td className="al-by">{log.email || "—"}</td>
                      <td className="al-when">{fmtWhen(log.performedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="al-hint">Click any row to view full details</p>

      </div>

      {selected && <DetailModal log={selected} onClose={() => setSelected(null)} />}
    </StaffLayout>
  );
}
