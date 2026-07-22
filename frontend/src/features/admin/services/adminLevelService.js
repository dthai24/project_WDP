import { apiGet, apiPost, apiPut, apiDelete } from '@/features/admin/services/adminApiClient';
import { resolveSeedColorCode } from '@/shared/catalog/catalogColorPalette';

const extractArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.levels)) return res.levels;
  if (Array.isArray(res?.categories)) return res.categories;
  if (Array.isArray(res?.users)) return res.users;
  if (Array.isArray(res?.courses)) return res.courses;
  return [];
};

/**
 * Map a backend level record to the frontend shape.
 */
function mapLevel(raw = {}) {
  const id = raw._id || raw.LevelId || raw.id;
  const isActive = raw.isActive !== undefined ? raw.isActive : (raw.Status === 'ACTIVE' || raw.status === 'ACTIVE' || raw.status === 'active');
  return {
    id,
    levelName: raw.LevelName || raw.levelName || '',
    displayName: raw.DisplayName || raw.displayName || '',
    sortOrder: Number(raw.SortOrder || raw.sortOrder) || 0,
    colorCode: raw.ColorCode || raw.colorCode || resolveSeedColorCode('level', id) || '#0891B2',
    status: isActive ? 'ACTIVE' : 'INACTIVE',
    createdAt: raw.CreatedAt || raw.createdAt || null,
  };
}

export async function getLevels() {
  const res = await apiGet('/levels');
  if (!res.ok) return { ok: false, levels: [] };
  const rawList = extractArray(res);
  const levels = rawList.map(mapLevel);
  return { ok: true, levels };
}

export async function createLevel(payload) {
  const res = await apiPost('/levels', {
    LevelName: payload.levelName || payload.displayName?.toLowerCase().replace(/\s+/g, '-') || '',
    DisplayName: payload.displayName,
    SortOrder: payload.sortOrder || 1,
  });
  if (!res.ok) {
    return { ok: false, message: res.message || 'Không thể tạo trình độ' };
  }
  return { ok: true, level: mapLevel(res.data) };
}

export async function updateLevel(id, payload) {
  const res = await apiPut(`/levels/${id}`, {
    LevelName: payload.levelName || payload.displayName?.toLowerCase().replace(/\s+/g, '-') || '',
    DisplayName: payload.displayName,
    SortOrder: payload.sortOrder || 1,
  });
  if (!res.ok) {
    return { ok: false, message: res.message || 'Không thể cập nhật trình độ' };
  }
  const fetchRes = await getLevels();
  const updated = (fetchRes.levels || []).find((l) => String(l.id) === String(id));
  return { ok: true, level: updated || mapLevel(res.data) };
}

export async function deleteLevel(id) {
  const res = await apiDelete(`/levels/${id}`);
  if (!res.ok) {
    return { ok: false, message: res.message || 'Không thể xoá trình độ' };
  }
  return { ok: true, message: 'Đã xoá trình độ thành công' };
}
