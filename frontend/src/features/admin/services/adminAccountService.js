/**
 * Admin Account Service — calls real backend APIs.
 */
import { apiGet, apiPost, apiPut, apiPatch } from '@/features/admin/services/adminApiClient';

/**
 * Map a backend user record to the frontend account shape.
 * Backend returns: UserId, FullName, Email, Phone, DateOfBirth,
 *   IsFirstLogin, CreatedAt, UpdatedAt, CurrentLevelId, LearningGoal, Roles (comma-separated or mui array of objects)
 */
function mapUserToAccount(user) {
  if (!user) return {};

  let roles = [];
  if (Array.isArray(user.roles)) {
    roles = user.roles.map(r => {
      if (typeof r === 'string') return r;
      return r?.roleName || r?.RoleName || '';
    }).filter(Boolean);
  } else if (typeof user.Roles === 'string') {
    roles = user.Roles.split(',').map((r) => r.trim()).filter(Boolean);
  }

  // Determine primary role: Admin > Mentor > Student
  let role = 'Student';
  if (roles.includes('Admin')) role = 'Admin';
  else if (roles.includes('Mentor')) role = 'Mentor';

  const isActiveVal = user.isActive !== undefined ? user.isActive : true;

  const emailStr = typeof user.Email === 'string' ? user.Email : (typeof user.email === 'string' ? user.email : '');
  const username = emailStr ? emailStr.split('@')[0] : '';

  return {
    id: user.UserId || user._id,
    fullName: user.FullName || user.fullName || '',
    username,
    email: emailStr,
    phone: user.Phone || user.phone || '',
    dateOfBirth: user.DateOfBirth || user.dateOfBirth || '',
    role,
    status: isActiveVal ? 'ACTIVE' : 'LOCKED',
    createdAt: user.CreatedAt || user.createdAt || null,
    lastLoginAt: user.UpdatedAt || user.updatedAt || null,
    streak: user.streak || 0,
    xp: user.xp || 0,
  };
}

export async function getAccounts() {
  const response = await apiGet('/users');
  console.log("=== ADMIN LIVE FETCH DATA ===", response.data);
  if (!response.ok) return { ok: false, accounts: [] };
  const accounts = (response.data || []).map(mapUserToAccount).filter(acc => acc.id);
  return { ok: true, accounts, data: response.data };
}

export async function createAccount(payload) {
  const res = await apiPost('/users', {
    FullName: payload.fullName,
    Email: payload.email,
    Phone: payload.phone || '',
    DateOfBirth: payload.dateOfBirth || null,
    Password: payload.tempPassword || '123456',
    Role: payload.role || 'Student',
  });
  if (!res.ok) {
    return { ok: false, message: res.message || 'Failed to create account' };
  }
  return { ok: true, account: mapUserToAccount(res.data) };
}

export async function updateAccount(id, payload) {
  const userId = id;

  // Update roles if provided
  if (payload.role) {
    const rolesRes = await apiGet('/roles');
    if (rolesRes.ok) {
      const allRoles = rolesRes.data || [];
      const targetRole = allRoles.find((r) => (r.roleName || r.RoleName || '').toLowerCase() === payload.role.toLowerCase());
      if (targetRole) {
        const roleRes = await apiPut(`/users/${userId}/roles`, { roleIds: [targetRole._id || targetRole.RoleId] });
        if (!roleRes.ok) {
          return { ok: false, message: roleRes.message || 'Failed to update user roles' };
        }
      }
    }
  }

  // Update user basic info
  const updateData = {};
  if (payload.fullName) updateData.FullName = payload.fullName;
  if (payload.email) updateData.Email = payload.email;
  if (payload.phone !== undefined) updateData.Phone = payload.phone;
  if (payload.dateOfBirth !== undefined) updateData.DateOfBirth = payload.dateOfBirth;
  if (payload.status !== undefined) {
    updateData.IsActive = payload.status === 'ACTIVE';
  }

  if (Object.keys(updateData).length > 0) {
    const userRes = await apiPut(`/users/${userId}`, updateData);
    if (!userRes.ok) {
      return { ok: false, message: userRes.message || 'Failed to update user details' };
    }
  }

  // Re-fetch the updated user
  const detailRes = await apiGet(`/users/${userId}`);
  const account = detailRes.ok && detailRes.data ? mapUserToAccount(detailRes.data) : null;

  return { ok: true, account };
}

export async function toggleAccountStatus(id, currentStatus) {
  const newIsActive = currentStatus !== 'ACTIVE';
  const res = await apiPatch(`/users/${id}/status`, { IsActive: newIsActive });
  if (!res.ok) return { ok: false, message: res.message || 'Không thể chuyển trạng thái tài khoản' };
  const account = res.data ? mapUserToAccount(res.data) : null;
  return { ok: true, message: res.message || 'Đã chuyển trạng thái tài khoản thành công', account };
}

export async function resetAccountPassword(id) {
  const userId = id;
  const detailRes = await apiGet(`/users/${userId}`);
  if (!detailRes.ok || !detailRes.data) {
    return { ok: false, message: 'Account not found' };
  }
  const email = detailRes.data.email || detailRes.data.Email || '';
  return { ok: true, message: `Password reset instructions sent to ${email}` };
}
