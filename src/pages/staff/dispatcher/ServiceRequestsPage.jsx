import { useState, useEffect, useCallback } from "react";
import StaffLayout from "../../../components/staff/StaffLayout";
import DispatcherService from "../../../services/DispatcherService";
import CreateWorkOrderModal from "./CreateWorkOrderModal";
import "./ServiceRequestPage.css";

const STATUS_CFG = {
  PENDING:     { label: "Pending",     bg: "#fef3c7", color: "#92400e" },
  VALIDATED:   { label: "Validated",   bg: "#d1fae5", color: "#065f46" },
  REJECTED:    { label: "Rejected",    bg: "#fee2e2", color: "#991b1b" },
  IN_PROGRESS: { label: "In Progress", bg: "#dbeafe", color: "#1e40af" },
  RESOLVED:    { label: "Resolved",    bg: "#d1fae5", color: "#065f46" },
  CLOSED:      { label: "Closed",      bg: "#f1f5f9", color: "#64748b" },
};

const TYPE_ICONS = { ROAD: "🛣️", LIGHT: "💡", PARK: "🌳", UTILITY: "⚡" };

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || { label: status, bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

function fmt(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ServiceRequestsPage() {
  const [activeTab, setActiveTab]       = useState("pending");
  const [requests, setRequests]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [actionId, setActionId]         = useState(null);
  const [toast, setToast]               = useState(null);
  const [modalRequest, setModalRequest] = useState(null);
  const [doneIds, setDoneIds]           = useState(new Set());

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setRequests([]);
    try {
      const res = activeTab === "pending"
        ? await DispatcherService.getPendingRequests()
        : await DispatcherService.getValidatedRequests();
      setRequests(res.data?.data || []);
    } catch {
      showToast("Failed to load requests.", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  const handleValidate = async (id) => {
    setActionId(id);
    try {
      await DispatcherService.validateRequest(id);
      setRequests(r => r.filter(x => x.requestId !== id));
      showToast("Request validated successfully.");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        `Error ${err.response?.status}: Failed to validate request.`;
      showToast(msg, "error");
    } finally { setActionId(null); }
  };

  const handleReject = async (id) => {
    setActionId(id);
    try {
      await DispatcherService.rejectRequest(id);
      setRequests(r => r.filter(x => x.requestId !== id));
      showToast("Request rejected.");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        `Error ${err.response?.status}: Failed to reject request.`;
      showToast(msg, "error");
    } finally { setActionId(null); }
  };

  return (
    <StaffLayout>
      <div className="srp-root">

        <div className="srp-header">
          <div>
            <h1 className="srp-title">Service Requests</h1>
            <p className="srp-subtitle">Triage and validate incoming citizen requests</p>
          </div>
          <button className="srp-btn-refresh" onClick={load}>🔄 Refresh</button>
        </div>

        {toast && <div className={`srp-toast srp-toast--${toast.type}`}>{toast.msg}</div>}

        <div className="srp-tabs">
          {[
            { key: "pending",   label: "📋 Pending"   },
            { key: "validated", label: "✅ Validated" },
          ].map(t => (
            <button
              key={t.key}
              className={`srp-tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              {activeTab === t.key && requests.length > 0 && (
                <span className="srp-tab-count">{requests.length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="srp-card">
          {loading ? (
            <div className="srp-empty"><div className="srp-spinner" /><p>Loading...</p></div>
          ) : requests.length === 0 ? (
            <div className="srp-empty">
              <div style={{ fontSize: 40 }}>{activeTab === "pending" ? "📋" : "✅"}</div>
              <p>No {activeTab} requests found.</p>
            </div>
          ) : (
            <div className="srp-table-wrap">
              <table className="srp-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Asset Tag</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>{activeTab === "pending" ? "Reported At" : "Validated At"}</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.requestId}>
                      <td className="srp-id">#{req.requestId}</td>
                      <td><span className="srp-tag">{req.assetTag || "—"}</span></td>
                      <td className="srp-type">{TYPE_ICONS[req.assetType] || "📦"} {req.assetType || "—"}</td>
                      <td className="srp-desc" title={req.description}>
                        {req.description?.length > 55 ? req.description.slice(0, 55) + "…" : req.description || "—"}
                      </td>
                      <td className="srp-date">{fmt(activeTab === "pending" ? req.reportedAt : req.validatedAt)}</td>
                      <td><StatusBadge status={req.status} /></td>
                      <td className="srp-actions">
                        {activeTab === "pending" ? (
                          <>
                            <button className="srp-btn srp-btn--validate" disabled={actionId === req.requestId} onClick={() => handleValidate(req.requestId)}>
                              {actionId === req.requestId ? "…" : "✓ Validate"}
                            </button>
                            <button className="srp-btn srp-btn--reject" disabled={actionId === req.requestId} onClick={() => handleReject(req.requestId)}>
                              {actionId === req.requestId ? "…" : "✗ Reject"}
                            </button>
                          </>
                        ) : doneIds.has(req.requestId) ? (
                          <span className="srp-badge-done">✔ Work Order Created</span>
                        ) : (
                          <button className="srp-btn srp-btn--workorder" onClick={() => setModalRequest(req)}>
                            🔧 Work Order
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {modalRequest && (
        <CreateWorkOrderModal
          prefilledRequest={modalRequest}
          onClose={() => setModalRequest(null)}
          onSuccess={(msg) => {
            setDoneIds(prev => new Set([...prev, modalRequest.requestId]));
            setModalRequest(null);
            showToast(msg);
          }}
        />
      )}
    </StaffLayout>
  );
}