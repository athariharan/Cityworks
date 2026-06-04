// components/staff/StaffSidebar.jsx
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { ROLE_SIDEBAR_LINKS } from "../../utility/StaffConfig";
import "../../styles/StaffSidebar.css";

function StaffSidebar({ isOpen, onClose }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useSelector((state) => state.auth);
  const role      = user?.role || "";
  const links     = ROLE_SIDEBAR_LINKS[role] || [];

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();           // close sidebar on mobile after click
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="ssidebar-overlay" onClick={onClose}></div>
      )}

      <aside className={`ssidebar ${isOpen ? "open" : ""}`}>

        {/* Logo area */}
        <div className="ssidebar-logo">
          <span className="ssidebar-logo-icon">🏛️</span>
          <span className="ssidebar-logo-text">CityWorks</span>
        </div>

        {/* Nav Links */}
        <nav className="ssidebar-nav">
          <p className="ssidebar-section-label">Navigation</p>
          {links.map((link) => (
            <button
              key={link.path}
              className={`ssidebar-link ${location.pathname === link.path ? "active" : ""}`}
              onClick={() => handleNav(link.path)}
            >
              <span className="ssidebar-link-icon">{link.icon}</span>
              <span className="ssidebar-link-label">{link.label}</span>
              {location.pathname === link.path && (
                <span className="ssidebar-active-indicator"></span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom — version */}
        <div className="ssidebar-footer">
          <span className="ssidebar-version">CityWorks v1.0</span>
        </div>

      </aside>
    </>
  );
}

export default StaffSidebar;