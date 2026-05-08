import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CitizenLayout from "../../components/citizen/Layout";
import api from "../../services/api";
import "./ServiceRequestForm.css";
 
// Matches exactly: com.cts.enums.AssetType
const ASSET_GROUPS = [
  {
    group: "💡 Lighting",
    types: ["STREET_LAMP", "TRAFFIC_SIGNAL", "PEDESTRIAN_LIGHT"],
  },
  {
    group: "🛣️ Roads & Transport",
    types: ["ROAD", "BRIDGE", "FOOTPATH", "SPEED_BREAKER", "BUS_STOP", "PARKING_LOTS"],
  },
  {
    group: "🚰 Water & Sanitation",
    types: ["WATER_TAP", "WATER_PIPELINE", "WATER_TANK", "SEWAGE", "DRAINAGE", "MANHOLE", "STORM_DRAIN", "PUBLIC_TOILET"],
  },
  {
    group: "⚡ Electrical",
    types: ["TRANSFORMER", "ELECTRIC_POLE", "SUBSTATION", "GENERATOR"],
  },
  {
    group: "🌳 Public Spaces",
    types: ["PARK", "PLAYGROUND", "GARDEN", "MARKET", "LIBRARY"],
  },
  {
    group: "🗑️ Waste Management",
    types: ["GARBAGE_BIN", "WASTE_COLLECTION_POINT", "RECYCLING_STATION", "COMPOST_UNIT"],
  },
  {
    group: "🏗️ Buildings & Infrastructure",
    types: ["HEALTH_CENTER", "SCHOOL_BUILDING"],
  },
  {
    group: "🚧 Signage & Safety",
    types: ["ROAD_SIGN", "BOUNDARY_WALL", "CCTV_CAMERA"],
  },
];
 
const toLabel = (type) =>
  type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
 
function ServiceRequestForm() {
  const navigate   = useNavigate();
  const { user: authUser, userId } = useSelector((state) => state.auth);  // ← read userId from Redux
 
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
 
  const removePhoto = () => {
    setPhoto(null);
    setPreview(null);
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError("Unable to identify your account. Please log out and log in again.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      if (photo) fd.append("photoFile", photo);
 
     await api.post(
  `/api/user/servicereq?assetTag=${encodeURIComponent(form.assetTag)}&assetType=${form.assetType}&description=${encodeURIComponent(form.description)}&citizenId=${userId}`,
  fd,
  { headers: { "Content-Type": undefined } }   // ← add this
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
        <div className="srf-centered">
          <div className="srf-success-card">
            <div className="srf-success-icon">✅</div>
            <h2 className="srf-success-title">Request Submitted!</h2>
            <p className="srf-success-desc">
              Your request is under review. You'll be notified when it's processed.
            </p>
            <div className="srf-success-actions">
              <button className="srf-btn-primary" onClick={() => navigate("/citizen/home")}>
                Back to Home
              </button>
              <button
                className="srf-btn-ghost"
                onClick={() => {
                  setSuccess(false);
                  setForm({ assetType: "", assetTag: "", description: "" });
                  setPhoto(null);
                  setPreview(null);
                }}
              >
                Submit Another
              </button>
            </div>
          </div>
        </div>
      </CitizenLayout>
    );
  }
 
  return (
    <CitizenLayout user={user}>
      <div className="srf-wrapper">
        <div className="srf-container">
 
          <div className="srf-header">
            <button className="srf-back" onClick={() => navigate(-1)}>← Back</button>
            <div>
              <h1 className="srf-title">Report an Issue</h1>
              <p className="srf-subtitle">Fill in the details below and we'll take care of it.</p>
            </div>
          </div>
 
          <form className="srf-form" onSubmit={handleSubmit}>
 
            {/* Step 1 — Asset Type */}
            <div className="srf-field">
              <label className="srf-label">
                Asset Type <span className="srf-req">*</span>
              </label>
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
                      <option key={type} value={type}>
                        {toLabel(type)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
 
            {/* Step 2 — Asset Tag (appears only after type selected) */}
            {form.assetType && (
              <div className="srf-field srf-field--animated">
                <label className="srf-label">
                  Asset Tag <span className="srf-req">*</span>
                </label>
                <input
                  type="text"
                  className="srf-input"
                  placeholder="e.g. AST-SL-001"
                  value={form.assetTag}
                  onChange={(e) => setForm({ ...form, assetTag: e.target.value.toUpperCase() })}
                  required
                />
                <p className="srf-hint">📌 Look for the tag printed on the physical asset.</p>
              </div>
            )}
 
            {/* Step 3 — Description */}
            <div className="srf-field">
              <label className="srf-label">
                Description <span className="srf-req">*</span>
              </label>
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
            </div>
 
            {/* Step 4 — Photo */}
            <div className="srf-field">
              <label className="srf-label">
                Photo <span className="srf-opt">(optional)</span>
              </label>
              {preview ? (
                <div className="srf-preview-wrap">
                  <img src={preview} alt="Preview" className="srf-preview-img" />
                  <button type="button" className="srf-remove-photo" onClick={removePhoto}>
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <label className="srf-upload-area" htmlFor="srf-photo-input">
                  <span className="srf-upload-icon">📷</span>
                  <span className="srf-upload-text">Click to upload a photo</span>
                  <span className="srf-upload-hint">JPG or PNG · max 10 MB</span>
                </label>
              )}
              <input
                id="srf-photo-input"
                type="file"
                accept="image/*"
                className="srf-hidden"
                onChange={handlePhoto}
              />
            </div>
 
            {error && <p className="srf-error">{error}</p>}
 
            <div className="srf-footer">
              <button type="button" className="srf-btn-ghost" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="srf-btn-primary" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Request"}
              </button>
            </div>
 
          </form>
        </div>
      </div>
    </CitizenLayout>
  );
}
 
export default ServiceRequestForm;