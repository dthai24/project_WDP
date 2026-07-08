/**
 * Admin Level Service — calls real backend APIs.
 */
import { apiGet, apiPost, apiPut, apiDelete } from '@/features/admin/services/adminApiClient';
import { resolveSeedColorCode } from '@/shared/catalog/catalogColorPalette';

/**
 * Map a backend level record to the frontend shape.
 * Backend returns: LevelId, LevelName, DisplayName, SortOrder, CreatedAt
 */
function mapLevel(raw) {
  const id = raw.LevelId || raw._id || raw.id;
  return {
    id,
    levelName: raw.LevelName || raw.levelName || '',
    displayName: raw.DisplayName || raw.displayName || '',
    sortOrder: Number(raw.SortOrder || raw.sortOrder) || 0,
    colorCode: raw.ColorCode || raw.colorCode || resolveSeedColorCode('level', id) || null,
    status: raw.isActive === false ? 'INACTIVE' : 'ACTIVE',
    createdAt: raw.CreatedAt || raw.createdAt || null,
    categoryId: raw.CategoryId || raw.categoryId || null,
  };
}

export async function getLevels({ page = 1, limit = 10, q = '', status = '', sort = '' } = {}) {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('limit', limit);
  if (q) params.set('q', q);
  if (status && status !== 'all') params.set('status', status);
  if (sort) params.set('sort', sort);

  const res = await apiGet(`/levels?${params.toString()}`);
  if (!res.ok) return { ok: false, levels: [], totalPages: 1 };
  const levels = (res.data || []).map(mapLevel);
  return { ok: true, levels, totalPages: res.totalPages || 1 };
}

export async function createLevel(payload) {
  const res = await apiPost('/levels', {
    LevelName: payload.levelName || payload.displayName?.toLowerCase().replace(/\s+/g, '-') || '',
    DisplayName: payload.displayName,
    SortOrder: payload.sortOrder || 1,
    CategoryId: payload.CategoryId || null,
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
    CategoryId: payload.CategoryId || null,
    IsActive: payload.status !== undefined ? payload.status === 'ACTIVE' : undefined,
  });
  if (!res.ok) {
    return { ok: false, message: res.message || 'Không thể cập nhật trình độ' };
  }
  // Re-fetch to get updated data
  const fetchRes = await getLevels(1, 100);
  const updated = (fetchRes.levels || []).find((l) => String(l.id) === String(id));
  return { ok: true, level: updated || null };
}

export async function deleteLevel(id) {
  const res = await apiDelete(`/levels/${id}`);
  if (!res.ok) {
    return { ok: false, message: res.message || 'Không thể xoá trình độ' };
  }
  return { ok: true, message: 'Đã xoá trình độ thành công' };
}
