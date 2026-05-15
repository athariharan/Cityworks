// pages/staff/NotificationsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import StaffLayout from "../../components/staff/StaffLayout";
import NotificationService from "../../services/NotificationService";
import "../../styles/NotificationsPage.css";

const CATEGORY_META = {
  NEW_SERVICE_REQUEST:  { icon: "📋", label: "Service Request",  color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
  WORK_ORDER_ASSIGNED:  { icon: "🔧", label: "Work Order",       color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  WORK_ORDER_COMPLETED: { icon: "✅", label: "Completed",        color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
  ASSIGNED:             { icon: "👷", label: "Assigned",         color: "#8b5cf6", bg: "rgba(139,92,246,0.1)"  },
  INSPECTION:           { icon: "🔍", label: "Inspection",       color: "#06b6d4", bg: "rgba(6,182,212,0.1)"   },
  MAINTENANCE:          { icon: "🛠️", label: "Maintenance",      color: "#f97316", bg: "rgba(249,115,22,0.1)"  },
  REPORT:               { icon: "📑", label: "Report",           color: "#64748b", bg: "rgba(100,116,139,0.1)" },
  ALERT:                { icon: "🚨", label: "Alert",            color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
};

const DEFAULT_META = { icon: "📢", label: "General", color: "#64748b", bg: "rgba(100,116,139,0.1)" };

const FILTERS = [
  { key: "ALL",    label: "All"    },
  { key: "UNREAD", label: "Unread" },
  { key: "READ",   label: "Read"   },
];

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d    = new Date(dateStr);
  const diff = Math.floor((Date.now() - d) / 60000);
  if (diff < 1)    return "Just now";
  if (diff < 60)   return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function NotificationsPage() {
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
      const res  = await NotificationService.getByUserId(userId);
      const list = res.data?.data ?? [];
      setNotifications(Array.isArray(list) ? list : []);
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
    } catch {
      showToast("Could not mark as read.", "error");
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => n.status === "UNREAD");
    if (!unread.length) return;
    await Promise.allSettled(unread.map(n => NotificationService.markAsRead(n.notificationId)));
    setNotifications(prev => prev.map(n => ({ ...n, status: "READ" })));
    showToast(`${unread.length} notification${unread.length > 1 ? "s" : ""} marked as read.`);
  };

  const visible = notifications.filter(n =>
    filter === "ALL" || n.status === filter
  );

  const unreadCount = notifications.filter(n => n.status === "UNREAD").length;

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
                {count > 0 && (
                  <span className="np-filter-count">{count}</span>
                )}
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
              const meta = CATEGORY_META[n.category] || DEFAULT_META;
              const isUnread = n.status === "UNREAD";
              return (
                <div
                  key={n.notificationId}
                  className={`np-item ${isUnread ? "np-item--unread" : ""}`}
                  onClick={() => isUnread && handleMarkRead(n.notificationId)}
                >
                  {/* Unread accent bar */}
                  {isUnread && <div className="np-unread-bar" />}

                  {/* Icon */}
                  <div className="np-item-icon" style={{ background: meta.bg, color: meta.color }}>
                    {meta.icon}
                  </div>

                  {/* Body */}
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

                  {/* Unread dot */}
                  {isUnread && (
                    <div className="np-dot-wrap">
                      <span className="np-unread-dot" />
                      <span className="np-click-hint">Click to mark read</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </StaffLayout>
  );
}
