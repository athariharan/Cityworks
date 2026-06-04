// pages/staff/work-logs/WorkLogsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate }         from "react-router-dom";
import StaffLayout             from "../../../components/staff/StaffLayout";
import WorkLogService          from "../../../services/WorkLogService";
import MaterialUsageService    from "../../../services/MaterialUsageService";
import "../../../styles/WorkLogsViewPage.css";
import { STATUS_FILTERS }                          from "../../../utility/WorkLogConfig";
import { StatusBadge, UsageBadge, formatDateTime } from "../../../utility/WorkLogHelpers";
import { unwrap }              from "../../../utility/ApiHelpers";
import WorkLogDetailPanel      from "./WorkLogDetailPanel";
import WorkLogFormModal        from "./WorkLogFormModal";
import { useToast }            from "../../../utility/useToast";

export default function WorkLogsViewPage() {
  const navigate = useNavigate();

  const [logs,        setLogs]        = useState([]);
  const [usages,      setUsages]      = useState([]);
  const [isLoading,   setIsLoading]   = useState(false);
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState("ALL");
  const [usageFilter, setUsageFilter] = useState("ALL");
  const [selected,    setSelected]    = useState(null);
  const [activeModal, setActiveModal] = useState(null); 
  const [isSaving,    setIsSaving]    = useState(false);
  const [activeToast, displayToast]   = useToast();

  const fetchWorkLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const [workLogResult, materialUsageResult] = await Promise.allSettled([
        WorkLogService.getAll(),
        MaterialUsageService.getAll(),
      ]);
      setLogs(workLogResult.status       === "fulfilled" ? unwrap(workLogResult.value)       : []);
      setUsages(materialUsageResult.status === "fulfilled" ? unwrap(materialUsageResult.value) : []);
    } catch {
      displayToast("Failed to load data.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorkLogs(); }, [fetchWorkLogs]);

  // Build a map of logId → [usageRecords] for quick lookup in the table
  const usageMap = usages.reduce((accumulator, usageRecord) => {
    if (!accumulator[usageRecord.logId]) accumulator[usageRecord.logId] = [];
    accumulator[usageRecord.logId].push(usageRecord);
    return accumulator;
  }, {});

  // Stats for the hero chips
  const total       = logs.length;
  const completed   = logs.filter(workLog => workLog.status === "COMPLETED").length;
  const inProg      = logs.filter(workLog => workLog.status === "IN_PROGRESS").length;
  const recorded    = logs.filter(workLog => (usageMap[workLog.logId] ?? []).length > 0).length;
  const notRecorded = total - recorded;

  const statusCounts = logs.reduce((accumulator, workLog) => {
    accumulator[workLog.status] = (accumulator[workLog.status] || 0) + 1;
    return accumulator;
  }, {});

  const USAGE_FILTERS = [
    { key: "ALL",      label: "All Logs",         count: total },
    { key: "RECORDED", label: "Usage Recorded",   count: recorded },
    { key: "PENDING",  label: "Not Yet Recorded", count: notRecorded },
  ];

  // Apply status, usage, and search filters to produce the visible rows
  const visible = logs.filter(workLog => {
    const matchStatus = filter === "ALL" || workLog.status === filter;
    const hasUsage    = (usageMap[workLog.logId] ?? []).length > 0;
    const matchUsage  = usageFilter === "ALL"
      || (usageFilter === "RECORDED" && hasUsage)
      || (usageFilter === "PENDING"  && !hasUsage);
    const query        = search.trim().toLowerCase();
    const matchSearch  = !query
      || String(workLog.logId).includes(query)
      || String(workLog.workOrderId ?? "").includes(query)
      || String(workLog.performedBy ?? "").includes(query);
    return matchStatus && matchUsage && matchSearch;
  });

  const handleAddUsage = (workLog) => {
    navigate("/staff/materials", {
      state: { prefillLogId: workLog.logId, prefillWoId: workLog.workOrderId },
    });
  };

  
  const handleSave = async (logId, formData) => {
    setIsSaving(true);
    try {
      if (logId) {
        // Edit — patch the list in place so the table updates immediately
        const response = await WorkLogService.update(logId, formData);
        const updatedLog = response.data?.data ?? {};
        setLogs(previousLogs =>
          previousLogs.map(workLog =>
            workLog.logId === logId ? { ...workLog, ...updatedLog } : workLog
          )
        );
        setSelected(previousSelected =>
          previousSelected?.logId === logId
            ? { ...previousSelected, ...updatedLog }
            : previousSelected
        );
        displayToast("Work log updated successfully.");
      } else {
        // Create — refresh the full list so the new log appears with its server-assigned ID
        await WorkLogService.create(formData);
        displayToast("Work log created successfully.");
        fetchWorkLogs();
      }
      setActiveModal(null);
    } catch (error) {
      const message = error.response?.data?.message || "Save failed. Please try again.";
      displayToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StaffLayout>
      <div className="wlv-root">

        {/* ── Hero ── */}
        <div className="wlv-hero">
          <div className="wlv-hero-content">
            <div>
              <div className="wlv-hero-breadcrumb">Dashboard · Operations · Work Logs</div>
              <h1 className="wlv-hero-title">Work Logs</h1>
              <p className="wlv-hero-sub">Create, view and update work logs — track material usage for each</p>
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

        {activeToast && (
          <div className={`wlv-toast wlv-toast--${activeToast.toastType}`}>{activeToast.message}</div>
        )}

        {/* ── Usage filter pills ── */}
        <div className="wlv-usage-pills">
          {USAGE_FILTERS.map(filterItem => (
            <button
              key={filterItem.key}
              className={`wlv-usage-pill ${usageFilter === filterItem.key ? "active" : ""}`}
              onClick={() => setUsageFilter(filterItem.key)}
            >
              {filterItem.key === "RECORDED" && <span className="wlv-pill-dot wlv-pill-dot--green" />}
              {filterItem.key === "PENDING"  && <span className="wlv-pill-dot wlv-pill-dot--amber" />}
              {filterItem.label}
              <span className="wlv-pill-count">{filterItem.count}</span>
            </button>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="wlv-toolbar">
          <div className="wlv-search-wrap">
            
            <input
              className="wlv-search-input"
              placeholder="Search by Log ID, Work Order ID, Staff ID…"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
            {search && <button className="wlv-search-clear" onClick={() => setSearch("")}>✕</button>}
          </div>

          <div className="wlv-status-filters">
            {STATUS_FILTERS.map(filterItem => (
              <button
                key={filterItem.key}
                className={`wlv-filter-btn ${filter === filterItem.key ? "active" : ""}`}
                onClick={() => setFilter(filterItem.key)}
              >
                {filterItem.label}
                {(filterItem.key === "ALL" ? logs.length : statusCounts[filterItem.key]) > 0 && (
                  <span className="wlv-filter-count">
                    {filterItem.key === "ALL" ? logs.length : statusCounts[filterItem.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button className="wlv-btn-new" onClick={() => setActiveModal("new")}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            New Work Log
          </button>

          <button className="wlv-btn-refresh" onClick={fetchWorkLogs} disabled={isLoading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Table ── */}
        <div className="wlv-card">
          {isLoading ? (
            <div className="wlv-empty">
              <div className="wlv-spinner" /><p>Loading work logs…</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="wlv-empty">
              <div className="wlv-empty-icon">📋</div>
              <p>{search || filter !== "ALL" || usageFilter !== "ALL"
                ? "No logs match your filter."
                : "No work logs yet."}
              </p>
              {!search && filter === "ALL" && usageFilter === "ALL" && (
                <button className="wlv-btn-new" onClick={() => setActiveModal("new")}>
                  + Create First Work Log
                </button>
              )}
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
                  {visible.map(workLog => {
                    const logUsages = usageMap[workLog.logId] ?? [];
                    const hasUsage  = logUsages.length > 0;
                    return (
                      <tr key={workLog.logId} className={`wlv-row ${!hasUsage ? "wlv-row--warn" : ""}`}>
                        <td className="wlv-td-ids">
                          <span className="wlv-log-id">Log #{workLog.logId}</span>
                          <span className="wlv-wo-sub">WO #{workLog.workOrderId ?? "—"}</span>
                        </td>
                        <td className="wlv-td-plain">#{workLog.performedBy ?? "—"}</td>
                        <td><StatusBadge value={workLog.status} /></td>
                        <td className="wlv-td-date">{formatDateTime(workLog.startAt)}</td>
                        <td><UsageBadge hasUsage={hasUsage} usageRecords={logUsages} /></td>
                        <td className="wlv-td-actions">
                          <button className="wlv-btn-view" onClick={() => setSelected(workLog)}>
                            Details
                          </button>
                          <button className="wlv-btn-edit" onClick={() => setActiveModal(workLog)}>
                            Edit
                          </button>
                          {!hasUsage && (
                            <button className="wlv-btn-add-usage" onClick={() => handleAddUsage(workLog)}>
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
        <WorkLogDetailPanel
          log={selected}
          usageRecords={usageMap[selected.logId] ?? []}
          onClose={() => setSelected(null)}
          onAddUsage={handleAddUsage}
        />
      )}

      {activeModal && (
        <WorkLogFormModal
          log={activeModal === "new" ? null : activeModal}
          onSave={handleSave}
          onClose={() => setActiveModal(null)}
          isSaving={isSaving}
        />
      )}
    </StaffLayout>
  );
}
