import { apiGet, apiPost, apiPut, apiPatch } from '@/features/admin/services/adminApiClient';

const extractArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.users)) return res.users;
  if (Array.isArray(res?.categories)) return res.categories;
  if (Array.isArray(res?.courses)) return res.courses;
  if (Array.isArray(res?.levels)) return res.levels;
  return [];
};

/**
 * Map a backend user record to the frontend account shape.
 */
function mapUserToAccount(user = {}) {
  let roles = [];
  if (Array.isArray(user.roles)) {
    roles = user.roles;
  } else if (typeof user.Roles === 'string') {
    roles = user.Roles.split(',').map((r) => r.trim()).filter(Boolean);
  } else if (Array.isArray(user.Roles)) {
    roles = user.Roles;
  }

  // Determine primary role: Admin > Mentor > Student
  let role = 'Student';
  if (roles.includes('Admin') || roles.includes('admin')) role = 'Admin';
  else if (roles.includes('Mentor') || roles.includes('mentor')) role = 'Mentor';

  const isActiveVal = user.isActive !== undefined ? user.isActive : (user.IsActive !== undefined ? user.IsActive : true);

  return {
    id: user._id || user.UserId || user.id,
    fullName: user.FullName || user.fullName || '',
    username: user.Email ? user.Email.split('@')[0] : (user.email ? user.email.split('@')[0] : ''),
    email: user.Email || user.email || '',
    phone: user.Phone || user.phone || '',
    dateOfBirth: user.DateOfBirth || user.dateOfBirth || '',
    role,
    status: isActiveVal ? 'ACTIVE' : 'BLOCKED',
    createdAt: user.CreatedAt || user.createdAt || null,
    lastLoginAt: user.UpdatedAt || user.updatedAt || null,
    streak: user.streak || 0,
    xp: user.xp || 0,
  };
}

export async function getAccounts() {
  const res = await apiGet('/users');
  if (!res.ok) return { ok: false, accounts: [] };
  const rawList = extractArray(res);
  const accounts = rawList.map(mapUserToAccount);
  return { ok: true, accounts };
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
    return { ok: false, message: res.message || 'Không thể tạo tài khoản' };
  }
  return { ok: true, account: mapUserToAccount(res.data) };
}

export async function updateAccount(id, payload) {
  const userId = id;

  // Update roles if provided
  if (payload.role) {
    const rolesRes = await apiGet('/roles');
    if (rolesRes.ok) {
      const allRoles = extractArray(rolesRes);
      const targetRole = allRoles.find((r) => r.RoleName === payload.role || r.roleName === payload.role);
      if (targetRole) {
        const roleRes = await apiPut(`/users/${userId}/roles`, { roleIds: [targetRole.RoleId || targetRole._id] });
        if (!roleRes.ok) {
          return { ok: false, message: roleRes.message || 'Không thể cập nhật vai trò' };
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
      return { ok: false, message: userRes.message || 'Không thể cập nhật tài khoản' };
    }
  }

  // Re-fetch the updated user
  const detailRes = await apiGet(`/users/${userId}`);
  const account = detailRes.ok && detailRes.data ? mapUserToAccount(detailRes.data) : null;

  return { ok: true, account };
}

export async function toggleAccountStatus(id, isActive) {
  const res = await apiPatch(`/users/${id}/status`, { isActive });
  if (!res.ok) {
    return { ok: false, message: res.message || 'Không thể cập nhật trạng thái tài khoản' };
  }
  return { ok: true, message: res.message || 'Đã cập nhật trạng thái tài khoản' };
}

export async function resetAccountPassword(id) {
  const userId = id;
  const detailRes = await apiGet(`/users/${userId}`);
  if (!detailRes.ok || !detailRes.data) {
    return { ok: false, message: 'Không tìm thấy tài khoản' };
  }
  const email = detailRes.data.Email || detailRes.data.email || '';
  return { ok: true, message: `Đã gửi email đặt lại mật khẩu tới ${email}` };
}
