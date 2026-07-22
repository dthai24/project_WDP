import { apiGet, apiPost, apiPut, apiDelete } from '@/features/admin/services/adminApiClient';
import { resolveSeedColorCode } from '@/shared/catalog/catalogColorPalette';

const extractArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.categories)) return res.categories;
  if (Array.isArray(res?.users)) return res.users;
  if (Array.isArray(res?.courses)) return res.courses;
  if (Array.isArray(res?.levels)) return res.levels;
  return [];
};

/**
 * Map a backend category record to the frontend shape.
 */
function mapCategory(raw = {}) {
  const catId = raw._id || raw.CategoryId || raw.id;
  const dispName = raw.displayName || raw.DisplayName || raw.categoryName || raw.CategoryName || '';
  const isActive = raw.isActive !== undefined ? raw.isActive : (raw.Status === 'ACTIVE' || raw.status === 'ACTIVE' || raw.status === 'active');
  return {
    id: catId,
    categoryName: raw.categoryName || raw.CategoryName || dispName.toLowerCase().replace(/\s+/g, '-'),
    displayName: dispName,
    colorCode: raw.colorCode || raw.ColorCode || resolveSeedColorCode('category', catId) || '#0891B2',
    status: isActive ? 'ACTIVE' : 'INACTIVE',
    createdAt: raw.createdAt || raw.CreatedAt || null,
  };
}

export async function getCategories() {
  const res = await apiGet('/categories');
  if (!res.ok) return { ok: false, categories: [] };
  const rawList = extractArray(res);
  const categories = rawList.map(mapCategory);
  return { ok: true, categories };
}

export async function createCategory(payload) {
  const res = await apiPost('/categories', {
    CategoryName: payload.categoryName || payload.displayName?.toLowerCase().replace(/\s+/g, '-') || '',
    DisplayName: payload.displayName,
  });
  if (!res.ok) {
    return { ok: false, message: res.message || 'Không thể tạo danh mục' };
  }
  return { ok: true, category: mapCategory(res.data) };
}

export async function updateCategory(id, payload) {
  const res = await apiPut(`/categories/${id}`, {
    CategoryName: payload.categoryName || payload.displayName?.toLowerCase().replace(/\s+/g, '-') || '',
    DisplayName: payload.displayName,
  });
  if (!res.ok) {
    return { ok: false, message: res.message || 'Không thể cập nhật danh mục' };
  }
  const fetchRes = await getCategories();
  const updated = (fetchRes.categories || []).find((c) => String(c.id) === String(id));
  return { ok: true, category: updated || mapCategory(res.data) };
}

export async function deleteCategory(id) {
  const res = await apiDelete(`/categories/${id}`);
  if (!res.ok) {
    return { ok: false, message: res.message || 'Không thể xoá danh mục' };
  }
  return { ok: true, message: 'Đã xoá danh mục thành công' };
}
