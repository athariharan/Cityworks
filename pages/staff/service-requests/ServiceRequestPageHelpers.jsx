// pages/staff/service-requests/ServiceRequestPageHelpers.jsx
// Shared helpers, formatters, and small UI components used by ServiceRequestsPage.

import { useEffect } from "react";
import { STATUS_CFG } from "../../../utility/ServiceRequestConfig";

/** Formats a datetime string as "01 Jan 2024, 10:30 am". */
export function formatDateTime(dateTimeString) {
  if (!dateTimeString) return "—";
  return new Date(dateTimeString).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function StatusBadge({ status }) {
  const statusConfig = STATUS_CFG[status] || { label: status, bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: statusConfig.bg, color: statusConfig.color }}>
      {statusConfig.label}
    </span>
  );
}


export function ImageLightboxModal({ imageUrl, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="srp-img-overlay" onClick={onClose}>
      <div className="srp-img-box" onClick={event => event.stopPropagation()}>
        <button className="srp-img-close" onClick={onClose} title="Close">✕</button>
        <img src={imageUrl} alt="Citizen uploaded evidence" className="srp-img-preview" />
      </div>
    </div>
  );
}
