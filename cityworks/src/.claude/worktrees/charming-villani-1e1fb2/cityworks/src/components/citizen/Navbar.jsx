// components/citizen/CitizenNavbar.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
 
function CitizenNavbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
 
  const displayUser = user || { name: "Guest", initials: "G" };
 
  const isActive = (path) => location.pathname === path;
 
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  const handleSignOut = () => {
    setDropdownOpen(false);
    navigate("/login");
  };
 
  const handleProfile = () => {
    setDropdownOpen(false);
    navigate("/citizen/profile");
  };
 
  return (
    <nav className="cnav">
      <div className="cnav-inner">
 
        {/* Logo */}
        <div className="cnav-logo" onClick={() => navigate("/citizen/home")}>
          <span className="cnav-logo-icon">🏙️</span>
          <span className="cnav-logo-text">CityWorks</span>
        </div>
 
        {/* Right side */}
        <div className="cnav-right">
 
          {/* User profile with dropdown */}
          <div className="cnav-profile-wrapper" ref={dropdownRef}>
            <button
              className="cnav-profile"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <div className="cnav-avatar">{displayUser.initials}</div>
              <span className="cnav-username">{displayUser.name}</span>
              <svg
                className={`cnav-chevron ${dropdownOpen ? "open" : ""}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
 
            {dropdownOpen && (
              <div className="cnav-dropdown">
                <button className="cnav-dropdown-item" onClick={handleProfile}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </button>
                <div className="cnav-dropdown-divider" />
                <button className="cnav-dropdown-item cnav-dropdown-signout" onClick={handleSignOut}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
 
          {/* Hamburger for mobile */}
          <button
            className={`cnav-hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
 
      </div>
    </nav>
  );
}
 
export default CitizenNavbar;