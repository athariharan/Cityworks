export const STATUS_CFG = {
  PENDING:     { label: "Pending",     bg: "#fef3c7", color: "#92400e" },
  VALIDATED:   { label: "Validated",   bg: "#d1fae5", color: "#065f46" },
  REJECTED:    { label: "Rejected",    bg: "#fee2e2", color: "#991b1b" },
  IN_PROGRESS: { label: "In Progress", bg: "#dbeafe", color: "#1e40af" },
  RESOLVED:    { label: "Resolved",    bg: "#d1fae5", color: "#065f46" },
  CLOSED:      { label: "Closed",      bg: "#f1f5f9", color: "#64748b" },
};

export const TYPE_ICONS = { ROAD: "🛣️", LIGHT: "💡", PARK: "🌳", UTILITY: "⚡" };

export const STEPS = [
  { label: "Submitted",   icon: "✓"  },
  { label: "Reviewed",    icon: "✓"  },
  { label: "Scheduled",   icon: "✓"  },
  { label: "In Progress", icon: "🔧" },
  { label: "Closed",      icon: "✅" },
];

export const STATUS_STEP = {
  PENDING:     0,
  VALIDATED:   1,
  SCHEDULED:   2,
  IN_PROGRESS: 3,
  RESOLVED:    5,
  CLOSED:      4,
  REJECTED:    0,
};
