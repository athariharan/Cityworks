// pages/staff/operations/KpiPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../../components/staff/StaffLayout";
import DispatcherService from "../../../services/DispatcherService";
import WorkLogService from "../../../services/WorkLogService";
import "../../../styles/KpiPage.css";

// ── helpers ──────────────────────────────────────────────────────────────────
function pct(num, den) {
  if (!den || den === 0) return 0;
  return Math.min(100, Math.round((num / den) * 100));
}

function avgDays(workOrders) {
  const completed = workOrders.filter(
    w => w.status === "COMPLETED" && w.createdAt && w.scheduledEnd
  );
  if (!completed.length) return null;
  const total = completed.reduce((sum, w) => {
    const ms = new Date(w.scheduledEnd) - new Date(w.createdAt);
    return sum + ms;
  }, 0);
  const days = total / completed.length / (1000 * 60 * 60 * 24);
  return days < 1 ? `${Math.round(days * 24)}h` : `${days.toFixed(1)}d`;
}

function statusColor(status) {
  const m = {
    COMPLETED:   { bg: "#d1fae5", color: "#065f46", dot: "#22c55e" },
    IN_PROGRESS: { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
    NOT_STARTED: { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
    CANCELLED:   { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
  };
  return m[status] || { bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" };
}

// ── small components ──────────────────────────────────────────────────────────
function Ring({ pct: p, color, size = 64 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash  = (p / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="6"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth="6" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
    </svg>
  );
}

function MetricCard({ icon, label, value, sub, pctVal, color, bg }) {
  return (
    <div className="kd-metric-card" style={{ "--accent": color, "--accent-bg": bg }}>
      <div className="kd-metric-top">
        <div className="kd-metric-icon">{icon}</div>
        {pctVal != null && (
          <div className="kd-metric-ring">
            <Ring pct={pctVal} color={color} size={52} />
            <span className="kd-metric-ring-pct" style={{ color }}>{pctVal}%</span>
          </div>
        )}
      </div>
      <div className="kd-metric-val" style={{ color }}>{value}</div>
      <div className="kd-metric-label">{label}</div>
      {sub && <div className="kd-metric-sub">{sub}</div>}
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function KpiPage() {
  const navigate = useNavigate();

  const [pending,    setPending]    = useState([]);
  const [validated,  setValidated]  = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [workLogs,   setWorkLogs]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, vRes, woRes, wlRes] = await Promise.all([
        DispatcherService.getPendingRequests(),
        DispatcherService.getValidatedRequests(),
        DispatcherService.getAllWorkOrders(),
        WorkLogService.getAll(),
      ]);
      setPending(   pRes.data?.data  ?? pRes.data  ?? []);
      setValidated( vRes.data?.data  ?? vRes.data  ?? []);
      setWorkOrders(woRes.data?.data ?? woRes.data ?? []);
      setWorkLogs(  wlRes.data?.data ?? wlRes.data ?? []);
      setLastRefresh(new Date());
    } catch (e) {
      setError("Failed to load KPI data. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── derived metrics ─────────────────────────────────────────────────────────
  const totalRequests  = pending.length + validated.length;
  const completedWOs   = workOrders.filter(w => w.status === "COMPLETED").length;
  const inProgressWOs  = workOrders.filter(w => w.status === "IN_PROGRESS").length;
  const cancelledWOs   = workOrders.filter(w => w.status === "CANCELLED").length;
  const notStartedWOs  = workOrders.filter(w => w.status === "NOT_STARTED").length;

  const validationRate  = pct(validated.length, totalRequests);
  const woCreationRate  = pct(workOrders.length, validated.length);
  const completionRate  = pct(completedWOs, workOrders.length);

  // work log coverage: unique workOrderIds that have at least 1 log
  const coveredWOIds = new Set(workLogs.map(l => l.workOrderId ?? l.work_orderid));
  const wlCoverage   = pct(coveredWOIds.size, workOrders.length);

  const avgTime = avgDays(workOrders);

  // ── per-request journey table ───────────────────────────────────────────────
  // join validated requests with their work orders using requestId
  const journey = validated.map(req => {
    const wo  = workOrders.find(w => String(w.requestId) === String(req.requestId));
    const log = wo ? workLogs.find(l =>
      String(l.workOrderId ?? l.work_orderid) === String(wo.workOrderId)
    ) : null;
    return { req, wo, log };
  });

  // funnel stages
  const funnel = [
    { label: "Requests Received",   count: totalRequests,       color: "#6366f1", icon: "📥" },
    { label: "Validated",           count: validated.length,    color: "#0ea5e9", icon: "✅" },
    { label: "Work Orders Created", count: workOrders.length,   color: "#f59e0b", icon: "🔧" },
    { label: "Completed",           count: completedWOs,        color: "#22c55e", icon: "🏁" },
  ];

  const fmt = (dt) => dt
    ? new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  return (
    <StaffLayout>
      <div className="kd-root">

        {/* ── Hero ── */}
        <div className="kd-hero">
          <div className="kd-hero-blob" />
          <div className="kd-hero-left">
            <div className="kd-breadcrumb">
              <span className="kd-bc-link" onClick={() => navigate("/staff/home")}>Dashboard</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <span className="kd-bc-active">KPI Dashboard</span>
            </div>
            <h1 className="kd-hero-title">KPI Dashboard</h1>
            <p className="kd-hero-sub">
              Live metrics across the full service request lifecycle
            </p>
            {lastRefresh && (
              <p className="kd-hero-refresh">
                Last updated: {lastRefresh.toLocaleTimeString("en-IN")}
              </p>
            )}
          </div>
          <div className="kd-hero-right">
            <button className="kd-refresh-btn" onClick={load} disabled={loading}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"
                viewBox="0 0 24 24" style={{ animation: loading ? "kd-spin 0.8s linear infinite" : "none" }}>
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="kd-error">
            ⚠️ {error}
            <button className="kd-error-retry" onClick={load}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="kd-loading">
            <div className="kd-spinner-big" />
            <p>Loading KPI data…</p>
          </div>
        ) : (
          <div className="kd-body">

            {/* ── Lifecycle Funnel ── */}
            <section className="kd-section">
              <div className="kd-section-title">
                <svg width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                Service Request Lifecycle
              </div>
              <div className="kd-funnel">
                {funnel.map((stage, i) => (
                  <div key={stage.label} className="kd-funnel-stage">
                    <div className="kd-funnel-card" style={{ "--fc": stage.color }}>
                      <span className="kd-funnel-emoji">{stage.icon}</span>
                      <div className="kd-funnel-count" style={{ color: stage.color }}>
                        {stage.count}
                      </div>
                      <div className="kd-funnel-label">{stage.label}</div>
                      {i > 0 && (
                        <div className="kd-funnel-rate">
                          {pct(stage.count, funnel[i-1].count)}% of prev. stage
                        </div>
                      )}
                    </div>
                    {i < funnel.length - 1 && (
                      <div className="kd-funnel-arrow">
                        <svg width="20" height="20" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* ── Metric Cards ── */}
            <section className="kd-section">
              <div className="kd-section-title">
                <svg width="16" height="16" fill="none" stroke="#0ea5e9" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                Efficiency KPIs
              </div>
              <div className="kd-metrics-grid">

                <MetricCard
                  icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
                  label="Validation Rate"
                  value={`${validationRate}%`}
                  sub={`${validated.length} of ${totalRequests} requests validated`}
                  pctVal={validationRate}
                  color="#0ea5e9"
                  bg="#e0f2fe"
                />

                <MetricCard
                  icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                  label="Work Order Creation Rate"
                  value={`${woCreationRate}%`}
                  sub={`${workOrders.length} WOs for ${validated.length} validated requests`}
                  pctVal={woCreationRate}
                  color="#f59e0b"
                  bg="#fef9c3"
                />

                <MetricCard
                  icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                  label="Completion Rate"
                  value={`${completionRate}%`}
                  sub={`${completedWOs} of ${workOrders.length} work orders completed`}
                  pctVal={completionRate}
                  color="#22c55e"
                  bg="#d1fae5"
                />

                <MetricCard
                  icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
                  label="Work Log Coverage"
                  value={`${wlCoverage}%`}
                  sub={`${coveredWOIds.size} of ${workOrders.length} WOs have work logs`}
                  pctVal={wlCoverage}
                  color="#8b5cf6"
                  bg="#ede9fe"
                />

                <MetricCard
                  icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                  label="Avg. Resolution Time"
                  value={avgTime ?? "—"}
                  sub={avgTime ? `Average time to complete a work order` : "No completed work orders yet"}
                  color="#f97316"
                  bg="#fff7ed"
                />

                <MetricCard
                  icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                  label="Pending Requests"
                  value={pending.length}
                  sub={`Awaiting validation by dispatcher`}
                  color="#ef4444"
                  bg="#fee2e2"
                />

              </div>
            </section>

            {/* ── Work Order Status Breakdown ── */}
            <section className="kd-section">
              <div className="kd-section-title">
                <svg width="16" height="16" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M9 21V9"/>
                </svg>
                Work Order Status Breakdown
              </div>
              <div className="kd-status-row">
                {[
                  { label: "Not Started", count: notStartedWOs, color: "#94a3b8", bg: "#f1f5f9" },
                  { label: "In Progress",  count: inProgressWOs,  color: "#3b82f6", bg: "#dbeafe" },
                  { label: "Completed",    count: completedWOs,   color: "#22c55e", bg: "#d1fae5" },
                  { label: "Cancelled",    count: cancelledWOs,   color: "#ef4444", bg: "#fee2e2" },
                ].map(s => (
                  <div key={s.label} className="kd-status-chip" style={{ background: s.bg, color: s.color }}>
                    <span className="kd-status-count">{s.count}</span>
                    <span className="kd-status-label">{s.label}</span>
                    <div className="kd-status-bar-wrap">
                      <div className="kd-status-bar-fill"
                        style={{ width: `${pct(s.count, workOrders.length)}%`, background: s.color }}
                      />
                    </div>
                    <span className="kd-status-pct">{pct(s.count, workOrders.length)}%</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Per-Request Journey Table ── */}
            <section className="kd-section">
              <div className="kd-section-title">
                <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <path d="M9 12h6M9 16h4"/>
                </svg>
                Request Journey Tracker
                <span className="kd-section-count">{journey.length}</span>
              </div>

              {journey.length === 0 ? (
                <div className="kd-table-empty">
                  <div style={{ fontSize: 36 }}>📋</div>
                  <p>No validated requests yet.</p>
                </div>
              ) : (
                <div className="kd-table-wrap">
                  <table className="kd-table">
                    <thead>
                      <tr>
                        <th>Request #</th>
                        <th>Asset Tag</th>
                        <th>Reported</th>
                        <th>Validated</th>
                        <th>Work Order</th>
                        <th>WO Status</th>
                        <th>Work Logged</th>
                        <th>Journey</th>
                      </tr>
                    </thead>
                    <tbody>
                      {journey.map(({ req, wo, log }) => {
                        const sc  = statusColor(wo?.status);
                        const stagesDone = [
                          true,                          // received
                          true,                          // validated
                          !!wo,                          // WO created
                          wo?.status === "COMPLETED",    // completed
                        ];
                        const stagesCount = stagesDone.filter(Boolean).length;
                        return (
                          <tr key={req.requestId}>
                            <td className="kd-td-id">
                              <span className="kd-req-id">#{req.requestId}</span>
                            </td>
                            <td>{req.assetTag || "—"}</td>
                            <td className="kd-td-date">{fmt(req.reportedAt)}</td>
                            <td className="kd-td-date">{fmt(req.validatedAt)}</td>
                            <td className="kd-td-id">
                              {wo ? <span className="kd-wo-id">WO #{wo.workOrderId}</span> : <span className="kd-na">—</span>}
                            </td>
                            <td>
                              {wo ? (
                                <span className="kd-status-badge"
                                  style={{ background: sc.bg, color: sc.color }}>
                                  <span className="kd-badge-dot" style={{ background: sc.dot }}/>
                                  {wo.status.replace("_"," ")}
                                </span>
                              ) : <span className="kd-na">No WO</span>}
                            </td>
                            <td className="kd-td-center">
                              {log ? (
                                <span className="kd-logged-yes">✓ Logged</span>
                              ) : (
                                <span className="kd-logged-no">Not yet</span>
                              )}
                            </td>
                            <td>
                              <div className="kd-journey-steps">
                                {["Received","Validated","WO Created","Completed"].map((step, i) => (
                                  <div key={step}
                                    className={`kd-step ${stagesDone[i] ? "kd-step--done" : "kd-step--pending"}`}
                                    title={step}
                                  />
                                ))}
                                <span className="kd-journey-pct">{stagesCount}/4</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

          </div>
        )}
      </div>
    </StaffLayout>
  );
}
