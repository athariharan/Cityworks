import { StatCard, QuickAction } from "./DashboardShared";

export default function ComplianceOfficerView({ navigate }) {
  return (
    <>
      <div className="sh-stats-grid">
        <StatCard icon="📜" label="Audit Entries"     value="—" color="blue"  />
        <StatCard icon="📋" label="Inspections Due"   value="—" color="amber" />
        <StatCard icon="📊" label="Reports Generated" value="—" color="green" />
        <StatCard icon="⚠️" label="Compliance Issues" value="—" color="red"   />
      </div>
      <div className="sh-section">
        <h2 className="sh-section-title">Quick Actions</h2>
        <div className="sh-quick-actions">
          <QuickAction icon="📜" label="Audit Logs"  onClick={() => navigate("/staff/audit")}        />
          <QuickAction icon="📋" label="Inspections" onClick={() => navigate("/staff/inspections")}  />
          <QuickAction icon="📊" label="Reports"     onClick={() => navigate("/staff/reports")}      />
          <QuickAction icon="📰" label="View News"   onClick={() => navigate("/staff/news")}         />
        </div>
      </div>
    </>
  );
}
