// pages/staff/StaffHome.jsx
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../components/staff/StaffLayout";
import AddStaffModal from "./admin/AddStaffModal";
import "./StaffHome.css";

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`sh-stat-card sh-stat-card--${color}`}>
      <div className="sh-stat-icon">{icon}</div>
      <div className="sh-stat-value">{value}</div>
      <div className="sh-stat-label">{label}</div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }) {
  return (
    <button className="sh-quick-action" onClick={onClick}>
      <span className="sh-quick-action-icon">{icon}</span>
      <span className="sh-quick-action-label">{label}</span>
    </button>
  );
}

function DispatcherView({ navigate }) {
  return (
    <>
      <div className="sh-stats-grid">
        <StatCard icon="📋" label="Pending Requests"   value="—" color="blue" />
        <StatCard icon="🔧" label="Open Work Orders"   value="—" color="amber" />
        <StatCard icon="👥" label="Available Crews"    value="—" color="green" />
        <StatCard icon="⚠️" label="Unassigned Orders"  value="—" color="red" />
      </div>
      <div className="sh-section">
        <h2 className="sh-section-title">Quick Actions</h2>
        <div className="sh-quick-actions">
          <QuickAction icon="📋" label="View Requests"     onClick={() => navigate("/staff/requests")} />
          <QuickAction icon="🔧" label="Create Work Order" onClick={() => navigate("/staff/workorders")} />
          <QuickAction icon="👥" label="Manage Crews"      onClick={() => navigate("/staff/crews")} />
          <QuickAction icon="📰" label="View News"         onClick={() => navigate("/staff/news")} />
        </div>
      </div>
    </>
  );
}

function CrewView({ navigate }) {
  return (
    <>
      <div className="sh-stats-grid">
        <StatCard icon="✅" label="My Tasks Today"   value="—" color="blue" />
        <StatCard icon="🔧" label="In Progress"      value="—" color="amber" />
        <StatCard icon="📷" label="Pending Evidence" value="—" color="red" />
        <StatCard icon="✔️" label="Completed Today"  value="—" color="green" />
      </div>
      <div className="sh-section">
        <h2 className="sh-section-title">Quick Actions</h2>
        <div className="sh-quick-actions">
          <QuickAction icon="✅" label="My Tasks"        onClick={() => navigate("/staff/tasks")} />
          <QuickAction icon="🔧" label="Work Orders"     onClick={() => navigate("/staff/workorders")} />
          <QuickAction icon="📷" label="Upload Evidence" onClick={() => navigate("/staff/evidence")} />
          <QuickAction icon="📰" label="View News"       onClick={() => navigate("/staff/news")} />
        </div>
      </div>
    </>
  );
}

function AssetManagerView({ navigate }) {
  return (
    <>
      <div className="sh-stats-grid">
        <StatCard icon="🏗️" label="Total Assets"      value="—" color="blue" />
        <StatCard icon="🔍" label="Due Inspections"   value="—" color="amber" />
        <StatCard icon="🛠️" label="Maintenance Tasks" value="—" color="red" />
        <StatCard icon="✅" label="Healthy Assets"    value="—" color="green" />
      </div>
      <div className="sh-section">
        <h2 className="sh-section-title">Quick Actions</h2>
        <div className="sh-quick-actions">
          <QuickAction icon="🏗️" label="View Assets"  onClick={() => navigate("/staff/assets")} />
          <QuickAction icon="🔍" label="Inspections"  onClick={() => navigate("/staff/inspections")} />
          <QuickAction icon="🛠️" label="Maintenance"  onClick={() => navigate("/staff/maintenance")} />
          <QuickAction icon="📰" label="View News"    onClick={() => navigate("/staff/news")} />
        </div>
      </div>
    </>
  );
}

function OperationsManagerView({ navigate }) {
  return (
    <>
      <div className="sh-stats-grid">
        <StatCard icon="📋" label="Total Requests"     value="—" color="blue" />
        <StatCard icon="🔧" label="Active Work Orders" value="—" color="amber" />
        <StatCard icon="📈" label="Completion Rate"    value="—" color="green" />
        <StatCard icon="⏳" label="Overdue Orders"     value="—" color="red" />
      </div>
      <div className="sh-section">
        <h2 className="sh-section-title">Quick Actions</h2>
        <div className="sh-quick-actions">
          <QuickAction icon="📋" label="Service Requests" onClick={() => navigate("/staff/requests")} />
          <QuickAction icon="🔧" label="Work Orders"      onClick={() => navigate("/staff/workorders")} />
          <QuickAction icon="📈" label="KPIs"             onClick={() => navigate("/staff/kpis")} />
          <QuickAction icon="📑" label="Reports"          onClick={() => navigate("/staff/reports")} />
        </div>
      </div>
    </>
  );
}

function FinanceOfficerView({ navigate }) {
  return (
    <>
      <div className="sh-stats-grid">
        <StatCard icon="💰" label="Total Costs"        value="—" color="blue" />
        <StatCard icon="🧰" label="Material Usage"     value="—" color="amber" />
        <StatCard icon="🧾" label="Pending Invoices"   value="—" color="red" />
        <StatCard icon="📊" label="Budget Utilization" value="—" color="green" />
      </div>
      <div className="sh-section">
        <h2 className="sh-section-title">Quick Actions</h2>
        <div className="sh-quick-actions">
          <QuickAction icon="💰" label="View Costs"     onClick={() => navigate("/staff/costs")} />
          <QuickAction icon="🧰" label="Material Usage" onClick={() => navigate("/staff/materials")} />
          <QuickAction icon="🧾" label="Invoices"       onClick={() => navigate("/staff/invoices")} />
          <QuickAction icon="📰" label="View News"      onClick={() => navigate("/staff/news")} />
        </div>
      </div>
    </>
  );
}

