import { useState } from "react";
import { EMPTY_FORM } from "../../../utility/MaterialConfig";
import { blockInvalidIdKeys, toPositiveInt } from "../../../utility/FormHelpers";

const INT_FIELDS = ["logId", "workOrderId", "quantity"];

function MuField({ label, required, optional, error, children }) {
  return (
    <div className="mu-field">
      <label className="mu-label">
        {label}
        {required && <span className="mu-req"> *</span>}
        {optional && <span className="mu-opt"> (optional)</span>}
      </label>
      {children}
      {error && <span className="mu-err-msg">{error}</span>}
    </div>
  );
}

export default function UsageModal({ initial, workLogs, onSave, onClose, isSaving }) {
  const isEditMode = !!initial?.usageId; // true when editing an existing record

  const [formData, setFormData] = useState(
    isEditMode
      ? {
          logId:        initial.logId        ?? "",
          workOrderId:  initial.workOrderId  ?? "",
          materialName: initial.materialName ?? "",
          quantity:     initial.quantity     ?? "",
          unitCost:     initial.unitCost     ?? "",
          totalCost:    initial.totalCost    ?? "",
        }
      : { ...EMPTY_FORM }
  );
  const [validationErrors, setValidationErrors] = useState({});

  // Auto-populate workOrderId when a work log is chosen from the dropdown
  const handleWorkLogChange = (event) => {
    const selectedLogId  = event.target.value;
    const matchedWorkLog = workLogs.find(workLog => String(workLog.logId) === String(selectedLogId));
    setFormData(previousFormData => ({
      ...previousFormData,
      logId:       selectedLogId,
      workOrderId: matchedWorkLog ? matchedWorkLog.workOrderId ?? "" : previousFormData.workOrderId,
    }));
  };

  // Auto-calculate totalCost whenever quantity or unitCost changes
  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    const sanitised = INT_FIELDS.includes(name) ? toPositiveInt(value) : value;
    setFormData(previousFormData => {
      const updatedFormData = { ...previousFormData, [name]: sanitised };
      if (name === "quantity" || name === "unitCost") {
        const parsedQuantity = parseFloat(name === "quantity" ? sanitised : previousFormData.quantity);
        const parsedUnitCost = parseFloat(name === "unitCost"  ? sanitised : previousFormData.unitCost);
        if (!isNaN(parsedQuantity) && !isNaN(parsedUnitCost)) {
          updatedFormData.totalCost = (parsedQuantity * parsedUnitCost).toFixed(2);
        } else {
          updatedFormData.totalCost = "";
        }
      }
      return updatedFormData;
    });
    setValidationErrors(previousErrors => ({ ...previousErrors, [name]: "" }));
  };

  // Validates all required fields before submission
  const validateForm = () => {
    const formErrors = {};
    if (!formData.logId)                          formErrors.logId        = "Work Log is required.";
    if (!formData.workOrderId)                    formErrors.workOrderId  = "Work Order ID is required.";
    if (!formData.materialName?.trim())           formErrors.materialName = "Material name is required.";
    if (!formData.quantity || Number(formData.quantity) <= 0)
      formErrors.quantity = "Quantity must be > 0.";
    setValidationErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    onSave({
      logId:        Number(formData.logId),
      workOrderId:  Number(formData.workOrderId),
      materialName: formData.materialName.trim(),
      quantity:     Number(formData.quantity),
      unitCost:     formData.unitCost  ? Number(formData.unitCost)  : null,
      totalCost:    formData.totalCost ? Number(formData.totalCost) : null,
    });
  };

  return (
    <div className="mu-modal-overlay" onClick={event => event.target === event.currentTarget && onClose()}>
      <div className="mu-modal">

        <div
          className="mu-modal-header"
          style={{
            background: isEditMode
              ? "linear-gradient(135deg,#1e3a5f,#0d9488)"
              : "linear-gradient(135deg,#1e1b4b,#4f46e5)",
          }}
        >
          <div className="mu-modal-title-row">
            <div className="mu-modal-icon-wrap">
              {isEditMode ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              )}
            </div>
            <div>
              <h2 className="mu-modal-title">
                {isEditMode ? "Edit Material Usage" : "New Material Usage"}
              </h2>
              <p className="mu-modal-sub">
                {isEditMode ? `Editing record #${initial.usageId}` : "Record material consumed on a work log"}
              </p>
            </div>
          </div>
          <button className="mu-modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="mu-modal-body" onSubmit={handleSubmit} noValidate>

          {/* Work Log */}
          <MuField label="Work Log" required error={validationErrors.logId}>
            {workLogs.length > 0 ? (
              <select
                className={`mu-select ${validationErrors.logId ? "mu-input--err" : ""}`}
                name="logId"
                value={formData.logId}
                onChange={handleWorkLogChange}
              >
                <option value="">— Select work log —</option>
                {workLogs.map(workLog => (
                  <option key={workLog.logId} value={workLog.logId}>
                    Log #{workLog.logId} — WO #{workLog.workOrderId ?? "?"} · {workLog.status ?? ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={`mu-input ${validationErrors.logId ? "mu-input--err" : ""}`}
                type="number"
                name="logId"
                min="1"
                step="1"
                placeholder="Enter Work Log ID"
                value={formData.logId}
                onChange={handleFieldChange}
                onKeyDown={blockInvalidIdKeys}
              />
            )}
          </MuField>

          {/* Work Order ID */}
          <MuField label="Work Order ID" required error={validationErrors.workOrderId}>
            <input
              className={`mu-input ${validationErrors.workOrderId ? "mu-input--err" : ""}`}
              type="number"
              name="workOrderId"
              min="1"
              step="1"
              placeholder="e.g. 3"
              value={formData.workOrderId}
              onChange={handleFieldChange}
              onKeyDown={blockInvalidIdKeys}
            />
          </MuField>

          {/* Material Name */}
          <MuField label="Material Name" required error={validationErrors.materialName}>
            <input
              className={`mu-input ${validationErrors.materialName ? "mu-input--err" : ""}`}
              type="text"
              name="materialName"
              placeholder="e.g. PVC Pipe, Concrete Mix"
              value={formData.materialName}
              onChange={handleFieldChange}
            />
          </MuField>

          {/* Quantity */}
          <MuField label="Quantity" required error={validationErrors.quantity}>
            <input
              className={`mu-input ${validationErrors.quantity ? "mu-input--err" : ""}`}
              type="number"
              name="quantity"
              min="1"
              step="1"
              placeholder="e.g. 10"
              value={formData.quantity}
              onChange={handleFieldChange}
              onKeyDown={blockInvalidIdKeys}
            />
          </MuField>

          {/* Unit Cost */}
          <MuField label="Unit Cost (₹)" optional>
            <input
              className="mu-input"
              type="number"
              step="0.01"
              name="unitCost"
              placeholder="e.g. 250.00"
              value={formData.unitCost}
              onChange={handleFieldChange}
            />
          </MuField>

          {/* Total Cost — auto-calculated read-only display */}
          {formData.totalCost && (
            <div className="mu-field mu-field--full">
              <label className="mu-label">Total Cost (auto-calculated)</label>
              <div className="mu-total-display">
                ₹ {Number(formData.totalCost).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}

          <div className="mu-modal-footer">
            <button type="button" className="mu-btn-ghost" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="mu-btn-primary" disabled={isSaving}>
              {isSaving
                ? <><span className="mu-spinner" /> Saving…</>
                : isEditMode ? "Save Changes" : "Create Record"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
