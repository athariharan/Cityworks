// ── Role badge styles (used in staff list / profile tables) ──
export const ROLE_BADGE = {
  ADMINISTRATOR:      { bg: "#fef3c7", color: "#92400e", label: "Administrator"      },
  DISPATCHER:         { bg: "#dbeafe", color: "#1e40af", label: "Dispatcher"         },
  CREW:               { bg: "#d1fae5", color: "#065f46", label: "Crew"               },
  ASSET_MANAGER:      { bg: "#ede9fe", color: "#5b21b6", label: "Asset Manager"      },
  OPERATIONS_MANAGER: { bg: "#fce7f3", color: "#9d174d", label: "Operations Manager" },
  FINANCE_OFFICER:    { bg: "#e0f2fe", color: "#0c4a6e", label: "Finance Officer"    },
  COMPLIANCE_OFFICER: { bg: "#fff7ed", color: "#9a3412", label: "Compliance Officer" },
};

// ── All staff role keys (used in dropdowns, validation, routes) ──
export const STAFF_ROLES = [
  "DISPATCHER",
  "CREW",
  "ASSET_MANAGER",
  "OPERATIONS_MANAGER",
  "FINANCE_OFFICER",
  "ADMINISTRATOR",
  "COMPLIANCE_OFFICER",
];

// ── Human-readable role names (used in navbar, forms, modals) ──
export const ROLE_LABELS = {
  DISPATCHER:         "Dispatcher",
  CREW:               "Field Crew",
  ASSET_MANAGER:      "Asset Manager",
  OPERATIONS_MANAGER: "Operations Manager",
  FINANCE_OFFICER:    "Finance Officer",
  ADMINISTRATOR:      "Administrator",
  COMPLIANCE_OFFICER: "Compliance Officer",
};

// ── Staff skills for the add-staff form ───────────────────────
export const SKILLS = [
  "ELECTRICIAN", "PLUMBER", "LANDSCAPER", "SANITATION_WORKER",
  "PAVER", "FLEET_MECHANIC", "DRIVER", "CARPENTER", "MANAGEMENT",
];

// ── Blood groups for the add-staff form ──────────────────────
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// ── Sidebar navigation links per role ─────────────────────────
export const ROLE_SIDEBAR_LINKS = {
  DISPATCHER: [
    { icon: "📊", label: "Dashboard",        path: "/staff/home"          },
    { icon: "📋", label: "Service Requests", path: "/staff/requests"      },
    { icon: "🔧", label: "Work Orders",      path: "/staff/workorders"    },
    { icon: "👥", label: "Crews",            path: "/staff/crews"         },
    { icon: "🔔", label: "Notifications",    path: "/staff/notifications" },
  ],
  CREW: [
    { icon: "📊", label: "Dashboard",       path: "/staff/home"            },
    { icon: "✅", label: "My Tasks",        path: "/staff/tasks"           },
    { icon: "🔧", label: "Work Orders",     path: "/staff/crew/workorders" },
    { icon: "📷", label: "Evidence Upload", path: "/staff/crew/evidence"   },
    { icon: "🔔", label: "Notifications",   path: "/staff/notifications"   },
  ],
  ASSET_MANAGER: [
    { icon: "📊", label: "Dashboard",     path: "/staff/home"          },
    { icon: "🏗️", label: "Assets",        path: "/staff/assets"        },
    { icon: "🔍", label: "Inspections",   path: "/staff/inspections"   },
    { icon: "🛠️", label: "Maintenance",   path: "/staff/maintenance"   },
    { icon: "🔔", label: "Notifications", path: "/staff/notifications" },
  ],
  OPERATIONS_MANAGER: [
    { icon: "📊", label: "Dashboard",       path: "/staff/home"                        },
    { icon: "🔧", label: "Work Orders",     path: "/staff/operations/workorders"       },
    { icon: "📋", label: "Create Work Log", path: "/staff/operations/worklogs/create"  },
    { icon: "📈", label: "KPIs",            path: "/staff/kpis"                        },
    { icon: "📑", label: "Reports",         path: "/staff/reports"                     },
    { icon: "🔔", label: "Notifications",   path: "/staff/notifications"               },
  ],
  FINANCE_OFFICER: [
    { icon: "📊", label: "Dashboard",      path: "/staff/home"             },
    { icon: "🧰", label: "Material Usage", path: "/staff/materials"        },
    { icon: "📒", label: "Work Logs",      path: "/staff/finance/worklogs" },
    { icon: "🔔", label: "Notifications",  path: "/staff/notifications"    },
  ],
  ADMINISTRATOR: [
    { icon: "📊", label: "Dashboard",          path: "/staff/home"                       },
    // ── Dispatcher ──────────────────────────────────────────────
    { icon: "📋", label: "Service Requests",   path: "/staff/requests"                   },
    { icon: "🔧", label: "Work Orders",        path: "/staff/workorders"                 },
    { icon: "👥", label: "Crews",              path: "/staff/crews"                      },
    // ── Asset Manager ───────────────────────────────────────────
    { icon: "🏗️", label: "Assets",             path: "/staff/assets"                     },
    // ── Operations Manager ──────────────────────────────────────
    { icon: "⚙️", label: "Operations",         path: "/staff/operations"                 },
    // ── Finance Officer ─────────────────────────────────────────
    { icon: "📒", label: "Work Logs",          path: "/staff/finance/worklogs"           },
    { icon: "🧰", label: "Material Usage",     path: "/staff/materials"                  },
    // ── Reporting & KPIs ────────────────────────────────────────
    { icon: "📈", label: "KPIs",              path: "/staff/kpis"                       },
    { icon: "📑", label: "Reports",            path: "/staff/reports"                    },
    // ── Compliance ──────────────────────────────────────────────
    { icon: "🗂️", label: "Audit Logs",        path: "/staff/audit"                      },
    // ── Common ──────────────────────────────────────────────────
    { icon: "🔔", label: "Notifications",      path: "/staff/notifications"              },
  ],
  COMPLIANCE_OFFICER: [
    { icon: "📊", label: "Dashboard",     path: "/staff/home"          },
    { icon: "🔍", label: "Inspections",   path: "/staff/inspections"   },
    { icon: "📑", label: "Reports",       path: "/staff/reports"       },
    { icon: "🗂️", label: "Audit Logs",    path: "/staff/audit"         },
    { icon: "🔔", label: "Notifications", path: "/staff/notifications" },
  ],
};
