// pages/citizen/CitizenHome.jsx
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CitizenLayout from "../../components/citizen/Layout";
import "../../styles/CitizenHome.css";
import { QUICK_ACTIONS, EXPERTISE } from "../../utility/CitizenConfig";


export default function CitizenHome() {
  const navigate = useNavigate();
  const { user: authUser } = useSelector((state) => state.auth);

  const realName    = authUser?.name || localStorage.getItem("name") || null;
  const rawUserName = realName || authUser?.email?.split("@")[0] || "User";
  const displayName = rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1);
  const initials    = displayName.charAt(0).toUpperCase();
  const user        = { name: displayName, initials };

  const handleImgError = (event, fallback) => {
    if (event.target.src !== fallback) event.target.src = fallback;
  };

  return (
    <CitizenLayout user={user}>

      <div className="hero-banner">
        {/* Wave into cream background below */}
        <svg
          className="hero-wave"
          viewBox="0 0 1440 64"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M0,32 C480,64 960,0 1440,32 L1440,64 L0,64 Z" fill="#f9f7f4"/>
        </svg>

        <div className="hero-content">
          <div className="hero-badge">🌿 Welcome back, {user.name}!</div>
          <h1 className="hero-title">
            Your City,{" "}
            <span className="hero-title-violet">Your Voice.</span>
          </h1>
          <p className="hero-desc">
            Report issues, track repairs, and stay connected with the
            services that keep your city running. CityWorks puts
            municipal services at your fingertips.
          </p>

        </div>
      </div>

      {/* ── Page body — warm cream background ── */}
      <div className="page-body">

        {/* ── Quick Action Cards ── */}
        <section className="qactions">
          <div className="qactions-inner">
            <p className="qactions-label">Quick Actions</p>
            <div className="qactions-grid">
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.title}
                  className={`qac ${qa.variant}`}
                  onClick={() => navigate(qa.path)}
                >
                  <div className="qac-icon">{qa.icon}</div>
                  <div className="qac-title">{qa.title}</div>
                  <p className="qac-desc">{qa.desc}</p>
                  <span className="qac-link">{qa.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Our Expertise ── */}
        <section className="expertise-section">
          <div className="expertise-inner">
            <div className="expertise-header">
              <span className="expertise-eyebrow">What We Do</span>
              <h2 className="expertise-title">Our City Services</h2>
              <p className="expertise-sub">
                From roads to street lights, we manage the infrastructure that makes
                urban life safe, clean, and comfortable.
              </p>
            </div>

            {EXPERTISE.map((item, index) => (
              <div key={item.title} className={`exp-row ${index % 2 === 1 ? "exp-row--flip" : ""}`}>
                <div className="exp-img-wrap">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="exp-img"
                    loading="lazy"
                    onError={(event) => handleImgError(event, item.fallback)}
                  />
                </div>
                <div className="exp-card">
                  <span className="exp-tag">{item.tag}</span>
                  <h3 className="exp-card-title">{item.title}</h3>
                  <p className="exp-card-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>{/* end .page-body */}

    </CitizenLayout>
  );
}
