// pages/staff/asset/AssetPage.jsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAssets } from "../../../context/AssetContext";
import "../../../styles/assetmanager.css";
import StaffLayout from "../../../components/staff/StaffLayout";

const ASSET_GROUPS = [
  { group: "💡 Lighting",                   types: ["STREET_LAMP", "TRAFFIC_SIGNAL", "PEDESTRIAN_LIGHT"] },
  { group: "🛣️ Roads & Transport",          types: ["ROAD", "BRIDGE", "FOOTPATH", "SPEED_BREAKER", "BUS_STOP", "PARKING_LOTS"] },
  { group: "🚰 Water & Sanitation",         types: ["WATER_TAP", "WATER_PIPELINE", "WATER_TANK", "SEWAGE", "DRAINAGE", "MANHOLE", "STORM_DRAIN", "PUBLIC_TOILET"] },
  { group: "⚡ Electrical",                 types: ["TRANSFORMER", "ELECTRIC_POLE", "SUBSTATION", "GENERATOR"] },
  { group: "🌳 Public Spaces",              types: ["PARK", "PLAYGROUND", "GARDEN", "MARKET", "LIBRARY"] },
  { group: "🗑️ Waste Management",           types: ["GARBAGE_BIN", "WASTE_COLLECTION_POINT", "RECYCLING_STATION", "COMPOST_UNIT"] },
  { group: "🏗️ Buildings & Infrastructure", types: ["HEALTH_CENTER", "SCHOOL_BUILDING"] },
  { group: "🚧 Signage & Safety",           types: ["ROAD_SIGN", "BOUNDARY_WALL", "CCTV_CAMERA"] },
];

const ASSET_STATUSES = ["Active", "Inactive", "Under_Maintenance", "Decommissioned"];
const DOC_TYPES      = ["Invoice", "Permit", "Inspection_Report", "Blueprint", "Manual"];

const INITIAL = { assetTag:"", type:"", status:"", locationGeoJSON:"", installDate:"", docType:"" };

function validate(form) {
  const e = {};
  if (!form.assetTag) e.assetTag = "Asset tag is required";
  else if (!/^[a-zA-Z0-9\-]{3,50}$/.test(form.assetTag)) e.assetTag = "3–50 chars, alphanumeric + hyphens";
  if (!form.type)        e.type        = "Asset type is required";
  if (!form.status)      e.status      = "Asset status is required";
  if (!form.installDate) e.installDate = "Install date is required";
  return e;
}

