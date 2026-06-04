// pages/staff/service-requests/ServiceRequestsPage.jsx
// Dispatcher view — triage and validate incoming citizen service requests.

import { useState, useEffect, useCallback } from "react";
import StaffLayout              from "../../../components/staff/StaffLayout";
import DispatcherService        from "../../../services/DispatcherService";
import CreateWorkOrderModal     from "../work-orders/WorkOrderCreateModal";
import "../../../styles/ServiceRequestPage.css";
import { TYPE_ICONS }           from "../../../utility/ServiceRequestConfig";
import { buildPhotoUrl }        from "../../../services/FileService";
import {
  formatDateTime,
  StatusBadge,
  ImageLightboxModal,
} from "./ServiceRequestPageHelpers";
import { useToast }             from "../../../utility/useToast";

const TAB_OPTIONS = [
  { key: "pending",   label: "📋 Pending"   },
  { key: "validated", label: "✅ Validated" },
];

export default function ServiceRequestsPage() {
  const [activeTab,           setActiveTab]           = useState("pending");
  const [serviceRequests,     setServiceRequests]     = useState([]);
  const [isLoading,           setIsLoading]           = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [selectedRequest,     setSelectedRequest]     = useState(null);
  const [completedRequestIds, setCompletedRequestIds] = useState(() => {
    try {
      const userId = localStorage.getItem("userId") || "default";
      const stored = localStorage.getItem(`completed_wo_requests_${userId}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [activeImageUrl,      setActiveImageUrl]      = useState(null);
  const [activeToast, displayToast] = useToast();

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setServiceRequests([]);
    try {
      const response = activeTab === "pending"
        ? await DispatcherService.getPendingRequests()
        : await DispatcherService.getValidatedRequests();
      setServiceRequests(response.data?.data || []);
    } catch {
      displayToast("Failed to load requests.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleValidate = async (requestId) => {
    setProcessingRequestId(requestId);
    try {
      await DispatcherService.validateRequest(requestId);
      setServiceRequests(previousRequests => previousRequests.filter(request => request.requestId !== requestId));
      displayToast("Request validated successfully.");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error   ||
        `Error ${error.response?.status}: Failed to validate request.`;
      displayToast(errorMessage, "error");
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessingRequestId(requestId);
    try {
      await DispatcherService.rejectRequest(requestId);
      setServiceRequests(previousRequests => previousRequests.filter(request => request.requestId !== requestId));
      displayToast("Request rejected.");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error   ||
        `Error ${error.response?.status}: Failed to reject request.`;
      displayToast(errorMessage, "error");
    } finally {
      setProcessingRequestId(null);
    }
  };

  return (
    <StaffLayout>
      <div className="srp-root">

        <div className="srp-header">
          <div>
            <h1 className="srp-title">Service Requests</h1>
            <p className="srp-subtitle">Triage and validate incoming citizen requests</p>
          </div>
          <button className="srp-btn-refresh" onClick={fetchRequests}>🔄 Refresh</button>
        </div>

        {activeToast && (
          <div className={`srp-toast srp-toast--${activeToast.toastType}`}>
            {activeToast.message}
          </div>
        )}

        <div className="srp-tabs">
          {TAB_OPTIONS.map(tabItem => (
            <button
              key={tabItem.key}
              className={`srp-tab ${activeTab === tabItem.key ? "active" : ""}`}
              onClick={() => setActiveTab(tabItem.key)}
            >
              {tabItem.label}
              {activeTab === tabItem.key && serviceRequests.length > 0 && (
                <span className="srp-tab-count">{serviceRequests.length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="srp-card">
          {isLoading ? (
            <div className="srp-empty">
              <div className="srp-spinner" />
              <p>Loading...</p>
            </div>
          ) : serviceRequests.length === 0 ? (
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
                    <th>Photo</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceRequests.map(serviceRequest => (
                    <tr key={serviceRequest.requestId}>
                      <td className="srp-id">#{serviceRequest.requestId}</td>
                      <td><span className="srp-tag">{serviceRequest.assetTag || "—"}</span></td>
                      <td className="srp-type">
                        {TYPE_ICONS[serviceRequest.assetType] || "📦"} {serviceRequest.assetType || "—"}
                      </td>
                      <td className="srp-desc" title={serviceRequest.description}>
                        {serviceRequest.description?.length > 55
                          ? serviceRequest.description.slice(0, 55) + "…"
                          : serviceRequest.description || "—"}
                      </td>
                      <td className="srp-date">
                        {formatDateTime(activeTab === "pending" ? serviceRequest.reportedAt : serviceRequest.validatedAt)}
                      </td>
                      <td>
                        {serviceRequest.photoUri ? (
                          <button
                            className="srp-btn srp-btn--photo"
                            onClick={() => setActiveImageUrl(buildPhotoUrl(serviceRequest.photoUri))}
                            title="View uploaded photo"
                          >
                            🖼 View Image
                          </button>
                        ) : (
                          <span className="srp-no-photo">—</span>
                        )}
                      </td>
                      <td><StatusBadge status={serviceRequest.status} /></td>
                      <td className="srp-actions">
                        {activeTab === "pending" ? (
                          <>
                            <button
                              className="srp-btn srp-btn--validate"
                              disabled={processingRequestId === serviceRequest.requestId}
                              onClick={() => handleValidate(serviceRequest.requestId)}
                            >
                              {processingRequestId === serviceRequest.requestId ? "…" : "✓ Validate"}
                            </button>
                            <button
                              className="srp-btn srp-btn--reject"
                              disabled={processingRequestId === serviceRequest.requestId}
                              onClick={() => handleReject(serviceRequest.requestId)}
                            >
                              {processingRequestId === serviceRequest.requestId ? "…" : "✗ Reject"}
                            </button>
                          </>
                        ) : completedRequestIds.has(serviceRequest.requestId) ? (
                          <span className="srp-badge-done">✔ Work Order Created</span>
                        ) : (
                          <button
                            className="srp-btn srp-btn--workorder"
                            onClick={() => setSelectedRequest(serviceRequest)}
                          >
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

      {selectedRequest && (
        <CreateWorkOrderModal
          prefilledRequest={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSuccess={(message) => {
            const rid = selectedRequest.requestId;
            setCompletedRequestIds(prev => {
              const next = new Set([...prev, rid]);
              try {
                const userId = localStorage.getItem("userId") || "default";
                localStorage.setItem(`completed_wo_requests_${userId}`, JSON.stringify([...next]));
              } catch {}
              return next;
            });
            setSelectedRequest(null);
            displayToast(message);
          }}
        />
      )}

      {activeImageUrl && (
        <ImageLightboxModal imageUrl={activeImageUrl} onClose={() => setActiveImageUrl(null)} />
      )}
    </StaffLayout>
  );
}
