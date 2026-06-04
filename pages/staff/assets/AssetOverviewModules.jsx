// pages/staff/assets/AssetOverviewModules.jsx
// Module card configuration for the Asset Overview landing page.
// Call buildModules({ assetCount, inspCount, maintCount, navigate }) to get
// a ready-to-render array of module descriptors.

export function buildModules({ assetCount, inspCount, maintCount, navigate }) {
  return [
    {
      key:         "registry",
      path:        "/staff/assets/registry",
      icon: (
        <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M9 9h6M9 12h6M9 15h4"/>
        </svg>
      ),
      title:       "Asset Registry",
      subtitle:    "Register & manage assets",
      description: "Add new municipal assets, update statuses, attach documents, and maintain the complete inventory with geolocation data.",
      count:       assetCount,
      countLabel:  "Registered",
      color:       "#1e40af",
      light:       "#dbeafe",
      accent:      "#3b82f6",
      gradient:    "linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)",
      primaryBtn:  { label: "+ Add Asset",  action: () => navigate("/staff/assets/registry")       },
      otherBtns:  [{ label: "View All",     action: () => navigate("/staff/assets/registry/list")  }],
    },
    {
      key:         "inspection",
      path:        "/staff/assets/inspections",
      icon: (
        <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
      title:       "Inspection Records",
      subtitle:    "Track asset conditions",
      description: "Record inspection findings, condition ratings, and upload photo evidence. Monitor asset health across the entire infrastructure.",
      count:       inspCount,
      countLabel:  "Logged",
      color:       "#1a4971",
      light:       "#dbeafe",
      accent:      "#3b82f6",
      gradient:    "linear-gradient(135deg, #1a4971 0%, #1d6096 100%)",
      primaryBtn:  { label: "+ New Inspection", action: () => navigate("/staff/assets/inspections")       },
      otherBtns:  [{ label: "View Records",     action: () => navigate("/staff/assets/inspections/list") }],
    },
    {
      key:         "maintenance",
      path:        "/staff/assets/maintenance",
      icon: (
        <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2"  x2="16" y2="6"/>
          <line x1="8"  y1="2"  x2="8"  y2="6"/>
          <line x1="3"  y1="10" x2="21" y2="10"/>
        </svg>
      ),
      title:       "Maintenance Tasks",
      subtitle:    "Schedule & track work",
      description: "Plan preventive maintenance, schedule tasks, set due dates, and track completion status for all municipal infrastructure assets.",
      count:       maintCount,
      countLabel:  "Scheduled",
      color:       "#7c2d12",
      light:       "#fee2e2",
      accent:      "#ef4444",
      gradient:    "linear-gradient(135deg, #7c2d12 0%, #b45309 100%)",
      primaryBtn:  { label: "+ Schedule Task", action: () => navigate("/staff/assets/maintenance")       },
      otherBtns:  [{ label: "View Calendar",   action: () => navigate("/staff/assets/maintenance/list") }],
    },
  ];
}
