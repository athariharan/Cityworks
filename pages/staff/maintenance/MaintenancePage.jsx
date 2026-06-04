// pages/staff/maintenance/MaintenancePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { maintenanceService } from "../../../services/MaintenanceService";
import { assetService }       from "../../../services/AssetService";
import StaffLayout from "../../../components/staff/StaffLayout";
import { TASK_STATUSES, INITIAL } from "../../../utility/MaintenanceConfig";
import { unwrap } from "../../../utility/ApiHelpers";
import "../../../styles/MaintenancePage.css";

function pad(n) { return String(n).padStart(2, "0"); }
function minDatetime() {
  const d = new Date(Date.now() + 60000);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MaintenancePage() {
  const navigate = useNavigate();

  const [form,      setForm]      = useState(INITIAL);
  const [errors,    setErrors]    = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [assets,    setAssets]    = useState([]);

  const [totalTasks,     setTotalTasks]     = useState(0);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    Promise.allSettled([
      assetService.getAll(),
      maintenanceService.getAll(),
    ]).then(([aRes, mRes]) => {
      if (aRes.status === "fulfilled") setAssets(unwrap(aRes.value));
      if (mRes.status === "fulfilled") {
        const list = unwrap(mRes.value);
        setTotalTasks(list.length);
        setScheduledCount(list.filter(task => task.status === "Scheduled" || task.status === "SCHEDULED").length);
      }
    });
  }, []);

  const selectedStatus = TASK_STATUSES.find(s => s.value === form.status);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm(previousForm => ({ ...previousForm, [name]: value }));
    if (errors[name]) setErrors(previousErrors => ({ ...previousErrors, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.assetId)     e.assetId    = "Please select an asset";
    if (!form.status)      e.status     = "Status is required";
    if (!form.scheduledAt) e.scheduledAt = "Scheduled date/time is required";
    else if (new Date(form.scheduledAt) <= new Date()) e.scheduledAt = "Must be a future date and time";
    if (form.nextDueDate && new Date(form.nextDueDate) < new Date(new Date().toDateString()))
      e.nextDueDate = "Must be today or a future date";
    return e;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }
    setIsLoading(true); setSubmitErr("");
    try {
      await maintenanceService.create({
        assetId:     Number(form.assetId),
        description: form.description || null,
        scheduledAt: form.scheduledAt,
        status:      form.status,
        nextDueDate: form.nextDueDate || null,
      });
      const mRes = await maintenanceService.getAll().catch(() => null);
      if (mRes) {
        const list = unwrap(mRes);
        setTotalTasks(list.length);
        setScheduledCount(list.filter(task => task.status === "Scheduled" || task.status === "SCHEDULED").length);
      }
      setSuccess(true);
      setForm(INITIAL);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setSubmitErr(error.response?.data?.message || error.message || "Failed to schedule task. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StaffLayout>
      <div className="mtp-root">

        {/* ── Hero ── */}
        <div className="mtp-hero">
          <div className="mtp-hero-blob" />
          <div className="mtp-hero-blob2" />
          <div className="mtp-hero-left">
            <div className="mtp-breadcrumb">
              <span className="mtp-bc-link" onClick={() => navigate("/staff/home")}>Dashboard</span>
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
              <span className="mtp-bc-link" onClick={() => navigate("/staff/assets")}>Asset Management</span>
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
              <span className="mtp-bc-active">Maintenance Task</span>
            </div>
            <div className="mtp-hero-icon">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <h1 className="mtp-title">Maintenance Task</h1>
            <p className="mtp-subtitle">Schedule and track preventive maintenance for city assets</p>
          </div>
          <div className="mtp-hero-right">
            <button className="mtp-view-btn" onClick={() => navigate("/staff/assets/maintenance/list")}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
              </svg>
              View All Tasks
            </button>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className="mtp-layout">

          {/* ── Left: Form ── */}
          <div>

            {/* Success */}
            {success && (
              <div className="mtp-alert mtp-alert--success" style={{ borderRadius: 12, marginBottom: 16 }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Task scheduled successfully!
                <span className="mtp-alert-link" onClick={() => navigate("/staff/assets/maintenance/list")}>
                  View All Tasks →
                </span>
              </div>
            )}

            {/* Error */}
            {submitErr && (
              <div className="mtp-alert mtp-alert--error" style={{ borderRadius: 12, marginBottom: 16 }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {submitErr}
              </div>
            )}

            <div className="mtp-form-card">
              <form onSubmit={handleSubmit} noValidate>

                {/* ── Section 1: Task Details ── */}
                <div className="mtp-section">
                  <div className="mtp-section-head">
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8"  y1="2" x2="8"  y2="6"/>
                      <line x1="3"  y1="10" x2="21" y2="10"/>
                    </svg>
                    Task Details
                  </div>

                  <div className="mtp-row2">
                    {/* Asset */}
                    <div className="mtp-field">
                      <label className="mtp-label">
                        Asset <span className="mtp-req">*</span>
                      </label>
                      <select
                        className={`mtp-select${errors.assetId ? " mtp-select--error" : ""}`}
                        name="assetId"
                        value={form.assetId}
                        onChange={handleChange}
                      >
                        <option value="">{assets.length ? "Select asset…" : "Loading assets…"}</option>
                        {assets.map(asset => (
                          <option key={asset.assetId || asset.id} value={asset.assetId || asset.id}>
                            {asset.assetTag} — {(asset.type || asset.assetType || "").replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                      {errors.assetId
                        ? <span className="mtp-err">⚠ {errors.assetId}</span>
                        : <span className="mtp-hint">Select the asset to maintain</span>}
                    </div>

                    {/* Status */}
                    <div className="mtp-field">
                      <label className="mtp-label">
                        Task Status <span className="mtp-req">*</span>
                      </label>
                      <select
                        className={`mtp-select${errors.status ? " mtp-select--error" : ""}`}
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                      >
                        <option value="">Select status…</option>
                        {TASK_STATUSES.map(statusOption => (
                          <option key={statusOption.value} value={statusOption.value}>{statusOption.label}</option>
                        ))}
                      </select>
                      {errors.status
                        ? <span className="mtp-err">⚠ {errors.status}</span>
                        : selectedStatus
                          ? (
                            <span className="mtp-status-pill" style={{ background: selectedStatus.bg, color: selectedStatus.color }}>
                              <span className="mtp-status-dot" style={{ background: selectedStatus.color }} />
                              {selectedStatus.label}
                            </span>
                          )
                          : <span className="mtp-hint">Current task status</span>}
                    </div>
                  </div>
                </div>

                {/* ── Section 2: Schedule ── */}
                <div className="mtp-section">
                  <div className="mtp-section-head">
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Schedule
                  </div>

                  <div className="mtp-row2">
                    {/* Scheduled At */}
                    <div className="mtp-field">
                      <label className="mtp-label">
                        Scheduled At <span className="mtp-req">*</span>
                      </label>
                      <input
                        className={`mtp-input${errors.scheduledAt ? " mtp-input--error" : ""}`}
                        type="datetime-local"
                        name="scheduledAt"
                        value={form.scheduledAt}
                        onChange={handleChange}
                        min={minDatetime()}
                      />
                      {errors.scheduledAt
                        ? <span className="mtp-err">⚠ {errors.scheduledAt}</span>
                        : <span className="mtp-hint">Must be a future date and time</span>}
                    </div>

                    {/* Next Due Date */}
                    <div className="mtp-field">
                      <label className="mtp-label">Next Due Date</label>
                      <input
                        className={`mtp-input${errors.nextDueDate ? " mtp-input--error" : ""}`}
                        type="date"
                        name="nextDueDate"
                        value={form.nextDueDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                      />
                      {errors.nextDueDate
                        ? <span className="mtp-err">⚠ {errors.nextDueDate}</span>
                        : <span className="mtp-hint">Set for recurring schedule (optional)</span>}
                    </div>
                  </div>
                </div>

                {/* ── Section 3: Description ── */}
                <div className="mtp-section">
                  <div className="mtp-section-head">
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    Notes
                  </div>
                  <div className="mtp-field">
                    <label className="mtp-label">Description</label>
                    <textarea
                      className="mtp-input mtp-textarea"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe the maintenance work to be performed…"
                      rows={4}
                    />
                    <span className="mtp-hint">Optional — add any relevant details or instructions</span>
                  </div>
                </div>

                {/* ── Actions ── */}
                <div className="mtp-actions">
                  <button
                    type="button"
                    className="mtp-btn-ghost"
                    onClick={() => { setForm(INITIAL); setErrors({}); setSubmitErr(""); }}
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="1 4 1 10 7 10"/>
                      <path d="M3.51 15a9 9 0 1 0 .49-3.1"/>
                    </svg>
                    Reset
                  </button>
                  <button type="submit" className="mtp-btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <><span className="mtp-spinner" /> Scheduling…</>
                    ) : (
                      <>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Schedule Task
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* ── Right: Panel ── */}
          <aside className="mtp-panel">

            {/* Hero KPI */}
            <div className="mtp-panel-hero">            
              <div className="mtp-panel-hero-icon">🛠️</div>
              <div className="mtp-panel-hero-num">{totalTasks}</div>
              <div className="mtp-panel-hero-label">Tasks Scheduled</div>
              <div className="mtp-panel-hero-sub">{scheduledCount} upcoming</div>
            </div>

            {/* Status Guide */}
            <div className="mtp-panel-card">
              <div className="mtp-panel-title">                
                Status Guide
              </div>
              {[
                { dot: "#22c55e", label: "Scheduled",   msg: "Upcoming work"    },
                { dot: "#f59e0b", label: "In Progress",  msg: "Currently active" },
                { dot: "#16a34a", label: "Completed",    msg: "Work done"        },
              ].map(statusGuideItem => (
                <div key={statusGuideItem.label} className="mtp-guide-row">
                  <span className="mtp-guide-dot" style={{ background: statusGuideItem.dot }} />
                  <span className="mtp-guide-label">{statusGuideItem.label}</span>
                  <span className="mtp-guide-msg">{statusGuideItem.msg}</span>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="mtp-panel-card">
              <div className="mtp-panel-title">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Quick Links
              </div>
              <div className="mtp-nav-cards">
                {[
                  { ico: "📋", lbl: "View All Tasks",   path: "/staff/assets/maintenance/list", bg: "#fee2e2" },
                  { ico: "🔍", lbl: "Log Inspection",   path: "/staff/assets/inspections",      bg: "#cffafe" },
                  { ico: "🏗️", lbl: "Register Asset",   path: "/staff/assets/registry",         bg: "#d1fae5" },
                ].map(navItem => (
                  <button key={navItem.path} className="mtp-nav-card" onClick={() => navigate(navItem.path)}>
                    <div className="mtp-nav-card-ico" style={{ background: navItem.bg }}>{navItem.ico}</div>
                    <span className="mtp-nav-card-lbl">{navItem.lbl}</span>
                    <span className="mtp-nav-card-arr">›</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div className="mtp-tip">
              <div className="mtp-tip-title">💡 Tip</div>
              <p>Set a <strong>Next Due Date</strong> to build a recurring schedule for preventive maintenance.</p>
            </div>

          </aside>
        </div>

      </div>
    </StaffLayout>
  );
}
