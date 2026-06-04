export const STAFF_CATEGORY_META = {
  // Dispatcher
  NEW_SERVICE_REQUEST:   { icon: "📋", label: "New Request",          color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
  PENDING_VALIDATION:    { icon: "⏳", label: "Pending Validation",   color: "#d97706", bg: "rgba(217,119,6,0.1)"   },
  HIGH_PRIORITY:         { icon: "🚨", label: "High Priority",        color: "#dc2626", bg: "rgba(220,38,38,0.1)"   },
  WORK_ORDER_REQUIRED:   { icon: "📝", label: "Work Order Required",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  // Field Crew
  WORK_ORDER_ASSIGNED:   { icon: "🔧", label: "Work Assigned",        color: "#2563eb", bg: "rgba(37,99,235,0.1)"   },
  SCHEDULE_UPDATE:       { icon: "📅", label: "Schedule Updated",     color: "#7c3aed", bg: "rgba(124,58,237,0.1)"  },
  PRIORITY_CHANGE:       { icon: "⚡", label: "Priority Changed",     color: "#ea580c", bg: "rgba(234,88,12,0.1)"   },
  TASK_REMINDER:         { icon: "⏰", label: "Task Reminder",        color: "#ca8a04", bg: "rgba(202,138,4,0.1)"   },
  // Asset Manager
  ASSET_ISSUE:           { icon: "⚠️", label: "Asset Issue",          color: "#ea580c", bg: "rgba(234,88,12,0.1)"   },
  INSPECTION_DUE:        { icon: "🔍", label: "Inspection Due",       color: "#ca8a04", bg: "rgba(202,138,4,0.1)"   },
  INSPECTION_OVERDUE:    { icon: "🚨", label: "Inspection Overdue",   color: "#dc2626", bg: "rgba(220,38,38,0.1)"   },
  MAINTENANCE_SCHEDULED: { icon: "🔩", label: "Maintenance",          color: "#2563eb", bg: "rgba(37,99,235,0.1)"   },
  // Operations Manager
  BACKLOG_ALERT:         { icon: "📊", label: "Backlog Alert",        color: "#ea580c", bg: "rgba(234,88,12,0.1)"   },
  SLA_BREACH:            { icon: "⏰", label: "SLA Breach",           color: "#dc2626", bg: "rgba(220,38,38,0.1)"   },
  KPI_ALERT:             { icon: "📈", label: "KPI Alert",            color: "#ca8a04", bg: "rgba(202,138,4,0.1)"   },
  // Finance Officer
  WORK_ORDER_COST:       { icon: "💰", label: "Cost Update",          color: "#16a34a", bg: "rgba(22,163,74,0.1)"   },
  MATERIAL_USAGE:        { icon: "📦", label: "Material Used",        color: "#2563eb", bg: "rgba(37,99,235,0.1)"   },
  BUDGET_EXCEEDED:       { icon: "🚨", label: "Budget Exceeded",      color: "#dc2626", bg: "rgba(220,38,38,0.1)"   },
  INVOICE_TRIGGER:       { icon: "💳", label: "Invoice / Payment",    color: "#7c3aed", bg: "rgba(124,58,237,0.1)"  },
  // Compliance Officer
  AUDIT_LOGS:            { icon: "📋", label: "Audit Logs",           color: "#2563eb", bg: "rgba(37,99,235,0.1)"   },
  MISSING_RECORDS:       { icon: "⚠️", label: "Missing Records",      color: "#dc2626", bg: "rgba(220,38,38,0.1)"   },
  COMPLIANCE_ISSUE:      { icon: "🚨", label: "Compliance Issue",     color: "#dc2626", bg: "rgba(220,38,38,0.1)"   },
  AUDIT_REPORT:          { icon: "📊", label: "Audit Report",         color: "#16a34a", bg: "rgba(22,163,74,0.1)"   },
  // Administrator
  SYSTEM_ERROR:          { icon: "🔴", label: "System Error",         color: "#dc2626", bg: "rgba(220,38,38,0.1)"   },
  SECURITY_ALERT:        { icon: "🔐", label: "Security Alert",       color: "#dc2626", bg: "rgba(220,38,38,0.1)"   },
  ROLE_CHANGE:           { icon: "👤", label: "Role Change",          color: "#2563eb", bg: "rgba(37,99,235,0.1)"   },
  CONFIG_CHANGE:         { icon: "⚙️", label: "Config Change",        color: "#64748b", bg: "rgba(100,116,139,0.1)" },
  // Shared
  STATUS_UPDATE:         { icon: "🔄", label: "Status Update",        color: "#0ea5e9", bg: "rgba(14,165,233,0.1)"  },
  WORK_ORDER_COMPLETED:  { icon: "✅", label: "Completed",            color: "#16a34a", bg: "rgba(22,163,74,0.1)"   },
  ALERT:                 { icon: "🚨", label: "Alert",                color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
};

// Fallback when category is unknown
export const STAFF_DEFAULT_META = { icon: "📢", label: "General", color: "#64748b", bg: "rgba(100,116,139,0.1)" };

// ── Citizen: category → icon + label + colors ─────────────────
export const CITIZEN_CATEGORY_META = {
  NEW_SERVICE_REQUEST:  { icon: "📋", label: "Submitted",      color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
  REQUEST_APPROVED:     { icon: "✅", label: "Approved",       color: "#16a34a", bg: "rgba(22,163,74,0.1)"   },
  REQUEST_REJECTED:     { icon: "❌", label: "Rejected",       color: "#dc2626", bg: "rgba(220,38,38,0.1)"   },
  STATUS_UPDATE:        { icon: "🔄", label: "Status Update",  color: "#0ea5e9", bg: "rgba(14,165,233,0.1)"  },
  WORK_STARTED:         { icon: "🔧", label: "Work Started",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  WORK_ORDER_ASSIGNED:  { icon: "🔧", label: "Work Scheduled", color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  WORK_ORDER_COMPLETED: { icon: "✅", label: "Resolved",       color: "#16a34a", bg: "rgba(22,163,74,0.1)"   },
  ALERT:                { icon: "🚨", label: "Alert",          color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
};

// Fallback when category is unknown
export const CITIZEN_DEFAULT_META = { icon: "🔔", label: "Notification", color: "#64748b", bg: "rgba(100,116,139,0.1)" };

// ── Shared filter tabs ────────────────────────────────────────
export const NOTIFICATION_FILTERS = [
  { key: "ALL",    label: "All"    },
  { key: "UNREAD", label: "Unread" },
  { key: "READ",   label: "Read"   },
];
