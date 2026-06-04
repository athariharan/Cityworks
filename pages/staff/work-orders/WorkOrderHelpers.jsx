// pages/staff/work-orders/WorkOrderHelpers.jsx
// Shared helper components and date formatters for the Work Orders module.
import { STATUS_CFG, PRIORITY_CFG } from "../../../utility/WorkOrderConfig";

/** Coloured pill with a leading dot — used to show status or priority at a glance. */
export function Badge({ cfg, value }) {
  const config = cfg[value] || { label: value || "—", bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" };
  return (
    <span className="wop-badge" style={{ "--bg": config.bg, "--color": config.color, "--dot": config.dot }}>
      <span className="wop-badge-dot" />
      {config.label}
    </span>
  );
}

/** Format a datetime string to "DD Mon YYYY, HH:MM". */
export function fmt(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/** Format a date string to "DD Mon YYYY" (date only, no time). */
export function fmtShort(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
