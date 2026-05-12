// pages/staff/operations/WorkLogCreatePage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../../components/staff/StaffLayout";
import WorkLogService from "../../../services/WorkLogService";
import "../../../styles/WorkLogCreatePage.css";

const STATUS_OPTIONS = ["IN_PROGRESS", "COMPLETED", "CANCELLED"];
const toInstant = (val) => val ? new Date(val).toISOString() : null;

const EMPTY = {
  workOrderId: "",
  performedBy: "",
  startAt:     "",
  endAt:       "",
  capturedAt:  "",
  status:      "",
};

export default function WorkLogCreatePage() {
  const navigate = useNavigate();

  const [form,      setForm]      = useState(EMPTY);
  const [photoFile, setPhotoFile] = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);
  const [success,   setSuccess]   = useState(null);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const clearForm = () => {
    setForm(EMPTY);
    setPhotoFile(null);
    setPreview(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.workOrderId || !form.performedBy || !form.startAt || !form.status) {
      showToast("Work Order ID, Performed By, Start Time and Status are required.", "error");
      return;
    }

    const fd = new FormData();
    if (photoFile) fd.append("photoFile", photoFile);
    fd.append("workOrderId", form.workOrderId);
    fd.append("performedBy", form.performedBy);
    if (form.startAt)    fd.append("startAt",    toInstant(form.startAt));
    if (form.endAt)      fd.append("endAt",      toInstant(form.endAt));
    if (form.capturedAt) fd.append("capturedAt", toInstant(form.capturedAt));
    fd.append("status", form.status);

    setSaving(true);
    try {
      const res   = await WorkLogService.create(fd);
      const logId = res.data?.data?.logId;
      setSuccess(`Work Log #${logId} created successfully for Work Order #${form.workOrderId}`);
      clearForm();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create work log. Please try again.";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <StaffLayout>
      <div className="wlc-root">

        {/* ── Hero Header ───────────────────────────────────── */}
        <div className="wlc-hero">
          <div className="wlc-hero-blob" />
          <div className="wlc-hero-left">
            <div className="wlc-breadcrumb">
              <span className="wlc-bc-link" onClick={() => navigate("/staff/home")}>Dashboard</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <span className="wlc-bc-link" onClick={() => navigate("/staff/operations")}>Operations</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <span className="wlc-bc-active">Create Work Log</span>
            </div>
            <h1 className="wlc-title">Create Work Log</h1>
            <p className="wlc-subtitle">Log field work activity for a completed or in-progress work order</p>
          </div>
        </div>

        <div className="wlc-layout">

          {/* ── Form Card ──────────────────────────────────── */}
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

              {/* Section: Work Order Info */}
              <div className="wlc-section">
                <div className="wlc-section-head">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                  </svg>
                  Work Order Information
                </div>
                <div className="wlc-row2">
                  <div className="wlc-field">
                    <label className="wlc-label">
                      Work Order ID <span className="wlc-req">*</span>
                    </label>
                    <input
                      name="workOrderId"
                      type="number"
                      min="1"
                      className="wlc-input"
                      placeholder="e.g. 12"
                      value={form.workOrderId}
                      onChange={handleChange}
                    />
                    <span className="wlc-hint">Enter the ID of the work order being logged</span>
                  </div>
                  <div className="wlc-field">
                    <label className="wlc-label">
                      Performed By (Worker ID) <span className="wlc-req">*</span>
                    </label>
                    <input
                      name="performedBy"
                      type="number"
                      min="1"
                      className="wlc-input"
                      placeholder="e.g. 5"
                      value={form.performedBy}
                      onChange={handleChange}
                    />
                    <span className="wlc-hint">Enter the field worker's staff ID</span>
                  </div>
                </div>
              </div>

              {/* Section: Timeline */}
              <div className="wlc-section">
                <div className="wlc-section-head">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Timeline & Status
                </div>
                <div className="wlc-row2">
                  <div className="wlc-field">
                    <label className="wlc-label">
                      Start Time <span className="wlc-req">*</span>
                    </label>
                    <input
                      name="startAt"
                      type="datetime-local"
                      className="wlc-input"
                      value={form.startAt}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="wlc-field">
                    <label className="wlc-label">End Time</label>
                    <input
                      name="endAt"
                      type="datetime-local"
                      className="wlc-input"
                      value={form.endAt}
                      onChange={handleChange}
                    />
                    <span className="wlc-hint">Leave blank if work is still in progress</span>
                  </div>
                </div>
                <div className="wlc-row2">
                  <div className="wlc-field">
                    <label className="wlc-label">Captured At</label>
                    <input
                      name="capturedAt"
                      type="datetime-local"
                      className="wlc-input"
                      value={form.capturedAt}
                      onChange={handleChange}
                    />
                    <span className="wlc-hint">When the evidence/photo was captured</span>
                  </div>
                  <div className="wlc-field">
                    <label className="wlc-label">
                      Status <span className="wlc-req">*</span>
                    </label>
                    <select
                      name="status"
                      className="wlc-input wlc-select"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="">Select status…</option>
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: Evidence */}
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
                    <label className="wlc-file-label" htmlFor="wlc-photo-input">
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      {photoFile ? photoFile.name : "Choose photo file…"}
                    </label>
                    <input
                      id="wlc-photo-input"
                      type="file"
                      accept="image/*"
                      className="wlc-file-input"
                      onChange={handleFileChange}
                    />
                    {photoFile && (
                      <button
                        type="button"
                        className="wlc-file-clear"
                        onClick={() => { setPhotoFile(null); setPreview(null); }}
                      >
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
                    <>
                      <span className="wlc-spinner" />
                      Creating…
                    </>
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

          {/* ── Info Panel ─────────────────────────────────── */}
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
                <li>Always enter the correct <strong>Work Order ID</strong> — the log is linked to that order.</li>
                <li>Set status to <strong>COMPLETED</strong> only when all field work is fully done.</li>
                <li>Use <strong>IN_PROGRESS</strong> if the task is still ongoing — update later.</li>
                <li><strong>End Time</strong> must always be after Start Time.</li>
                <li>Upload a photo as evidence for completed maintenance tasks.</li>
              </ul>
            </div>

            <div className="wlc-status-legend">
              <div className="wlc-legend-header">Status Reference</div>
              {[
                { s: "IN_PROGRESS", bg: "#fef9c3", color: "#854d0e", dot: "#eab308", desc: "Work is still ongoing" },
                { s: "COMPLETED",   bg: "#dcfce7", color: "#166534", dot: "#22c55e", desc: "All work fully done" },
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
            {toast.type === "success" ? (
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              </svg>
            )}
            {toast.msg}
          </div>
        )}

      </div>
    </StaffLayout>
  );
}
