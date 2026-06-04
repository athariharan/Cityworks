export const COND_COLORS = {
  EXCELLENT: { bg: "#dbeafe", color: "#1a7f37", dot: "#2da44e" },
  GOOD:      { bg: "#c8f0d8", color: "#1b6e3a", dot: "#3fb950" },
  FAIR:      { bg: "#fff3cc", color: "#7d5a00", dot: "#d29922" },
  POOR:      { bg: "#ffe4d0", color: "#9a3412", dot: "#e25c2c" },
  CRITICAL:  { bg: "#ffe0e0", color: "#7f1d1d", dot: "#dc2626" },
};

export const COND_ORDER = ["EXCELLENT", "GOOD", "FAIR", "POOR", "CRITICAL"];

export const CONDITION_OPTIONS = [
  { value: "EXCELLENT", label: "Excellent", color: "#1a7f37", bg: "#dbeafe", dot: "#2da44e", msg: "No action needed"            },
  { value: "GOOD",      label: "Good",      color: "#1b6e3a", bg: "#c8f0d8", dot: "#3fb950", msg: "Minor wear — routine check"  },
  { value: "FAIR",      label: "Fair",      color: "#7d5a00", bg: "#fff3cc", dot: "#d29922", msg: "Monitor and plan maintenance" },
  { value: "POOR",      label: "Poor",      color: "#9a3412", bg: "#ffe4d0", dot: "#e25c2c", msg: "Schedule maintenance soon"   },
  { value: "CRITICAL",  label: "Critical",  color: "#7f1d1d", bg: "#ffe0e0", dot: "#dc2626", msg: "Immediate action required"   },
];

export const STATUSES = [
  { value: "PENDING",         label: "Pending"         },
  { value: "COMPLETED",       label: "Completed"       },
  { value: "REQUIRES_ACTION", label: "Requires Action" },
  { value: "CLOSED",          label: "Closed"          },
];

export const INSPECTOR_ROLES = ["ADMINISTRATOR", "OPERATIONS_MANAGER"];

export const INITIAL_FORM = {
  assetId: "", inspectorId: "", performedAt: "",
  conditionRating: "", findings: "", status: "",
};