function AdministratorView({ navigate }) {
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [successMsg,   setSuccessMsg]   = useState("");

  return (
    <>
      {showAddStaff && (
        <AddStaffModal
          onClose={() => setShowAddStaff(false)}
          onSuccess={(msg) => {
            setSuccessMsg(msg);
            setTimeout(() => setSuccessMsg(""), 4000);
          }}
        />
      )}

      <div className="sh-stats-grid">
        <StatCard icon="👤" label="Total Users"        value="—" color="blue" />
        <StatCard icon="👥" label="Total Staff"        value="—" color="green" />
        <StatCard icon="📋" label="Open Requests"      value="—" color="amber" />
        <StatCard icon="🔧" label="Active Work Orders" value="—" color="red" />
      </div>

      <div className="sh-section">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
          <h2 className="sh-section-title" style={{ margin: 0 }}>Quick Actions</h2>
          <button
            onClick={() => setShowAddStaff(true)}
            style={{
              display:"flex", alignItems:"center", gap:"6px",
              padding:"8px 16px", borderRadius:"8px", border:"none",
              background:"#1e40af", color:"#fff", fontWeight:600,
              fontSize:"13px", cursor:"pointer",
            }}
          >
            ＋ Add Staff
          </button>
        </div>

        {successMsg && (
          <div style={{
            padding:"10px 14px", borderRadius:"8px", marginBottom:"12px",
            background:"#f0fdf4", color:"#16a34a", border:"1px solid #bbf7d0",
            fontSize:"13px", fontWeight:500,
          }}>
            ✓ {successMsg}
          </div>
        )}

        <div className="sh-quick-actions">
          <QuickAction icon="👤" label="Manage Users"   onClick={() => navigate("/staff/users")} />
          <QuickAction icon="📋" label="Requests"       onClick={() => navigate("/staff/requests")} />
          <QuickAction icon="🏗️" label="Asset Registry" onClick={() => navigate("/staff/assets/registry/list")} />
          <QuickAction icon="⚙️" label="Settings"       onClick={() => navigate("/staff/settings")} />
        </div>
      </div>
    </>
  );
}

function ComplianceOfficerView({ navigate }) {
  return (
    <>
      <div className="sh-stats-grid">
        <StatCard icon="📜" label="Audit Entries"     value="—" color="blue" />
        <StatCard icon="🔍" label="Inspections Due"   value="—" color="amber" />
        <StatCard icon="📑" label="Reports Generated" value="—" color="green" />
        <StatCard icon="⚠️" label="Compliance Issues" value="—" color="red" />
      </div>
      <div className="sh-section">
        <h2 className="sh-section-title">Quick Actions</h2>
        <div className="sh-quick-actions">
          <QuickAction icon="📜" label="Audit Logs"  onClick={() => navigate("/staff/audit")} />
          <QuickAction icon="🔍" label="Inspections" onClick={() => navigate("/staff/inspections")} />
          <QuickAction icon="📑" label="Reports"     onClick={() => navigate("/staff/reports")} />
          <QuickAction icon="📰" label="View News"   onClick={() => navigate("/staff/news")} />
        </div>
      </div>
    </>
  );
}

function StaffHome() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const role     = user?.role || "";

  const rawName = user?.email?.split("@")[0] || "Staff";
  const name    = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const roleLabels = {
    DISPATCHER:          "Dispatcher",
    CREW:                "Field Crew",
    ASSET_MANAGER:       "Asset Manager",
    OPERATIONS_MANAGER:  "Operations Manager",
    FINANCE_OFFICER:     "Finance Officer",
    ADMINISTRATOR:       "Administrator",
    COMPLIANCE_OFFICER:  "Compliance Officer",
  };

  const renderDashboard = () => {
    switch (role) {
      case "DISPATCHER":         return <DispatcherView        navigate={navigate} />;
      case "CREW":               return <CrewView              navigate={navigate} />;
      case "ASSET_MANAGER":      return <AssetManagerView      navigate={navigate} />;
      case "OPERATIONS_MANAGER": return <OperationsManagerView navigate={navigate} />;
      case "FINANCE_OFFICER":    return <FinanceOfficerView    navigate={navigate} />;
      case "ADMINISTRATOR":      return <AdministratorView     navigate={navigate} />;
      case "COMPLIANCE_OFFICER": return <ComplianceOfficerView navigate={navigate} />;
      default:
        return <p style={{ color: "#64748b" }}>No dashboard configured for role: {role}</p>;
    }
  };

  return (
    <StaffLayout>
      <div className="sh-root">
        <div className="sh-header">
          <div>
            <h1 className="sh-title">Welcome back, {name} 👋</h1>
            <p className="sh-subtitle">
              {roleLabels[role]} Dashboard · {new Date().toLocaleDateString("en-IN", {
                weekday: "long", year: "numeric", month: "long", day: "numeric"
              })}
            </p>
          </div>
          <div className="sh-header-badge">{roleLabels[role]}</div>
        </div>
        {renderDashboard()}
      </div>
    </StaffLayout>
  );
}

export default StaffHome;