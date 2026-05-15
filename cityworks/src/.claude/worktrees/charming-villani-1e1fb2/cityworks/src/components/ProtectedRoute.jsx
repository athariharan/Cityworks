// components/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// allowedRoles — array of roles that can access this route
// e.g. allowedRoles={["ADMINISTRATOR", "DISPATCHER"]}
// if empty or not passed — any logged-in user can access

function ProtectedRoute({ children, allowedRoles = [], loginPath = "/" }) {
  const { token, role } = useSelector((state) => state.auth);

  // 1 — Not logged in → redirect to login
  if (!token) {
    return <Navigate to={loginPath} replace />;
  }

  // 2 — Logged in but wrong role → redirect to their correct home
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Citizen trying to access staff page
    if (role === "USER") {
      return <Navigate to="/citizen/home" replace />;
    }
    // Staff trying to access citizen page
    return <Navigate to="/staff/home" replace />;
  }

  // 3 — Authorized → render the page
  return children;
}

export default ProtectedRoute;