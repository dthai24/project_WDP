import { Navigate } from 'react-router-dom';
import { getUser, getUserRoles } from '../../utils/authUtils';

/**
 * ProtectedRoute — reusable RBAC wrapper
 *
 * Props:
 *   allowedRoles : string[] | undefined
 *       – If provided, the user MUST have at least one matching role.
 *       – If omitted / empty, any authenticated user is allowed.
 *   children     : ReactNode
 *
 * Behaviour:
 *   1. Guest (no session) → redirect to /login
 *   2. Logged-in but wrong role → redirect to /unauthorized
 *   3. Logged-in with correct role → render children
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const user = getUser();

  /* ── 1. Not authenticated ──────────────────────────────── */
  const isAuthenticated = user && Object.keys(user).length > 0 && sessionStorage.getItem('user');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  /* ── 2. Role gate (only when allowedRoles is specified) ── */
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = getUserRoles(user).map((r) => r.toLowerCase());
    const hasAccess = allowedRoles.some((role) =>
      userRoles.includes(role.toLowerCase()),
    );

    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  /* ── 3. Allowed ────────────────────────────────────────── */
  return children;
}
