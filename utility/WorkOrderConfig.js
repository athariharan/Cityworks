export const STATUS_CFG = {
  NOT_STARTED: { label: "Not Started", bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  IN_PROGRESS:  { label: "In Progress", bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  COMPLETED:    { label: "Completed",   bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
  CANCELLED:    { label: "Cancelled",   bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
};

export const PRIORITY_CFG = {
  LOW:      { label: "Low",      bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  MEDIUM:   { label: "Medium",   bg: "#fefce8", color: "#a16207", dot: "#eab308" },
  HIGH:     { label: "High",     bg: "#fff7ed", color: "#c2410c", dot: "#f97316" },
  CRITICAL: { label: "Critical", bg: "#fef2f2", color: "#991b1b", dot: "#ef4444" },
};

// 5-item filter list — used on full work orders / crew work orders pages
export const WO_FILTERS = [
  { key: "ALL",         label: "All" },
  { key: "NOT_STARTED", label: "Not Started" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED",   label: "Completed" },
  { key: "CANCELLED",   label: "Cancelled" },
];

// 4-item filter list — used on crew dashboard (no CANCELLED)
export const DASHBOARD_FILTERS = [
  { key: "ALL",         label: "All" },
  { key: "NOT_STARTED", label: "Not Started" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED",   label: "Completed" },
];

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const PRIORITY_LABELS = { LOW: "Low", MEDIUM: "Medium", HIGH: "High", CRITICAL: "Critical" };

export const PRIORITY_META = {
  LOW:      { bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
  MEDIUM:   { bg: "#fef9c3", color: "#854d0e", dot: "#eab308" },
  HIGH:     { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
  CRITICAL: { bg: "#fce7f3", color: "#831843", dot: "#ec4899" },
};

export const STATUS_META = {
  NOT_STARTED: { bg: "#e0e7ff", color: "#3730a3" },
  IN_PROGRESS: { bg: "#fef9c3", color: "#854d0e" },
  COMPLETED:   { bg: "#dcfce7", color: "#166534" },
  CANCELLED:   { bg: "#f1f5f9", color: "#475569" },
};
