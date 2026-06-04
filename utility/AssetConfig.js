export const ASSET_STATUSES = [
  { value: "ACTIVE",   label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export const DOC_TYPES = [
  { value: "PDF",  label: "PDF" },
  { value: "PNG",  label: "PNG Image" },
  { value: "JPG",  label: "JPG Image" },
  { value: "JPEG", label: "JPEG Image" },
];

export const STATUS_COLORS = {
  ACTIVE:   { bg: "#d1fae5", color: "#065f46" },
  INACTIVE: { bg: "#f0f0f0", color: "#555" },
};

export const TIPS = [
  "Tag assets consistently — use format TYPE-YEAR-SEQ (e.g. RD-2024-001) for easy filtering.",
  "Schedule inspections before monsoon season to catch drainage and road condition issues early.",
  "Critical condition assets should be re-inspected within 7 days of the initial finding.",
  "Upload GeoJSON coordinates for every asset to enable map-based reporting.",
  "Maintenance tasks marked Overdue automatically escalate to the Operations Manager.",
  "Use photo evidence on every inspection — it protects against audit disputes.",
];

export const ACTIVITY_ICONS = {
  asset:       { bg: "#dbeafe", color: "#1e40af", symbol: "🏗" },
  inspection:  { bg: "#dbeafe", color: "#1a4971", symbol: "🔍" },
  maintenance: { bg: "#fee2e2", color: "#7c2d12", symbol: "🛠" },
};

export const INITIAL = { assetTag: "", type: "", status: "", locationGeoJSON: "", installDate: "", docType: "" };
