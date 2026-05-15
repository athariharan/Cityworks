// pages/citizen/CitizenProfile.jsx
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../../styles/CitizenProfile.css";

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

const GENDER_DISPLAY = {
  MALE:   { symbol: "♂", label: "Male" },
  FEMALE: { symbol: "♀", label: "Female" },
  OTHER:  { symbol: "⚬", label: "Other" },
};

function MaleAvatar() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="cp-avatar-svg">
      {/* Head */}
      <circle cx="50" cy="35" r="20" fill="rgba(255,255,255,0.9)"/>
      {/* Hair — short, brushed forward */}
      <path d="M30 33 Q30 14 50 14 Q70 14 70 33 Q65 18 50 18 Q35 18 30 33Z" fill="rgba(255,255,255,0.55)"/>
      {/* Eyes */}
      <circle cx="43" cy="34" r="2.5" fill="#009F6B"/>
      <circle cx="57" cy="34" r="2.5" fill="#009F6B"/>
      {/* Smile */}
      <path d="M43 43 Q50 49 57 43" stroke="#009F6B" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Shoulders / body */}
      <path d="M20 90 Q20 68 35 63 Q42 60 50 60 Q58 60 65 63 Q80 68 80 90Z" fill="rgba(255,255,255,0.75)"/>
      {/* Collar / shirt detail */}
      <path d="M43 63 L50 72 L57 63" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function FemaleAvatar() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="cp-avatar-svg">
      {/* Hair back layer */}
      <path d="M28 56 Q24 40 26 30 Q28 10 50 10 Q72 10 74 30 Q76 40 72 56 Q66 50 50 50 Q34 50 28 56Z" fill="rgba(255,255,255,0.45)"/>
      {/* Head */}
      <circle cx="50" cy="36" r="20" fill="rgba(255,255,255,0.9)"/>
      {/* Hair top/front */}
      <path d="M30 34 Q30 15 50 15 Q70 15 70 34 Q66 20 50 20 Q34 20 30 34Z" fill="rgba(255,255,255,0.55)"/>
      {/* Side hair strands */}
      <path d="M30 34 Q26 46 28 56" stroke="rgba(255,255,255,0.5)" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M70 34 Q74 46 72 56" stroke="rgba(255,255,255,0.5)" strokeWidth="6" strokeLinecap="round" fill="none"/>
      {/* Eyes */}
      <ellipse cx="43" cy="35" rx="2.5" ry="2.8" fill="#009F6B"/>
      <ellipse cx="57" cy="35" rx="2.5" ry="2.8" fill="#009F6B"/>
      {/* Smile */}
      <path d="M43 44 Q50 51 57 44" stroke="#009F6B" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Shoulders / blouse */}
      <path d="M20 90 Q20 68 32 63 Q40 59 50 59 Q60 59 68 63 Q80 68 80 90Z" fill="rgba(255,255,255,0.75)"/>
      {/* Neckline */}
      <path d="M44 63 Q50 70 56 63" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export default function CitizenProfile() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const name      = user?.name      || localStorage.getItem("name")      || null;
  const phone     = user?.phone     || localStorage.getItem("phone")     || null;
  const gender    = user?.gender    || localStorage.getItem("gender")    || null;
  const email     = user?.email     || null;
  const createdAt = user?.createdAt || localStorage.getItem("createdAt") || null;

  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
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
            {gender === "MALE"   && <MaleAvatar />}
            {gender === "FEMALE" && <FemaleAvatar />}
            {(!gender || gender === "OTHER") && (
              <span className="cp-avatar-initials">{initials}</span>
            )}
          </div>
          <p className="cp-left-name">{name || "Citizen"}</p>
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
            <span className="cp-detail-val">{name || "—"}</span>
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
