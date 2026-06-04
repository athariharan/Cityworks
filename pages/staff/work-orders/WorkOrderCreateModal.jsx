// pages/staff/work-orders/WorkOrderCreateModal.jsx
// Modal for creating a work order from a validated service request.
import { useState, useEffect } from "react";
import DispatcherService from "../../../services/DispatcherService";
import "../../../styles/CreateWorkOrderModal.css";
import { PRIORITIES, PRIORITY_LABELS } from "../../../utility/WorkOrderConfig";

function toISO(str) {
  if (!str) return undefined;
  return str.length === 16 ? `${str}:00` : str;
}

// ── Success Screen ─────────────────────────────────────────────
function SuccessScreen({ requestId, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2800);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="cwom-success">
      <p className="cwom-success-title">Work Order Created!</p>
      <p className="cwom-success-sub">
        Request <strong>#{requestId}</strong> has been queued successfully.
      </p>
      <div className="cwom-success-bar">
        <div className="cwom-success-bar-fill" />
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────
export default function WorkOrderCreateModal({ prefilledRequest, onClose, onSuccess }) {
  const [workers,          setWorkers]          = useState([]);
  const [selectedWorkers,  setSelectedWorkers]  = useState([]);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(true);
  const [form, setForm] = useState({
    assetId:        prefilledRequest?.assetId ?? "",
    description:    prefilledRequest?.description || "",
    priority:       "MEDIUM",
    scheduledStart: "",
    scheduledEnd:   "",
  });
  const [errors,    setErrors]    = useState({});
  const [apiError,  setApiError]  = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success,   setSuccess]   = useState(false);

  useEffect(() => {
    DispatcherService.getAllFieldWorkers()
      .then(response => setWorkers(response.data?.data || []))
      .catch(() => {})
      .finally(() => setIsLoadingWorkers(false));
  }, []);

  const setField = (field, value) => {
    setForm(previousForm => ({ ...previousForm, [field]: value }));
    setErrors(previousErrors => ({ ...previousErrors, [field]: "" }));
  };

  const toggleWorker = (workerId) =>
    setSelectedWorkers(previousSelected =>
      previousSelected.includes(workerId)
        ? previousSelected.filter(worker => worker !== workerId)
        : [...previousSelected, workerId]
    );

  const validate = () => {
    const validationErrors = {};
    if (!form.scheduledStart) validationErrors.scheduledStart = "Required";
    if (!form.scheduledEnd)   validationErrors.scheduledEnd   = "Required";
    return validationErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");

    const userId = localStorage.getItem("userId");
    if (!userId || userId === "0") {
      setApiError("Session error: please log out and log back in, then try again.");
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }

    const payload = {
      requestId:              prefilledRequest.requestId,
      assetId:                parseInt(form.assetId),
      description:            form.description.trim() || undefined,
      priority:               form.priority,
      assignedFieldWorkerIds: selectedWorkers,
      scheduledStart:         toISO(form.scheduledStart),
      scheduledEnd:           toISO(form.scheduledEnd),
    };

    try {
      setIsLoading(true);
      await DispatcherService.createWorkOrder(payload);
      setSuccess(true);
    } catch (error) {
      const status    = error.response?.status;
      const serverMsg = error.response?.data?.message || "";
      if (status === 500) {
        setApiError(
          "A work order already exists for this request, or the asset ID is invalid. " +
          "Please use a different validated request."
        );
      } else {
        setApiError(serverMsg || error.response?.data?.error || "Failed to create work order.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cwom-overlay" onClick={event => !success && event.target === event.currentTarget && onClose()}>
      <div className="cwom-dialog">

        {success ? (
          <SuccessScreen requestId={prefilledRequest.requestId} onDone={() => onSuccess("Work order created successfully.")} />
        ) : (
          <>
            <div className="cwom-header">
              <div className="cwom-header-left">
                <div className="cwom-header-icon">🔧</div>
                <div>
                  <p className="cwom-title">Create Work Order</p>
                  <p className="cwom-subtitle">Request #{prefilledRequest.requestId} · {prefilledRequest.assetTag}</p>
                </div>
              </div>
              <button className="cwom-close" onClick={onClose}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="cwom-body">
                {apiError && <div className="cwom-alert cwom-alert--error">{apiError}</div>}

                <div className="cwom-section">
                  <p className="cwom-section-label">Request Details</p>
                  <div className="cwom-info-row">
                    <div className="cwom-info-item">
                      <span className="cwom-info-label">Request ID</span>
                      <span className="cwom-info-value">#{prefilledRequest.requestId}</span>
                    </div>
                    <div className="cwom-info-item">
                      <span className="cwom-info-label">Asset Tag</span>
                      <span className="cwom-info-value">{prefilledRequest.assetTag || "—"}</span>
                    </div>
                    <div className="cwom-info-item">
                      <span className="cwom-info-label">Type</span>
                      <span className="cwom-info-value">{prefilledRequest.assetType || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="cwom-section">
                  <p className="cwom-section-label">Work Order Details</p>
                  <div className="cwom-grid">
                    <div className="cwom-field">
                      <label className="cwom-label">Priority</label>
                      <select className="cwom-select" value={form.priority} onChange={event => setField("priority", event.target.value)}>
                        {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                      </select>
                    </div>
                    <div className="cwom-field">
                      <label className="cwom-label">Scheduled Start <span>*</span></label>
                      <input
                        className={`cwom-input${errors.scheduledStart ? " error" : ""}`}
                        type="datetime-local"
                        value={form.scheduledStart}
                        onChange={event => setField("scheduledStart", event.target.value)}
                      />
                      {errors.scheduledStart && <span className="cwom-error">{errors.scheduledStart}</span>}
                    </div>
                    <div className="cwom-field">
                      <label className="cwom-label">Scheduled End <span>*</span></label>
                      <input
                        className={`cwom-input${errors.scheduledEnd ? " error" : ""}`}
                        type="datetime-local"
                        value={form.scheduledEnd}
                        onChange={event => setField("scheduledEnd", event.target.value)}
                      />
                      {errors.scheduledEnd && <span className="cwom-error">{errors.scheduledEnd}</span>}
                    </div>
                    <div className="cwom-field cwom-field--full">
                      <label className="cwom-label">Description</label>
                      <textarea
                        className="cwom-textarea"
                        rows={3}
                        placeholder="Work order description..."
                        value={form.description}
                        onChange={event => setField("description", event.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="cwom-section">
                  <p className="cwom-section-label">Assign Field Workers</p>
                  {isLoadingWorkers ? (
                    <p className="cwom-loading-text">Loading field workers...</p>
                  ) : workers.length === 0 ? (
                    <p className="cwom-loading-text">No field workers available.</p>
                  ) : (
                    <div className="cwom-workers-grid">
                      {workers.map(worker => (
                        <label
                          key={worker.fieldWorkerId}
                          className={`cwom-worker ${selectedWorkers.includes(worker.fieldWorkerId) ? "selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedWorkers.includes(worker.fieldWorkerId)}
                            onChange={() => toggleWorker(worker.fieldWorkerId)}
                            style={{ display: "none" }}
                          />
                          <span className="cwom-worker-name">{worker.name}</span>
                          <span className="cwom-worker-skill">{worker.skill?.replace(/_/g, " ")}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="cwom-footer">
                <button type="button" className="cwom-btn-cancel" onClick={onClose}>Cancel</button>
                <button type="submit" className="cwom-btn-submit" disabled={isLoading}>
                  {isLoading && <span className="cwom-spinner" />}
                  {isLoading ? "Creating..." : "Create Work Order"}
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
