// pages/citizen/service-requests/ServiceRequestSidebar.jsx
// Static right-side info panel for the service request form.

const NEXT_STEPS = [
  { n: 1, title: "Submission",  desc: "Your request is logged and assigned a unique ID instantly." },
  { n: 2, title: "Review",      desc: "Our team validates and categorises your issue within 24h." },
  { n: 3, title: "Scheduling",  desc: "A maintenance crew is dispatched and a date is set." },
  { n: 4, title: "Resolution",  desc: "Work is completed and the request is marked resolved." },
];

const TIPS = [
  { icon: "🏷️", text: <><strong>Use the asset tag</strong> — it's the fastest way to identify the exact asset.</> },
  { icon: "📍", text: <><strong>Be specific</strong> — mention landmarks, street names or directions.</> },
  { icon: "📷", text: <><strong>Add a photo</strong> — requests with photos are resolved 40% faster.</> },
  { icon: "⚠️", text: <><strong>Mention urgency</strong> — safety hazards are prioritised automatically.</> },
];

const STATS = [
  { num: "98%",  lbl: "Resolution Rate" },
  { num: "48h",  lbl: "Avg Response"    },
  { num: "500+", lbl: "Issues Closed"   },
  { num: "8",    lbl: "Categories"      },
];

export default function ServiceRequestSidebar() {
  return (
    <div className="srf-sidebar">

      {/* What Happens Next */}
      <div className="srf-side-card">
        <div className="srf-side-head"><span>📋</span><h3>What Happens Next?</h3></div>
        <div className="srf-side-body">
          {NEXT_STEPS.map((step) => (
            <div key={step.n} className="srf-next-step">
              <div className="srf-next-dot">{step.n}</div>
              <div><h4>{step.title}</h4><p>{step.desc}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="srf-side-card">
        <div className="srf-side-head"><span>💡</span><h3>Tips for a Good Report</h3></div>
        <div className="srf-side-body">
          {TIPS.map((tip, tipIndex) => (
            <div key={tipIndex} className="srf-tip-item">
              <span className="srf-tip-icon">{tip.icon}</span>
              <span className="srf-tip-text">{tip.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* City Stats */}
      <div className="srf-side-card">
        <div className="srf-side-head"><span>📊</span><h3>City Service Stats</h3></div>
        <div className="srf-side-body">
          <div className="srf-stats-grid">
            {STATS.map((stat) => (
              <div key={stat.lbl} className="srf-stat-box">
                <div className="srf-stat-num">{stat.num}</div>
                <div className="srf-stat-lbl">{stat.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
