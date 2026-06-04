// pages/citizen/service-requests/ServiceRequestHelpers.js
// Shared formatters, helpers, and UI components used across all service-request pages.

/** Converts snake_case or UPPER_CASE to Title Case. */
export function toLabel(inputString) {
  return inputString?.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) || "—";
}

/** Returns the CSS modifier class for a status pill. */
export function statusPillClass(status) {
  switch (status?.toUpperCase()) {
    case "PENDING":  return "tr-sp-amber";
    case "REJECTED": return "tr-sp-red";
    case "CLOSED":
    case "RESOLVED": return "tr-sp-green";
    default:         return "tr-sp-blue";
  }
}

/** Formats a date string as "Jan 1, 2024". */
export function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

/** Formats a datetime string as "Jan 1, 2024 · 10:30 AM". */
export function formatDateTime(dateString) {
  if (!dateString) return "—";
  const dateObject = new Date(dateString);
  return (
    dateObject.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " +
    dateObject.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
}

/** Formats a date string for display inside a stepper step, or null if no date. */
export function formatStepDate(dateString) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─── UI Components ────────────────────────────────────────────────────────────

export function SuccessCard({ onGoHome, onSubmitAnother }) {
  return (
    <div className="srf-success-card">
      <div className="srf-success-icon">✅</div>
      <h2 className="srf-success-title">Request Submitted!</h2>
      <p className="srf-success-desc">
        Your request is under review. You'll be notified when it's processed.
      </p>
      <div className="srf-success-actions">
        <button className="srf-btn-primary" onClick={onGoHome}>
          Back to Home
        </button>
        <button className="srf-btn-ghost" onClick={onSubmitAnother}>
          Submit Another
        </button>
      </div>
    </div>
  );
}

/**
 * Inline error message shown when a submission fails.
 * Props:
 *   error — the error string; renders nothing if falsy
 */
export function ErrorMessage({ error }) {
  if (!error) return null;
  return <p className="srf-error">⚠ {error}</p>;
}
