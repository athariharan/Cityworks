// pages/staff/crew/CrewEvidencePage.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import StaffLayout       from "../../../components/staff/StaffLayout";
import WorkOrderService  from "../../../services/WorkOrderService";
import WorkLogService    from "../../../services/WorkLogService";
import DispatcherService from "../../../services/DispatcherService";
import "../../../styles/WorkLogCreatePage.css";
import { STATUS_OPTIONS, STATUS_LABEL, STATUS_LEGEND } from "../../../utility/WorkLogConfig";
import { useToast } from "../../../utility/useToast";

const toISO = value => value ? new Date(value).toISOString() : null;

const Chevron = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

function WlcField({ label, required, hint, style, children }) {
  return (
    <div className="wlc-field" style={style}>
      <label className="wlc-label">
        {label}{required && <span className="wlc-req"> *</span>}
      </label>
      {children}
      {hint && <span className="wlc-hint">{hint}</span>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function CrewEvidencePage() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { userId }  = useSelector(state => state.auth);
  const staffId     = Number(userId);
  const prefilledId = location.state?.workOrderId ?? "";

  const [myOrders,      setMyOrders]      = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [form, setForm] = useState({
    workOrderId: prefilledId, startAt: "", endAt: "", capturedAt: "", status: "COMPLETED",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [isSaving,  setIsSaving]  = useState(false);
  const [success,   setSuccess]   = useState(null);
  const [activeToast, displayToast] = useToast();

  useEffect(() => {
    if (!staffId || isNaN(staffId) || staffId <= 0) return;

    let cancelled = false;

    Promise.allSettled([
      DispatcherService.getFieldWorkerByStaffId(staffId),
      WorkOrderService.getAll(),
    ]).then(([fieldWorkerResponse, workOrderResponse]) => {
      if (cancelled) return;
      const fieldWorker   = fieldWorkerResponse.status === "fulfilled" ? (fieldWorkerResponse.value.data?.data ?? null) : null;
      const fieldWorkerId = fieldWorker?.fieldWorkerId;
      const allOrders     = workOrderResponse.status === "fulfilled" ? (workOrderResponse.value.data?.data ?? []) : [];
      const myAssigned    = fieldWorkerId != null
        ? allOrders.filter(workOrder => workOrder.assignedFieldWorkerIds?.map(Number).includes(Number(fieldWorkerId)))
        : allOrders;
      setMyOrders(myAssigned);
    }).finally(() => { if (!cancelled) setLoadingOrders(false); });

    return () => { cancelled = true; };
  }, [staffId]);

  const handleFieldChange = key => event => setForm(previousForm => ({ ...previousForm, [key]: event.target.value }));

  const handleFile = event => {
    const selectedFile = event.target.files[0] || null;
    setPhotoFile(selectedFile);
    if (selectedFile) {
      const fileReader = new FileReader();
      fileReader.onload = readerEvent => setPreview(readerEvent.target.result);
      fileReader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const clearForm = () => {
    setForm({ workOrderId: "", startAt: "", endAt: "", capturedAt: "", status: "COMPLETED" });
    setPhotoFile(null); setPreview(null); setSuccess(null);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (!form.workOrderId) { displayToast("Please select a Work Order.", "error"); return; }
    if (!form.startAt)     { displayToast("Start Time is required.", "error"); return; }
    if (form.status === "COMPLETED" && !form.endAt) {
      displayToast("End Time is required when status is COMPLETED.", "error"); return;
    }
    if (form.endAt && new Date(form.endAt) < new Date(form.startAt)) {
      displayToast("End Time cannot be before Start Time.", "error"); return;
    }

    const formData = new FormData();
    formData.append("workOrderId", form.workOrderId);
    formData.append("performedBy", staffId);
    formData.append("startAt", toISO(form.startAt));
    if (form.endAt)      formData.append("endAt",      toISO(form.endAt));
    if (form.capturedAt) formData.append("capturedAt", toISO(form.capturedAt));
    formData.append("status", form.status);
    if (photoFile) formData.append("photoFile", photoFile);

    setIsSaving(true);
    try {
      const response      = await WorkLogService.create(formData);
      const logId         = response.data?.data?.logId;
      const successMessage = `Work Log #${logId} created successfully for Work Order #${form.workOrderId}`;
      clearForm();
      setSuccess(successMessage);
      displayToast(successMessage);
    } catch (error) {
      displayToast(error.response?.data?.message || "Failed to create work log. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StaffLayout>
      <div className="wlc-root">

        {/* Hero */}
        <div className="wlc-hero">
          <div className="wlc-hero-blob" />
          <div className="wlc-hero-left">
            <div className="wlc-breadcrumb">
              <span className="wlc-bc-link" onClick={() => navigate("/staff/home")}>Dashboard</span>
              <Chevron />
              <span className="wlc-bc-link" onClick={() => navigate("/staff/crew")}>My Tasks</span>
              <Chevron />
              <span className="wlc-bc-active">Evidence Upload</span>
            </div>
            <h1 className="wlc-title">Upload Evidence</h1>
            <p className="wlc-subtitle">
              Create a work log with photo evidence for a completed or in-progress work order
            </p>
          </div>
        </div>

        <div className="wlc-layout">

          {/* Form Card */}
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

              {/* ── Work Order ── */}
              <div className="wlc-section">
                <div className="wlc-section-head">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>
                  </svg>
                  Work Order
                </div>
                <WlcField label="Select Work Order" required hint="Showing work orders assigned to you">
                  {loadingOrders ? (
                    <div style={{ color: "#94a3b8", fontSize: 13 }}>Loading your work orders…</div>
                  ) : (
                    <select className="wlc-input wlc-select" value={form.workOrderId} onChange={handleFieldChange("workOrderId")}>
                      <option value="">— Select a work order —</option>
                      {myOrders.map(workOrder => (
                        <option key={workOrder.workOrderId} value={workOrder.workOrderId}>
                          #{workOrder.workOrderId} — {workOrder.description?.slice(0, 60) || "No description"} [{STATUS_LABEL[workOrder.status] || workOrder.status}]
                        </option>
                      ))}
                    </select>
                  )}
                </WlcField>
                <WlcField label="Performed By (Staff ID)" hint="Auto-filled from your profile" style={{ marginTop: 14 }}>
                  <input className="wlc-input" type="number" value={staffId} readOnly
                    style={{ background: "#f8fafc", color: "#94a3b8" }} />
                </WlcField>
              </div>

              {/* ── Timeline ── */}
              <div className="wlc-section">
                <div className="wlc-section-head">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Timeline &amp; Status
                </div>
                <div className="wlc-row2">
                  <WlcField label="Start Time" required>
                    <input className="wlc-input" type="datetime-local" value={form.startAt} onChange={handleFieldChange("startAt")} />
                  </WlcField>
                  <WlcField label="End Time" required={form.status === "COMPLETED"}
                    hint={form.status === "COMPLETED" ? "Required when status is COMPLETED" : "Leave blank if still in progress"}>
                    <input className="wlc-input" type="datetime-local" value={form.endAt} onChange={handleFieldChange("endAt")} />
                  </WlcField>
                </div>
                <div className="wlc-row2">
                  <WlcField label="Captured At" hint="When the photo was taken">
                    <input className="wlc-input" type="datetime-local" value={form.capturedAt} onChange={handleFieldChange("capturedAt")} />
                  </WlcField>
                  <WlcField label="Status" required>
                    <select className="wlc-input wlc-select" value={form.status} onChange={handleFieldChange("status")}>
                      {STATUS_OPTIONS.map(statusOption => (
                        <option key={statusOption} value={statusOption}>{statusOption.replace("_", " ")}</option>
                      ))}
                    </select>
                  </WlcField>
                </div>
              </div>

              {/* ── Photo ── */}
              <div className="wlc-section">
                <div className="wlc-section-head">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                  Photo Evidence
                </div>
                <WlcField label="Upload Photo" hint="Optional — JPG or PNG, max 10 MB">
                  <div className="wlc-file-wrap">
                    <label className="wlc-file-label" htmlFor="crew-photo-input">
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
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
                </WlcField>
              </div>

              {/* ── Actions ── */}
              <div className="wlc-actions">
                <button type="submit" className="wlc-btn-primary" disabled={isSaving}>
                  {isSaving ? (
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
                <button type="button" className="wlc-btn-ghost" onClick={clearForm}>Clear Form</button>
              </div>

            </form>
          </div>

          {/* Info Panel */}
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
              {STATUS_LEGEND.map(item => (
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
        {activeToast && (
          <div className={`wlc-toast wlc-toast--${activeToast.toastType}`}>
            {activeToast.toastType === "success"
              ? <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
            }
            {activeToast.message}
          </div>
        )}

      </div>
    </StaffLayout>
  );
}
