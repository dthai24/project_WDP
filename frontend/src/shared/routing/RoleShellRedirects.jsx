import { Navigate } from 'react-router-dom';
import {
  getRoleDefaultPath,
  getUser,
  isAdmin,
  isAuthenticatedUser,
  isMentor,
  isStudent,
  ROLE_DEFAULT_PATHS,
} from '@/features/auth/utils/authUtils';

function ShellIndexRedirect({ path }) {
  return <Navigate to={path} replace />;
}

export function AdminShellIndexRedirect() {
  return <ShellIndexRedirect path={ROLE_DEFAULT_PATHS.Admin} />;
}

export function MentorShellIndexRedirect() {
  return <ShellIndexRedirect path={ROLE_DEFAULT_PATHS.Mentor} />;
}

export function StudentShellIndexRedirect() {
  return <ShellIndexRedirect path={ROLE_DEFAULT_PATHS.Student} />;
}

export function AdminShellFallbackRedirect() {
  return <AdminShellIndexRedirect />;
}

export function MentorShellFallbackRedirect() {
  return <MentorShellIndexRedirect />;
}

/** Chặn role lạc shell Admin (bổ sung sau ProtectedRoute). */
export function AdminLayoutGuard({ children }) {
  const user = getUser();
  if (isMentor(user)) return <Navigate to={getRoleDefaultPath(user)} replace />;
  if (isStudent(user)) return <Navigate to={getRoleDefaultPath(user)} replace />;
  return children;
}

/** Chặn role lạc shell Mentor. */
export function MentorLayoutGuard({ children }) {
  const user = getUser();
  if (isAdmin(user)) return <Navigate to={getRoleDefaultPath(user)} replace />;
  if (isStudent(user)) return <Navigate to={getRoleDefaultPath(user)} replace />;
  return children;
}

/** Mentor không dùng MainLayout. Admin vẫn vào /courses, /profile. */
export function shouldBlockStudentShell(user = getUser()) {
  return isAuthenticatedUser(user) && isMentor(user);
}

/** Admin/Mentor không xem trang chủ học viên. */
export function shouldLeaveStudentHome(user = getUser()) {
  return isAuthenticatedUser(user) && !isStudent(user);
}
