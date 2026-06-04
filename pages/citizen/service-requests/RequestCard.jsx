// pages/citizen/service-requests/RequestCard.jsx
// Single request card with a progress stepper shown on the tracking page.
import { toLabel, formatDateTime, statusPillClass, formatStepDate } from "./ServiceRequestHelpers";
import { STEPS, STATUS_STEP } from "../../../utility/ServiceRequestConfig";
import { ASSET_ICON }         from "../../../utility/AssetIcons";

function getStepIndex(status) {
  return STATUS_STEP[status?.toUpperCase()] ?? 0;
}

export default function RequestCard({ serviceRequest }) {
  const currentStepIndex = getStepIndex(serviceRequest.status);
  const displayStep      = Math.min(currentStepIndex, STEPS.length);
  const fillPercentage   = currentStepIndex === 0 ? 0 : Math.min(100, Math.round((currentStepIndex / (STEPS.length - 1)) * 100));
  const assetIcon        = ASSET_ICON[serviceRequest.assetType] || "🔧";
  const isRejected       = serviceRequest.status?.toUpperCase() === "REJECTED";

  const stepDates = [
    formatStepDate(serviceRequest.reportedAt),
    formatStepDate(serviceRequest.validatedAt),
    formatStepDate(serviceRequest.scheduledAt),
    null,
    null,
  ];

  return (
    <div className="tr-request-block">

      {/* Banner */}
      <div className="tr-banner">
        <div className="tr-banner-icon">{assetIcon}</div>
        <div className="tr-banner-meta">
          <h2>{toLabel(serviceRequest.assetType)}{serviceRequest.assetTag ? ` — ${serviceRequest.assetTag}` : ""}</h2>
          <div className="tr-banner-id">
            Request ID: <strong>#{serviceRequest.requestId}</strong>
          </div>
          <div className="tr-banner-tags">
            <span className="tr-tag tr-tag-green">{toLabel(serviceRequest.assetType)}</span>
            <span className={`tr-tag ${isRejected ? "tr-tag-red" : "tr-tag-violet"}`}>
              {toLabel(serviceRequest.status)}
            </span>
          </div>
        </div>
        <div className="tr-banner-status">
          <div className={`tr-status-pill ${statusPillClass(serviceRequest.status)}`}>
            <span className="tr-sdot" />
            {toLabel(serviceRequest.status)}
          </div>
          <div className="tr-banner-date">
            Submitted: {formatDateTime(serviceRequest.reportedAt)}
          </div>
        </div>
      </div>

      {/* Stepper / Rejected */}
      {isRejected ? (
        <div className="tr-card">
          <div className="tr-ch"><h2>❌ Request Rejected</h2></div>
          <div className="tr-cb">
            <div className="tr-rejected-bar">
              Your request was not approved. Please submit a new request with more details.
            </div>
          </div>
        </div>
      ) : (
        <div className="tr-card">
          <div className="tr-ch">
            <h2>📍 Your Request Progress</h2>
            <span className="tr-tag tr-tag-violet">
              Step {displayStep} of {STEPS.length}
            </span>
          </div>
          <div className="tr-cb">
            <div className="tr-stepper">
              <div className="tr-track">
                <div className="tr-fill" style={{ width: `${fillPercentage}%` }} />
              </div>
              {STEPS.map((step, stepPosition) => {
                const stepDate = stepPosition <= currentStepIndex ? stepDates[stepPosition] : null;
                return (
                  <div
                    key={step.label}
                    className={`tr-step ${stepPosition < currentStepIndex ? "done" : stepPosition === currentStepIndex ? "active" : "next"}`}
                  >
                    <div className="tr-sc">{stepPosition < currentStepIndex ? "✓" : step.icon}</div>
                    <div className="tr-sl">{step.label}</div>
                    {stepDate && <div className="tr-step-date">{stepDate}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
