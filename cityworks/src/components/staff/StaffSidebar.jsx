// components/staff/StaffSidebar.jsx
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import "./StaffSidebar.css";

// ── Role-based sidebar links ──────────────────────────────
const roleLinks = {
  DISPATCHER: [
    { icon: "📊", label: "Dashboard",        path: "/staff/home" },
    { icon: "📋", label: "Service Requests", path: "/staff/requests" },
    { icon: "🔧", label: "Work Orders",      path: "/staff/workorders" },
    { icon: "👥", label: "Crews",            path: "/staff/crews" },
    { icon: "📰", label: "News",             path: "/staff/news" },
  ],
  CREW: [
    { icon: "📊", label: "Dashboard",        path: "/staff/home" },
    { icon: "✅", label: "My Tasks",         path: "/staff/tasks" },
    { icon: "🔧", label: "Work Orders",      path: "/staff/workorders" },
    { icon: "📷", label: "Evidence Upload",  path: "/staff/evidence" },
    { icon: "📰", label: "News",             path: "/staff/news" },
  ],
  ASSET_MANAGER: [
    { icon: "📊", label: "Dashboard",        path: "/staff/home" },
    { icon: "🏗️", label: "Assets",           path: "/staff/assets" },
    { icon: "🔍", label: "Inspections",      path: "/staff/inspections" },
    { icon: "🛠️", label: "Maintenance",      path: "/staff/maintenance" },
    { icon: "📰", label: "News",             path: "/staff/news" },
  ],
  OPERATIONS_MANAGER: [
    { icon: "📊", label: "Dashboard",        path: "/staff/home" },
    { icon: "📋", label: "Service Requests", path: "/staff/requests" },
    { icon: "🔧", label: "Work Orders",      path: "/staff/workorders" },
    { icon: "📈", label: "KPIs",             path: "/staff/kpis" },
    { icon: "📑", label: "Reports",          path: "/staff/reports" },
    { icon: "📰", label: "News",             path: "/staff/news" },
  ],
  FINANCE_OFFICER: [
    { icon: "📊", label: "Dashboard",        path: "/staff/home" },
    { icon: "💰", label: "Costs",            path: "/staff/costs" },
    { icon: "🧰", label: "Material Usage",   path: "/staff/materials" },
    { icon: "🧾", label: "Invoices",         path: "/staff/invoices" },
    { icon: "📰", label: "News",             path: "/staff/news" },
  ],
  ADMINISTRATOR: [
    { icon: "📊", label: "Dashboard",          path: "/staff/home" },
    { icon: "📡", label: "Dispatcher",         path: "/staff/requests" },
    { icon: "🦺", label: "Field Crew",         path: "/staff/workorders" },
    { icon: "🏗️", label: "Asset Manager",      path: "/staff/assets/registry/list" },
    { icon: "📈", label: "Operations Manager", path: "/staff/kpis" },
    { icon: "💰", label: "Finance Officer",    path: "/staff/costs" },
    { icon: "📜", label: "Compliance Officer", path: "/staff/audit" },
    { icon: "📰", label: "News",               path: "/staff/news" },
  ],
  COMPLIANCE_OFFICER: [
    { icon: "📊", label: "Dashboard",        path: "/staff/home" },
    { icon: "📜", label: "Audit Logs",       path: "/staff/audit" },
    { icon: "🔍", label: "Inspections",      path: "/staff/inspections" },
    { icon: "📑", label: "Reports",          path: "/staff/reports" },
    { icon: "📰", label: "News",             path: "/staff/news" },
  ],
};

function StaffSidebar({ isOpen, onClose }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useSelector((state) => state.auth);
  const role      = user?.role || "";
  const links     = roleLinks[role] || [];

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