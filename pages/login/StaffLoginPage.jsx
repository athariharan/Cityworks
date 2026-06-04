// pages/Staff/StaffLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginStaff, clearError } from "../../redux/slices/authSlice";
import "../../styles/StaffLogin.css";

function StaffLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading: isLoading, error } = useSelector((state) => state.auth);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearError());

    if (!email || !password) return;

    const result = await dispatch(loginStaff({ email, password }));
    if (loginStaff.fulfilled.match(result)) {
      navigate("/staff/home");
    }
  };

  return (
    <div className="staff-root">

      <div className="staff-left">
        <div className="staff-badge">🔒 Authorized Personnel Only</div>
        <h2>Municipal <span>Operations</span> Portal</h2>
        <p>
          Secure access for city staff. Manage work orders, assets,
          crew dispatch, and compliance from one unified platform.
        </p>

      </div>

      <div className="staff-right">
        <div className="staff-form-box">

          <div className="logo-line">
            <div className="logo-icon">🏛️</div>
            <span className="logo-text">CityWorks</span>
          </div>

          <h3>Staff Sign In</h3>
          <p className="subtitle">Use your municipal credentials to access the system.</p>

          {error && <div className="staff-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>

            <div className="staff-field">
              <label className="staff-label">Email Address</label>
              <input
                type="email"
                className="staff-input"
                placeholder="staff@citiworks.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoFocus
              />
              <small className="staff-hint">Use your @citiworks.com email</small>
            </div>

            <div className="staff-field" style={{ marginBottom: "26px" }}>
              <label className="staff-label">Password</label>
              <input
                type="password"
                className="staff-input"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button type="submit" className="staff-submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Authenticating...
                </>
              ) : (
                "Sign In to Portal"
              )}
            </button>

          </form>

          <div className="citizen-link">
            Not a staff member? <a href="/">Citizen Portal →</a>
          </div>
        </div>
      </div>

    </div>
  );
}

export default StaffLogin;
