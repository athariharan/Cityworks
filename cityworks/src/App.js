import { Routes, Route, Navigate } from "react-router-dom";

import CitizenLogin       from "./pages/citizen/CitizenLogin";
import StaffLogin         from "./pages/staff/StaffLogin";
import CitizenHome        from "./pages/citizen/CitizenHome";
import StaffHome          from "./pages/staff/StaffHome";
import ProtectedRoute     from "./components/ProtectedRoute";
import ServiceRequestForm from "./pages/citizen/ServiceRequestForm";

import { AssetProvider }   from "./context/AssetContext";
import AssetLanding        from "./pages/staff/asset/AssetLanding";
import AssetPage           from "./pages/staff/asset/AssetPage";
import AssetListPage       from "./pages/staff/asset/AssetListPage";
import InspectionPage      from "./pages/staff/asset/InspectionPage";
import InspectionListPage  from "./pages/staff/asset/InspectionListPage";
import MaintenancePage     from "./pages/staff/asset/MaintenancePage";
import MaintenanceListPage from "./pages/staff/asset/MaintenanceListPage";

import ServiceRequestsPage  from "./pages/staff/dispatcher/ServiceRequestsPage";
import WorkOrdersPage       from "./pages/staff/dispatcher/WorkOrdersPage";
import CrewsPage            from "./pages/staff/dispatcher/CrewsPage";

import OperationsLanding     from "./pages/staff/operations/OperationsLanding";
import WorkOrderPriorityPage from "./pages/staff/operations/WorkOrderPriorityPage";
import WorkLogCreatePage     from "./pages/staff/operations/WorkLogCreatePage";
import KpiPage               from "./pages/staff/operations/KpiPage";

const STAFF_ROLES      = ["DISPATCHER","CREW","ASSET_MANAGER","OPERATIONS_MANAGER","FINANCE_OFFICER","ADMINISTRATOR","COMPLIANCE_OFFICER"];
const DISPATCHER_ROLES = ["DISPATCHER", "ADMINISTRATOR"];
const OPERATIONS_ROLES = ["OPERATIONS_MANAGER", "ADMINISTRATOR"];

function App() {
  return (
    <AssetProvider>
      <Routes>

        {/* ── Public ── */}
        <Route path="/"      element={<CitizenLogin />} />
        <Route path="/staff" element={<StaffLogin />} />

        {/* ── Citizen ── */}
        <Route path="/citizen/home"        element={<ProtectedRoute allowedRoles={["USER"]} loginPath="/"><CitizenHome /></ProtectedRoute>} />
        <Route path="/citizen/request/new" element={<ProtectedRoute allowedRoles={["USER"]} loginPath="/"><ServiceRequestForm /></ProtectedRoute>} />

        {/* ── Staff Home ── */}
        <Route path="/staff/home" element={<ProtectedRoute allowedRoles={STAFF_ROLES} loginPath="/staff"><StaffHome /></ProtectedRoute>} />

        {/* ── Dispatcher Module ── */}
        <Route path="/staff/requests"   element={<ProtectedRoute allowedRoles={DISPATCHER_ROLES} loginPath="/staff"><ServiceRequestsPage /></ProtectedRoute>} />
        <Route path="/staff/workorders" element={<ProtectedRoute allowedRoles={DISPATCHER_ROLES} loginPath="/staff"><WorkOrdersPage /></ProtectedRoute>} />
        <Route path="/staff/crews"      element={<ProtectedRoute allowedRoles={DISPATCHER_ROLES} loginPath="/staff"><CrewsPage /></ProtectedRoute>} />

        {/* ── Asset Manager Module ── */}
        <Route path="/staff/assets"                  element={<AssetLanding />} />
        <Route path="/staff/assets/registry"         element={<AssetPage />} />
        <Route path="/staff/assets/registry/list"    element={<AssetListPage />} />
        <Route path="/staff/assets/inspections"      element={<InspectionPage />} />
        <Route path="/staff/assets/inspections/list" element={<InspectionListPage />} />
        <Route path="/staff/assets/maintenance"      element={<MaintenancePage />} />
        <Route path="/staff/assets/maintenance/list" element={<MaintenanceListPage />} />
        <Route path="/staff/inspections"             element={<InspectionPage />} />
        <Route path="/staff/maintenance"             element={<MaintenancePage />} />

        {/* ── Operations Manager Module ── */}
        <Route path="/staff/operations"
          element={<ProtectedRoute allowedRoles={OPERATIONS_ROLES} loginPath="/staff"><OperationsLanding /></ProtectedRoute>} />
        <Route path="/staff/operations/workorders"
          element={<ProtectedRoute allowedRoles={OPERATIONS_ROLES} loginPath="/staff"><WorkOrderPriorityPage /></ProtectedRoute>} />
        <Route path="/staff/operations/worklogs/create"
          element={<ProtectedRoute allowedRoles={OPERATIONS_ROLES} loginPath="/staff"><WorkLogCreatePage /></ProtectedRoute>} />
        <Route path="/staff/kpis"
          element={<ProtectedRoute allowedRoles={OPERATIONS_ROLES} loginPath="/staff"><KpiPage /></ProtectedRoute>} />

        {/* ── Fallback ── */}
        <Route path="/staff/*" element={<Navigate to="/staff/home" replace />} />
        <Route path="*"        element={<Navigate to="/"           replace />} />

      </Routes>
    </AssetProvider>
  );
}

export default App;