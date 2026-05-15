// pages/staff/NewsPage.jsx
import StaffLayout from "../../components/staff/StaffLayout";

const NEWS_ITEMS = [
  {
    id: 1,
    category: "Infrastructure",
    date: "15 May 2026",
    title: "Phase 2 Road Resurfacing Programme Begins",
    body: "The municipal works department has commenced the second phase of the annual road resurfacing programme covering 42 km of residential streets. Field crews have been deployed across six wards and are expected to complete work within six weeks.",
    icon: "🛣️",
    color: "#3b82f6",
    bg: "#dbeafe",
  },
  {
    id: 2,
    category: "Water & Sanitation",
    date: "13 May 2026",
    title: "Scheduled Water Supply Maintenance – Ward 7 & 9",
    body: "Residents in Ward 7 and Ward 9 are advised of a planned 6-hour water supply interruption on 18 May from 08:00 to 14:00. The outage is required for pipeline valve replacement. Water tankers will be stationed at designated points.",
    icon: "💧",
    color: "#06b6d4",
    bg: "#cffafe",
  },
  {
    id: 3,
    category: "Public Safety",
    date: "10 May 2026",
    title: "New CCTV Cameras Installed at 18 Locations",
    body: "As part of the Smart City Initiative, 18 new CCTV cameras have been installed at key intersections and public spaces. The cameras are now live and integrated with the central monitoring system to improve public safety response times.",
    icon: "📷",
    color: "#8b5cf6",
    bg: "#ede9fe",
  },
  {
    id: 4,
    category: "Parks & Recreation",
    date: "8 May 2026",
    title: "Riverside Park Renovation Completed",
    body: "The six-month renovation of Riverside Park is now complete. Upgrades include new walking trails, children's play equipment, improved drainage, and solar-powered lighting. The park reopens to the public on 16 May.",
    icon: "🌳",
    color: "#10b981",
    bg: "#d1fae5",
  },
  {
    id: 5,
    category: "Waste Management",
    date: "5 May 2026",
    title: "Extended Collection Hours During Summer Season",
    body: "Effective 1 June, waste collection services will operate extended hours (06:00–20:00) across all wards for the summer season. Additional collection vehicles have been commissioned to manage the increased volume of waste during the peak period.",
    icon: "♻️",
    color: "#84cc16",
    bg: "#ecfccb",
  },
];

const CATEGORY_COLOR = {
  Infrastructure:     { color: "#3b82f6", bg: "#dbeafe" },
  "Water & Sanitation": { color: "#06b6d4", bg: "#cffafe" },
  "Public Safety":    { color: "#8b5cf6", bg: "#ede9fe" },
  "Parks & Recreation": { color: "#10b981", bg: "#d1fae5" },
  "Waste Management": { color: "#84cc16", bg: "#ecfccb" },
};

export default function NewsPage() {
  return (
    <StaffLayout>
      <div style={{ padding: "24px 36px 48px", maxWidth: 900 }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 6px", letterSpacing: -0.5 }}>
            Municipal News & Updates
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
            Latest announcements, service updates, and operational news from CityWorks.
          </p>
        </div>

        {/* News cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {NEWS_ITEMS.map(item => {
            const cat = CATEGORY_COLOR[item.category] || { color: "#64748b", bg: "#f1f5f9" };
            return (
              <div
                key={item.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: "20px 24px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  display: "flex",
                  gap: 20,
                  alignItems: "flex-start",
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: cat.bg, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 22,
                }}>
                  {item.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 10px",
                      borderRadius: 20, background: cat.bg, color: cat.color,
                    }}>
                      {item.category}
                    </span>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{item.date}</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, margin: 0 }}>
                    {item.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </StaffLayout>
  );
}
