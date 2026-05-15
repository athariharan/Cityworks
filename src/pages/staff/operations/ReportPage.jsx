// pages/staff/operations/ReportPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../../components/staff/StaffLayout";
import DispatcherService from "../../../services/DispatcherService";
import WorkLogService from "../../../services/WorkLogService";
import "../../../styles/ReportPage.css";

// ── helpers ───────────────────────────────────────────────────────────────────
function fmt(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function fmtDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function diffHours(a, b) {
  if (!a || !b) return null;
  const ms = Math.abs(new Date(b) - new Date(a));
  const h  = Math.floor(ms / 3600000);
  const m  = Math.floor((ms % 3600000) / 60000);
  if (h >= 24) return `${Math.floor(h/24)}d ${h%24}h`;
  return `${h}h ${m}m`;
}
const PRIORITY_COLOR = {
  LOW:      { bg: "#f0fdf4", color: "#15803d" },
  MEDIUM:   { bg: "#fefce8", color: "#a16207" },
  HIGH:     { bg: "#fff7ed", color: "#c2410c" },
  CRITICAL: { bg: "#fef2f2", color: "#991b1b" },
};

// ── main page ─────────────────────────────────────────────────────────────────
export default function ReportPage() {
  const navigate = useNavigate();

  const [validated,  setValidated]  = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [workLogs,   setWorkLogs]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [expanded,   setExpanded]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [vRes, woRes, wlRes] = await Promise.all([
        DispatcherService.getValidatedRequests(),
        DispatcherService.getAllWorkOrders(),
        WorkLogService.getAll(),
      ]);
      setValidated( vRes.data?.data  ?? vRes.data  ?? []);
      setWorkOrders(woRes.data?.data ?? woRes.data ?? []);
      setWorkLogs(  wlRes.data?.data ?? wlRes.data ?? []);
    } catch {
      setError("Failed to load report data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Build completed report entries ────────────────────────────────────────
  const reports = workOrders
    .filter(wo => wo.status === "COMPLETED")
    .map(wo => {
      const req  = validated.find(r => String(r.requestId) === String(wo.requestId));
      const logs = workLogs.filter(l =>
        String(l.workOrderId ?? l.work_orderid) === String(wo.workOrderId)
      );
      return { wo, req, logs };
    })
    .filter(r =>
      !search ||
      (r.req?.submittedBy  || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.req?.assetTag     || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.req?.assetType    || "").toLowerCase().includes(search.toLowerCase()) ||
      String(r.wo.workOrderId).includes(search) ||
      String(r.wo.requestId  || "").includes(search)
    );

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  const handlePrint = () => window.print();

  return (
    <StaffLayout>
      <div className="rp-root" id="rp-printable">

        {/* ── Header ── */}
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
            <button className="rp-btn-refresh" onClick={load} disabled={loading}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                style={{ animation: loading ? "rp-spin 0.8s linear infinite" : "none" }}>
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
            <button className="rp-btn-print" onClick={handlePrint}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print / Export
            </button>
          </div>
        </div>

        {/* ── Print Header (only visible when printing) ── */}
        <div className="rp-print-header print-only">
          <h1>Municipal Service — Completion Report</h1>
          <p>Generated on {new Date().toLocaleString("en-IN")} &nbsp;|&nbsp; Total Completed: {reports.length}</p>
        </div>

        {error && (
          <div className="rp-error no-print">⚠️ {error}
            <button onClick={load} style={{ marginLeft: 12, cursor: "pointer" }}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="rp-loading no-print">
            <div className="rp-spinner" />
            <p>Loading report data…</p>
          </div>
        ) : (
          <div className="rp-body">

            {/* ── Summary Bar ── */}
            <div className="rp-summary no-print">
              <div className="rp-summary-chip rp-summary-chip--green">
                <span className="rp-summary-n">{reports.length}</span>
                <span className="rp-summary-l">Completed Tasks</span>
              </div>
              <div className="rp-summary-chip rp-summary-chip--blue">
                <span className="rp-summary-n">
                  {new Set(reports.map(r => r.req?.submittedBy).filter(Boolean)).size}
                </span>
                <span className="rp-summary-l">Citizens Served</span>
              </div>
              <div className="rp-summary-chip rp-summary-chip--purple">
                <span className="rp-summary-n">
                  {new Set(reports.map(r => r.req?.assetType).filter(Boolean)).size}
                </span>
                <span className="rp-summary-l">Asset Types</span>
              </div>
              <div className="rp-summary-chip rp-summary-chip--amber">
                <span className="rp-summary-n">
                  {reports.reduce((s, r) => s + r.logs.length, 0)}
                </span>
                <span className="rp-summary-l">Work Logs</span>
              </div>
            </div>

            {/* ── Search ── */}
            <div className="rp-search-wrap no-print">
              <svg width="15" height="15" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="rp-search"
                placeholder="Search by citizen email, asset tag, asset type or ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="rp-search-clear" onClick={() => setSearch("")}>✕</button>
              )}
            </div>

            {/* ── Empty ── */}
            {reports.length === 0 && (
              <div className="rp-empty">
                <div style={{ fontSize: 40 }}>📋</div>
                <p>{search ? "No completed tasks match your search." : "No completed tasks yet."}</p>
              </div>
            )}

            {/* ── Report Cards ── */}
            <div className="rp-cards">
              {reports.map(({ wo, req, logs }, idx) => {
                const pc    = PRIORITY_COLOR[wo.priority] || { bg: "#f1f5f9", color: "#64748b" };
                const open  = expanded === wo.workOrderId;
                const dur   = diffHours(wo.createdAt, wo.scheduledEnd);

                return (
                  <div key={wo.workOrderId} className={`rp-card ${open ? "rp-card--open" : ""}`}>

                    {/* ── Card Header ── */}
                    <div className="rp-card-header" onClick={() => toggle(wo.workOrderId)}>
                      <div className="rp-card-left">
                        <span className="rp-card-num">#{idx + 1}</span>
                        <div>
                          <div className="rp-card-ids">
                            <span className="rp-card-wo">WO #{wo.workOrderId}</span>
                            {req && <span className="rp-card-req">Request #{req.requestId}</span>}
                          </div>
                          <div className="rp-card-asset">
                            {req?.assetTag
                              ? <><strong>{req.assetTag}</strong> — {(req.assetType || "").replace(/_/g," ")}</>
                              : <span className="rp-na">No asset info</span>
                            }
                          </div>
                        </div>
                      </div>
                      <div className="rp-card-right">
                        {dur && <span className="rp-card-dur">⏱ {dur}</span>}
                        <span className="rp-priority-badge" style={{ background: pc.bg, color: pc.color }}>
                          {wo.priority}
                        </span>
                        <span className="rp-done-badge">✓ Completed</span>
                        <svg className={`rp-chevron ${open ? "rp-chevron--open" : ""}`}
                          width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                    </div>

                    {/* ── Expanded Timeline ── */}
                    {open && (
                      <div className="rp-timeline">

                        {/* Stage 1 — Citizen Request */}
                        <div className="rp-stage">
                          <div className="rp-stage-icon rp-stage-icon--blue">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          </div>
                          <div className="rp-stage-line" />
                          <div className="rp-stage-body">
                            <div className="rp-stage-title">
                              <span className="rp-stage-label rp-stage-label--blue">Step 1</span>
                              Request Submitted by Citizen
                            </div>
                            <div className="rp-stage-grid">
                              <div className="rp-field">
                                <span className="rp-field-lbl">Submitted By</span>
                                <span className="rp-field-val rp-highlight">{req?.submittedBy || "—"}</span>
                              </div>
                              <div className="rp-field">
                                <span className="rp-field-lbl">Reported At</span>
                                <span className="rp-field-val">{fmt(req?.reportedAt)}</span>
                              </div>
                              <div className="rp-field">
                                <span className="rp-field-lbl">Asset Tag</span>
                                <span className="rp-field-val">{req?.assetTag || "—"}</span>
                              </div>
                              <div className="rp-field">
                                <span className="rp-field-lbl">Asset Type</span>
                                <span className="rp-field-val">{(req?.assetType || "—").replace(/_/g," ")}</span>
                              </div>
                              {req?.description && (
                                <div className="rp-field rp-field--full">
                                  <span className="rp-field-lbl">Issue Description</span>
                                  <span className="rp-field-val">{req.description}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stage 2 — Validation */}
                        <div className="rp-stage">
                          <div className="rp-stage-icon rp-stage-icon--indigo">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                              <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                          </div>
                          <div className="rp-stage-line" />
                          <div className="rp-stage-body">
                            <div className="rp-stage-title">
                              <span className="rp-stage-label rp-stage-label--indigo">Step 2</span>
                              Request Validated by Dispatcher
                            </div>
                            <div className="rp-stage-grid">
                              <div className="rp-field">
                                <span className="rp-field-lbl">Validated At</span>
                                <span className="rp-field-val">{fmt(req?.validatedAt)}</span>
                              </div>
                              <div className="rp-field">
                                <span className="rp-field-lbl">Time to Validate</span>
                                <span className="rp-field-val">{diffHours(req?.reportedAt, req?.validatedAt) || "—"}</span>
                              </div>
                              <div className="rp-field">
                                <span className="rp-field-lbl">Request Status</span>
                                <span className="rp-field-val" style={{ color: "#16a34a", fontWeight: 700 }}>
                                  ✓ Validated
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stage 3 — Work Order */}
                        <div className="rp-stage">
                          <div className="rp-stage-icon rp-stage-icon--amber">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                            </svg>
                          </div>
                          <div className="rp-stage-line" />
                          <div className="rp-stage-body">
                            <div className="rp-stage-title">
                              <span className="rp-stage-label rp-stage-label--amber">Step 3</span>
                              Work Order Created
                            </div>
                            <div className="rp-stage-grid">
                              <div className="rp-field">
                                <span className="rp-field-lbl">Work Order ID</span>
                                <span className="rp-field-val" style={{ fontWeight: 700 }}>WO #{wo.workOrderId}</span>
                              </div>
                              <div className="rp-field">
                                <span className="rp-field-lbl">Created At</span>
                                <span className="rp-field-val">{fmt(wo.createdAt)}</span>
                              </div>
                              <div className="rp-field">
                                <span className="rp-field-lbl">Priority</span>
                                <span className="rp-field-val" style={{ color: pc.color, fontWeight: 700 }}>{wo.priority}</span>
                              </div>
                              <div className="rp-field">
                                <span className="rp-field-lbl">Scheduled Start</span>
                                <span className="rp-field-val">{fmt(wo.scheduledStart)}</span>
                              </div>
                              <div className="rp-field">
                                <span className="rp-field-lbl">Scheduled End</span>
                                <span className="rp-field-val">{fmt(wo.scheduledEnd)}</span>
                              </div>
                              {wo.assignedFieldWorkerIds?.length > 0 && (
                                <div className="rp-field">
                                  <span className="rp-field-lbl">Assigned Workers</span>
                                  <span className="rp-field-val">
                                    {wo.assignedFieldWorkerIds.map(id => (
                                      <span key={id} className="rp-worker-chip">Worker #{id}</span>
                                    ))}
                                  </span>
                                </div>
                              )}
                              {wo.description && (
                                <div className="rp-field rp-field--full">
                                  <span className="rp-field-lbl">Work Description</span>
                                  <span className="rp-field-val">{wo.description}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stage 4 — Field Work Logs */}
                        <div className="rp-stage">
                          <div className="rp-stage-icon rp-stage-icon--teal">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                          </div>
                          <div className="rp-stage-line" />
                          <div className="rp-stage-body">
                            <div className="rp-stage-title">
                              <span className="rp-stage-label rp-stage-label--teal">Step 4</span>
                              Field Work Logged
                              {logs.length > 0 && (
                                <span className="rp-log-count">{logs.length} log{logs.length > 1 ? "s" : ""}</span>
                              )}
                            </div>
                            {logs.length === 0 ? (
                              <p className="rp-no-logs">No work logs recorded for this work order.</p>
                            ) : (
                              <div className="rp-logs">
                                {logs.map((log, li) => (
                                  <div key={log.logId ?? li} className="rp-log-entry">
                                    <div className="rp-log-num">Log {li + 1}</div>
                                    <div className="rp-stage-grid">
                                      <div className="rp-field">
                                        <span className="rp-field-lbl">Performed By</span>
                                        <span className="rp-field-val rp-highlight">Worker #{log.performedBy}</span>
                                      </div>
                                      <div className="rp-field">
                                        <span className="rp-field-lbl">Log Status</span>
                                        <span className="rp-field-val" style={{ color: "#16a34a", fontWeight: 700 }}>
                                          {log.status || "—"}
                                        </span>
                                      </div>
                                      <div className="rp-field">
                                        <span className="rp-field-lbl">Work Started</span>
                                        <span className="rp-field-val">{fmt(log.startAt ?? log.start_at)}</span>
                                      </div>
                                      <div className="rp-field">
                                        <span className="rp-field-lbl">Work Ended</span>
                                        <span className="rp-field-val">{fmt(log.endAt ?? log.end_at)}</span>
                                      </div>
                                      <div className="rp-field">
                                        <span className="rp-field-lbl">Duration</span>
                                        <span className="rp-field-val">
                                          {diffHours(log.startAt ?? log.start_at, log.endAt ?? log.end_at) || "—"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Stage 5 — Completed */}
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
                              <div className="rp-field">
                                <span className="rp-field-lbl">Completed On</span>
                                <span className="rp-field-val" style={{ fontWeight: 700, color: "#16a34a" }}>
                                  {fmt(wo.scheduledEnd)}
                                </span>
                              </div>
                              <div className="rp-field">
                                <span className="rp-field-lbl">Total Duration</span>
                                <span className="rp-field-val" style={{ fontWeight: 700 }}>
                                  {diffHours(req?.reportedAt, wo.scheduledEnd) || "—"}
                                </span>
                              </div>
                              <div className="rp-field">
                                <span className="rp-field-lbl">Final Status</span>
                                <span className="rp-completion-badge">✓ COMPLETED</span>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {!open && (
                      <div className="rp-card-preview">
                        <span>👤 {req?.submittedBy || "Unknown citizen"}</span>
                        <span>📅 Reported: {fmtDate(req?.reportedAt)}</span>
                        <span>✅ Completed: {fmtDate(wo.scheduledEnd)}</span>
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
