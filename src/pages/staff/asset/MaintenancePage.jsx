// pages/staff/asset/MaintenancePage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAssets } from "../../../context/AssetContext";
import "../../../styles/assetmanager.css";
import StaffLayout from "../../../components/staff/StaffLayout";

const TASK_STATUSES = [
  { value:"Scheduled",   label:"Scheduled",   color:"#1b6e3a", bg:"#dbeafe", dot:"#3fb950" },
  { value:"In_Progress", label:"In Progress",  color:"#7d5a00", bg:"#fff3cc", dot:"#d29922" },
  { value:"Completed",   label:"Completed",    color:"#1a7f37", bg:"#e0f7e4", dot:"#2da44e" },
  { value:"Overdue",     label:"Overdue",      color:"#7f1d1d", bg:"#ffe0e0", dot:"#dc2626" },
  { value:"Cancelled",   label:"Cancelled",    color:"#555",    bg:"#f0f0f0", dot:"#888"    },
];

const INITIAL = { assetTag:"", description:"", scheduledAt:"", status:"", nextDueDate:"" };

function pad(n) { return String(n).padStart(2,"0"); }
function minDatetime() {
  const d = new Date(Date.now() + 60000);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MaintenancePage() {
  const navigate = useNavigate();
  const { addMaintenance } = useAssets();
  const [form,    setForm]    = useState(INITIAL);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedStatus = TASK_STATUSES.find(s => s.value === form.status);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.assetTag || !form.assetTag.trim()) e.assetTag = "Asset tag is required";
    if (!form.scheduledAt) e.scheduledAt = "Scheduled date/time is required";
    else if (new Date(form.scheduledAt) <= new Date()) e.scheduledAt = "Must be a future date and time";
    if (!form.status) e.status = "Status is required";
    if (form.nextDueDate && new Date(form.nextDueDate) < new Date(new Date().toDateString()))
      e.nextDueDate = "Must be today or a future date";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    addMaintenance({
      ...form,
      statusInfo:  TASK_STATUSES.find(s => s.value === form.status),
      submittedAt: new Date().toLocaleString("en-IN"),
    });
    setLoading(false); setSuccess(true);
    setForm(INITIAL);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <StaffLayout>
      <div className="page-wrapper">

        <button className="page-back-btn" onClick={() => navigate("/staff/assets")}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Asset Management
        </button>

        <div className="page-header">
          <div className="header-icon" style={{ background:"#fee2e2", color:"#7c2d12" }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <h1 className="page-title">Maintenance Task</h1>
            <p className="page-sub">Schedule and track preventive maintenance</p>
          </div>
          <button className="page-view-btn" onClick={() => navigate("/staff/assets/maintenance/list")}>
            View All Tasks →
          </button>
        </div>

        {success && (
          <div className="alert alert-success">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
            </svg>
            Task scheduled!
            <span className="alert-link" onClick={() => navigate("/staff/assets/maintenance/list")}>
              View All Tasks →
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="card">
            <div className="card-section-label">Task Details</div>
            <div className="form-grid-2">

              <div className="field">
                <label className="label">Asset Tag <span className="req">*</span></label>
                <input
                  className={`input ${errors.assetTag ? "input-error" : ""}`}
                  name="assetTag" value={form.assetTag} onChange={handleChange}
                  placeholder="e.g. RD-2024-001"
                />
                {errors.assetTag && <span className="err-msg">{errors.assetTag}</span>}
              </div>

              <div className="field">
                <label className="label">Task Status <span className="req">*</span></label>
                <select
                  className={`input ${errors.status ? "input-error" : ""}`}
                  name="status" value={form.status} onChange={handleChange}
                >
                  <option value="">Select status</option>
                  {TASK_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                {errors.status && <span className="err-msg">{errors.status}</span>}
                {selectedStatus && (
                  <span className="status-pill"
                    style={{ background: selectedStatus.bg, color: selectedStatus.color }}>
                    {selectedStatus.label}
                  </span>
                )}
              </div>

              <div className="field">
                <label className="label">Scheduled At <span className="req">*</span></label>
                <input
                  className={`input ${errors.scheduledAt ? "input-error" : ""}`}
                  type="datetime-local" name="scheduledAt"
                  value={form.scheduledAt} onChange={handleChange} min={minDatetime()}
                />
                {errors.scheduledAt
                  ? <span className="err-msg">{errors.scheduledAt}</span>
                  : <span className="hint">Must be a future date and time</span>}
              </div>

              <div className="field">
                <label className="label">Next Due Date</label>
                <input
                  className={`input ${errors.nextDueDate ? "input-error" : ""}`}
                  type="date" name="nextDueDate"
                  value={form.nextDueDate} onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                />
                {errors.nextDueDate
                  ? <span className="err-msg">{errors.nextDueDate}</span>
                  : <span className="hint">Today or a future date</span>}
              </div>

            </div>

            <div className="field mt-16">
              <label className="label">Description</label>
              <textarea
                className="input textarea" name="description" value={form.description}
                onChange={handleChange}
                placeholder="Describe the maintenance work to be performed..." rows={4}
              />
            </div>
          </div>

          <div className="actions">
            <button type="button" className="btn-secondary"
              onClick={() => { setForm(INITIAL); setErrors({}); }}>
              Reset
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"/> Scheduling...</> : "Schedule Task"}
            </button>
          </div>
        </form>

      </div>
    </StaffLayout>
  );
}