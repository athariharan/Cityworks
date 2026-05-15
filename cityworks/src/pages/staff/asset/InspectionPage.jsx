// pages/staff/asset/InspectionPage.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { inspectionService } from "../../../services/Inspectionservice";
import { assetService }      from "../../../services/Assetservice";
import StaffService           from "../../../services/StaffService";
import "../../../styles/assetmanager.css";
import StaffLayout from "../../../components/staff/StaffLayout";

const CONDITION_OPTIONS = [
  { value:"EXCELLENT", label:"Excellent", color:"#1a7f37", bg:"#dbeafe", dot:"#2da44e", msg:"No action needed"            },
  { value:"GOOD",      label:"Good",      color:"#1b6e3a", bg:"#c8f0d8", dot:"#3fb950", msg:"Minor wear — routine check"  },
  { value:"FAIR",      label:"Fair",      color:"#7d5a00", bg:"#fff3cc", dot:"#d29922", msg:"Monitor and plan maintenance" },
  { value:"POOR",      label:"Poor",      color:"#9a3412", bg:"#ffe4d0", dot:"#e25c2c", msg:"Schedule maintenance soon"   },
  { value:"CRITICAL",  label:"Critical",  color:"#7f1d1d", bg:"#ffe0e0", dot:"#dc2626", msg:"Immediate action required"   },
];

// Must exactly match the backend InspectionStatus enum: GOOD, NEED_SERVICE
const STATUSES = ["GOOD", "NEED_SERVICE"];

const INITIAL = {
  assetId: "", inspectorId: "", performedAt: "",
  conditionRating: "", findings: "", status: "",
};

