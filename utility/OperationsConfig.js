
export const OPERATIONS_MODULES = [
  {
    key:         "workorders",
    path:        "/staff/operations/workorders",
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
    label:       "Work Orders",
    tagline:     "Priority & Severity Management",
    description: "View all active work orders and update priority levels. Escalate CRITICAL issues and manage field dispatch assignments.",
    statKey:     "active",
    statLabel:   "Active Orders",
    color:       "#2563eb",
    lightBg:     "#eff6ff",
    borderColor: "#bfdbfe",
    btnLabel:    "Manage Priorities",
  },
  {
    key:         "worklogs",
    path:        "/staff/operations/worklogs/create",
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    label:       "Work Logs",
    tagline:     "Field Activity Logging",
    description: "Create work logs for completed and in-progress work orders. Track timelines, worker activity, and upload photo evidence.",
    statKey:     "logs",
    statLabel:   "Total Logs",
    color:       "#0d9488",
    lightBg:     "#f0fdfa",
    borderColor: "#99f6e4",
    btnLabel:    "Create Work Log",
  },
  {
    key:         "report",
    path:        "/staff/reports",
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 17H7A5 5 0 0 1 7 7h2"/>
        <path d="M15 7h2a5 5 0 0 1 0 10h-2"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
    label:       "Completion Report",
    tagline:     "End-to-End Lifecycle View",
    description: "Full audit trail of every completed task — from citizen submission through validation, work order creation, field activity, to final sign-off.",
    statKey:     "completed",
    statLabel:   "Completed Tasks",
    color:       "#059669",
    lightBg:     "#f0fdf4",
    borderColor: "#a7f3d0",
    btnLabel:    "View Report",
  },
];
