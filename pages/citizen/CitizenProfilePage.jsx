// pages/citizen/CitizenProfile.jsx
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../../styles/CitizenProfile.css";
import { GENDER_DISPLAY } from "../../utility/CitizenConfig";

function CivicIcon() {
  return (
    <svg className="cp-civic-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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


function PersonAvatar() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="cp-avatar-svg">
      {/* Head */}
      <circle cx="50" cy="34" r="20" fill="rgba(255,255,255,0.9)"/>
      {/* Eyes */}
      <circle cx="43" cy="33" r="2.5" fill="#009F6B"/>
      <circle cx="57" cy="33" r="2.5" fill="#009F6B"/>
      {/* Smile */}
      <path d="M43 42 Q50 48 57 42" stroke="#009F6B" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Shoulders / body */}
      <path d="M20 90 Q20 68 35 63 Q42 60 50 60 Q58 60 65 63 Q80 68 80 90Z" fill="rgba(255,255,255,0.75)"/>
    </svg>
  );
}

export default function CitizenProfile() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const displayName = user?.name      || localStorage.getItem("name")      || null;
  const phone       = user?.phone     || localStorage.getItem("phone")     || null;
  const gender      = user?.gender    || localStorage.getItem("gender")    || null;
  const email       = user?.email     || null;
  const createdAt   = user?.createdAt || localStorage.getItem("createdAt") || null;

  const initials = displayName
    ? displayName.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase()
    : (email?.[0] || "U").toUpperCase();

  const genderInfo  = gender ? GENDER_DISPLAY[gender] : null;

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  return (
    <div className="cp-root">

      {/* Navbar */}
      <nav className="cp-navbar">
        <div className="cp-logo">
          <div className="cp-logo-corner">
            <span className="cp-lc cp-lc-tl" /><span className="cp-lc cp-lc-tr" />
            <span className="cp-lc cp-lc-bl" /><span className="cp-lc cp-lc-br" />
            <CivicIcon />
            <span className="cp-logo-text">CityWorks</span>
          </div>
        </div>
        <button className="cp-back-btn" onClick={() => navigate("/citizen/home")}>
          ← Back to Home
        </button>
      </nav>

      {/* Two-panel full-screen */}
      <div className="cp-panels-wrap">
      <div className="cp-panels">

        {/* Left — dark green gradient */}
        <div className="cp-left">
          <div className="cp-avatar">
            <PersonAvatar />
          </div>
          <p className="cp-left-name">{displayName || "Citizen"}</p>
          <p className="cp-left-role">Citizen</p>
          <p className="cp-left-email">{email || "—"}</p>

          {memberSince && (
            <>
              <div className="cp-left-divider" />
              <p className="cp-left-since">
                <strong>Member Since</strong>
                {memberSince}
              </p>
            </>
          )}
        </div>

        {/* Right — light green gradient */}
        <div className="cp-right">

          <div className="cp-breadcrumb">
            <span className="cp-breadcrumb-link" onClick={() => navigate("/citizen/home")}>Home</span>
            <span>/</span>
            <span className="cp-breadcrumb-link">User</span>
            <span>/</span>
            <span className="cp-breadcrumb-current">User Profile</span>
          </div>

          <p className="cp-right-heading">Citizen Portal</p>
          <h2 className="cp-right-title">User Profile</h2>

          <div className="cp-detail">
            <span className="cp-detail-key">Full Name</span>
            <span className="cp-detail-val">{displayName || "—"}</span>
          </div>

          <div className="cp-detail">
            <span className="cp-detail-key">Email</span>
            <span className="cp-detail-val">{email || "—"}</span>
          </div>

          <div className="cp-detail">
            <span className="cp-detail-key">Phone</span>
            <span className="cp-detail-val">{phone || "—"}</span>
          </div>

          <div className="cp-detail">
            <span className="cp-detail-key">Gender</span>
            <span className="cp-detail-val">
              {genderInfo
                ? <><span className="cp-gender-sym">{genderInfo.symbol}</span>{genderInfo.label}</>
                : "—"}
            </span>
          </div>

        </div>
      </div>
      </div>

    </div>
  );
}
