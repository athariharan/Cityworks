// pages/staff/audit/AuditHelpers.jsx
// Shared badge components and date formatters used across the audit module.

import { ACTION_CLS, MODULE_CLS } from "../../../utility/AuditLogConfig";

// ── CSS class helpers ─────────────────────────────────────────
export function actionCls(action) { return ACTION_CLS[action] || "other";  }
export function moduleCls(module) { return MODULE_CLS[module] || "system"; }

// ── Badge components ──────────────────────────────────────────
export function ActionBadge({ action }) {
  return (
    <span className={`al-badge al-badge--${actionCls(action)}`}>
      {action || "OTHER"}
    </span>
  );
}

export function ModuleBadge({ module }) {
  return (
    <span className={`al-badge al-module--${moduleCls(module)}`}>
      {module || "System"}
    </span>
  );
}

export function RoleBadge({ role }) {
  return (
    <span className="al-role-badge">
      {role?.replace(/_/g, " ") || "—"}
    </span>
  );
}

// ── Date / time formatters ────────────────────────────────────
export function formatWhen(timestamp) {
  if (!timestamp) return "—";
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function formatFullDate(timestamp) {
  if (!timestamp) return "—";
  return new Date(timestamp).toLocaleDateString("en-IN", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

export function formatTime(timestamp) {
  if (!timestamp) return "—";
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}
