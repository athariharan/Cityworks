// pages/citizen/CitizenLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser, clearError, fetchUserProfile } from "../../redux/slices/authSlice";
import "../../styles/CitizenLogin.css";

/* Civic building SVG icon */
function CivicIcon() {
  return (
    <svg className="civic-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Flag pole */}
      <rect x="15.5" y="1" width="1.5" height="6" rx="0.5" fill="currentColor" opacity="0.9"/>
      {/* Flag */}
      <path d="M17 1.5 L22 3.5 L17 5.5 Z" fill="currentColor"/>
      {/* Pediment / roof triangle */}
      <path d="M5 12 L16 6.5 L27 12 Z" fill="currentColor"/>
      {/* Entablature bar */}
      <rect x="4" y="12" width="24" height="2.5" rx="0.5" fill="currentColor"/>
      {/* Four columns */}
      <rect x="6"  y="14.5" width="3" height="11" rx="1" fill="currentColor"/>
      <rect x="11" y="14.5" width="3" height="11" rx="1" fill="currentColor"/>
      <rect x="18" y="14.5" width="3" height="11" rx="1" fill="currentColor"/>
      <rect x="23" y="14.5" width="3" height="11" rx="1" fill="currentColor"/>
      {/* Door */}
      <rect x="13.5" y="20" width="5" height="5.5" rx="1.5" fill="currentColor" opacity="0.6"/>
      {/* Steps */}
      <rect x="3"  y="25.5" width="26" height="2"   rx="0.5" fill="currentColor"/>
      <rect x="1"  y="27.5" width="30" height="1.5" rx="0.5" fill="currentColor" opacity="0.7"/>
    </svg>
  );
}

function CitizenLogin() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [isRegister, setIsRegister] = useState(false);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [gender,   setGender]   = useState("");
  const [phone,    setPhone]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [showPass, setShowPass] = useState(false);

  const resetForm = () => {
    setName(""); setGender(""); setPhone("");
    setEmail(""); setPassword(""); setSuccess("");
    dispatch(clearError());
  };

  const handleToggle = (mode) => {
    resetForm();
    setIsRegister(mode === "register");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    dispatch(clearError());
    if (isRegister) {
      if (!name || !gender || !phone || !email || !password) return;
      const result = await dispatch(
        registerUser({ name, email, phone, gender: gender.toUpperCase(), password })
      );
      if (registerUser.fulfilled.match(result)) {
        setSuccess("Account created! Please sign in.");
        handleToggle("login");
      }
    } else {
      if (!email || !password) return;
      const result = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(result)) {
        const userId = result.payload?.data?.userId;
        if (userId) dispatch(fetchUserProfile(userId));
        navigate("/citizen/home");
      }
    }
  };

  return (
    <div className="nf-root">

      {/* ── Navbar with styled corner-bracket logo ── */}
      <div className="nf-navbar">
        <div className="nf-logo">
          <div className="logo-corner-wrap">
            <span className="lc lc-tl" /><span className="lc lc-tr" />
            <span className="lc lc-bl" /><span className="lc lc-br" />
            <CivicIcon />
            <span className="logo-text">CityWorks</span>
          </div>
        </div>
      </div>

      {/* ── Card ── */}
      <div className="nf-card">

        <div className="nf-card-brand">
          
          Citizen Portal
        </div>

        <h2 className="nf-title">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="nf-subtitle">
          {isRegister
            ? "Join thousands of citizens shaping a better city"
            : "Sign in to manage your city service requests"}
        </p>

        {error   && <div className="nf-alert nf-alert-error">⚠ {error}</div>}
        {success && <div className="nf-alert nf-alert-success">✓ {success}</div>}

        <form onSubmit={handleSubmit} noValidate className="nf-form">

          {isRegister && (
            <>
              <div className="nf-field">
                <input type="text" className="nf-input" placeholder=" "
                  value={name} onChange={(e) => setName(e.target.value)} autoFocus id="nf-name"/>
                <label className="nf-label" htmlFor="nf-name">Full Name</label>
              </div>

              <div className="nf-gender-wrap">
                <span className="nf-gender-title">Gender</span>
                <div className="nf-gender-row">
                  {["Male", "Female", "Other"].map((opt) => (
                    <label key={opt} className={`nf-gender-chip ${gender === opt ? "selected" : ""}`}>
                      <input type="checkbox" checked={gender === opt} onChange={() => setGender(opt)} />
                      {opt === "Male" ? "♂ Male" : opt === "Female" ? "♀ Female" : "⚬ Other"}
                    </label>
                  ))}
                </div>
              </div>

              <div className="nf-field">
                <input type="tel" className="nf-input" placeholder=" "
                  value={phone} onChange={(e) => setPhone(e.target.value)} id="nf-phone"/>
                <label className="nf-label" htmlFor="nf-phone">Phone Number</label>
              </div>
            </>
          )}

          <div className="nf-field">
            <input type="email" className="nf-input" placeholder=" "
              value={email} onChange={(e) => setEmail(e.target.value)}
              autoFocus={!isRegister} id="nf-email"/>
            <label className="nf-label" htmlFor="nf-email">Email Address</label>
          </div>

          <div className="nf-field nf-field--password">
            <input type={showPass ? "text" : "password"} className="nf-input" placeholder=" "
              value={password} onChange={(e) => setPassword(e.target.value)} id="nf-password"/>
            <label className="nf-label" htmlFor="nf-password">Password</label>
            <button type="button" className="nf-eye-btn" onClick={() => setShowPass((p) => !p)} tabIndex={-1}>
              <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
            </button>
          </div>

          <button type="submit" className="nf-submit" disabled={loading}>
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"/>
                {isRegister ? "Creating..." : "Signing in..."}</>
            ) : (
              isRegister ? "Create Account" : "Sign In"
            )}
          </button>

          {!isRegister && (
            <div className="nf-options-row">
              <label className="nf-remember">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="nf-help-link">Need help?</a>
            </div>
          )}

        </form>

        <p className="nf-toggle-text">
          {isRegister
            ? <>Already have an account?{" "}
                <button className="nf-toggle-btn" onClick={() => handleToggle("login")}>Sign in</button></>
            : <>New to CityWorks?{" "}
                <button className="nf-toggle-btn" onClick={() => handleToggle("register")}>Create account</button></>}
        </p>

        <p className="nf-staff-text">
          Municipal staff?{" "}
          <a href="/staff" className="nf-staff-link">Staff Login →</a>
        </p>

        <div className="nf-card-footer">
          <p>This page is protected by CityWorks security policy.</p>
        </div>

      </div>

      <div className="nf-page-footer">
        <p>© 2025 CityWorks Municipal Services · All rights reserved</p>
      </div>

    </div>
  );
}

export default CitizenLogin;