export default function AssetPage() {
  const navigate = useNavigate();
  const { addAsset } = useAssets();
  const [form,    setForm]    = useState(INITIAL);
  const [errors,  setErrors]  = useState({});
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const handleFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    setFile(f);
    if (f.type.startsWith("image/")) {
      const r = new FileReader();
      r.onload = ev => setPreview(ev.target.result);
      r.readAsDataURL(f);
    } else setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    addAsset({ ...form, fileName: file?.name || null, submittedAt: new Date().toLocaleString("en-IN") });
    setLoading(false); setSuccess(true);
    setForm(INITIAL); setFile(null); setPreview(null);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <StaffLayout>
      <div className="page-wrapper">

        <button className="page-back-btn" onClick={() => navigate("/staff/assets")}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Asset Management
        </button>

        <div className="page-header">
          <div className="header-icon">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <path d="M9 9h6M9 12h6M9 15h4"/>
            </svg>
          </div>
          <div>
            <h1 className="page-title">Asset Registry</h1>
            <p className="page-sub">Register a new asset to the municipal inventory</p>
          </div>
          <button className="page-view-btn" onClick={() => navigate("/staff/assets/registry/list")}>
            View All Assets →
          </button>
        </div>

        {success && (
          <div className="alert alert-success">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
            </svg>
            Asset registered successfully!
            <span className="alert-link" onClick={() => navigate("/staff/assets/registry/list")}>
              View All Assets →
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Card 1: Asset Information */}
          <div className="card">
            <div className="card-section-label">Asset Information</div>
            <div className="form-grid-2">

              {/* Asset Tag — plain text input */}
              <div className="field">
                <label className="label">Asset Tag <span className="req">*</span></label>
                <input
                  className={`input ${errors.assetTag ? "input-error" : ""}`}
                  name="assetTag" value={form.assetTag} onChange={handleChange}
                  placeholder="e.g. RD-2024-001" maxLength={50}
                />
                {errors.assetTag && <span className="err-msg">{errors.assetTag}</span>}
                <span className="hint">Format: TYPE-YEAR-SEQ (alphanumeric + hyphens)</span>
              </div>

              {/* Install Date */}
              <div className="field">
                <label className="label">Install Date <span className="req">*</span></label>
                <input
                  className={`input ${errors.installDate ? "input-error" : ""}`}
                  type="date" name="installDate" value={form.installDate} onChange={handleChange}
                />
                {errors.installDate && <span className="err-msg">{errors.installDate}</span>}
              </div>

              {/* Asset Type — grouped optgroup select */}
              <div className="field">
                <label className="label">Asset Type <span className="req">*</span></label>
                <select
                  className={`input ${errors.type ? "input-error" : ""}`}
                  name="type" value={form.type} onChange={handleChange}
                >
                  <option value="">Select asset type</option>
                  {ASSET_GROUPS.map(g => (
                    <optgroup key={g.group} label={g.group}>
                      {g.types.map(t => (
                        <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {errors.type && <span className="err-msg">{errors.type}</span>}
              </div>

              {/* Asset Status */}
              <div className="field">
                <label className="label">Asset Status <span className="req">*</span></label>
                <select
                  className={`input ${errors.status ? "input-error" : ""}`}
                  name="status" value={form.status} onChange={handleChange}
                >
                  <option value="">Select status</option>
                  {ASSET_STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
                {errors.status && <span className="err-msg">{errors.status}</span>}
              </div>

            </div>

            <div className="field mt-16">
              <label className="label">Location (GeoJSON)</label>
              <textarea
                className="input textarea" name="locationGeoJSON"
                value={form.locationGeoJSON} onChange={handleChange}
                placeholder='{"type":"Point","coordinates":[80.2707,13.0827]}' rows={3}
              />
              <span className="hint">Paste GeoJSON coordinates or leave blank</span>
            </div>
          </div>

          {/* Card 2: Document Attachment — no File URI field */}
          <div className="card mt-16">
            <div className="card-section-label">Document Attachment</div>

            <div className="field" style={{ maxWidth: "50%" }}>
              <label className="label">Document Type</label>
              <select className="input" name="docType" value={form.docType} onChange={handleChange}>
                <option value="">Select document type</option>
                {DOC_TYPES.map(d => (
                  <option key={d} value={d}>{d.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            <div className="field mt-16">
              <label className="label">Upload File</label>
              <div className="upload-zone" onClick={() => fileRef.current.click()}>
                <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx"
                  style={{ display: "none" }} onChange={handleFile}
                />
                {file ? (
                  <div className="upload-info">
                    <svg width="16" height="16" fill="none" stroke="#1d4ed8" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span className="upload-name">{file.name}</span>
                    <span className="hint">({(file.size / 1024).toFixed(1)} KB)</span>
                    <button type="button" className="remove-btn"
                      onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); }}>✕</button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <svg width="22" height="22" fill="none" stroke="#3b82f6" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>Click to upload document or image</span>
                    <span className="hint">PDF, DOC, or Image files</span>
                  </div>
                )}
              </div>
              {preview && (
                <div className="preview-box mt-8">
                  <img src={preview} alt="preview" className="preview-img" />
                </div>
              )}
            </div>
          </div>

          <div className="actions">
            <button type="button" className="btn-secondary"
              onClick={() => { setForm(INITIAL); setErrors({}); setFile(null); setPreview(null); }}>
              Reset
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving...</> : (
                <>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v14a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                  </svg>
                  Register Asset
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </StaffLayout>
  );
} 