// pages/citizen/CitizenHome.jsx
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CitizenLayout from "../../components/citizen/Layout";
import "./CitizenHome.css";
 
function CitizenHome() {
  const navigate = useNavigate();
  const { user: authUser } = useSelector((state) => state.auth);
 
  // Trim name from email — "hari@gmail.com" → "Hari"
  const rawName  = authUser?.email?.split("@")[0] || "User";
  const name     = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const initials = name.charAt(0).toUpperCase();
 
  const user = { name, initials };
 
  return (
    <CitizenLayout user={user}>
 
      {/* ── Action Buttons Bar ── */}
      <div className="action-bar">
        <div className="action-bar-inner">
 
          <button
            className="action-btn action-btn--primary"
            onClick={() => navigate("/citizen/request/new")}
          >
            <span className="action-btn-icon">＋</span>
            Create Request
          </button>
 
          <button
            className="action-btn action-btn--secondary"
            onClick={() => navigate("/citizen/track")}
          >
            <span className="action-btn-icon">📍</span>
            Track
          </button>
 
          <button
            className="action-btn action-btn--secondary"
            onClick={() => navigate("/citizen/history")}
          >
            <span className="action-btn-icon">🕓</span>
            History
          </button>
 
        </div>
      </div>
 
      {/* ── Hero Section ── */}
      <div className="hero-section">
        <div className="hero-inner">
 
          {/* Left — Text */}
          <div className="hero-text">
            <div className="hero-tag">Welcome back, {user.name.split(" ")[0]} 👋</div>
            <h1 className="hero-title">
              Your City,<br />
              <span className="hero-title-accent">Your Voice.</span>
            </h1>
            <p className="hero-desc">
              Report issues, track repairs, and stay updated on the services
              that keep your city running. CityWorks puts municipal services
              at your fingertips.
            </p>
            <div className="hero-actions">
              <button
                className="hero-cta-primary"
                onClick={() => navigate("/citizen/request/new")}
              >
                Report an Issue
              </button>
              <button
                className="hero-cta-secondary"
                onClick={() => navigate("/citizen/track")}
              >
                Track My Requests →
              </button>
            </div>
          </div>
 
         
        </div>
 
        {/* Service Categories */}
        <div className="categories-section">
          <h2 className="categories-title">What do you need help with?</h2>
          <div className="categories-grid">
            {[
              { icon: "🛣️", label: "Roads & Potholes" },
              { icon: "💡", label: "Street Lights" },
              { icon: "🗑️", label: "Sanitation" },
              { icon: "🌳", label: "Parks & Green" },
              { icon: "🚰", label: "Water & Utilities" },
              { icon: "🏗️", label: "Infrastructure" },
            ].map((cat) => (
              <button
                key={cat.label}
                className="category-card"
                onClick={() => navigate("/citizen/request/new")}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-label">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
 
      </div>
 
    </CitizenLayout>
  );
}
 
export default CitizenHome;
 