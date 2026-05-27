export function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user")) || {};
  } catch {
    return {};
  }
}

export function getUserRoles(user = getUser()) {
  if (!Array.isArray(user?.roles)) return [];
  return user.roles.map((role) => String(role).trim()).filter(Boolean);
}

export function isMentor(user = getUser()) {
  return getUserRoles(user).some((role) => role.toLowerCase() === "mentor");
}

export function isAdmin(user = getUser()) {
  return getUserRoles(user).some((role) => role.toLowerCase() === "admin");
}

export function isStudent(user = getUser()) {
  const normalized = getUserRoles(user).map((role) => role.toLowerCase());

  if (normalized.includes("admin") || normalized.includes("mentor")) {
    return false;
  }

  if (normalized.includes("student")) {
    return true;
  }

  // Đăng ký qua OTP chỉ dành cho học viên — chưa có User_Roles vẫn coi là Student
  return normalized.length === 0;
}
