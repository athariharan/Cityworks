// components/citizen/CitizenFooter.jsx
import { useNavigate } from "react-router-dom";
import "./Footer.css";

function CitizenFooter() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="cfooter">
      <div className="cfooter-inner">

        <div className="cfooter-top">

          <div className="cfooter-brand">
            <div className="cfooter-logo">
              <span className="cfooter-logo-icon">🏙️</span>
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
            <button className="cfooter-link" onClick={() => navigate("/citizen/dashboard")}>
              My Dashboard
            </button>
          </div>

          {/* Support */}
          <div className="cfooter-col">
            <h4 className="cfooter-col-title">Support</h4>
            <button className="cfooter-link">Help Center</button>
            <button className="cfooter-link">Contact Us</button>
            <button className="cfooter-link">Report a Bug</button>
            <button className="cfooter-link">Accessibility</button>
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