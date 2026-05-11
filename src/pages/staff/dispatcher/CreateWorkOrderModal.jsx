import { useState, useEffect } from "react";
import DispatcherService from "../../../services/DispatcherService";
import "./CreateWorkOrderModal.css";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const PRIORITY_LABELS = { LOW: "Low", MEDIUM: "Medium", HIGH: "High", CRITICAL: "Critical" };

function toISO(str) {
  if (!str) return undefined;
  return str.length === 16 ? `${str}:00` : str;
}

// ── Success Screen ─────────────────────────────────────────────
function SuccessScreen({ requestId, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="cwom-success">
      <div className="cwom-success-circle">
        <svg className="cwom-check-svg" viewBox="0 0 52 52">
          <circle className="cwom-check-circle" cx="26" cy="26" r="24" />
          <path  className="cwom-check-tick"   d="M14 27 l8 8 l16-18" />
        </svg>
      </div>
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
export default function CreateWorkOrderModal({ prefilledRequest, onClose, onSuccess }) {
  const [workers, setWorkers]          = useState([]);
  const [selectedWorkers, setSelected] = useState([]);
  const [loadingWorkers, setLoadingW]  = useState(true);
  const [form, setForm]                = useState({
    assetId: prefilledRequest?.assetId ?? "",
    description: prefilledRequest?.description || "",
    priority: "MEDIUM", scheduledStart: "", scheduledEnd: "",
  });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    DispatcherService.getAllFieldWorkers()
      .then(res => setWorkers(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoadingW(false));
  }, []);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: "" }));
  };

  const toggleWorker = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);

  const validate = () => {
    const e = {};
    if (!form.scheduledStart) e.scheduledStart = "Required";
    if (!form.scheduledEnd)   e.scheduledEnd   = "Required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setApiErr("");

    const userId = localStorage.getItem("userId");
    if (!userId || userId === "0") {
      setApiErr("Session error: please log out and log back in, then try again.");
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

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
      setLoading(true);
      await DispatcherService.createWorkOrder(payload);
      setSuccess(true);
    } catch (err) {
      const status    = err.response?.status;
      const serverMsg = err.response?.data?.message || "";

      if (status === 500) {
        setApiErr(
          "A work order already exists for this request, or the asset ID is invalid. " +
          "Please use a different validated request."
        );
      } else {
        setApiErr(
          serverMsg ||
          err.response?.data?.error ||
          "Failed to create work order."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDone = () => {
    onSuccess("Work order created successfully.");
  };

  return (
    <div className="cwom-overlay" onClick={e => !success && e.target === e.currentTarget && onClose()}>
      <div className="cwom-dialog">

        {success ? (
          <SuccessScreen requestId={prefilledRequest.requestId} onDone={handleSuccessDone} />
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
                      <select className="cwom-select" value={form.priority} onChange={e => set("priority", e.target.value)}>
                        {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                      </select>
                    </div>
                    <div className="cwom-field">
                      <label className="cwom-label">Scheduled Start <span>*</span></label>
                      <input
                        className={`cwom-input${errors.scheduledStart ? " error" : ""}`}
                        type="datetime-local"
                        value={form.scheduledStart} onChange={e => set("scheduledStart", e.target.value)}
                      />
                      {errors.scheduledStart && <span className="cwom-error">{errors.scheduledStart}</span>}
                    </div>
                    <div className="cwom-field">
                      <label className="cwom-label">Scheduled End <span>*</span></label>
                      <input
                        className={`cwom-input${errors.scheduledEnd ? " error" : ""}`}
                        type="datetime-local"
                        value={form.scheduledEnd} onChange={e => set("scheduledEnd", e.target.value)}
                      />
                      {errors.scheduledEnd && <span className="cwom-error">{errors.scheduledEnd}</span>}
                    </div>
                    <div className="cwom-field cwom-field--full">
                      <label className="cwom-label">Description</label>
                      <textarea
                        className="cwom-textarea" rows={3}
                        placeholder="Work order description..."
                        value={form.description} onChange={e => set("description", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="cwom-section">
                  <p className="cwom-section-label">Assign Field Workers</p>
                  {loadingWorkers ? (
                    <p className="cwom-loading-text">Loading field workers...</p>
                  ) : workers.length === 0 ? (
                    <p className="cwom-loading-text">No field workers available.</p>
                  ) : (
                    <div className="cwom-workers-grid">
                      {workers.map(w => (
                        <label
                          key={w.fieldWorkerId}
                          className={`cwom-worker ${selectedWorkers.includes(w.fieldWorkerId) ? "selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedWorkers.includes(w.fieldWorkerId)}
                            onChange={() => toggleWorker(w.fieldWorkerId)}
                            style={{ display: "none" }}
                          />
                          <span className="cwom-worker-name">{w.name}</span>
                          <span className="cwom-worker-skill">{w.skill?.replace(/_/g, " ")}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="cwom-footer">
                <button type="button" className="cwom-btn-cancel" onClick={onClose}>Cancel</button>
                <button type="submit" className="cwom-btn-submit" disabled={loading}>
                  {loading && <span className="cwom-spinner" />}
                  {loading ? "Creating..." : "Create Work Order"}
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
}