// components/staff/StaffNavbar.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";
import NotificationService from "../../services/NotificationService";
import "../../styles/StaffNavbar.css";

function StaffNavbar({ onMenuToggle }) {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user, userId } = useSelector((state) => state.auth);

  const rawName  = user?.email?.split("@")[0] || "Staff";
  const name     = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const initials = name.charAt(0).toUpperCase();
  const role     = user?.role || "";

  const [bellOpen,      setBellOpen]      = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const bellRef = useRef(null);

  const roleLabels = {
    DISPATCHER:          "Dispatcher",
    CREW:                "Field Crew",
    ASSET_MANAGER:       "Asset Manager",
    OPERATIONS_MANAGER:  "Operations Manager",
    FINANCE_OFFICER:     "Finance Officer",
    ADMINISTRATOR:       "Administrator",
    COMPLIANCE_OFFICER:  "Compliance Officer",
  };

  // ── Fetch notifications ──────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    if (!localStorage.getItem("token")) return;  // not logged in yet
    try {
      const res = await NotificationService.getByUserId(userId, "STAFF");
      const list = res.data?.data || [];
      setNotifications(list);
      setUnreadCount(list.filter(n => n.status === "UNREAD").length);
    } catch { /* silently ignore */ }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close bell on outside click
  useEffect(() => {
    const handle = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target))
        setBellOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.notificationId === id ? { ...n, status: "READ" } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    if (!unreadCount) return;
    try {
      await NotificationService.markAllAsRead(userId, "STAFF");
      setNotifications(prev => prev.map(n => ({ ...n, status: "READ" })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d    = new Date(dateStr);
    const diff = Math.floor((new Date() - d) / 60000);
    if (diff < 1)    return "Just now";
    if (diff < 60)   return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString();
  };

  const categoryIcon = (cat) => {
    const icons = {
      // Dispatcher
      NEW_SERVICE_REQUEST:   "📋",
      PENDING_VALIDATION:    "⏳",
      HIGH_PRIORITY:         "🚨",
      WORK_ORDER_REQUIRED:   "📝",
      // Crew
      WORK_ORDER_ASSIGNED:   "🔧",
      SCHEDULE_UPDATE:       "📅",
      PRIORITY_CHANGE:       "⚡",
      TASK_REMINDER:         "⏰",
      // Asset Manager
      ASSET_ISSUE:           "⚠️",
      INSPECTION_DUE:        "🔍",
      INSPECTION_OVERDUE:    "🚨",
      MAINTENANCE_SCHEDULED: "🔩",
      // Operations Manager
      BACKLOG_ALERT:         "📊",
      SLA_BREACH:            "⏰",
      KPI_ALERT:             "📈",
      // Finance Officer
      WORK_ORDER_COST:       "💰",
      MATERIAL_USAGE:        "📦",
      BUDGET_EXCEEDED:       "🚨",
      INVOICE_TRIGGER:       "💳",
      // Compliance Officer
      AUDIT_LOGS:            "📋",
      MISSING_RECORDS:       "⚠️",
      COMPLIANCE_ISSUE:      "🚨",
      AUDIT_REPORT:          "📊",
      // Admin
      SYSTEM_ERROR:          "🔴",
      SECURITY_ALERT:        "🔐",
      ROLE_CHANGE:           "👤",
      CONFIG_CHANGE:         "⚙️",
      // Shared
      STATUS_UPDATE:         "🔄",
      WORK_ORDER_COMPLETED:  "✅",
      ALERT:                 "🚨",
    };
    return icons[cat] || "📢";
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/staff");
  };

  return (
    <header className="snav">
      <div className="snav-inner">

        {/* Hamburger */}
        <button className="snav-hamburger" onClick={onMenuToggle} aria-label="Toggle sidebar">
          <span></span><span></span><span></span>
        </button>

        {/* Brand */}
        <div className="snav-brand">
        </div>

        {/* Right side */}
        <div className="snav-right">

          {/* ── Notification Bell ────────────────────────── */}
          <div className="snav-bell-wrapper" ref={bellRef}>
            <button
              className="snav-icon-btn"
              title="Notifications"
              onClick={() => setBellOpen(o => !o)}
            >
              <span className="snav-notif-icon">🔔</span>
              {unreadCount > 0 && (
                <span className="snav-bell-badge">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="snav-notif-panel">
                <div className="snav-notif-header">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button className="snav-notif-markall" onClick={handleMarkAllRead}>
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="snav-notif-list">
                  {notifications.length === 0 ? (
                    <div className="snav-notif-empty">
                      <p>🎉 All caught up!</p>
                      <p>No notifications yet.</p>
                    </div>
                  ) : (
                    notifications.slice(0, 8).map(n => (
                      <div
                        key={n.notificationId}
                        className={`snav-notif-item ${n.status === "UNREAD" ? "unread" : ""}`}
                        onClick={() => n.status === "UNREAD" && handleMarkAsRead(n.notificationId)}
                      >
                        <div className="snav-notif-icon-box">
                          {categoryIcon(n.category)}
                        </div>
                        <div className="snav-notif-body">
                          <p className="snav-notif-msg">{n.message}</p>
                          <p className="snav-notif-time">{formatTime(n.createdAt)}</p>
                        </div>
                        {n.status === "UNREAD" && <span className="snav-notif-dot" />}
                      </div>
                    ))
                  )}
                </div>

                <div className="snav-notif-footer">
                  <button
                    className="snav-notif-viewall"
                    onClick={() => { setBellOpen(false); navigate("/staff/notifications"); }}
                  >
                    View all notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="snav-profile">
            <div className="snav-avatar">{initials}</div>
            <div className="snav-profile-info">
              <span className="snav-profile-name">{name}</span>
              <span className="snav-profile-role">{roleLabels[role] || role}</span>
            </div>
          </div>

          {/* Logout */}
          <button className="snav-logout-btn" onClick={handleLogout} title="Logout">
            ⎋ Logout
          </button>

        </div>
      </div>
    </header>
  );
}

export default StaffNavbar;
