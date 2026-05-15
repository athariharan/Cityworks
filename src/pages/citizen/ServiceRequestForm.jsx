import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CitizenLayout from "../../components/citizen/Layout";
import api from "../../services/api";
import "../../styles/ServiceRequestForm.css";

const ASSET_GROUPS = [
  { group: "💡 Lighting",              types: ["STREET_LAMP", "TRAFFIC_SIGNAL", "PEDESTRIAN_LIGHT"] },
  { group: "🛣️ Roads & Transport",     types: ["ROAD", "BRIDGE", "FOOTPATH", "SPEED_BREAKER", "BUS_STOP", "PARKING_LOTS"] },
  { group: "🚰 Water & Sanitation",    types: ["WATER_TAP", "WATER_PIPELINE", "WATER_TANK", "SEWAGE", "DRAINAGE", "MANHOLE", "STORM_DRAIN", "PUBLIC_TOILET"] },
  { group: "⚡ Electrical",            types: ["TRANSFORMER", "ELECTRIC_POLE", "SUBSTATION", "GENERATOR"] },
  { group: "🌳 Public Spaces",         types: ["PARK", "PLAYGROUND", "GARDEN", "MARKET", "LIBRARY"] },
  { group: "🗑️ Waste Management",      types: ["GARBAGE_BIN", "WASTE_COLLECTION_POINT", "RECYCLING_STATION", "COMPOST_UNIT"] },
  { group: "🏗️ Buildings & Infrastructure", types: ["HEALTH_CENTER", "SCHOOL_BUILDING"] },
  { group: "🚧 Signage & Safety",      types: ["ROAD_SIGN", "BOUNDARY_WALL", "CCTV_CAMERA"] },
];

const toLabel = (type) =>
  type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function stepState(index, form) {
  const filled = [
    !!form.assetType,
    !!form.assetTag.trim(),
    !!form.description.trim(),
    true,
  ];
  if (filled[index] && (index < 3 ? filled.slice(0, index).every(Boolean) : true)) return "done";
  const firstEmpty = filled.findIndex((v) => !v);
  if (firstEmpty === index) return "active";
  return "next";
}

