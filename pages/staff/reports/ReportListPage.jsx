// pages/staff/operations/ReportListPage.jsx
// Full lifecycle completion report — reuses the ReportPage logic
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../../components/staff/StaffLayout";
import DispatcherService from "../../../services/DispatcherService";
import WorkLogService from "../../../services/WorkLogService";
import "../../../styles/ReportListPage.css";
import { PRIORITY_COLOR } from "../../../utility/ReportConfig";

function formatDateTime(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function diffHours(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const ms    = Math.abs(new Date(endDate) - new Date(startDate));
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${minutes}m`;
}
export default function ReportListPage() {
  const navigate = useNavigate();

  const [validated,  setValidated]  = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [workLogs,   setWorkLogs]   = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [expanded,   setExpanded]   = useState(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const [validatedResponse, workOrdersResponse, workLogsResponse] = await Promise.all([
        DispatcherService.getAllRequests(),
        DispatcherService.getAllWorkOrders(),
        WorkLogService.getAll(),
      ]);
      setValidated( validatedResponse.data?.data  ?? validatedResponse.data  ?? []);
      setWorkOrders(workOrdersResponse.data?.data ?? workOrdersResponse.data ?? []);
      setWorkLogs(  workLogsResponse.data?.data   ?? workLogsResponse.data   ?? []);
    } catch {
      setError("Failed to load report data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const reports = workOrders
    .filter(workOrder => workOrder.status === "COMPLETED")
    .map(workOrder => {
      const request = validated.find(record => String(record.requestId) === String(workOrder.requestId));
      const logs    = workLogs.filter(logEntry =>
        String(logEntry.workOrderId ?? logEntry.work_orderid) === String(workOrder.workOrderId)
      );
      return { wo: workOrder, req: request, logs };
    })
    .filter(report =>
      !search ||
      (report.req?.submittedByName || "").toLowerCase().includes(search.toLowerCase()) ||
      (report.req?.assetTag    || "").toLowerCase().includes(search.toLowerCase()) ||
      (report.req?.assetType   || "").toLowerCase().includes(search.toLowerCase()) ||
      String(report.wo.workOrderId).includes(search) ||
      String(report.wo.requestId  || "").includes(search)
    );

  const toggle = (workOrderId) => setExpanded(previousExpanded => previousExpanded === workOrderId ? null : workOrderId);

  return (
    <StaffLayout>
      <div className="rp-root" id="rp-printable">

        {/* Header */}
        <div className="rp-hero no-print">
          <div className="rp-hero-blob" />
          <div className="rp-hero-left">
            <div className="rp-breadcrumb">
              <span className="rp-bc-link" onClick={() => navigate("/staff/home")}>Dashboard</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <span className="rp-bc-link" onClick={() => navigate("/staff/operations")}>Operations</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <span className="rp-bc-active">Completion Report</span>
            </div>
            <h1 className="rp-hero-title">Completion Report</h1>
            <p className="rp-hero-sub">
              Full lifecycle view of every completed service request — from citizen submission to field closure
            </p>
          </div>
          <div className="rp-hero-right">
            <button className="rp-btn-refresh" onClick={fetchReports} disabled={isLoading}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                style={{ animation: isLoading ? "rp-spin 0.8s linear infinite" : "none" }}>
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
            <button className="rp-btn-print" onClick={() => window.print()}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print / Export
            </button>
          </div>
        </div>

        {/* Print header */}
        <div className="rp-print-header print-only">
          <h1>Municipal Service — Completion Report</h1>
          <p>Generated on {new Date().toLocaleString("en-IN")} &nbsp;|&nbsp; Total Completed: {reports.length}</p>
        </div>

        {error && (
          <div className="rp-error no-print">⚠️ {error}
            <button onClick={fetchReports} style={{ marginLeft: 12, cursor: "pointer" }}>Retry</button>
          </div>
        )}

        {isLoading ? (
          <div className="rp-loading no-print">
            <div className="rp-spinner" />
            <p>Loading report data…</p>
          </div>
        ) : (
          <div className="rp-body">

            {/* Summary */}
            <div className="rp-summary no-print">
              <div className="rp-summary-chip rp-summary-chip--green">
                <span className="rp-summary-n">{reports.length}</span>
                <span className="rp-summary-l">Completed Tasks</span>
              </div>
              <div className="rp-summary-chip rp-summary-chip--blue">
                <span className="rp-summary-n">
                  {new Set(reports.map(report => report.req?.submittedByName).filter(Boolean)).size}
                </span>
                <span className="rp-summary-l">Citizens Served</span>
              </div>
              <div className="rp-summary-chip rp-summary-chip--purple">
                <span className="rp-summary-n">
                  {new Set(reports.map(report => report.req?.assetType).filter(Boolean)).size}
                </span>
                <span className="rp-summary-l">Asset Types</span>
              </div>
              <div className="rp-summary-chip rp-summary-chip--amber">
                <span className="rp-summary-n">{reports.reduce((total, report) => total + report.logs.length, 0)}</span>
                <span className="rp-summary-l">Work Logs</span>
              </div>
            </div>

            {/* Search */}
            <div className="rp-search-wrap no-print">
              <svg width="15" height="15" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input className="rp-search"
                placeholder="Search by citizen, asset tag, type or ID…"
                value={search} onChange={event => setSearch(event.target.value)}
              />
              {search && <button className="rp-search-clear" onClick={() => setSearch("")}>✕</button>}
            </div>

            {reports.length === 0 && (
              <div className="rp-empty">
                <div style={{ fontSize: 40 }}>📋</div>
                <p>{search ? "No completed tasks match your search." : "No completed tasks yet."}</p>
              </div>
            )}

            {/* Report Cards */}
            <div className="rp-cards">
              {reports.map(({ wo, req, logs }, index) => {
                const priorityColors = PRIORITY_COLOR[wo.priority] || { bg: "#f1f5f9", color: "#64748b" };
                const isOpen         = expanded === wo.workOrderId;
                const duration       = diffHours(wo.createdAt, wo.scheduledEnd);

                return (
                  <div key={wo.workOrderId} className={`rp-card ${isOpen ? "rp-card--open" : ""}`}>

                    <div className="rp-card-header" onClick={() => toggle(wo.workOrderId)}>
                      <div className="rp-card-left">
                        <span className="rp-card-num">#{index + 1}</span>
                        <div>
                          <div className="rp-card-ids">
                            <span className="rp-card-wo">WO #{wo.workOrderId}</span>
                            {req && <span className="rp-card-req">Request #{req.requestId}</span>}
                          </div>
                          <div className="rp-card-asset">
                            {req?.assetTag
                              ? <><strong>{req.assetTag}</strong> — {(req.assetType || "").replace(/_/g, " ")}</>
                              : <span className="rp-na">No asset info</span>
                            }
                          </div>
                        </div>
                      </div>
                      <div className="rp-card-right">
                        {duration && <span className="rp-card-dur">⏱ {duration}</span>}
                        <span className="rp-priority-badge" style={{ background: priorityColors.bg, color: priorityColors.color }}>
                          {wo.priority}
                        </span>
                        <span className="rp-done-badge">✓ Completed</span>
                        <svg className={`rp-chevron ${isOpen ? "rp-chevron--open" : ""}`}
                          width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="rp-timeline">

                        {/* Step 1 — Citizen Request */}
                        <div className="rp-stage">
                          <div className="rp-stage-icon rp-stage-icon--blue">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                            </svg>
                          </div>
                          <div className="rp-stage-line" />
                          <div className="rp-stage-body">
                            <div className="rp-stage-title">
                              <span className="rp-stage-label rp-stage-label--blue">Step 1</span>
                              Request Submitted by Citizen
                            </div>
                            <div className="rp-stage-grid">
                              <div className="rp-field"><span className="rp-field-lbl">Submitted By</span><span className="rp-field-val rp-highlight">{req?.submittedByName || "—"}</span></div>
                              <div className="rp-field"><span className="rp-field-lbl">Reported At</span><span className="rp-field-val">{formatDateTime(req?.reportedAt)}</span></div>
                              <div className="rp-field"><span className="rp-field-lbl">Asset Tag</span><span className="rp-field-val">{req?.assetTag || "—"}</span></div>
                              <div className="rp-field"><span className="rp-field-lbl">Asset Type</span><span className="rp-field-val">{(req?.assetType || "—").replace(/_/g, " ")}</span></div>
                              {req?.description && (
                                <div className="rp-field rp-field--full"><span className="rp-field-lbl">Issue Description</span><span className="rp-field-val">{req.description}</span></div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Step 2 — Validation */}
                        <div className="rp-stage">
                          <div className="rp-stage-icon rp-stage-icon--indigo">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                          </div>
                          <div className="rp-stage-line" />
                          <div className="rp-stage-body">
                            <div className="rp-stage-title">
                              <span className="rp-stage-label rp-stage-label--indigo">Step 2</span>
                              Request Validated by Dispatcher
                            </div>
                            <div className="rp-stage-grid">
                              <div className="rp-field"><span className="rp-field-lbl">Validated At</span><span className="rp-field-val">{formatDateTime(req?.validatedAt)}</span></div>
                              <div className="rp-field"><span className="rp-field-lbl">Time to Validate</span><span className="rp-field-val">{diffHours(req?.reportedAt, req?.validatedAt) || "—"}</span></div>
                              <div className="rp-field"><span className="rp-field-lbl">Request Status</span><span className="rp-field-val" style={{ color: "#16a34a", fontWeight: 700 }}>✓ Validated</span></div>
                            </div>
                          </div>
                        </div>

                        {/* Step 3 — Work Order */}
                        <div className="rp-stage">
                          <div className="rp-stage-icon rp-stage-icon--amber">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                            </svg>
                          </div>
                          <div className="rp-stage-line" />
                          <div className="rp-stage-body">
                            <div className="rp-stage-title">
                              <span className="rp-stage-label rp-stage-label--amber">Step 3</span>
                              Work Order Created
                            </div>
                            <div className="rp-stage-grid">
                              <div className="rp-field"><span className="rp-field-lbl">Work Order ID</span><span className="rp-field-val" style={{ fontWeight: 700 }}>WO #{wo.workOrderId}</span></div>
                              <div className="rp-field"><span className="rp-field-lbl">Created At</span><span className="rp-field-val">{formatDateTime(wo.createdAt)}</span></div>
                              <div className="rp-field"><span className="rp-field-lbl">Priority</span><span className="rp-field-val" style={{ color: priorityColors.color, fontWeight: 700 }}>{wo.priority}</span></div>
                              <div className="rp-field"><span className="rp-field-lbl">Scheduled Start</span><span className="rp-field-val">{formatDateTime(wo.scheduledStart)}</span></div>
                              <div className="rp-field"><span className="rp-field-lbl">Scheduled End</span><span className="rp-field-val">{formatDateTime(wo.scheduledEnd)}</span></div>
                              {wo.assignedFieldWorkerIds?.length > 0 && (
                                <div className="rp-field"><span className="rp-field-lbl">Assigned Workers</span>
                                  <span className="rp-field-val">{wo.assignedFieldWorkerIds.map(workerId => (
                                    <span key={workerId} className="rp-worker-chip">Worker #{workerId}</span>
                                  ))}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Step 4 — Work Logs */}
                        <div className="rp-stage">
                          <div className="rp-stage-icon rp-stage-icon--teal">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                          </div>
                          <div className="rp-stage-line" />
                          <div className="rp-stage-body">
                            <div className="rp-stage-title">
                              <span className="rp-stage-label rp-stage-label--teal">Step 4</span>
                              Field Work Logged
                              {logs.length > 0 && <span className="rp-log-count">{logs.length} log{logs.length > 1 ? "s" : ""}</span>}
                            </div>
                            {logs.length === 0 ? (
                              <p className="rp-no-logs">No work logs recorded for this work order.</p>
                            ) : (
                              <div className="rp-logs">
                                {logs.map((logEntry, logIndex) => (
                                  <div key={logEntry.logId ?? logIndex} className="rp-log-entry">
                                    <div className="rp-log-num">Log {logIndex + 1}</div>
                                    <div className="rp-stage-grid">
                                      <div className="rp-field"><span className="rp-field-lbl">Performed By</span><span className="rp-field-val rp-highlight">{logEntry.performedByName || `Worker #${logEntry.performedBy}`}</span></div>
                                      <div className="rp-field"><span className="rp-field-lbl">Log Status</span><span className="rp-field-val" style={{ color: "#16a34a", fontWeight: 700 }}>{logEntry.status || "—"}</span></div>
                                      <div className="rp-field"><span className="rp-field-lbl">Work Started</span><span className="rp-field-val">{formatDateTime(logEntry.startAt ?? logEntry.start_at)}</span></div>
                                      <div className="rp-field"><span className="rp-field-lbl">Work Ended</span><span className="rp-field-val">{formatDateTime(logEntry.endAt ?? logEntry.end_at)}</span></div>
                                      <div className="rp-field"><span className="rp-field-lbl">Duration</span><span className="rp-field-val">{diffHours(logEntry.startAt ?? logEntry.start_at, logEntry.endAt ?? logEntry.end_at) || "—"}</span></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Step 5 — Completed */}
                        <div className="rp-stage rp-stage--last">
                          <div className="rp-stage-icon rp-stage-icon--green">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </div>
                          <div className="rp-stage-body">
                            <div className="rp-stage-title">
                              <span className="rp-stage-label rp-stage-label--green">Step 5</span>
                              Task Completed ✓
                            </div>
                            <div className="rp-stage-grid">
                              <div className="rp-field"><span className="rp-field-lbl">Completed On</span><span className="rp-field-val" style={{ fontWeight: 700, color: "#16a34a" }}>{formatDateTime(wo.scheduledEnd)}</span></div>
                              <div className="rp-field"><span className="rp-field-lbl">Total Duration</span><span className="rp-field-val" style={{ fontWeight: 700 }}>{diffHours(req?.reportedAt, wo.scheduledEnd) || "—"}</span></div>
                              <div className="rp-field"><span className="rp-field-lbl">Final Status</span><span className="rp-completion-badge">✓ COMPLETED</span></div>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {!isOpen && (
                      <div className="rp-card-preview">
                        <span>👤 {req?.submittedByName || "Unknown citizen"}</span>
                        <span>📅 Reported: {formatDate(req?.reportedAt)}</span>
                        <span>✅ Completed: {formatDate(wo.scheduledEnd)}</span>
                        <span>📋 {logs.length} work log{logs.length !== 1 ? "s" : ""}</span>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>
    </StaffLayout>
  );
}
