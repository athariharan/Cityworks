// components/citizen/CitizenNotificationsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import Layout from "./Layout";
import NotificationService from "../../services/NotificationService";
import "../../styles/CitizenNotificationsPage.css";

// ── Category metadata for citizens ──────────────────────────────────────────
const CATEGORY_META = {
  NEW_SERVICE_REQUEST:  { icon: "📋", label: "Submitted",      color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
  REQUEST_APPROVED:     { icon: "✅", label: "Approved",       color: "#16a34a", bg: "rgba(22,163,74,0.1)"   },
  REQUEST_REJECTED:     { icon: "❌", label: "Rejected",       color: "#dc2626", bg: "rgba(220,38,38,0.1)"   },
  STATUS_UPDATE:        { icon: "🔄", label: "Status Update",  color: "#0ea5e9", bg: "rgba(14,165,233,0.1)"  },
  WORK_STARTED:         { icon: "🔧", label: "Work Started",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  WORK_ORDER_ASSIGNED:  { icon: "🔧", label: "Work Scheduled", color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  WORK_ORDER_COMPLETED: { icon: "✅", label: "Resolved",       color: "#16a34a", bg: "rgba(22,163,74,0.1)"   },
  ALERT:                { icon: "🚨", label: "Alert",          color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
};
const DEFAULT_META = { icon: "🔔", label: "Notification", color: "#64748b", bg: "rgba(100,116,139,0.1)" };

function formatTime(ts) {
  if (!ts) return "";
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function CitizenNotificationsPage() {
  const userId = useSelector((s) => s.auth.userId);

  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState("All");
  const [toast,         setToast]         = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res  = await NotificationService.getByUserId(userId, "USER");
      const body = res?.data ?? res;
      const list = Array.isArray(body?.data) ? body.data
        : Array.isArray(body) ? body : [];
      setNotifications(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.notificationId ?? n.id) === id ? { ...n, status: "READ" } : n)
      );
    } catch { showToast("Failed to mark as read", "error"); }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => (n.status || "").toUpperCase() === "UNREAD");
    if (!unread.length) return;
    try {
      await NotificationService.markAllAsRead(userId, "USER");
      setNotifications(prev => prev.map(n => ({ ...n, status: "READ" })));
      showToast("All notifications marked as read");
    } catch { showToast("Could not mark all as read", "error"); }
  };

  const unreadCount = notifications.filter(n => (n.status || "").toUpperCase() === "UNREAD").length;

  const displayed = filter === "Unread"
    ? notifications.filter(n => (n.status || "").toUpperCase() === "UNREAD")
    : filter === "Read"
    ? notifications.filter(n => (n.status || "").toUpperCase() !== "UNREAD")
    : notifications;

  return (
    <Layout>
      <div className="cnp-root">

        {/* Header */}
        <div className="cnp-header">
          <div>
            <h1 className="cnp-title">🔔 Notifications</h1>
            <p className="cnp-subtitle">Updates on your service requests and work orders</p>
          </div>
          <div className="cnp-header-actions">
            <button className="cnp-btn-refresh" onClick={load} disabled={loading}>
              {loading ? "⟳" : "↻"} Refresh
            </button>
            {unreadCount > 0 && (
              <button className="cnp-btn-markall" onClick={handleMarkAllRead}>
                ✓ Mark all read ({unreadCount})
              </button>
            )}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`cnp-toast cnp-toast--${toast.type}`}>{toast.msg}</div>
        )}

        {/* Filter tabs */}
        <div className="cnp-filters">
          {["All", "Unread", "Read"].map(f => (
            <button
              key={f}
              className={`cnp-filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
              <span className="cnp-filter-count">
                {f === "All"    ? notifications.length
                 : f === "Unread" ? unreadCount
                 : notifications.length - unreadCount}
              </span>
            </button>
          ))}
        </div>

        {/* Body */}
        {loading ? (
          <div className="cnp-state-box">
            <div className="cnp-spinner" />
            <p>Loading notifications…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="cnp-state-box">
            <div className="cnp-empty-icon">🔔</div>
            <p className="cnp-empty-title">No notifications</p>
            <p className="cnp-empty-sub">You're all caught up!</p>
          </div>
        ) : (
          <div className="cnp-list">
            {displayed.map(n => {
              const id       = n.notificationId ?? n.id;
              const isUnread = (n.status || "").toUpperCase() === "UNREAD";
              const meta     = CATEGORY_META[n.category] || DEFAULT_META;
              return (
                <div
                  key={id}
                  className={`cnp-item ${isUnread ? "cnp-item--unread" : ""}`}
                  onClick={() => isUnread && handleMarkRead(id)}
                >
                  {isUnread && <div className="cnp-unread-bar" />}

                  <div className="cnp-item-icon" style={{ background: meta.bg }}>
                    {meta.icon}
                  </div>

                  <div className="cnp-item-body">
                    <div className="cnp-item-top">
                      <span
                        className="cnp-category-tag"
                        style={{ color: meta.color, background: meta.bg }}
                      >
                        {meta.label}
                      </span>
                      <span className="cnp-item-time">{formatTime(n.createdAt)}</span>
                    </div>
                    <p className="cnp-item-msg">{n.message}</p>
                    {n.entityId > 0 && (
                      <p className="cnp-item-ref">Ref #{n.entityId}</p>
                    )}
                  </div>

                  {isUnread && (
                    <div className="cnp-dot-wrap">
                      <div className="cnp-unread-dot" />
                      <span className="cnp-click-hint">tap to read</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </Layout>
  );
}
