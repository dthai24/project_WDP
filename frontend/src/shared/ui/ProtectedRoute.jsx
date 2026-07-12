import { Navigate } from 'react-router-dom';
import {
  getRoleDefaultPath,
  getUser,
  getUserRoles,
  isAuthenticatedUser,
  resolveRoleRedirectPath,
} from '@/features/auth/utils/authUtils';

/**
 * ProtectedRoute - Lớp bảo vệ phân quyền (Role-Based Access Control)
 */
export default function ProtectedRoute({ allowedRoles, roleRedirects, children }) {
  const user = getUser();

  // Nếu chưa đăng nhập -> Đuổi ra cổng /login
  if (!isAuthenticatedUser(user)) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra xem phòng này có yêu cầu allowedRoles không
  if (allowedRoles?.length > 0) {
    const userRoles = getUserRoles(user).map((role) => role.toLowerCase());
    
    // Dò xem role của user có nằm trong allowedRoles không
    const hasAccess = allowedRoles.some((role) => userRoles.includes(role.toLowerCase()));

    // Không có quyền truy cập -> Mở cẩm nang roleRedirects để tống cổ đi
    if (!hasAccess) {
      const redirectTo = resolveRoleRedirectPath(user, roleRedirects) ?? getRoleDefaultPath(user);
      return <Navigate to={redirectTo} replace />;
    }
  }

  // CÓ TÊN ROLE HỢP LỆ -> Cho phép truy cập vào children
  return children;
}
