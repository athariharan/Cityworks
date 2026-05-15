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
      const res = await NotificationService.getByUserId(userId);
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
    const unread = notifications.filter(n => n.status === "UNREAD");
    await Promise.allSettled(
      unread.map(n => NotificationService.markAsRead(n.notificationId))
    );
    setNotifications(prev => prev.map(n => ({ ...n, status: "READ" })));
    setUnreadCount(0);
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
    switch (cat) {
      case "NEW_SERVICE_REQUEST":   return "📋";
      case "WORK_ORDER_COMPLETED":  return "✅";
      case "ASSIGNED":              return "👷";
      default:                      return "📢";
    }
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
                    notifications.map(n => (
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
