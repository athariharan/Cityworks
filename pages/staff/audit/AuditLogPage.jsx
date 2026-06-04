// pages/staff/compliance/AuditLogPage.jsx
import { useState, useEffect, useCallback } from "react";
import StaffLayout from "../../../components/staff/StaffLayout";
import AuditLogService from "../../../services/AuditLogService";
import "../../../styles/AuditLog.css";
import { MODULES, ROLES } from "../../../utility/AuditLogConfig";
import { ActionBadge, ModuleBadge, actionCls, formatWhen } from "./AuditHelpers";
import DetailModal from "./AuditDetailModal";

export default function AuditLogPage() {
  const [logs,     setLogs]     = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,    setError]    = useState(null);
  const [selected, setSelected] = useState(null);

  const [search,        setSearch]        = useState("");
  const [moduleFilter,  setModuleFilter]  = useState("All Modules");
  const [actionFilter,  setActionFilter]  = useState("ALL");
  const [roleFilter,    setRoleFilter]    = useState("All Roles");
  const [dateFrom,      setDateFrom]      = useState("");
  const [dateTo,        setDateTo]        = useState("");

  const fetchLogs = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const response  = await AuditLogService.getAllLogs();
      const data = response.data?.data ?? [];
      setLogs(data); setFiltered(data);
    } catch {
      setError("Failed to load audit logs.");
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    let results = [...logs];
    if (moduleFilter !== "All Modules") results = results.filter(logEntry => logEntry.module === moduleFilter);
    if (actionFilter !== "ALL")         results = results.filter(logEntry => logEntry.action === actionFilter);
    if (roleFilter   !== "All Roles")   results = results.filter(logEntry => logEntry.role   === roleFilter);
    if (search.trim()) {
      const query = search.toLowerCase();
      results = results.filter(logEntry =>
        logEntry.email?.toLowerCase().includes(query)       ||
        logEntry.activity?.toLowerCase().includes(query)    ||
        logEntry.description?.toLowerCase().includes(query)
      );
    }
    if (dateFrom) results = results.filter(logEntry => new Date(logEntry.performedAt) >= new Date(dateFrom));
    if (dateTo)   results = results.filter(logEntry => new Date(logEntry.performedAt) <= new Date(dateTo + "T23:59:59"));
    setFiltered(results);
  }, [logs, moduleFilter, actionFilter, roleFilter, search, dateFrom, dateTo]);

  return (
    <StaffLayout>
      <div className="al-root">

        <div className="al-header">
          <div>
            <h1 className="al-title">Audit Logs</h1>
            <p className="al-subtitle">Complete record of every action performed across the system</p>
          </div>
          <button className="al-btn-refresh" onClick={fetchLogs}>Refresh</button>
        </div>

        {error && <div className="al-error">{error}</div>}

        {/* Filters */}
        <div className="al-filters">
          <input
            className="al-input"
            placeholder="Search by email or activity..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
          <select className="al-select" value={moduleFilter} onChange={event => setModuleFilter(event.target.value)}>
            {MODULES.map(module => <option key={module}>{module}</option>)}
          </select>
          <select className="al-select" value={actionFilter} onChange={event => setActionFilter(event.target.value)}>
            <option value="ALL">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
          <select className="al-select" value={roleFilter} onChange={event => setRoleFilter(event.target.value)}>
            {ROLES.map(role => <option key={role}>{role}</option>)}
          </select>
          <input
            className="al-input al-date"
            type="date"
            value={dateFrom}
            title="From date"
            onChange={event => setDateFrom(event.target.value)}
          />
          <input
            className="al-input al-date"
            type="date"
            value={dateTo}
            title="To date"
            onChange={event => setDateTo(event.target.value)}
          />
          <span className="al-count">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="al-card">
          {isLoading ? (
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
                      <td className="al-when">{formatWhen(log.performedAt)}</td>
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
