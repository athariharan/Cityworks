export const TASK_STATUSES = [
  { value: "SCHEDULED",   label: "Scheduled",   color: "#1b6e3a", bg: "#dbeafe", dot: "#3fb950" },
  { value: "IN_PROGRESS", label: "In Progress", color: "#7d5a00", bg: "#fff3cc", dot: "#d29922" },
  { value: "COMPLETED",   label: "Completed",   color: "#1a7f37", bg: "#e0f7e4", dot: "#2da44e" },
];

export const STATUS_STYLES = {
  Scheduled:   { bg: "#dbeafe", color: "#1b6e3a", dot: "#3fb950" },
  In_Progress: { bg: "#fff3cc", color: "#7d5a00", dot: "#d29922" },
  Completed:   { bg: "#e0f7e4", color: "#1a7f37", dot: "#2da44e" },
  // API may also return PENDING / IN_PROGRESS / COMPLETED
  PENDING:     { bg: "#dbeafe", color: "#1b6e3a", dot: "#3fb950" },
  IN_PROGRESS: { bg: "#fff3cc", color: "#7d5a00", dot: "#d29922" },
  COMPLETED:   { bg: "#e0f7e4", color: "#1a7f37", dot: "#2da44e" },
};

export const INITIAL = { assetId: "", description: "", scheduledAt: "", status: "", nextDueDate: "" };
