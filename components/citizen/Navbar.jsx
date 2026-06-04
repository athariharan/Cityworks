// components/citizen/CitizenNavbar.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import NotificationService from "../../services/NotificationService";
import "../../styles/Navbar.css";

function CivicIcon() {
  return (
    <svg className="cnav-civic-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15.5" y="1" width="1.5" height="6" rx="0.5" fill="currentColor" opacity="0.9"/>
      <path d="M17 1.5 L22 3.5 L17 5.5 Z" fill="currentColor"/>
      <path d="M5 12 L16 6.5 L27 12 Z" fill="currentColor"/>
      <rect x="4" y="12" width="24" height="2.5" rx="0.5" fill="currentColor"/>
      <rect x="6"  y="14.5" width="3" height="11" rx="1" fill="currentColor"/>
      <rect x="11" y="14.5" width="3" height="11" rx="1" fill="currentColor"/>
      <rect x="18" y="14.5" width="3" height="11" rx="1" fill="currentColor"/>
      <rect x="23" y="14.5" width="3" height="11" rx="1" fill="currentColor"/>
      <rect x="13.5" y="20" width="5" height="5.5" rx="1.5" fill="currentColor" opacity="0.6"/>
      <rect x="3"  y="25.5" width="26" height="2"   rx="0.5" fill="currentColor"/>
      <rect x="1"  y="27.5" width="30" height="1.5" rx="0.5" fill="currentColor" opacity="0.7"/>
    </svg>
  );
}

const GENDER_LABEL = { MALE: "♂ Male", FEMALE: "♀ Female", OTHER: "⚬ Other" };