function VStep({ num, state, title, badge, badgeType, last, children }) {
  return (
    <div className="vstep">
      <div className="vstep-rail">
        <div className={`vstep-num vstep-num--${state}`}>
          {state === "done" ? "✓" : num}
        </div>
        {!last && <div className={`vstep-line vstep-line--${state}`} />}
      </div>
      <div className="vstep-content">
        <div className="vstep-label-row">
          <span className={`vstep-title vstep-title--${state}`}>{title}</span>
          <span className={`vstep-badge vstep-badge--${badgeType}`}>{badge}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function ServiceRequestForm() {
  const navigate = useNavigate();
  const { user: authUser, userId } = useSelector((state) => state.auth);

  const rawName = authUser?.email?.split("@")[0] || "User";
  const name    = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const user    = { name, initials: name.charAt(0).toUpperCase() };

  const [form,       setForm]       = useState({ assetType: "", assetTag: "", description: "" });
  const [photo,      setPhoto]      = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState(null);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => { setPhoto(null); setPreview(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) { setError("Unable to identify your account. Please log out and log in again."); return; }
    setSubmitting(true); setError(null);
    try {
      const fd = new FormData();
      if (photo) fd.append("photoFile", photo);
      await api.post(
        `/api/user/servicereq?assetTag=${encodeURIComponent(form.assetTag)}&assetType=${form.assetType}&description=${encodeURIComponent(form.description)}&citizenId=${userId}`,
        fd,
        { headers: { "Content-Type": undefined } }
      );
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <CitizenLayout user={user}>
        <div className="srf-page">
          <div className="srf-centered">
            <div className="srf-success-card">
              <div className="srf-success-icon">✅</div>
              <h2 className="srf-success-title">Request Submitted!</h2>
              <p className="srf-success-desc">
                Your request is under review. You'll be notified when it's processed.
              </p>
              <div className="srf-success-actions">
                <button className="srf-btn-primary" onClick={() => navigate("/citizen/home")}>Back to Home</button>
                <button className="srf-btn-ghost" onClick={() => { setSuccess(false); setForm({ assetType: "", assetTag: "", description: "" }); setPhoto(null); setPreview(null); }}>
                  Submit Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout user={user}>
      <div className="srf-page">

        {/* ── Hero ── */}
        <div className="srf-hero" style={{ backgroundImage: `linear-gradient(135deg, rgba(20,83,45,0.90) 0%, rgba(22,163,74,0.78) 50%, rgba(20,83,45,0.88) 100%), url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1920&q=80')` }}>
          <div className="srf-hero-dots" />
          <div className="srf-hero-ring srf-hero-ring-1" />
          <div className="srf-hero-ring srf-hero-ring-2" />
          <div className="srf-hero-ring srf-hero-ring-3" />
          <div className="srf-hero-ring srf-hero-ring-4" />
          <div className="srf-hero-orb srf-hero-orb-1" />
          <div className="srf-hero-orb srf-hero-orb-2" />
          <div className="srf-hero-inner">
            <div className="srf-crumb">
              <span className="srf-crumb-link" onClick={() => navigate("/citizen/home")}>Home</span>
              &nbsp;›&nbsp; Report an Issue
            </div>
            <div className="srf-hero-badge">
              <span className="srf-hero-badge-dot" />
              Civic Issue Reporting
            </div>
            <h1 className="srf-hero-title">Report an <span>Issue</span></h1>
            <p className="srf-hero-sub">
              Help us improve your city. Submit a service request and our team will respond promptly.
            </p>
            <div className="srf-hero-chips">
              <div className="srf-hero-chip">
                <span className="srf-hero-chip-icon">✅</span>
                <div><div className="srf-hero-chip-num">500+</div><div className="srf-hero-chip-lbl">Issues Resolved</div></div>
              </div>
              <div className="srf-hero-chip">
                <span className="srf-hero-chip-icon">⚡</span>
                <div><div className="srf-hero-chip-num">48h</div><div className="srf-hero-chip-lbl">Avg Response</div></div>
              </div>
              <div className="srf-hero-chip">
                <span className="srf-hero-chip-icon">🗂️</span>
                <div><div className="srf-hero-chip-num">8</div><div className="srf-hero-chip-lbl">Categories</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div className="srf-body">

          {/* Form card */}
          <div className="srf-form-card">
            <div className="srf-form-card-header">
              <div className="srf-form-card-icon">🛠️</div>
              <div>
                <h2>Submit a Service Request</h2>
                <p>All fields marked * are required</p>
              </div>
            </div>

            <form className="srf-form-body" onSubmit={handleSubmit} noValidate>

              {/* Step 1 — Asset Type */}
              <VStep num={1} state={stepState(0, form)} title="Asset Type" badge="Required" badgeType="required">
                <select
                  className="srf-select"
                  value={form.assetType}
                  onChange={(e) => setForm({ ...form, assetType: e.target.value, assetTag: "" })}
                  required
                >
                  <option value="">— Select asset type —</option>
                  {ASSET_GROUPS.map((g) => (
                    <optgroup key={g.group} label={g.group}>
                      {g.types.map((type) => (
                        <option key={type} value={type}>{toLabel(type)}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </VStep>

              {/* Step 2 — Asset Tag */}
              <VStep num={2} state={stepState(1, form)} title="Asset Tag" badge="Required" badgeType="required">
                <input
                  type="text"
                  className="srf-input"
                  placeholder="e.g. AST-SL-001"
                  value={form.assetTag}
                  onChange={(e) => setForm({ ...form, assetTag: e.target.value.toUpperCase() })}
                  required
                />
                <p className="srf-hint">📌 Look for the tag printed on the physical asset.</p>
              </VStep>

              {/* Step 3 — Description */}
              <VStep num={3} state={stepState(2, form)} title="Description" badge="Required" badgeType="required">
                <textarea
                  className="srf-textarea"
                  rows={5}
                  placeholder="Describe the issue — severity, exact location, any safety risk…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  maxLength={1000}
                />
                <div className="srf-char">{form.description.length} / 1000</div>
              </VStep>

              {/* Step 4 — Photo */}
              <VStep num={4} state="next" title="Photo" badge="Optional" badgeType="optional" last>
                {preview ? (
                  <div className="srf-preview-wrap">
                    <img src={preview} alt="Preview" className="srf-preview-img" />
                    <button type="button" className="srf-remove-photo" onClick={removePhoto}>✕ Remove</button>
                  </div>
                ) : (
                  <label className="srf-upload-area" htmlFor="srf-photo-input">
                    <span className="srf-upload-icon">📷</span>
                    <span className="srf-upload-text">Click to upload a photo</span>
                    <span className="srf-upload-hint">JPG or PNG · max 10 MB</span>
                  </label>
                )}
                <input id="srf-photo-input" type="file" accept="image/*" className="srf-hidden" onChange={handlePhoto} />
              </VStep>

              {error && <p className="srf-error">⚠ {error}</p>}

              <div className="srf-footer">
                <button type="button" className="srf-btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
                <button type="submit" className="srf-btn-primary" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Request →"}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="srf-sidebar">

            <div className="srf-side-card">
              <div className="srf-side-head"><span>📋</span><h3>What Happens Next?</h3></div>
              <div className="srf-side-body">
                {[
                  { n: 1, title: "Submission",  desc: "Your request is logged and assigned a unique ID instantly." },
                  { n: 2, title: "Review",      desc: "Our team validates and categorises your issue within 24h." },
                  { n: 3, title: "Scheduling",  desc: "A maintenance crew is dispatched and a date is set." },
                  { n: 4, title: "Resolution",  desc: "Work is completed and the request is marked resolved." },
                ].map((s) => (
                  <div key={s.n} className="srf-next-step">
                    <div className="srf-next-dot">{s.n}</div>
                    <div><h4>{s.title}</h4><p>{s.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="srf-side-card">
              <div className="srf-side-head"><span>💡</span><h3>Tips for a Good Report</h3></div>
              <div className="srf-side-body">
                {[
                  { icon: "🏷️", text: <><strong>Use the asset tag</strong> — it's the fastest way to identify the exact asset.</> },
                  { icon: "📍", text: <><strong>Be specific</strong> — mention landmarks, street names or directions.</> },
                  { icon: "📷", text: <><strong>Add a photo</strong> — requests with photos are resolved 40% faster.</> },
                  { icon: "⚠️", text: <><strong>Mention urgency</strong> — safety hazards are prioritised automatically.</> },
                ].map((t, i) => (
                  <div key={i} className="srf-tip-item">
                    <span className="srf-tip-icon">{t.icon}</span>
                    <span className="srf-tip-text">{t.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="srf-side-card">
              <div className="srf-side-head"><span>📊</span><h3>City Service Stats</h3></div>
              <div className="srf-side-body">
                <div className="srf-stats-grid">
                  {[
                    { num: "98%",  lbl: "Resolution Rate" },
                    { num: "48h",  lbl: "Avg Response"    },
                    { num: "500+", lbl: "Issues Closed"   },
                    { num: "8",    lbl: "Categories"      },
                  ].map((s) => (
                    <div key={s.lbl} className="srf-stat-box">
                      <div className="srf-stat-num">{s.num}</div>
                      <div className="srf-stat-lbl">{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}

export default ServiceRequestForm;
