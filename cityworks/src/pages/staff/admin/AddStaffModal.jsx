// pages/staff/admin/AddStaffModal.jsx
import { useState } from "react";
import StaffService from "../../../services/Staffservice";
import "./AddStaffModal.css";

const ROLES = [
  "DISPATCHER", "CREW", "ASSET_MANAGER",
  "OPERATIONS_MANAGER", "FINANCE_OFFICER",
  "ADMINISTRATOR", "COMPLIANCE_OFFICER",
];

const ROLE_LABELS = {
  DISPATCHER:         "Dispatcher",
  CREW:               "Field Crew",
  ASSET_MANAGER:      "Asset Manager",
  OPERATIONS_MANAGER: "Operations Manager",
  FINANCE_OFFICER:    "Finance Officer",
  ADMINISTRATOR:      "Administrator",
  COMPLIANCE_OFFICER: "Compliance Officer",
};

const SKILLS = [
  "ELECTRICIAN", "PLUMBER", "LANDSCAPER", "SANITATION_WORKER",
  "PAVER", "FLEET_MECHANIC", "DRIVER", "CARPENTER", "MANAGEMENT",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EMPTY = {
  name: "", role: "", email: "", password: "",
  phoneNumber: "", gender: "", bloodGroup: "",
  joiningDate: "", salary: "", emergencyContact: "",
  pan: "", aadhaar: "", accountNumber: "", skill: "",
};

export default function AddStaffModal({ onClose, onSuccess }) {
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name          = "Required";
    if (!form.role)                e.role          = "Required";
    if (!form.email.trim())        e.email         = "Required";
    if (!form.password.trim())     e.password      = "Required";
    if (!form.phoneNumber.trim())  e.phoneNumber   = "Required";
    if (!form.gender)              e.gender        = "Required";
    if (!form.joiningDate)         e.joiningDate   = "Required";
    if (!form.accountNumber.trim()) e.accountNumber = "Required";
    if (form.role === "CREW" && !form.skill) e.skill = "Required for Crew";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      name:             form.name.trim(),
      role:             form.role,
      email:            form.email.trim(),
      password:         form.password,
      phoneNumber:      form.phoneNumber.trim(),
      gender:           form.gender,
      bloodGroup:       form.bloodGroup || undefined,
      joiningDate:      form.joiningDate || undefined,
      salary:           form.salary ? parseFloat(form.salary) : undefined,
      emergencyContact: form.emergencyContact.trim() || undefined,
      pan:              form.pan.trim()  || undefined,
      aadhaar:          form.aadhaar.trim() || undefined,
      accountNumber:    form.accountNumber.trim(),
      skill:            form.role === "CREW" ? form.skill : undefined,
    };

    try {
      setLoading(true);
      await StaffService.addStaff(payload);
      onSuccess?.("Staff member added successfully.");
      onClose();
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
        err.response?.data?.error   ||
        "Failed to add staff. Please check the details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const F = ({ label, field, type = "text", placeholder = "", required = false }) => (
    <div className="asm-field">
      <label className="asm-label">{label}{required && <span>*</span>}</label>
      <input
        className={`asm-input${errors[field] ? " error" : ""}`}
        type={type}
        placeholder={placeholder}
        value={form[field]}
        onChange={e => set(field, e.target.value)}
      />
      {errors[field] && <span className="asm-error-text">{errors[field]}</span>}
    </div>
  );

  const S = ({ label, field, options, labelMap, required = false }) => (
    <div className="asm-field">
      <label className="asm-label">{label}{required && <span>*</span>}</label>
      <select
        className={`asm-select${errors[field] ? " error" : ""}`}
        value={form[field]}
        onChange={e => set(field, e.target.value)}
      >
        <option value="">— Select —</option>
        {options.map(o => (
          <option key={o} value={o}>{labelMap ? labelMap[o] : o}</option>
        ))}
      </select>
      {errors[field] && <span className="asm-error-text">{errors[field]}</span>}
    </div>
  );

  return (
    <div className="asm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="asm-dialog">

        {/* Header */}
        <div className="asm-header">
          <div className="asm-header-left">
            <div className="asm-header-icon">👤</div>
            <div>
              <p className="asm-title">Add New Staff Member</p>
              <p className="asm-subtitle">Fill in the details to register a staff account</p>
            </div>
          </div>
          <button className="asm-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="asm-body">

            {apiError && <div className="asm-alert asm-alert--error">{apiError}</div>}

            {/* Personal */}
            <div className="asm-section">
              <p className="asm-section-label">Personal Information</p>
              <div className="asm-grid">
                <F label="Full Name"   field="name"      placeholder="e.g. Ravi Kumar"  required />
                <S label="Gender"      field="gender"    options={["MALE","FEMALE","OTHER"]} required />
                <S label="Blood Group" field="bloodGroup" options={BLOOD_GROUPS} />
                <F label="Joining Date" field="joiningDate" type="date" required />
              </div>
            </div>

            {/* Contact */}
            <div className="asm-section">
              <p className="asm-section-label">Contact Details</p>
              <div className="asm-grid">
                <F label="Email"             field="email"            placeholder="staff@citiworks.com" required />
                <F label="Phone Number"      field="phoneNumber"      placeholder="10-digit mobile"     required />
                <F label="Emergency Contact" field="emergencyContact" placeholder="10-digit mobile" />
              </div>
            </div>

            {/* Role & Access */}
            <div className="asm-section">
              <p className="asm-section-label">Role & Access</p>
              <div className="asm-grid">
                <S label="Role" field="role" options={ROLES} labelMap={ROLE_LABELS} required />
                {form.role === "CREW" && (
                  <S label="Skill" field="skill" options={SKILLS} required />
                )}
                <F label="Password" field="password" type="password" placeholder="Min 8 chars, upper, lower, digit, symbol" required />
              </div>
            </div>

            {/* Financial & Identity */}
            <div className="asm-section">
              <p className="asm-section-label">Financial & Identity</p>
              <div className="asm-grid">
                <F label="Salary (₹)"      field="salary"        type="number" placeholder="e.g. 45000" />
                <F label="Account Number"  field="accountNumber" placeholder="9–18 digits" required />
                <F label="PAN"             field="pan"           placeholder="e.g. ABCDE1234F" />
                <F label="Aadhaar"         field="aadhaar"       placeholder="12-digit number" />
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="asm-footer">
            <button type="button" className="asm-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="asm-btn-submit" disabled={loading}>
              {loading && <span className="asm-spinner" />}
              {loading ? "Adding..." : "Add Staff Member"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
