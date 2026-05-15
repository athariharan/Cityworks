import { Routes, Route, Navigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

import CitizenLogin       from "./pages/citizen/CitizenLogin";
import StaffLogin         from "./pages/staff/StaffLogin";
import CitizenHome        from "./pages/citizen/CitizenHome";
import StaffHome          from "./pages/staff/StaffHome";
import ProtectedRoute     from "./components/ProtectedRoute";
import ServiceRequestForm from "./pages/citizen/ServiceRequestForm";
import TrackRequest       from "./pages/citizen/TrackRequest";
import RequestHistory     from "./pages/citizen/RequestHistory";
import CitizenProfile     from "./pages/citizen/CitizenProfile";

import { AssetProvider }   from "./context/AssetContext";
import AssetLanding        from "./pages/staff/asset/AssetLanding";
import AssetPage           from "./pages/staff/asset/AssetPage";
import AssetListPage       from "./pages/staff/asset/AssetListPage";
import InspectionPage      from "./pages/staff/asset/InspectionPage";
import InspectionListPage  from "./pages/staff/asset/InspectionListPage";
import MaintenancePage     from "./pages/staff/asset/MaintenancePage";
import MaintenanceListPage from "./pages/staff/asset/MaintenanceListPage";

import ServiceRequestsPage from "./pages/staff/dispatcher/ServiceRequestsPage";
import WorkOrdersPage      from "./pages/staff/dispatcher/WorkOrdersPage";
import CrewsPage           from "./pages/staff/dispatcher/CrewsPage";

import OperationsLanding     from "./pages/staff/operations/OperationsLanding";
import WorkOrderPriorityPage from "./pages/staff/operations/WorkOrderPriorityPage";
import WorkLogCreatePage     from "./pages/staff/operations/WorkLogCreatePage";
import KpiPage               from "./pages/staff/operations/KpiPage";
import ReportListPage        from "./pages/staff/operations/ReportListPage";
import ReportViewPage        from "./pages/staff/operations/ReportViewPage";
import ReportCreatePage      from "./pages/staff/operations/ReportCreatePage";

import MaterialUsagePage from "./pages/staff/finance/MaterialUsagePage";
import WorkLogsViewPage  from "./pages/staff/finance/WorkLogsViewPage";

import AuditLogPage        from "./pages/staff/compliance/AuditLogPage";
import NotificationsPage   from "./pages/staff/NotificationsPage";

import CrewOperationsPage  from "./pages/staff/crew/Crew";
import CrewWorkOrdersPage  from "./pages/staff/crew/CrewWorkOrdersPage";
import CrewEvidencePage    from "./pages/staff/crew/CrewEvidencePage";
import MyTasksPage         from "./pages/staff/crew/MyTasksPage";

/* ── Role groups ─────────────────────────────────────────── */
const COMPLIANCE_ROLES  = ["COMPLIANCE_OFFICER", "ADMINISTRATOR"];
const STAFF_ROLES       = ["DISPATCHER", "CREW", "ASSET_MANAGER", "OPERATIONS_MANAGER", "FINANCE_OFFICER", "ADMINISTRATOR", "COMPLIANCE_OFFICER"];
const DISPATCHER_ROLES  = ["DISPATCHER", "ADMINISTRATOR"];
const ASSET_ROLES       = ["ASSET_MANAGER", "ADMINISTRATOR"];
const INSPECTION_ROLES  = ["ASSET_MANAGER", "COMPLIANCE_OFFICER", "ADMINISTRATOR"]; // Compliance officer can view inspections
const REPORT_ROLES      = ["OPERATIONS_MANAGER", "COMPLIANCE_OFFICER", "ADMINISTRATOR"]; // Compliance officer can view/create reports
const OPERATIONS_ROLES  = ["OPERATIONS_MANAGER", "ADMINISTRATOR"];
const FINANCE_ROLES     = ["FINANCE_OFFICER", "ADMINISTRATOR"];
const CREW_ROLES        = ["CREW", "ADMINISTRATOR"]; // ✅ Fix 2: was missing entirely

function App() {
  return (
    <AssetProvider>
      <Routes>

        {/* ════════════════════════════════════
            PUBLIC
        ════════════════════════════════════ */}
        <Route path="/"      element={<CitizenLogin />} />
        <Route path="/staff" element={<StaffLogin />} />

        {/* ════════════════════════════════════
            CITIZEN
        ════════════════════════════════════ */}
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
        <Route
          path="/citizen/track"
          element={
            <ProtectedRoute allowedRoles={["USER"]} loginPath="/">
              <TrackRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/history"
          element={
            <ProtectedRoute allowedRoles={["USER"]} loginPath="/">
              <RequestHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/profile"
          element={
            <ProtectedRoute allowedRoles={["USER"]} loginPath="/">
              <CitizenProfile />
            </ProtectedRoute>
          }
        />

        {/* ════════════════════════════════════
            STAFF HOME  (all staff roles)
        ════════════════════════════════════ */}
        <Route
          path="/staff/home"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} loginPath="/staff">
              <StaffHome />
            </ProtectedRoute>
          }
        />

        {/* ════════════════════════════════════
            DISPATCHER MODULE
            Role: DISPATCHER
        ════════════════════════════════════ */}
        <Route
          path="/staff/requests"
          element={
            <ProtectedRoute allowedRoles={DISPATCHER_ROLES} loginPath="/staff">
              <ServiceRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/workorders"
          element={
            <ProtectedRoute allowedRoles={DISPATCHER_ROLES} loginPath="/staff">
              <WorkOrdersPage />
            </ProtectedRoute>
          }
        />
        {/* ✅ Fix 3: was <Crew/> (undefined) — correct component is <CrewsPage /> */}
        <Route
          path="/staff/crews"
          element={
            <ProtectedRoute allowedRoles={DISPATCHER_ROLES} loginPath="/staff">
              <CrewsPage />
            </ProtectedRoute>
          }
        />

        {/* ════════════════════════════════════
            ASSET MANAGER MODULE
            Role: ASSET_MANAGER
        ════════════════════════════════════ */}
        <Route
          path="/staff/assets"
          element={
            <ProtectedRoute allowedRoles={ASSET_ROLES} loginPath="/staff">
              <AssetLanding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/assets/registry"
          element={
            <ProtectedRoute allowedRoles={ASSET_ROLES} loginPath="/staff">
              <AssetPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/assets/registry/list"
          element={
            <ProtectedRoute allowedRoles={ASSET_ROLES} loginPath="/staff">
              <AssetListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/assets/inspections"
          element={
            <ProtectedRoute allowedRoles={INSPECTION_ROLES} loginPath="/staff">
              <InspectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/assets/inspections/list"
          element={
            <ProtectedRoute allowedRoles={INSPECTION_ROLES} loginPath="/staff">
              <InspectionListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/assets/maintenance"
          element={
            <ProtectedRoute allowedRoles={ASSET_ROLES} loginPath="/staff">
              <MaintenancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/assets/maintenance/list"
          element={
            <ProtectedRoute allowedRoles={ASSET_ROLES} loginPath="/staff">
              <MaintenanceListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/inspections"
          element={
            <ProtectedRoute allowedRoles={INSPECTION_ROLES} loginPath="/staff">
              <InspectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/maintenance"
          element={
            <ProtectedRoute allowedRoles={ASSET_ROLES} loginPath="/staff">
              <MaintenancePage />
            </ProtectedRoute>
          }
        />

        {/* ════════════════════════════════════
            OPERATIONS MANAGER MODULE
            Role: OPERATIONS_MANAGER
        ════════════════════════════════════ */}
        <Route
          path="/staff/operations"
          element={
            <ProtectedRoute allowedRoles={OPERATIONS_ROLES} loginPath="/staff">
              <OperationsLanding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/operations/workorders"
          element={
            <ProtectedRoute allowedRoles={OPERATIONS_ROLES} loginPath="/staff">
              <WorkOrderPriorityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/operations/worklogs/create"
          element={
            <ProtectedRoute allowedRoles={OPERATIONS_ROLES} loginPath="/staff">
              <WorkLogCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/kpis"
          element={
            <ProtectedRoute allowedRoles={OPERATIONS_ROLES} loginPath="/staff">
              <KpiPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/reports"
          element={
            <ProtectedRoute allowedRoles={REPORT_ROLES} loginPath="/staff">
              <ReportListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/reports/new"
          element={
            <ProtectedRoute allowedRoles={REPORT_ROLES} loginPath="/staff">
              <ReportCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/reports/:reportId"
          element={
            <ProtectedRoute allowedRoles={REPORT_ROLES} loginPath="/staff">
              <ReportViewPage />
            </ProtectedRoute>
          }
        />

        {/* ════════════════════════════════════
            FINANCE OFFICER MODULE
            Role: FINANCE_OFFICER
        ════════════════════════════════════ */}
        <Route
          path="/staff/materials"
          element={
            <ProtectedRoute allowedRoles={FINANCE_ROLES} loginPath="/staff">
              <MaterialUsagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/finance/worklogs"
          element={
            <ProtectedRoute allowedRoles={FINANCE_ROLES} loginPath="/staff">
              <WorkLogsViewPage />
            </ProtectedRoute>
          }
        />

        {/* ════════════════════════════════════
            CREW MODULE
            Role: CREW
        ════════════════════════════════════ */}
        <Route
          path="/staff/crew"
          element={
            <ProtectedRoute allowedRoles={CREW_ROLES} loginPath="/staff">
              <CrewOperationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/crew/workorders"
          element={
            <ProtectedRoute allowedRoles={CREW_ROLES} loginPath="/staff">
              <CrewWorkOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/crew/evidence"
          element={
            <ProtectedRoute allowedRoles={CREW_ROLES} loginPath="/staff">
              <CrewEvidencePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/tasks"
          element={
            <ProtectedRoute allowedRoles={CREW_ROLES} loginPath="/staff">
              <MyTasksPage />
            </ProtectedRoute>
          }
        />

        {/* ════════════════════════════════════
            COMPLIANCE OFFICER MODULE
            Role: COMPLIANCE_OFFICER
        ════════════════════════════════════ */}
        <Route
          path="/staff/audit"
          element={
            <ProtectedRoute allowedRoles={COMPLIANCE_ROLES} loginPath="/staff">
              <AuditLogPage />
            </ProtectedRoute>
          }
        />

        {/* ════════════════════════════════════
            NOTIFICATIONS  (all staff roles)
        ════════════════════════════════════ */}
        <Route
          path="/staff/notifications"
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} loginPath="/staff">
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* ════════════════════════════════════
            FALLBACK
        ════════════════════════════════════ */}
        <Route path="/staff/*" element={<Navigate to="/staff/home" replace />} />
        <Route path="*"        element={<Navigate to="/"           replace />} />

      </Routes>
    </AssetProvider>
  );
}

export default App;