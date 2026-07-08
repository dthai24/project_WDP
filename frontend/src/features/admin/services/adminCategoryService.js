/**
 * Admin Category Service — calls real backend APIs.
 */
import { apiGet, apiPost, apiPut, apiDelete } from '@/features/admin/services/adminApiClient';
import { resolveSeedColorCode } from '@/shared/catalog/catalogColorPalette';

/**
 * Map a backend category record to the frontend shape.
 * Backend returns: CategoryId, CategoryName, DisplayName, CreatedAt
 */
function mapCategory(raw) {
  const id = raw.CategoryId || raw._id || raw.id;
  return {
    id,
    categoryName: raw.CategoryName || raw.categoryName || '',
    displayName: raw.DisplayName || raw.displayName || '',
    colorCode: raw.ColorCode || raw.colorCode || resolveSeedColorCode('category', id) || null,
    status: raw.Status || raw.status || 'ACTIVE',
    createdAt: raw.CreatedAt || raw.createdAt || null,
  };
}

export async function getCategories({ page = 1, limit = 10, q = '', status = '', sort = '' } = {}) {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('limit', limit);
  if (q) params.set('q', q);
  if (status && status !== 'all') params.set('status', status);
  if (sort) params.set('sort', sort);

  const res = await apiGet(`/categories?${params.toString()}`);
  if (!res.ok) return { ok: false, categories: [], totalPages: 1 };
  const categories = (res.data || []).map(mapCategory);
  return { ok: true, categories, totalPages: res.totalPages || 1 };
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
  // Re-fetch to get updated data
  const fetchRes = await getCategories(1, 100);
  const updated = (fetchRes.categories || []).find((c) => String(c.id) === String(id));
  return { ok: true, category: updated || null };
}

export async function deleteCategory(id) {
  const res = await apiDelete(`/categories/${id}`);
  if (!res.ok) {
    return { ok: false, message: res.message || 'Không thể xoá danh mục' };
  }
  return { ok: true, message: 'Đã xoá danh mục thành công' };
}