export default function InspectionPage() {
  const navigate = useNavigate();

  const [form,       setForm]       = useState(INITIAL);
  const [errors,     setErrors]     = useState({});
  const [photo,      setPhoto]      = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [submitErr,  setSubmitErr]  = useState("");
  const [assets,     setAssets]     = useState([]);
  const [staff,      setStaff]      = useState([]);
  const photoRef = useRef();

  // Load assets and staff list on mount
  useEffect(() => {
    assetService.getAll()
      .then(res => {
        const body = res?.data ?? res;
        const list = Array.isArray(body)      ? body
          : Array.isArray(body?.data)         ? body.data
          : Array.isArray(body?.data?.data)   ? body.data.data : [];
        setAssets(list);
      })
      .catch(() => {});

    StaffService.getAllStaff()
      .then(res => {
        const body = res?.data ?? res;
        const list = Array.isArray(body)    ? body
          : Array.isArray(body?.data)       ? body.data
          : Array.isArray(body?.data?.data) ? body.data.data : [];
        setStaff(list);
      })
      .catch(() => {});
  }, []);

  const selectedCondition = CONDITION_OPTIONS.find(c => c.value === form.conditionRating);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const handleCondition = (value) => {
    setForm(p => ({ ...p, conditionRating: value }));
    if (errors.conditionRating) setErrors(p => ({ ...p, conditionRating: "" }));
  };

  const handlePhoto = (e) => {
    const f = e.target.files[0]; if (!f) return;
    setPhoto(f);
    const r = new FileReader();
    r.onload = ev => setPreview(ev.target.result);
    r.readAsDataURL(f);
  };

  const validate = () => {
    const e = {};
    if (!form.assetId)         e.assetId         = "Please select an asset";
    if (!form.inspectorId)     e.inspectorId     = "Please select an inspector";
    if (!form.conditionRating) e.conditionRating  = "Condition rating is required";
    if (!form.status)          e.status           = "Status is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setSubmitErr("");
    try {
      await inspectionService.create({
        assetId:         Number(form.assetId),
        inspectorId:     Number(form.inspectorId),
        performedAt:     form.performedAt   || null,
        conditionRating: form.conditionRating,
        findings:        form.findings      || null,
        photoUri:        photo?.name        || null,
        status:          form.status        || null,
      });
      setSuccess(true);
      setForm(INITIAL);
      setPhoto(null);
      setPreview(null);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setSubmitErr(err.message || "Failed to save inspection. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <div className="header-icon" style={{ background:"#dbeafe", color:"#1e40af" }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div>
            <h1 className="page-title">Inspection Record</h1>
            <p className="page-sub">Log asset condition and findings</p>
          </div>
          <button className="page-view-btn" onClick={() => navigate("/staff/assets/inspections/list")}>
            View All Records →
          </button>
        </div>

        {success && (
          <div className="alert alert-success">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
            </svg>
            Inspection saved to database!
            <span className="alert-link" onClick={() => navigate("/staff/assets/inspections/list")}>
              View All Records →
            </span>
          </div>
        )}

        {submitErr && (
          <div className="alert alert-error">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
            </svg>
            {submitErr}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Card 1: Inspection Info */}
          <div className="card">
            <div className="card-section-label">Inspection Info</div>
            <div className="form-grid-2">

              {/* Asset dropdown — real data from API */}
              <div className="field">
                <label className="label">Asset <span className="req">*</span></label>
                <select
                  className={`input ${errors.assetId ? "input-error" : ""}`}
                  name="assetId" value={form.assetId} onChange={handleChange}
                >
                  <option value="">{assets.length ? "Select asset…" : "Loading assets…"}</option>
                  {assets.map(a => (
                    <option key={a.assetId || a.id} value={a.assetId || a.id}>
                      {a.assetTag} — {(a.type || a.assetType || "").replace(/_/g," ")}
                    </option>
                  ))}
                </select>
                {errors.assetId && <span className="err-msg">{errors.assetId}</span>}
              </div>

              {/* Inspector — staff dropdown */}
              <div className="field">
                <label className="label">Inspector <span className="req">*</span></label>
                <select
                  className={`input ${errors.inspectorId ? "input-error" : ""}`}
                  name="inspectorId" value={form.inspectorId} onChange={handleChange}
                >
                  <option value="">{staff.length ? "Select inspector…" : "Loading staff…"}</option>
                  {staff
                    .filter(s => s.role === "ASSET_MANAGER" || s.role === "ADMINISTRATOR")
                    .map(s => (
                      <option key={s.staffId} value={s.staffId}>
                        {s.name} (ID: {s.staffId}) — {(s.role || "").replace(/_/g, " ")}
                      </option>
                    ))}
                </select>
                {errors.inspectorId && <span className="err-msg">{errors.inspectorId}</span>}
              </div>

              {/* Performed At */}
              <div className="field">
                <label className="label">Performed At</label>
                <input
                  className="input" type="datetime-local"
                  name="performedAt" value={form.performedAt} onChange={handleChange}
                />
              </div>

              {/* Status */}
              <div className="field">
                <label className="label">Status <span className="req">*</span></label>
                <select
                  className={`input ${errors.status ? "input-error" : ""}`}
                  name="status" value={form.status} onChange={handleChange}
                >
                  <option value="">Select status</option>
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
                {errors.status && <span className="err-msg">{errors.status}</span>}
              </div>

            </div>
          </div>

          {/* Card 2: Condition Assessment */}
          <div className="card mt-16">
            <div className="card-section-label">Condition Assessment</div>

            <div className="field">
              <label className="label">Condition Rating <span className="req">*</span></label>
              <div className="condition-grid">
                {CONDITION_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    className={`condition-card ${form.conditionRating === opt.value ? "condition-selected" : ""}`}
                    style={form.conditionRating === opt.value ? { borderColor: opt.dot, background: opt.bg } : {}}
                    onClick={() => handleCondition(opt.value)}
                  >
                    <input type="radio" name="conditionRating" value={opt.value}
                      checked={form.conditionRating === opt.value} onChange={() => {}}
                      style={{ display:"none" }}
                    />
                    <span className="condition-dot" style={{ background: opt.dot }}/>
                    <span className="condition-label"
                      style={form.conditionRating === opt.value ? { color: opt.color, fontWeight:600 } : {}}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
              {errors.conditionRating && <span className="err-msg">{errors.conditionRating}</span>}
            </div>

            {selectedCondition && (
              <div className="condition-banner"
                style={{ background: selectedCondition.bg, borderLeft: `4px solid ${selectedCondition.dot}` }}>
                <span style={{ color: selectedCondition.color, fontWeight:600 }}>● {selectedCondition.label}</span>
                <span style={{ color: selectedCondition.color, opacity:0.8, fontSize:"13px", marginLeft:8 }}>
                  {selectedCondition.msg}
                </span>
              </div>
            )}

            <div className="field mt-16">
              <label className="label">Findings</label>
              <textarea
                className="input textarea" name="findings" value={form.findings}
                onChange={handleChange}
                placeholder="Describe observed conditions, defects, or notes..." rows={4}
              />
            </div>
          </div>

          {/* Card 3: Evidence */}
          <div className="card mt-16">
            <div className="card-section-label">Evidence</div>
            <div className="field">
              <label className="label">Upload Photo</label>
              <div className="upload-zone mini" onClick={() => photoRef.current.click()}>
                <input ref={photoRef} type="file" accept="image/*"
                  style={{ display:"none" }} onChange={handlePhoto}
                />
                {photo ? (
                  <div className="upload-info">
                    <svg width="16" height="16" fill="none" stroke="#1d4ed8" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span className="upload-name">{photo.name}</span>
                    <button type="button" className="remove-btn"
                      onClick={e => { e.stopPropagation(); setPhoto(null); setPreview(null); }}>✕</button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <svg width="18" height="18" fill="none" stroke="#3b82f6" strokeWidth="1.5" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>Upload photo evidence</span>
                  </div>
                )}
              </div>
              {preview && (
                <div className="preview-box mt-8">
                  <img src={preview} alt="evidence preview" className="preview-img"/>
                </div>
              )}
            </div>
          </div>

          <div className="actions">
            <button type="button" className="btn-secondary"
              onClick={() => { setForm(INITIAL); setErrors({}); setPhoto(null); setPreview(null); setSubmitErr(""); }}>
              Reset
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"/> Saving...</> : "Save Inspection"}
            </button>
          </div>

        </form>
      </div>
    </StaffLayout>
  );
}
