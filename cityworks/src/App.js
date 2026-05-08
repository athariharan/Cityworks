// App.js
import { Routes, Route } from "react-router-dom";
import CitizenLogin from "./pages/citizen/CitizenLogin";
import StaffLogin   from "./pages/staff/StaffLogin";
import CitizenHome  from "./pages/citizen/CitizenHome";
import StaffHome    from "./pages/staff/StaffHome";
import ProtectedRoute from "./components/ProtectedRoute";
import ServiceRequestForm from "./pages/citizen/ServiceRequestForm";


//git checkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
// Staff roles
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
    <Routes>

      <Route path="/"      element={<CitizenLogin />} />
      <Route path="/staff" element={<StaffLogin />} />

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
        path="/staff/home"
        element={
          <ProtectedRoute allowedRoles={STAFF_ROLES} loginPath="/staff">
            <StaffHome />
          </ProtectedRoute>
        }
      />

      {/* Add more protected routes below as you build pages */}
      {/* 
      <Route path="/staff/requests" element={
        <ProtectedRoute allowedRoles={["DISPATCHER","OPERATIONS_MANAGER","ADMINISTRATOR"]} loginPath="/staff">
          <ServiceRequestsPage />
        </ProtectedRoute>
      } />
      */}

    </Routes>
  );
}

export default App;