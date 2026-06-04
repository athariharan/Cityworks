// pages/staff/assets/AssetDetailsPage.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate }                  from "react-router-dom";
import StaffLayout                      from "../../../components/staff/StaffLayout";
import { assetService }                 from "../../../services/AssetService";
import { inspectionService }            from "../../../services/InspectionService";
import { maintenanceService }           from "../../../services/MaintenanceService";
import "../../../styles/AssetManager.css";
import { ASSET_GROUPS }                       from "../../../utility/AssetGroups";
import { ASSET_STATUSES, DOC_TYPES, INITIAL } from "../../../utility/AssetConfig";
import { unwrap, validate }             from "./AssetHelpers";
import AssetDetailsPanel                from "./AssetDetailsPanel";

export default function AssetPage() {
  const navigate = useNavigate();

  // ── Form state ───────────────────────────────────────────────
  const [form,      setForm]      = useState(INITIAL);
  const [errors,    setErrors]    = useState({});
  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success,   setSuccess]   = useState(false);
  const fileRef = useRef();

  // ── Panel stats ──────────────────────────────────────────────
  const [assetCount,  setAssetCount]  = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inspCount,   setInspCount]   = useState(0);
  const [maintCount,  setMaintCount]  = useState(0);

  useEffect(() => {
    Promise.allSettled([
      assetService.getAll(),
      inspectionService.getAll(),
      maintenanceService.getAll(),
    ]).then(([assetResult, inspResult, maintResult]) => {
      if (assetResult.status === "fulfilled") {
        const list = unwrap(assetResult.value);
        setAssetCount(list.length);
        setActiveCount(list.filter(item => item.status === "ACTIVE").length);
      }
      if (inspResult.status === "fulfilled") setInspCount(unwrap(inspResult.value).length);
      if (maintResult.status === "fulfilled") setMaintCount(unwrap(maintResult.value).length);
    });
  }, []);

  // ── Handlers ─────────────────────────────────────────────────
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm(previousForm => ({ ...previousForm, [name]: value }));
    if (errors[name]) setErrors(previousErrors => ({ ...previousErrors, [name]: "" }));
  };

  const handleFile = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = loadEvent => setPreview(loadEvent.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("assetTag",    form.assetTag);
      formData.append("type",        form.type);
      formData.append("status",      form.status);
      formData.append("installDate", form.installDate);
      if (form.locationGeoJSON) formData.append("locationGeoJSON", form.locationGeoJSON);
      if (form.docType)         formData.append("docType",         form.docType);
      if (file)                 formData.append("photoFile",       file);
      await assetService.create(formData);
      setAssetCount(previousCount => previousCount + 1);
      if (form.status === "ACTIVE") setActiveCount(previousCount => previousCount + 1);
      setSuccess(true);
      setForm(INITIAL);
      setFile(null);
      setPreview(null);
      setTimeout(() => setSuccess(false), 4000);
    } catch (submitError) {
      setErrors({ submit: submitError.message || "Failed to register asset. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StaffLayout>
      <div className="asp-layout">

            {/* LEFT — Registration Form */}
        <div className="asp-form">

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
              Asset registered successfully!
              <span className="alert-link" onClick={() => navigate("/staff/assets/registry/list")}>
                View All Assets →
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Asset Information */}
            <div className="card">
              <div className="card-section-label">Asset Information</div>
              <div className="form-grid-2">

                <div className="field">
                  <label className="label">Asset Tag <span className="req">*</span></label>
                  <input
                    className={`input ${errors.assetTag ? "input-error" : ""}`}
                    name="assetTag"
                    value={form.assetTag}
                    onChange={handleChange}
                    placeholder="e.g. RD-2024-001"
                    maxLength={50}
                  />
                  {errors.assetTag && <span className="err-msg">{errors.assetTag}</span>}
                  <span className="hint">Format: TYPE-YEAR-SEQ (alphanumeric + hyphens)</span>
                </div>

                <div className="field">
                  <label className="label">Install Date <span className="req">*</span></label>
                  <input
                    className={`input ${errors.installDate ? "input-error" : ""}`}
                    type="date"
                    name="installDate"
                    value={form.installDate}
                    onChange={handleChange}
                  />
                  {errors.installDate && <span className="err-msg">{errors.installDate}</span>}
                </div>

                <div className="field">
                  <label className="label">Asset Type <span className="req">*</span></label>
                  <select
                    className={`input ${errors.type ? "input-error" : ""}`}
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option value="">Select asset type</option>
                    {ASSET_GROUPS.map(group => (
                      <optgroup key={group.group} label={group.group}>
                        {group.types.map(assetType => (
                          <option key={assetType} value={assetType}>{assetType.replace(/_/g, " ")}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {errors.type && <span className="err-msg">{errors.type}</span>}
                </div>

                <div className="field">
                  <label className="label">Asset Status <span className="req">*</span></label>
                  <select
                    className={`input ${errors.status ? "input-error" : ""}`}
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="">Select status</option>
                    {ASSET_STATUSES.map(statusOption => (
                      <option key={statusOption.value} value={statusOption.value}>{statusOption.label}</option>
                    ))}
                  </select>
                  {errors.status && <span className="err-msg">{errors.status}</span>}
                </div>

              </div>

              <div className="field mt-16">
                <label className="label">Location (GeoJSON)</label>
                <textarea
                  className="input textarea"
                  name="locationGeoJSON"
                  value={form.locationGeoJSON}
                  onChange={handleChange}
                  placeholder='{"type":"Point","coordinates":[80.2707,13.0827]}'
                  rows={3}
                />
                <span className="hint">Paste GeoJSON coordinates or leave blank</span>
              </div>
            </div>

            {/* Document Attachment */}
            <div className="card mt-16">
              <div className="card-section-label">Document Attachment</div>

              <div className="field" style={{ maxWidth: "50%" }}>
                <label className="label">Document Type</label>
                <select className="input" name="docType" value={form.docType} onChange={handleChange}>
                  <option value="">Select document type</option>
                  {DOC_TYPES.map(docTypeOption => (
                    <option key={docTypeOption.value} value={docTypeOption.value}>{docTypeOption.label}</option>
                  ))}
                </select>
              </div>

              <div className="field mt-16">
                <label className="label">Upload File</label>
                <div className="upload-zone" onClick={() => fileRef.current.click()}>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,image/png,image/jpeg"
                    style={{ display: "none" }}
                    onChange={handleFile}
                  />
                  {file ? (
                    <div className="upload-info">
                      <span className="upload-name">{file.name}</span>
                      <span className="hint">({(file.size / 1024).toFixed(1)} KB)</span>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={event => { event.stopPropagation(); setFile(null); setPreview(null); }}
                      >✕</button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span>Click to upload document or image</span>
                      <span className="hint">PDF, PNG, or JPG/JPEG images only</span>
                    </div>
                  )}
                </div>
                {preview && (
                  <div className="preview-box mt-8">
                    <img src={preview} alt="preview" className="preview-img"/>
                  </div>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="alert alert-error" style={{ marginTop: 12 }}>
                {errors.submit}
              </div>
            )}

            <div className="actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setForm(INITIAL); setErrors({}); setFile(null); setPreview(null); }}
              >
                Reset
              </button>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <><span className="spinner"/> Saving...</>
                ) : (
                  <>
                    Register Asset
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

            {/* RIGHT — Stat Panel */}
        <AssetDetailsPanel
          assetCount={assetCount}
          activeCount={activeCount}
          inspCount={inspCount}
          maintCount={maintCount}
          navigate={navigate}
        />

      </div>
    </StaffLayout>
  );
}
