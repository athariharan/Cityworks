export const STATUS_CFG = {
  PENDING:     { label: "Pending",     bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  IN_PROGRESS: { label: "In Progress", bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  COMPLETED:   { label: "Completed",   bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
  FAILED:      { label: "Failed",      bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
};

export const STATUS_OPTIONS = ["IN_PROGRESS", "COMPLETED", "CANCELLED"];

export const STATUS_FILTERS = [
  { key: "ALL",         label: "All" },
  { key: "PENDING",     label: "Pending" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED",   label: "Completed" },
];

export const EMPTY = {
  workOrderId: "",
  performedBy: "",
  startAt:     "",
  endAt:       "",
  capturedAt:  "",
  status:      "",
};

// Quick label lookup: STATUS_LABEL[wo.status] → "In Progress"
export const STATUS_LABEL = {
  PENDING:     "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED:   "Completed",
  FAILED:      "Failed",
  CANCELLED:   "Cancelled",
};

// Legend array for status reference panels
export const STATUS_LEGEND = [
  { s: "PENDING",     label: "Pending",     bg: "#f1f5f9", color: "#475569" },
  { s: "IN_PROGRESS", label: "In Progress", bg: "#dbeafe", color: "#1e40af" },
  { s: "COMPLETED",   label: "Completed",   bg: "#d1fae5", color: "#065f46" },
  { s: "FAILED",      label: "Failed",      bg: "#fee2e2", color: "#991b1b" },
];
