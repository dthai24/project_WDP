import { Navigate } from 'react-router-dom';
import {
  getRoleDefaultPath,
  getUser,
  getUserRoles,
  isAuthenticatedUser,
  resolveRoleRedirectPath,
} from '@/features/auth/utils/authUtils';

/**
 * ProtectedRoute — RBAC wrapper
 *
 * 1. Guest → /login
 * 2. Sai role → roleRedirects (case-insensitive) hoặc trang mặc định của role
 * 3. Không xác định được redirect → /unauthorized
 */
export default function ProtectedRoute({ allowedRoles, roleRedirects, children }) {
  const user = getUser();

  if (!isAuthenticatedUser(user)) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length > 0) {
    const userRoles = getUserRoles(user).map((role) => role.toLowerCase());
    const hasAccess = allowedRoles.some((role) => userRoles.includes(role.toLowerCase()));

    if (!hasAccess) {
      const redirectTo = resolveRoleRedirectPath(user, roleRedirects) ?? getRoleDefaultPath(user);
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
}
