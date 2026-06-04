import { STATUS_CFG } from "./WorkLogConfig";

export function StatusBadge({ value }) {
  const config = STATUS_CFG[value] || { label: value || "—", bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
  return (
    <span className="wlv-badge" style={{ "--bg": config.bg, "--color": config.color, "--dot": config.dot }}>
      <span className="wlv-badge-dot" />
      {config.label}
    </span>
  );
}

export function UsageBadge({ hasUsage, usageRecords }) {
  if (hasUsage) {
    return (
      <span className="wlv-usage-badge wlv-usage-badge--yes" title={`${usageRecords.length} usage record(s)`}>
        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Recorded ({usageRecords.length})
      </span>
    );
  }
  return (
    <span className="wlv-usage-badge wlv-usage-badge--no">
      <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      Not Recorded
    </span>
  );
}

export function formatDateTime(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export const formatRupees = (n) =>
  n == null ? "—" : `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
