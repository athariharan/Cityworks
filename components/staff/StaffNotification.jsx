// components/staff/StaffNotification.jsx
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import StaffLayout from "./StaffLayout";
import NotificationService from "../../services/NotificationService";
import "../../styles/NotificationsPage.css";

// ── Category metadata for all staff roles ───────────────────────────────────
const CATEGORY_META = {
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
  ROLE_CHANGE:           { icon: "👤", label: "Role Change",           color: "#2563eb", bg: "rgba(37,99,235,0.1)"   },
  CONFIG_CHANGE:         { icon: "⚙️", label: "Config Change",        color: "#64748b", bg: "rgba(100,116,139,0.1)" },
  // Shared
  STATUS_UPDATE:         { icon: "🔄", label: "Status Update",        color: "#0ea5e9", bg: "rgba(14,165,233,0.1)"  },
  WORK_ORDER_COMPLETED:  { icon: "✅", label: "Completed",            color: "#16a34a", bg: "rgba(22,163,74,0.1)"   },
  ALERT:                 { icon: "🚨", label: "Alert",                color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
};
const DEFAULT_META = { icon: "📢", label: "General", color: "#64748b", bg: "rgba(100,116,139,0.1)" };

const FILTERS = [
  { key: "ALL",    label: "All"    },
  { key: "UNREAD", label: "Unread" },
  { key: "READ",   label: "Read"   },
];

function formatTime(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1)     return "Just now";
  if (diff < 60)    return `${diff}m ago`;
  if (diff < 1440)  return `${Math.floor(diff / 60)}h ago`;
  if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function StaffNotificationsPage() {
  const { userId } = useSelector(s => s.auth);

  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState("ALL");
  const [toast,         setToast]         = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res  = await NotificationService.getByUserId(userId, "STAFF");
      const list = res.data?.data ?? [];
      setNotifications(Array.isArray(list)
        ? list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : []);
    } catch {
      showToast("Failed to load notifications.", "error");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.notificationId === id ? { ...n, status: "READ" } : n)
      );
    } catch { showToast("Could not mark as read.", "error"); }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => n.status === "UNREAD");
    if (!unread.length) return;
    try {
      await NotificationService.markAllAsRead(userId, "STAFF");
      setNotifications(prev => prev.map(n => ({ ...n, status: "READ" })));
      showToast(`${unread.length} notification${unread.length > 1 ? "s" : ""} marked as read.`);
    } catch { showToast("Could not mark all as read.", "error"); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await NotificationService.remove(id);
      setNotifications(prev => prev.filter(n => n.notificationId !== id));
    } catch { showToast("Could not delete notification.", "error"); }
  };

  const unreadCount = notifications.filter(n => n.status === "UNREAD").length;

  const visible = notifications.filter(n =>
    filter === "ALL" || n.status === filter
  );

  return (
    <StaffLayout>
      <div className="np-root">

        {/* Header */}
        <div className="np-header">
          <div>
            <h1 className="np-title">Notifications</h1>
            <p className="np-subtitle">
              {loading ? "Loading…" : (
                unreadCount > 0
                  ? `${unreadCount} unread · ${notifications.length} total`
                  : `${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`
              )}
            </p>
          </div>
          <div className="np-header-actions">
            {unreadCount > 0 && (
              <button className="np-btn-markall" onClick={handleMarkAllRead}>
                ✓ Mark all read
              </button>
            )}
            <button className="np-btn-refresh" onClick={load} disabled={loading}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`np-toast np-toast--${toast.type}`}>{toast.msg}</div>
        )}

        {/* Filter tabs */}
        <div className="np-filters">
          {FILTERS.map(f => {
            const count = f.key === "ALL"
              ? notifications.length
              : notifications.filter(n => n.status === f.key).length;
            return (
              <button
                key={f.key}
                className={`np-filter-btn ${filter === f.key ? "active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                {count > 0 && <span className="np-filter-count">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="np-state-box">
            <div className="np-spinner" />
            <p>Loading notifications…</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="np-state-box">
            <div className="np-empty-icon">🔔</div>
            <p className="np-empty-title">
              {filter === "ALL" ? "No notifications yet" : `No ${filter.toLowerCase()} notifications`}
            </p>
            <p className="np-empty-sub">You're all caught up!</p>
          </div>
        ) : (
          <div className="np-list">
            {visible.map(n => {
              const meta     = CATEGORY_META[n.category] || DEFAULT_META;
              const isUnread = n.status === "UNREAD";
              return (
                <div
                  key={n.notificationId}
                  className={`np-item ${isUnread ? "np-item--unread" : ""}`}
                  onClick={() => isUnread && handleMarkRead(n.notificationId)}
                >
                  {isUnread && <div className="np-unread-bar" />}

                  <div className="np-item-icon" style={{ background: meta.bg, color: meta.color }}>
                    {meta.icon}
                  </div>

                  <div className="np-item-body">
                    <div className="np-item-top">
                      <span
                        className="np-category-tag"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      <span className="np-item-time">{formatTime(n.createdAt)}</span>
                    </div>
                    <p className="np-item-msg">{n.message}</p>
                    {n.entityId > 0 && (
                      <p className="np-item-ref">Ref #{n.entityId}</p>
                    )}
                  </div>

                  <div className="np-item-right">
                    {isUnread && (
                      <div className="np-dot-wrap">
                        <span className="np-unread-dot" />
                        <span className="np-click-hint">Click to mark read</span>
                      </div>
                    )}
                    <button
                      className="np-delete-btn"
                      onClick={(e) => handleDelete(e, n.notificationId)}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </StaffLayout>
  );
}
