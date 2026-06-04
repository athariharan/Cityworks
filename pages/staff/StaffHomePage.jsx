import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROLE_LABELS } from "../../utility/StaffConfig";
import StaffLayout from "../../components/staff/StaffLayout";
import DispatcherView        from "./dashboards/DispatcherDashboard";
import { CrewView }          from "./dashboards/CrewDashboard";
import AssetManagerView      from "./dashboards/AssetManagerDashboard";
import OperationsManagerView from "./dashboards/OperationsManagerDashboard";
import FinanceOfficerView    from "./dashboards/FinanceDashboard";
import AdministratorView     from "./dashboards/AdminDashboard";
import ComplianceOfficerView from "./dashboards/ComplianceDashboard";
import "../../styles/StaffHome.css";

function StaffHome() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const role     = user?.role || "";

  const rawName = user?.email?.split("@")[0] || "Staff";
  const name    = rawName.charAt(0).toUpperCase() + rawName.slice(1);

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
              {ROLE_LABELS[role]} Dashboard · {new Date().toLocaleDateString("en-IN", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>
          <div className="sh-header-badge">{ROLE_LABELS[role]}</div>
        </div>
        {renderDashboard()}
      </div>
    </StaffLayout>
  );
}

export default StaffHome;
