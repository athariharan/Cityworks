// App.js
import { Routes, Route, Navigate } from "react-router-dom";

// ── Auth & Citizen ─────────────────────────────────────────
import CitizenLogin       from "./pages/citizen/CitizenLogin";
import StaffLogin         from "./pages/staff/StaffLogin";
import CitizenHome        from "./pages/citizen/CitizenHome";
import StaffHome          from "./pages/staff/StaffHome";
import ProtectedRoute     from "./components/ProtectedRoute";
import ServiceRequestForm from "./pages/citizen/ServiceRequestForm";

// ── Asset Module ───────────────────────────────────────────
import { AssetProvider }   from "./context/AssetContext";
import AssetLanding        from "./pages/staff/asset/AssetLanding";
import AssetPage           from "./pages/staff/asset/AssetPage";
import AssetListPage       from "./pages/staff/asset/AssetListPage";
import InspectionPage      from "./pages/staff/asset/InspectionPage";
import InspectionListPage  from "./pages/staff/asset/InspectionListPage";
import MaintenancePage     from "./pages/staff/asset/MaintenancePage";
import MaintenanceListPage from "./pages/staff/asset/MaintenanceListPage";

// ── Staff roles ────────────────────────────────────────────
const STAFF_ROLES = [
  "DISPATCHER",
  "CREW",
  "ASSET_MANAGER",
  "OPERATIONS_MANAGER",
  "FINANCE_OFFICER",
  "ADMINISTRATOR",
  "COMPLIANCE_OFFICER",
];

function App() {
  return (
    <AssetProvider>
      <Routes>

        {/* ── Public ── */}
        <Route path="/"      element={<CitizenLogin />} />
        <Route path="/staff" element={<StaffLogin />} />

        {/* ── Citizen ── */}
        <Route
          path="/citizen/home"
          element={
            <ProtectedRoute allowedRoles={["USER"]} loginPath="/">
              <CitizenHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/request/new"
          element={
            <ProtectedRoute allowedRoles={["USER"]} loginPath="/">
              <ServiceRequestForm />
            </ProtectedRoute>
          }
        />

        {/* ── Staff Home ── */}
        <Route
          path="/staff/home"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} loginPath="/staff">
              <StaffHome />
            </ProtectedRoute>
          }
        />

        {/* ── Asset Module ── */}
        <Route path="/staff/assets"                   element={<AssetLanding />} />
        <Route path="/staff/assets/registry"          element={<AssetPage />} />
        <Route path="/staff/assets/registry/list"     element={<AssetListPage />} />
        <Route path="/staff/assets/inspections"       element={<InspectionPage />} />
        <Route path="/staff/assets/inspections/list"  element={<InspectionListPage />} />
        <Route path="/staff/assets/maintenance"       element={<MaintenancePage />} />
        <Route path="/staff/assets/maintenance/list"  element={<MaintenanceListPage />} />

        {/* ── Legacy routes (StaffHome QuickActions) ── */}
        <Route path="/staff/inspections" element={<InspectionPage />} />
        <Route path="/staff/maintenance" element={<MaintenancePage />} />

        {/* ── Other staff routes (uncomment as you build) ── */}
        {/* <Route path="/staff/requests"   element={<RequestsPage />} /> */}
        {/* <Route path="/staff/workorders" element={<WorkOrdersPage />} /> */}
        {/* <Route path="/staff/crews"      element={<CrewsPage />} /> */}
        {/* <Route path="/staff/kpis"       element={<KPIsPage />} /> */}
        {/* <Route path="/staff/reports"    element={<ReportsPage />} /> */}
        {/* <Route path="/staff/audit"      element={<AuditPage />} /> */}
        {/* <Route path="/staff/users"      element={<UsersPage />} /> */}
        {/* <Route path="/staff/settings"   element={<SettingsPage />} /> */}

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/staff" replace />} />

      </Routes>
    </AssetProvider>
  );
}

export default App;