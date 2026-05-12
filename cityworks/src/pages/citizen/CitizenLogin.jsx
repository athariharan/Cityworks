// pages/citizen/CitizenLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser, clearError } from "../../redux/slices/authSlice";
import "../../styles/CitizenLogin.css";

function CitizenLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [isRegister, setIsRegister] = useState(false);

  // Shared fields
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");

  // Register-only fields
  const [name,   setName]   = useState("");
  const [gender, setGender] = useState("");
  const [phone,  setPhone]  = useState("");

  // Local success message
  const [success, setSuccess] = useState("");

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
      // Validate register fields
      if (!name || !gender || !phone || !email || !password) {
        return;
      }

      // POST /api/auth/register
      // Sends: { name, email, phone, gender, password }
      // gender must be uppercase to match backend: MALE / FEMALE / OTHER
      const result = await dispatch(
        registerUser({
          name,
          email,
          phone,
          gender: gender.toUpperCase(),
          password,
        })
      );

      if (registerUser.fulfilled.match(result)) {
        setSuccess("Account created! Please sign in.");
        handleToggle("login");
      }

    } else {
      // Validate login fields
      if (!email || !password) return;
      const result = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(result)) {
        // role from backend is "USER" — route to citizen home
        navigate("/citizen/home");
      }
    }
  };

  return (
    <div className="citizen-root">
      <div className="citizen-card">

        {/* Header */}
        <div className="citizen-header">
          <div className="city-icon">🏙️</div>
          <h1>CityWorks</h1>
          <p>Citizen Service Portal</p>
        </div>

        {/* Tabs */}
        <div className="tab-row">
          <button
            className={`tab-btn ${!isRegister ? "active" : ""}`}
            onClick={() => handleToggle("login")}
          >
            Sign In
          </button>
          <button
            className={`tab-btn ${isRegister ? "active" : ""}`}
            onClick={() => handleToggle("register")}
          >
            Create Account
          </button>
        </div>

        {/* Body */}
        <div className="citizen-body">

          {error   && <div className="alert-custom alert-danger-custom">{error}</div>}
          {success && <div className="alert-custom alert-success-custom"> {success}</div>}

          <form onSubmit={handleSubmit} noValidate>

            {/* Register-only fields */}
            {isRegister && (
              <>
                <div className="field-group">
                  <label className="form-label-custom">Full Name</label>
                  <input
                    type="text"
                    className="form-input-custom"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="field-group">
                  <label className="form-label-custom">Gender</label>
                  <div className="gender-row">
                    {["Male", "Female", "Other"].map((option) => (
                      <label
                        key={option}
                        className={`gender-chip ${gender === option ? "selected" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={gender === option}
                          onChange={() => setGender(option)}
                        />
                        {option === "Male" ? "♂ Male" : option === "Female" ? "♀ Female" : "⚬ Other"}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="field-group">
                  <label className="form-label-custom">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input-custom"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Shared fields */}
            <div className="field-group">
              <label className="form-label-custom">Email Address</label>
              <input
                type="email"
                className="form-input-custom"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus={!isRegister}
              />
            </div>

            <div className="field-group" style={{ marginBottom: "24px" }}>
              <label className="form-label-custom">Password</label>
              <input
                type="password"
                className="form-input-custom"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {isRegister ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                isRegister ? "Create Account" : "Sign In"
              )}
            </button>

          </form>

          <div className="staff-link">
            Are you a municipal staff member?{" "}
            <a href="/staff">Staff Login →</a>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CitizenLogin;