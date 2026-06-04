// pages/staff/inspections/InspectionPage.jsx
// Form to create a new asset inspection record — select asset, choose condition
// rating, add findings, and upload optional photo evidence.
import { useState, useRef, useEffect }  from "react";
import { useNavigate }                   from "react-router-dom";
import { inspectionService }             from "../../../services/InspectionService";
import { assetService }                  from "../../../services/AssetService";
import StaffService                      from "../../../services/StaffService";
import StaffLayout                       from "../../../components/staff/StaffLayout";
import InspectionDetailsPanel            from "./InspectionDetailsPanel";
import "../../../styles/AssetManager.css";
import { CONDITION_OPTIONS, STATUSES, INSPECTOR_ROLES, INITIAL_FORM } from "../../../utility/InspectionConfig";
import { unwrap }                        from "../../../utility/ApiHelpers";
import { validateInspection }            from "./InspectionHelpers";

export default function InspectionPage() {
  const navigate = useNavigate();

  const [form,      setForm]      = useState(INITIAL_FORM);
  const [errors,    setErrors]    = useState({});
  const [photo,     setPhoto]     = useState(null);
  const [preview,   setPreview]   = useState(null);
  const photoRef                  = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  const [assets,        setAssets]        = useState([]);
  const [inspectors,    setInspectors]    = useState([]);
  const [totalInsp,     setTotalInsp]     = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);

  useEffect(() => {
    Promise.allSettled([
      assetService.getAll(),
      StaffService.getAllStaff(),
      inspectionService.getAll(),
    ]).then(([assetResult, staffResult, inspResult]) => {
      if (assetResult.status === "fulfilled")
        setAssets(unwrap(assetResult.value));
      if (staffResult.status === "fulfilled")
        setInspectors(unwrap(staffResult.value).filter(staffMember => INSPECTOR_ROLES.includes(staffMember.role)));
      if (inspResult.status === "fulfilled") {
        const list = unwrap(inspResult.value);
        setTotalInsp(list.length);
        setCriticalCount(list.filter(inspection => (inspection.conditionRating || "").toUpperCase() === "CRITICAL").length);
      }
    });
  }, []);

  const selectedCondition = CONDITION_OPTIONS.find(condOption => condOption.value === form.conditionRating);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm(previousForm => ({ ...previousForm, [name]: value }));
    if (errors[name]) setErrors(previousErrors => ({ ...previousErrors, [name]: "" }));
  };

  const handleCondition = (value) => {
    setForm(previousForm => ({ ...previousForm, conditionRating: value }));
    if (errors.conditionRating) setErrors(previousErrors => ({ ...previousErrors, conditionRating: "" }));
  };

  const handlePhoto = (event) => {
    const file = event.target.files[0]; if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (readerEvent) => setPreview(readerEvent.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateInspection(form);
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }
    setIsLoading(true); setSubmitErr("");
    try {
      const selectedInspector = inspectors.find(
        staffMember => String(staffMember.staffId ?? staffMember.id) === String(form.inspectorId)
      );
      await inspectionService.create({
        assetId:         Number(form.assetId),
        inspectorId:     form.inspectorId ? Number(form.inspectorId) : null,
        inspectorName:   selectedInspector?.name || null,
        performedAt:     form.performedAt || null,
        conditionRating: form.conditionRating,
        findings:        form.findings || null,
        photoUri:        photo?.name   || null,
        status:          form.status   || null,
      });
      const refreshed = await inspectionService.getAll().catch(() => null);
      if (refreshed) {
        const list = unwrap(refreshed);
        setTotalInsp(list.length);
        setCriticalCount(list.filter(inspection => (inspection.conditionRating || "").toUpperCase() === "CRITICAL").length);
      }
      setSuccess(true);
      setForm(INITIAL_FORM); setPhoto(null); setPreview(null);
      setTimeout(() => setSuccess(false), 4000);
    } catch (error) {
      setSubmitErr(error.message || "Failed to save inspection. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StaffLayout>
      <div className="asp-layout">

        {/* ── Left — Inspection Form ── */}
        <div className="asp-form">

          <button className="page-back-btn" onClick={() => navigate("/staff/assets")}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to Asset Management
          </button>

          <div className="page-header">
            <div className="header-icon header-icon--inspection">
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
              Inspection saved!
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

            <div className="card">
              <div className="card-section-label">Inspection Info</div>
              <div className="form-grid-2">

                <div className="field">
                  <label className="label">Asset <span className="req">*</span></label>
                  <select
                    className={`input ${errors.assetId ? "input-error" : ""}`}
                    name="assetId" value={form.assetId} onChange={handleChange}
                  >
                    <option value="">{assets.length ? "Select asset…" : "Loading assets…"}</option>
                    {assets.map(asset => (
                      <option key={asset.assetId || asset.id} value={asset.assetId || asset.id}>
                        {asset.assetTag} — {(asset.type || asset.assetType || "").replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  {errors.assetId && <span className="err-msg">{errors.assetId}</span>}
                </div>

                <div className="field">
                  <label className="label">Inspector</label>
                  <select className="input" name="inspectorId" value={form.inspectorId} onChange={handleChange}>
                    <option value="">{inspectors.length ? "Select inspector…" : "Loading inspectors…"}</option>
                    {inspectors.map(staffMember => {
                      const staffId = staffMember.staffId ?? staffMember.id;
                      return <option key={staffId} value={staffId}>#{staffId} — {staffMember.name}</option>;
                    })}
                  </select>
                  <span className="hint">Admin &amp; Operations Manager staff only</span>
                </div>

                <div className="field">
                  <label className="label">Performed At</label>
                  <input className="input" type="datetime-local" name="performedAt"
                    value={form.performedAt} onChange={handleChange} />
                </div>

                <div className="field">
                  <label className="label">Status <span className="req">*</span></label>
                  <select
                    className={`input ${errors.status ? "input-error" : ""}`}
                    name="status" value={form.status} onChange={handleChange}
                  >
                    <option value="">Select status</option>
                    {STATUSES.map(statusOption => (
                      <option key={statusOption.value} value={statusOption.value}>{statusOption.label}</option>
                    ))}
                  </select>
                  {errors.status && <span className="err-msg">{errors.status}</span>}
                </div>

              </div>
            </div>

            <div className="card mt-16">
              <div className="card-section-label">Condition Assessment</div>
              <div className="field">
                <label className="label">Condition Rating <span className="req">*</span></label>
                <div className="condition-grid">
                  {CONDITION_OPTIONS.map(condOption => {
                    const isSelected = form.conditionRating === condOption.value;
                    return (
                      <label key={condOption.value}
                        className={`condition-card ${isSelected ? "condition-selected" : ""}`}
                        onClick={() => handleCondition(condOption.value)}
                        style={isSelected ? { borderColor: condOption.dot, background: condOption.bg } : {}}
                      >
                        <input type="radio" name="conditionRating" value={condOption.value}
                          checked={isSelected} onChange={() => {}} className="condition-radio" />
                        <span className="condition-dot" style={{ background: condOption.dot }} />
                        <span className="condition-label" style={isSelected ? { color: condOption.color, fontWeight: 600 } : {}}>
                          {condOption.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errors.conditionRating && <span className="err-msg">{errors.conditionRating}</span>}
              </div>

              {selectedCondition && (
                <div className="condition-banner"
                  style={{ background: selectedCondition.bg, borderLeft: `4px solid ${selectedCondition.dot}` }}>
                  <span style={{ color: selectedCondition.color, fontWeight: 600 }}>
                    ● {selectedCondition.label}
                  </span>
                  <span style={{ color: selectedCondition.color, opacity: 0.8, fontSize: "13px", marginLeft: 8 }}>
                    {selectedCondition.msg}
                  </span>
                </div>
              )}

              <div className="field mt-16">
                <label className="label">Findings</label>
                <textarea className="input textarea" name="findings" value={form.findings}
                  onChange={handleChange}
                  placeholder="Describe observed conditions, defects, or notes..." rows={4} />
              </div>
            </div>

            <div className="card mt-16">
              <div className="card-section-label">Evidence</div>
              <div className="field">
                <label className="label">Upload Photo</label>
                <div className="upload-zone mini" onClick={() => photoRef.current.click()}>
                  <input ref={photoRef} type="file" accept="image/*"
                    className="photo-input-hidden" onChange={handlePhoto} />
                  {photo ? (
                    <div className="upload-info">
                      <svg width="16" height="16" fill="none" stroke="#1d4ed8" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span className="upload-name">{photo.name}</span>
                      <button type="button" className="remove-btn"
                        onClick={event => { event.stopPropagation(); setPhoto(null); setPreview(null); }}>✕</button>
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
                    <img src={preview} alt="evidence preview" className="preview-img" />
                  </div>
                )}
              </div>
            </div>

            <div className="actions">
              <button type="button" className="btn-secondary"
                onClick={() => { setForm(INITIAL_FORM); setErrors({}); setPhoto(null); setPreview(null); setSubmitErr(""); }}>
                Reset
              </button>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? <><span className="spinner" /> Saving...</> : "Save Inspection"}
              </button>
            </div>

          </form>
        </div>

        {/* ── Right — Info Panel ── */}
        <InspectionDetailsPanel
          totalInsp={totalInsp}
          assetsCount={assets.length}
          criticalCount={criticalCount}
          navigate={navigate}
        />

      </div>
    </StaffLayout>
  );
}
