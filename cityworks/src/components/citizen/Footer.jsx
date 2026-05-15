// components/citizen/CitizenFooter.jsx
import { useNavigate } from "react-router-dom";
import "../../styles/Footer.css";

function CivicIcon() {
  return (
    <svg className="cfooter-civic-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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

function CitizenFooter() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="cfooter">
      <div className="cfooter-inner">

        <div className="cfooter-top">

          <div className="cfooter-brand">
            <div className="cfooter-logo">
              <CivicIcon />
              <span className="cfooter-logo-text">CityWorks</span>
            </div>
            <p className="cfooter-tagline">
              Municipal Work Order &amp; Asset Service Manager.
              Connecting citizens with the services that keep our city running.
            </p>
          </div>

          {/* Quick Links */}
          <div className="cfooter-col">
            <h4 className="cfooter-col-title">Services</h4>
            <button className="cfooter-link" onClick={() => navigate("/citizen/request/new")}>
              Submit a Request
            </button>
            <button className="cfooter-link" onClick={() => navigate("/citizen/track")}>
              Track Request
            </button>
            <button className="cfooter-link" onClick={() => navigate("/citizen/history")}>
              Request History
            </button>
            <button className="cfooter-link" onClick={() => navigate("/citizen/home")}>
              My Dashboard
            </button>
          </div>

          {/* Contact */}
          <div className="cfooter-col">
            <h4 className="cfooter-col-title">Contact</h4>
            <p className="cfooter-contact-item">📞 1800-CITYWORKS</p>
            <p className="cfooter-contact-item">✉️ support@cityworks.gov</p>
            <p className="cfooter-contact-item">🕘 Mon–Fri, 9am–6pm</p>
          </div>

        </div>

        {/* Divider */}
        <div className="cfooter-divider"></div>

        {/* Bottom row */}
        <div className="cfooter-bottom">
          <p className="cfooter-copy">
            © {year} CityWorks. All rights reserved. A Municipal Services Platform.
          </p>
          <div className="cfooter-bottom-links">
            <button className="cfooter-link-sm">Privacy Policy</button>
            <span className="cfooter-dot">·</span>
            <button className="cfooter-link-sm">Terms of Use</button>
            <span className="cfooter-dot">·</span>
            <button className="cfooter-link-sm">Sitemap</button>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default CitizenFooter;