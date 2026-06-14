import { Navigate } from 'react-router-dom';
import { getUser, getUserRoles } from '@/features/auth/utils/authUtils';

/**
 * ProtectedRoute — reusable RBAC wrapper
 *
 * Props:
 *   allowedRoles   : string[] | undefined — user must have at least one matching role
 *   roleRedirects  : Record<string, string> — redirect map when role is not allowed
 *   children       : ReactNode
 *
 * Behaviour:
 *   1. Guest → /login
 *   2. Wrong role → roleRedirects[role] or /unauthorized
 *   3. Allowed → render children
 */
export default function ProtectedRoute({ allowedRoles, roleRedirects, children }) {
  const user = getUser();
  const isAuthenticated = user && Object.keys(user).length > 0 && localStorage.getItem('user');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = getUserRoles(user).map((role) => role.toLowerCase());
    const hasAccess = allowedRoles.some((role) => userRoles.includes(role.toLowerCase()));

    if (!hasAccess) {
      if (roleRedirects) {
        for (const role of getUserRoles(user)) {
          const redirectTo = roleRedirects[role];
          if (redirectTo) {
            return <Navigate to={redirectTo} replace />;
          }
        }
      }
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}
