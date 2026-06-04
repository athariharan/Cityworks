import { useState, useEffect } from "react";
import WorkOrderService from "../../../services/WorkOrderService";
import { STATUS_OPTIONS } from "../../../utility/WorkLogConfig";
import { blockInvalidIdKeys, toPositiveInt } from "../../../utility/FormHelpers";

//converts to backend format (ISO)
const toLocal = (value) => {
  if (!value) return "";
  try {
    const parsedDate = new Date(value);
    if (isNaN(parsedDate)) return "";
    const padToTwoDigits = (number) => String(number).padStart(2, "0");
    return (
      `${parsedDate.getFullYear()}-` +
      `${padToTwoDigits(parsedDate.getMonth() + 1)}-` +
      `${padToTwoDigits(parsedDate.getDate())}T` +
      `${padToTwoDigits(parsedDate.getHours())}:` +
      `${padToTwoDigits(parsedDate.getMinutes())}`
    );
  } catch {
    return "";
  }
};

const toInstant = (value) => (value ? new Date(value).toISOString() : null);

const EMPTY = {
  workOrderId: "",
  performedBy: "",
  startAt:     "",
  endAt:       "",
  capturedAt:  "",
  status:      "",
};

export default function WorkLogFormModal({ log, onSave, onClose, isSaving }) {
  const isEditMode = !!log?.logId;

  const [workOrders,      setWorkOrders]      = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(!isEditMode);

  useEffect(() => {
    if (isEditMode) return;
    WorkOrderService.getAll()
      .then(response => {
        const allWorkOrders = response.data?.data ?? [];
        setWorkOrders(allWorkOrders.filter(workOrder => workOrder.status === "IN_PROGRESS"));
      })
      .catch(() => {})
      .finally(() => setIsLoadingOrders(false));
  }, [isEditMode]);

   const [form, setForm] = useState(
    isEditMode
      ? {
          workOrderId: log.workOrderId ?? "",
          performedBy: log.performedBy ?? "",
          startAt:     toLocal(log.startAt),
          endAt:       toLocal(log.endAt),
          capturedAt:  toLocal(log.capturedAt),
          status:      log.status ?? "",
        }
      : { ...EMPTY }
  );
  const [photoFile, setPhotoFile] = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [errors,    setErrors]    = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    const sanitisedValue = name === "performedBy" ? toPositiveInt(value) : value;
    setForm(previousForm => ({ ...previousForm, [name]: sanitisedValue }));
    setErrors(previousErrors => ({ ...previousErrors, [name]: "" }));
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0] || null;
    setPhotoFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => setPreview(readerEvent.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  //checks
  const validate = () => {
    const validationErrors = {};
    if (!isEditMode && !form.workOrderId) validationErrors.workOrderId = "Work Order is required.";
    if (!form.performedBy) validationErrors.performedBy = "Performed By is required.";
    if (!form.startAt)     validationErrors.startAt     = "Start Time is required.";
    if (!form.status)      validationErrors.status      = "Status is required.";
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  //submit
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    if (photoFile) formData.append("photoFile", photoFile);
    formData.append("workOrderId", form.workOrderId);
    formData.append("performedBy", form.performedBy);
    formData.append("startAt",     toInstant(form.startAt));
    if (form.endAt)      formData.append("endAt",      toInstant(form.endAt));
    if (form.capturedAt) formData.append("capturedAt", toInstant(form.capturedAt));
    formData.append("status", form.status);

    // Pass logId for edit, null for create — parent decides which API call to make
    onSave(isEditMode ? log.logId : null, formData);
  };

  return (
    <div
      className="wle-overlay"
      onClick={event => event.target === event.currentTarget && onClose()}
    >
      <div className="wle-modal">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div
          className="wle-header"
          style={{
            background: isEditMode
              ? "linear-gradient(135deg,#1e3a5f,#0d9488)"
              : "linear-gradient(135deg,#1e1b4b,#4f46e5)",
          }}
        >
          <div className="wle-header-left">
            <div className="wle-header-icon">
              {isEditMode ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              )}
            </div>
            <div>
              <h2 className="wle-title">{isEditMode ? "Edit Work Log" : "New Work Log"}</h2>
              <p className="wle-sub">
                {isEditMode
                  ? `Log #${log.logId} · Work Order #${log.workOrderId ?? "—"}`
                  : "Record field work activity for a work order"}
              </p>
            </div>
          </div>
          <button className="wle-close" onClick={onClose} disabled={isSaving}>✕</button>
        </div>

        {/* ── Form body ───────────────────────────────────────────────────── */}
        <form className="wle-body" onSubmit={handleSubmit} noValidate>

          {/* Work Order */}
          <div className="wle-field">
            <label className="wle-label">
              Work Order <span className="wle-req">*</span>
            </label>
            {isEditMode ? (
              // Read-only in edit mode — work order cannot be changed
              <input
                className="wle-input"
                type="text"
                value={`Work Order #${log.workOrderId ?? "—"}`}
                readOnly
                style={{ background: "#f8fafc", color: "#64748b", cursor: "not-allowed" }}
              />
            ) : isLoadingOrders ? (
              <div style={{ color: "#94a3b8", fontSize: 13, padding: "8px 0" }}>Loading work orders…</div>
            ) : (
              <select
                className={`wle-input ${errors.workOrderId ? "wle-input--err" : ""}`}
                name="workOrderId"
                value={form.workOrderId}
                onChange={handleChange}
              >
                <option value="">— Select a work order —</option>
                {workOrders.map(workOrder => (
                  <option key={workOrder.workOrderId} value={workOrder.workOrderId}>
                    #{workOrder.workOrderId} — {workOrder.description?.slice(0, 45) || "No description"} [{workOrder.status?.replace("_", " ")}]
                  </option>
                ))}
              </select>
            )}
            {errors.workOrderId && <span className="wle-err">{errors.workOrderId}</span>}
          </div>

          {/* Performed By + Status */}
          <div className="wle-row2">
            <div className="wle-field">
              <label className="wle-label">Performed By (Staff ID) <span className="wle-req">*</span></label>
              <input
                className={`wle-input ${errors.performedBy ? "wle-input--err" : ""}`}
                type="number"
                name="performedBy"
                min="1"
                step="1"
                placeholder="e.g. 5"
                value={form.performedBy}
                onChange={handleChange}
                onKeyDown={blockInvalidIdKeys}
              />
              {errors.performedBy && <span className="wle-err">{errors.performedBy}</span>}
            </div>

            <div className="wle-field">
              <label className="wle-label">Status <span className="wle-req">*</span></label>
              <select
                className={`wle-input wle-select ${errors.status ? "wle-input--err" : ""}`}
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="">Select status…</option>
                {STATUS_OPTIONS.map(statusOption => (
                  <option key={statusOption} value={statusOption}>{statusOption.replace("_", " ")}</option>
                ))}
              </select>
              {errors.status && <span className="wle-err">{errors.status}</span>}
            </div>
          </div>

          {/* Start + End */}
          <div className="wle-row2">
            <div className="wle-field">
              <label className="wle-label">Start Time <span className="wle-req">*</span></label>
              <input
                className={`wle-input ${errors.startAt ? "wle-input--err" : ""}`}
                type="datetime-local"
                name="startAt"
                value={form.startAt}
                onChange={handleChange}
              />
              {errors.startAt && <span className="wle-err">{errors.startAt}</span>}
            </div>
            <div className="wle-field">
              <label className="wle-label">End Time <span className="wle-opt">(optional)</span></label>
              <input
                className="wle-input"
                type="datetime-local"
                name="endAt"
                value={form.endAt}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Captured At */}
          <div className="wle-field">
            <label className="wle-label">Captured At <span className="wle-opt">(optional)</span></label>
            <input
              className="wle-input"
              type="datetime-local"
              name="capturedAt"
              value={form.capturedAt}
              onChange={handleChange}
            />
          </div>

          {/* Photo */}
          <div className="wle-field">
            <label className="wle-label">
              {isEditMode ? "Replace Photo Evidence" : "Upload Photo"}{" "}
              <span className="wle-opt">(optional)</span>
            </label>
            <div className="wle-file-wrap">
              <label className="wle-file-label" htmlFor="wlf-photo-input">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                {photoFile ? photoFile.name : "Choose photo file…"}
              </label>
              <input
                id="wlf-photo-input"
                type="file"
                accept="image/*"
                className="wle-file-input"
                onChange={handleFileChange}
              />
              {photoFile && (
                <button
                  type="button"
                  className="wle-file-clear"
                  onClick={() => { setPhotoFile(null); setPreview(null); }}
                >
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
            {preview && (
              <div className="wle-preview-wrap">
                <img src={preview} alt="Preview" className="wle-preview-img" />
              </div>
            )}
            {isEditMode && log.photoUri && !photoFile && (
              <p className="wle-hint">A photo is already attached — upload a new one to replace it.</p>
            )}
          </div>

          {/* Footer */}
          <div className="wle-footer">
            <button type="button" className="wle-btn-ghost" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="wle-btn-primary" disabled={isSaving}>
              {isSaving
                ? <><span className="wle-spinner" /> Saving…</>
                : <>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {isEditMode ? "Save Changes" : "Create Work Log"}
                  </>
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
