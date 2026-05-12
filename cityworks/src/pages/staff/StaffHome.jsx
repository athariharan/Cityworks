// pages/staff/StaffHome.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../components/staff/StaffLayout";
import AddStaffModal from "./admin/AddStaffModal";
import AdminService from "../../services/AdminService";
import "../../styles/StaffHome.css";
import WorkOrderService from "../../services/WorkOrderService";
import WorkLogService   from "../../services/WorkLogService";

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
  const [stats, setStats] = useState({
    totalOrders:    "…",
    activeOrders:   "…",
    completionRate: "…",
    totalLogs:      "…",
  });

  useEffect(() => {
    Promise.allSettled([
      WorkOrderService.getAll(),
      WorkLogService.getAll(),
    ]).then(([woRes, wlRes]) => {
      const orders = woRes.status === "fulfilled" ? (woRes.value.data?.data ?? []) : [];
      const logs   = wlRes.status === "fulfilled" ? (wlRes.value.data?.data ?? []) : [];
      const total     = orders.length;
      const active    = orders.filter(o => o.status === "NOT_STARTED" || o.status === "IN_PROGRESS").length;
      const completed = orders.filter(o => o.status === "COMPLETED").length;
      const rate      = total > 0 ? Math.round((completed / total) * 100) + "%" : "0%";
      setStats({ totalOrders: total, activeOrders: active, completionRate: rate, totalLogs: logs.length });
    });
  }, []);

  const omStats = [
    {
      label: "Total Work Orders",
      value: stats.totalOrders,
      color: "#2563eb",
      bg:    "#eff6ff",
      border:"#bfdbfe",
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="M9 12h6M9 16h4"/>
        </svg>
      ),
    },
    {
      label: "Active Orders",
      value: stats.activeOrders,
      color: "#d97706",
      bg:    "#fffbeb",
      border:"#fde68a",
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
    {
      label: "Completion Rate",
      value: stats.completionRate,
      color: "#059669",
      bg:    "#ecfdf5",
      border:"#a7f3d0",
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
    },
    {
      label: "Total Work Logs",
      value: stats.totalLogs,
      color: "#7c3aed",
      bg:    "#f5f3ff",
      border:"#ddd6fe",
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
    },
  ];

  const omActions = [
    {
      label: "Update Work Order Priority",
      path:  "/staff/operations/workorders",
      color: "#2563eb",
      bg:    "#eff6ff",
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="M9 12h6M9 16h4"/>
        </svg>
      ),
    },
    {
      label: "Create Work Log",
      path:  "/staff/operations/worklogs/create",
      color: "#0d9488",
      bg:    "#f0fdfa",
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
        </svg>
      ),
    },
    {
      label: "Manage KPIs",
      path:  "/staff/kpis",
      color: "#7c3aed",
      bg:    "#f5f3ff",
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Stats */}
      <div className="sh-om-stats">
        {omStats.map(s => (
          <div key={s.label} className="sh-om-card" style={{ borderColor: s.border }}>
            <div className="sh-om-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <div className="sh-om-value" style={{ color: s.color }}>{s.value}</div>
              <div className="sh-om-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="sh-section">
        <h2 className="sh-section-title">Quick Actions</h2>
        <div className="sh-om-actions">
          {omActions.map(a => (
            <button
              key={a.label}
              className="sh-om-action-btn"
              style={{ "--ac": a.color, "--abg": a.bg }}
              onClick={() => navigate(a.path)}
            >
              <span className="sh-om-action-icon" style={{ background: a.bg, color: a.color }}>
                {a.icon}
              </span>
              <span className="sh-om-action-label">{a.label}</span>
              <svg width="14" height="14" fill="none" stroke={a.color} strokeWidth="2" viewBox="0 0 24 24" style={{ marginLeft: "auto", opacity: 0.7 }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
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
  const [stats, setStats] = useState({
    totalUsers: "…", totalStaff: "…", activeWorkOrders: "…",
  });

  useEffect(() => {
    Promise.allSettled([
      AdminService.getAllUsers(),
      AdminService.getAllStaff(),
      AdminService.getAllWorkOrders(),
    ]).then(([users, staff, workOrders]) => {
      const totalUsers       = users.status       === "fulfilled" ? (users.value.data?.data?.length       ?? "—") : "—";
      const totalStaff       = staff.status       === "fulfilled" ? (staff.value.data?.data?.length       ?? "—") : "—";
      const allWO            = workOrders.status  === "fulfilled" ? (workOrders.value.data?.data          ?? [])  : [];
      const activeWorkOrders = allWO.filter(wo =>
        wo.status === "NOT_STARTED" || wo.status === "IN_PROGRESS"
      ).length;
      setStats({ totalUsers, totalStaff, activeWorkOrders });
    });
  }, []);

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
        <StatCard icon="👤" label="Total Users"        value={stats.totalUsers}       color="blue" />
        <StatCard icon="👥" label="Total Staff"        value={stats.totalStaff}       color="green" />
        <StatCard icon="🔧" label="Active Work Orders" value={stats.activeWorkOrders} color="red" />
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
          <QuickAction icon="🔧" label="Work Orders"    onClick={() => navigate("/staff/workorders")} />
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