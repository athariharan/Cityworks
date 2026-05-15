// pages/staff/crew/CrewEvidencePage.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import StaffLayout       from "../../../components/staff/StaffLayout";
import WorkOrderService  from "../../../services/WorkOrderService";
import WorkLogService    from "../../../services/WorkLogService";
import DispatcherService from "../../../services/DispatcherService";
import "../../../styles/WorkLogCreatePage.css";

const STATUS_OPTIONS = ["COMPLETED", "IN_PROGRESS", "CANCELLED"];
const toISO = val => val ? new Date(val).toISOString() : null;

export default function CrewEvidencePage() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { userId } = useSelector(s => s.auth);
  const staffId    = Number(userId);

  const prefilledId = location.state?.workOrderId ?? "";

  const [myOrders,      setMyOrders]      = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [form, setForm] = useState({
    workOrderId: prefilledId,
    startAt:     "",
    endAt:       "",
    capturedAt:  "",
    status:      "COMPLETED",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);
  const [success,   setSuccess]   = useState(null);

  /* ── Load this crew member's assigned work orders ── */
  useEffect(() => {
    Promise.allSettled([
      DispatcherService.getFieldWorkerByStaffId(staffId),
      WorkOrderService.getAll(),
    ]).then(([fwRes, woRes]) => {
      const fw    = fwRes.status === "fulfilled" ? (fwRes.value.data?.data ?? null) : null;
      const fwId  = fw?.fieldWorkerId;
      const all   = woRes.status === "fulfilled" ? (woRes.value.data?.data ?? []) : [];
      const mine  = fwId != null
        ? all.filter(wo => wo.assignedFieldWorkerIds?.map(Number).includes(Number(fwId)))
        : all;
      setMyOrders(mine);
    }).finally(() => setLoadingOrders(false));
  }, [staffId]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFile = e => {
    const f = e.target.files[0] || null;
    setPhotoFile(f);
    if (f) { const r = new FileReader(); r.onload = ev => setPreview(ev.target.result); r.readAsDataURL(f); }
    else setPreview(null);
  };

  const clearForm = () => {
    setForm({ workOrderId: "", startAt: "", endAt: "", capturedAt: "", status: "COMPLETED" });
    setPhotoFile(null); setPreview(null); setSuccess(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.workOrderId) { showToast("Please select a Work Order.", "error"); return; }
    if (!form.startAt)     { showToast("Start Time is required.", "error"); return; }
    if (form.endAt && new Date(form.endAt) < new Date(form.startAt)) {
      showToast("End Time cannot be before Start Time.", "error"); return;
    }

    const fd = new FormData();
    fd.append("workOrderId", form.workOrderId);
    fd.append("performedBy", staffId);
    fd.append("startAt", toISO(form.startAt));
    if (form.endAt)      fd.append("endAt",      toISO(form.endAt));
    if (form.capturedAt) fd.append("capturedAt", toISO(form.capturedAt));
    fd.append("status", form.status);
    if (photoFile) fd.append("photoFile", photoFile);

    setSaving(true);
    try {
      const res   = await WorkLogService.create(fd);
      const logId = res.data?.data?.logId;
      setSuccess(`Work Log #${logId} created successfully for Work Order #${form.workOrderId}`);
      clearForm();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create work log. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const STATUS_LABEL = { NOT_STARTED: "Not Started", IN_PROGRESS: "In Progress", COMPLETED: "Completed", CANCELLED: "Cancelled" };

  return (
    <StaffLayout>
      <div className="wlc-root">

        {/* ── Hero ── */}
        <div className="wlc-hero">
          <div className="wlc-hero-blob" />
          <div className="wlc-hero-left">
            <div className="wlc-breadcrumb">
              <span className="wlc-bc-link" onClick={() => navigate("/staff/home")}>Dashboard</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <span className="wlc-bc-link" onClick={() => navigate("/staff/crew")}>My Tasks</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <span className="wlc-bc-active">Evidence Upload</span>
            </div>
            <h1 className="wlc-title">Upload Evidence</h1>
            <p className="wlc-subtitle">
              Create a work log with photo evidence for a completed or in-progress work order
            </p>
          </div>
        </div>

        <div className="wlc-layout">

          {/* ── Form Card ── */}
          <div className="wlc-form-card">

            {success && (
              <div className="wlc-success-banner">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {success}
                <button className="wlc-success-close" onClick={() => setSuccess(null)}>×</button>
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Work Order */}
              <div className="wlc-section">
                <div className="wlc-section-head">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                  </svg>
                  Work Order
                </div>
                <div className="wlc-field">
                  <label className="wlc-label">
                    Select Work Order <span className="wlc-req">*</span>
                  </label>
                  {loadingOrders ? (
                    <div style={{ color: "#94a3b8", fontSize: 13 }}>Loading your work orders…</div>
                  ) : (
                    <select
                      className="wlc-input wlc-select"
                      name="workOrderId"
                      value={form.workOrderId}
                      onChange={e => setForm(p => ({ ...p, workOrderId: e.target.value }))}
                    >
                      <option value="">— Select a work order —</option>
                      {myOrders.map(wo => (
                        <option key={wo.workOrderId} value={wo.workOrderId}>
                          #{wo.workOrderId} — {wo.description?.slice(0, 60) || "No description"} [{STATUS_LABEL[wo.status] || wo.status}]
                        </option>
                      ))}
                    </select>
                  )}
                  <span className="wlc-hint">Showing work orders assigned to you</span>
                </div>
                <div className="wlc-field" style={{ marginTop: 14 }}>
                  <label className="wlc-label">Performed By (Staff ID)</label>
                  <input className="wlc-input" type="number" value={staffId} readOnly
                    style={{ background: "#f8fafc", color: "#94a3b8" }} />
                  <span className="wlc-hint">Auto-filled from your profile</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="wlc-section">
                <div className="wlc-section-head">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Timeline &amp; Status
                </div>
                <div className="wlc-row2">
                  <div className="wlc-field">
                    <label className="wlc-label">Start Time <span className="wlc-req">*</span></label>
                    <input className="wlc-input" type="datetime-local" name="startAt"
                      value={form.startAt}
                      onChange={e => setForm(p => ({ ...p, startAt: e.target.value }))} />
                  </div>
                  <div className="wlc-field">
                    <label className="wlc-label">End Time</label>
                    <input className="wlc-input" type="datetime-local" name="endAt"
                      value={form.endAt}
                      onChange={e => setForm(p => ({ ...p, endAt: e.target.value }))} />
                    <span className="wlc-hint">Leave blank if still in progress</span>
                  </div>
                </div>
                <div className="wlc-row2">
                  <div className="wlc-field">
                    <label className="wlc-label">Captured At</label>
                    <input className="wlc-input" type="datetime-local" name="capturedAt"
                      value={form.capturedAt}
                      onChange={e => setForm(p => ({ ...p, capturedAt: e.target.value }))} />
                    <span className="wlc-hint">When the photo was taken</span>
                  </div>
                  <div className="wlc-field">
                    <label className="wlc-label">Status <span className="wlc-req">*</span></label>
                    <select className="wlc-input wlc-select" name="status"
                      value={form.status}
                      onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Photo */}
              <div className="wlc-section">
                <div className="wlc-section-head">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  Photo Evidence
                </div>
                <div className="wlc-field">
                  <label className="wlc-label">Upload Photo</label>
                  <div className="wlc-file-wrap">
                    <label className="wlc-file-label" htmlFor="crew-photo-input">
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      {photoFile ? photoFile.name : "Choose photo file…"}
                    </label>
                    <input id="crew-photo-input" type="file" accept="image/*"
                      className="wlc-file-input" onChange={handleFile} />
                    {photoFile && (
                      <button type="button" className="wlc-file-clear"
                        onClick={() => { setPhotoFile(null); setPreview(null); }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  {preview && (
                    <div className="wlc-preview-wrap">
                      <img src={preview} alt="Preview" className="wlc-preview-img" />
                      <div className="wlc-preview-label">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {photoFile?.name}
                      </div>
                    </div>
                  )}
                  <span className="wlc-hint">Optional — JPG or PNG, max 10 MB</span>
                </div>
              </div>

              {/* Actions */}
              <div className="wlc-actions">
                <button type="submit" className="wlc-btn-primary" disabled={saving}>
                  {saving ? (
                    <><span className="wlc-spinner" /> Submitting…</>
                  ) : (
                    <>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Create Work Log
                    </>
                  )}
                </button>
                <button type="button" className="wlc-btn-ghost" onClick={clearForm}>
                  Clear Form
                </button>
              </div>

            </form>
          </div>

          {/* ── Info Panel ── */}
          <div className="wlc-info-panel">
            <div className="wlc-info-card">
              <div className="wlc-info-card-header">
                <div className="wlc-info-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                Guidelines
              </div>
              <ul className="wlc-info-list">
                <li>Select the correct <strong>Work Order</strong> from your assigned list.</li>
                <li>Set status to <strong>COMPLETED</strong> only when all field work is done.</li>
                <li>Use <strong>IN_PROGRESS</strong> if the task is still ongoing.</li>
                <li><strong>End Time</strong> must always be after Start Time.</li>
                <li>Upload a photo as evidence — required for audit purposes.</li>
              </ul>
            </div>

            <div className="wlc-status-legend">
              <div className="wlc-legend-header">Status Reference</div>
              {[
                { s: "COMPLETED",   bg: "#dcfce7", color: "#166534", dot: "#22c55e", desc: "All work fully done" },
                { s: "IN_PROGRESS", bg: "#fef9c3", color: "#854d0e", dot: "#eab308", desc: "Work still ongoing" },
                { s: "CANCELLED",   bg: "#f1f5f9", color: "#475569", dot: "#94a3b8", desc: "Work was cancelled" },
              ].map(item => (
                <div key={item.s} className="wlc-legend-item">
                  <span className="wlc-legend-badge" style={{ background: item.bg, color: item.color }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.dot, display: "inline-block", marginRight: 5 }} />
                    {item.s.replace("_", " ")}
                  </span>
                  <span className="wlc-legend-desc">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Toast */}
        {toast && (
          <div className={`wlc-toast wlc-toast--${toast.type}`}>
            {toast.type === "success"
              ? <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
            }
            {toast.msg}
          </div>
        )}

      </div>
    </StaffLayout>
  );
}
