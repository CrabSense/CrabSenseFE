import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

import authService from "../services/authService";
import { homePathForRole } from "../constants/roles";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = authService.getAccessToken();
  const user = authService.getStoredUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const roleAllowed =
    !Array.isArray(allowedRoles) ||
    allowedRoles.length === 0 ||
    allowedRoles.includes(user?.role);

  if (!roleAllowed) {
    const home = homePathForRole(user?.role);
    if (home === "/login") {
      authService.clearAuth();
    }
    return <Navigate to={home} replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};