function formatNotifTime(ts) {
  if (!ts) return "";
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function CitizenNavbar({ user }) {
  const navigate    = useNavigate();
  const dispatch    = useDispatch();
  const dropdownRef = useRef(null);
  const bellRef     = useRef(null);

  const { user: authUser, userId } = useSelector((s) => s.auth);

  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [showProfile,   setShowProfile]   = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);

  // ── Notification state ──────────────────────────────────────
  const [bellOpen,       setBellOpen]       = useState(false);
  const [notifications,  setNotifications]  = useState([]);
  const [notifsLoaded,   setNotifsLoaded]   = useState(false);

  // ── Resolve display name from Redux → localStorage → prop → fallback ──
  // This ensures the navbar always shows real user data even on pages that
  // don't explicitly pass a `user` prop (e.g. the notifications page).

  const unreadCount = notifications.filter(n => (n.status || "").toUpperCase() === "UNREAD").length;

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res  = await NotificationService.getByUserId(userId, "USER");
      const body = res?.data ?? res;
      const list = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
      setNotifications(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch { /* silent */ }
    finally { setNotifsLoaded(true); }
  }, [userId]);

  // Poll every 60 s while page is open
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Close bell when clicking outside
  useEffect(() => {
    const handleOut = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener("mousedown", handleOut);
    return () => document.removeEventListener("mousedown", handleOut);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev => prev.map(n =>
        (n.notificationId ?? n.id) === id ? { ...n, status: "READ" } : n
      ));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    if (!unreadCount) return;
    try {
      await NotificationService.markAllAsRead(userId, "USER");
      setNotifications(prev => prev.map(n => ({ ...n, status: "READ" })));
    } catch { /* silent */ }
  };

  const email     = authUser?.email                                          || "—";
  const phone     = authUser?.phone     || localStorage.getItem("phone")     || "—";
  const gender    = authUser?.gender    || localStorage.getItem("gender")    || null;
  const name      = authUser?.name      || localStorage.getItem("name")      || user?.name || "Guest";
  const createdAt = authUser?.createdAt || localStorage.getItem("createdAt") || null;

  // Build initials from the resolved name (e.g. "Ravi Kumar" → "RK")
  const initials  = name !== "Guest"
    ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : (user?.initials || "G");

  const displayUser = { name, initials };
  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    dispatch(logout());
    setDropdownOpen(false);
    setShowProfile(false);
    navigate("/");
  };

  const handleViewProfile = () => {
    setShowProfile(true);
  };

  const handleBack = () => {
    setShowProfile(false);
  };

  return (
    <nav className="cnav">
      <div className="cnav-inner">

        {/* Logo */}
        <div className="cnav-logo" onClick={() => navigate("/citizen/home")}>
          <div className="cnav-logo-corner-wrap">
            <span className="cnav-lc cnav-lc-tl" /><span className="cnav-lc cnav-lc-tr" />
            <span className="cnav-lc cnav-lc-bl" /><span className="cnav-lc cnav-lc-br" />
            <CivicIcon />
            <span className="cnav-logo-text">CityWorks</span>
          </div>
        </div>

        {/* Right side */}
        <div className="cnav-right">

          {/* ── Bell ── */}
          <div className="cnav-bell-wrapper" ref={bellRef}>
            <button
              className="cnav-bell-btn"
              onClick={() => { setBellOpen(p => !p); if (!notifsLoaded) loadNotifications(); }}
              aria-label="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="cnav-bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </button>

            {bellOpen && (
              <div className="cnav-notif-panel">
                <div className="cnav-notif-header">
                  <span>Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                  <div className="cnav-notif-actions">
                    {unreadCount > 0 && (
                      <button className="cnav-notif-markall" onClick={handleMarkAllRead}>
                        Mark all read
                      </button>
                    )}
                    <button
                      className="cnav-notif-viewall"
                      onClick={() => { setBellOpen(false); navigate("/citizen/notifications"); }}
                    >
                      View all →
                    </button>
                  </div>
                </div>

                <div className="cnav-notif-list">
                  {notifications.length === 0 ? (
                    <div className="cnav-notif-empty">
                      <span style={{ fontSize: "2rem" }}>🔔</span>
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 6).map(n => {
                      const id       = n.notificationId ?? n.id;
                      const isUnread = (n.status || "").toUpperCase() === "UNREAD";
                      return (
                        <div
                          key={id}
                          className={`cnav-notif-item ${isUnread ? "unread" : ""}`}
                          onClick={() => isUnread && handleMarkRead(id)}
                        >
                          <div className="cnav-notif-icon-box">
                            {n.category === "REQUEST_REJECTED"     ? "❌"
                           : n.category === "REQUEST_APPROVED"     ? "✅"
                           : n.category === "WORK_ORDER_COMPLETED" ? "✅"
                           : n.category === "WORK_STARTED"         ? "🔧"
                           : n.category === "WORK_ORDER_ASSIGNED"  ? "🔧"
                           : n.category === "STATUS_UPDATE"        ? "🔄"
                           : n.category === "ALERT"                ? "🚨"
                           : "📋"}
                          </div>
                          <div className="cnav-notif-body">
                            <p className="cnav-notif-msg">{n.message}</p>
                            <p className="cnav-notif-time">{formatNotifTime(n.createdAt)}</p>
                          </div>
                          {isUnread && <div className="cnav-notif-dot" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="cnav-profile-wrapper" ref={dropdownRef}>

            {/* Profile trigger button */}
            <button
              className={`cnav-profile ${dropdownOpen ? "cnav-profile--open" : ""}`}
              onClick={() => { setDropdownOpen((p) => !p); setShowProfile(false); }}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <div className="cnav-avatar">{displayUser.initials}</div>
              <span className="cnav-username">{displayUser.name}</span>
              <svg
                className={`cnav-chevron ${dropdownOpen ? "open" : ""}`}
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="cnav-dropdown">

                {!showProfile ? (
                  /* ── Menu view: View Profile + Sign Out ── */
                  <>
                    <div className="cnav-dropdown-header">
                      <div className="cnav-dropdown-avatar">{displayUser.initials}</div>
                      <div>
                        <div className="cnav-dropdown-name">{displayUser.name}</div>
                        <div className="cnav-dropdown-role">Citizen</div>
                      </div>
                    </div>
                    <div className="cnav-dropdown-divider" />
                    <button className="cnav-dropdown-item" onClick={handleViewProfile}>
                      <i className="bi bi-person-circle" />
                      View Profile
                    </button>
                    <div className="cnav-dropdown-divider" />
                    <button className="cnav-dropdown-item cnav-dropdown-signout" onClick={handleSignOut}>
                      <i className="bi bi-box-arrow-right" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  /* ── Profile details view ── */
                  <>
                    <div className="cnav-profile-card-header">
                      <button className="cnav-back-btn" onClick={handleBack}>
                        <i className="bi bi-arrow-left" /> Back
                      </button>
                    </div>

                    <div className="cnav-profile-card">
                      <div className="cnav-profile-card-avatar">{displayUser.initials}</div>
                      <div className="cnav-profile-card-name">{name}</div>
                      <div className="cnav-profile-card-badge">
                        <span className="cnav-profile-card-dot" /> Citizen
                      </div>
                    </div>

                    <div className="cnav-dropdown-divider" />

                    <div className="cnav-profile-details">
                      {[
                        { icon: "bi-person-badge", label: "Full Name",    value: name || "—" },
                        { icon: "bi-envelope",     label: "Email",        value: email },
                        { icon: "bi-telephone",    label: "Phone",        value: phone },
                        { icon: "bi-person",       label: "Gender",       value: GENDER_LABEL[gender] || gender || "—" },
                        { icon: "bi-calendar3",    label: "Member Since", value: memberSince || "—" },
                      ].map((row) => (
                        <div key={row.label} className="cnav-profile-detail-row">
                          <span className="cnav-detail-icon"><i className={`bi ${row.icon}`} /></span>
                          <div>
                            <div className="cnav-detail-label">{row.label}</div>
                            <div className="cnav-detail-value">{row.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </>
                )}
              </div>
            )}
          </div>

          {/* Hamburger for mobile */}
          <button
            className={`cnav-hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default CitizenNavbar;
