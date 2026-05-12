// components/staff/StaffNavbar.jsx
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";
import "../../styles/StaffNavbar.css";

function StaffNavbar({ onMenuToggle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const rawName  = user?.email?.split("@")[0] || "Staff";
  const name     = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const initials = name.charAt(0).toUpperCase();
  const role     = user?.role || "";

  // Human-readable role label
  const roleLabels = {
    DISPATCHER:          "Dispatcher",
    CREW:                "Field Crew",
    ASSET_MANAGER:       "Asset Manager",
    OPERATIONS_MANAGER:  "Operations Manager",
    FINANCE_OFFICER:     "Finance Officer",
    ADMINISTRATOR:       "Administrator",
    COMPLIANCE_OFFICER:  "Compliance Officer",
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/staff");
  };

  return (
    <header className="snav">
      <div className="snav-inner">

        {/* Hamburger — mobile sidebar toggle */}
        <button className="snav-hamburger" onClick={onMenuToggle} aria-label="Toggle sidebar">
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Page title area */}
        <div className="snav-brand">
          <span className="snav-logo-icon">🏛️</span>
          <span className="snav-logo-text">CityWorks</span>
          <span className="snav-divider">|</span>
          <span className="snav-role-badge">{roleLabels[role] || role}</span>
        </div>

        {/* Right side */}
        <div className="snav-right">

          {/* Notifications */}
          <button className="snav-icon-btn" title="Notifications">
            <span className="snav-notif-icon">🔔</span>
            <span className="snav-notif-dot"></span>
          </button>

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