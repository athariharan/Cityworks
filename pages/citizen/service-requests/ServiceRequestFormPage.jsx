// pages/citizen/service-requests/ServiceRequestFormPage.jsx
import { useState, useEffect }  from "react";
import { useNavigate }           from "react-router-dom";
import { useSelector }           from "react-redux";
import CitizenLayout             from "../../../components/citizen/Layout";
import api                       from "../../../services/api";
import "../../../styles/ServiceRequestForm.css";
import { ASSET_GROUPS }          from "../../../utility/AssetGroups";
import { toLabel, SuccessCard, ErrorMessage } from "./ServiceRequestHelpers";
import VStep                     from "./VStep";
import ServiceRequestSidebar     from "./ServiceRequestSidebar";

function stepState(stepIndex, formData) {
  const completedStepFlags = [
    !!formData.assetType,
    !!formData.assetTag.trim(),
    !!formData.description.trim(),
    true,
  ];
  if (completedStepFlags[stepIndex] && (stepIndex < 3 ? completedStepFlags.slice(0, stepIndex).every(Boolean) : true)) return "done";
  const firstIncompleteIndex = completedStepFlags.findIndex((isFilled) => !isFilled);
  if (firstIncompleteIndex === stepIndex) return "active";
  return "next";
}

export default function ServiceRequestForm() {
  const navigate = useNavigate();
  const { user: authUser, userId } = useSelector((state) => state.auth);

  const rawUserName    = authUser?.email?.split("@")[0] || "User";
  const displayName    = rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1);
  const user           = { name: displayName, initials: displayName.charAt(0).toUpperCase() };

  const [formData,         setFormData]         = useState({ assetType: "", assetTag: "", description: "" });
  const [selectedPhoto,    setSelectedPhoto]    = useState(null);
  const [photoPreviewUrl,  setPhotoPreviewUrl]  = useState(null);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [isSubmitSuccess,  setIsSubmitSuccess]  = useState(false);
  const [submissionError,  setSubmissionError]  = useState(null);
  const [allAssets,        setAllAssets]        = useState(null);
  const [hasAssetLoadError, setHasAssetLoadError] = useState(false);

  // Fetch all assets on mount so the dropdowns can be populated
  useEffect(() => {
    api.get("/api/user/assets")
      .then(response => { setAllAssets(response.data?.data ?? []); setHasAssetLoadError(false); })
      .catch(() => { setAllAssets([]); setHasAssetLoadError(true); });
  }, []);

  const availableAssetTypeSet = allAssets ? new Set(allAssets.map(asset => asset.type)) : null;

  // Only show groups that have at least one registered asset
  const filteredGroups = availableAssetTypeSet === null
    ? []
    : ASSET_GROUPS
        .map(assetGroup => ({ ...assetGroup, types: assetGroup.types.filter(assetType => availableAssetTypeSet.has(assetType)) }))
        .filter(assetGroup => assetGroup.types.length > 0);

  // Assets belonging to the currently selected type, used to populate the tag dropdown
  const assetsForSelectedType = (formData.assetType && allAssets)
    ? allAssets.filter(asset => asset.type === formData.assetType)
    : [];

  const handlePhoto = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedPhoto(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const removePhoto = () => { setSelectedPhoto(null); setPhotoPreviewUrl(null); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId) { setSubmissionError("Unable to identify your account. Please log out and log in again."); return; }
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const requestFormData = new FormData();
      if (selectedPhoto) requestFormData.append("photoFile", selectedPhoto);
      await api.post(
        `/api/user/servicereq?assetTag=${encodeURIComponent(formData.assetTag)}&assetType=${formData.assetType}&description=${encodeURIComponent(formData.description)}&citizenId=${userId}`,
        requestFormData,
        { headers: { "Content-Type": undefined } }
      );
      setIsSubmitSuccess(true);
    } catch (error) {
      setSubmissionError(error.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitSuccess) {
    return (
      <CitizenLayout user={user}>
        <div className="srf-page">
          <div className="srf-centered">
            <SuccessCard
              onGoHome={() => navigate("/citizen/home")}
              onSubmitAnother={() => {
                setIsSubmitSuccess(false);
                setFormData({ assetType: "", assetTag: "", description: "" });
                setSelectedPhoto(null);
                setPhotoPreviewUrl(null);
              }}
            />
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

          {/* ── Form card ── */}
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
              <VStep num={1} state={stepState(0, formData)} title="Asset Type" badge="Required" badgeType="required">
                <select
                  className="srf-select"
                  value={formData.assetType}
                  onChange={(event) => setFormData({ ...formData, assetType: event.target.value, assetTag: "" })}
                  required
                  disabled={availableAssetTypeSet === null || hasAssetLoadError}
                >
                  <option value="">
                    {availableAssetTypeSet === null
                      ? "Loading…"
                      : hasAssetLoadError
                        ? "Failed to load assets — please refresh"
                        : filteredGroups.length === 0
                          ? "No assets registered yet"
                          : "— Select asset type —"}
                  </option>
                  {filteredGroups.map((assetGroup) => (
                    <optgroup key={assetGroup.group} label={assetGroup.group}>
                      {assetGroup.types.map((assetType) => (
                        <option key={assetType} value={assetType}>{toLabel(assetType)}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </VStep>

              {/* Step 2 — Asset Tag */}
              <VStep num={2} state={stepState(1, formData)} title="Asset Tag" badge="Required" badgeType="required">
                <select
                  className="srf-select"
                  value={formData.assetTag}
                  onChange={(event) => setFormData({ ...formData, assetTag: event.target.value })}
                  required
                  disabled={!formData.assetType || assetsForSelectedType.length === 0}
                >
                  <option value="">
                    {!formData.assetType
                      ? "— Select asset type first —"
                      : assetsForSelectedType.length === 0
                        ? "No assets registered for this type"
                        : "— Select asset tag —"}
                  </option>
                  {assetsForSelectedType.map(asset => (
                    <option key={asset.assetId} value={asset.assetTag}>{asset.assetTag}</option>
                  ))}
                </select>
                <p className="srf-hint">📌 Select the tag of the specific asset with the issue.</p>
              </VStep>

              {/* Step 3 — Description */}
              <VStep num={3} state={stepState(2, formData)} title="Description" badge="Required" badgeType="required">
                <textarea
                  className="srf-textarea"
                  rows={5}
                  placeholder="Describe the issue — severity, exact location, any safety risk…"
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  required
                  maxLength={1000}
                />
                <div className="srf-char">{formData.description.length} / 1000</div>
              </VStep>

              {/* Step 4 — Photo */}
              <VStep num={4} state="next" title="Photo" badge="Optional" badgeType="optional" last>
                {photoPreviewUrl ? (
                  <div className="srf-preview-wrap">
                    <img src={photoPreviewUrl} alt="Preview" className="srf-preview-img" />
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

              <ErrorMessage error={submissionError} />

              <div className="srf-footer">
                <button type="button" className="srf-btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
                <button type="submit" className="srf-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting…" : "Submit Request →"}
                </button>
              </div>
            </form>
          </div>

          {/* ── Sidebar ── */}
          <ServiceRequestSidebar />
        </div>
      </div>
    </CitizenLayout>
  );
}
