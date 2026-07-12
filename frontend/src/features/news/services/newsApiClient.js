/**
 * News API client — gọi backend thật tại /api/news
 */
const API_BASE = 'http://localhost:5000/api/news';

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.userId) {
        headers['x-user-id'] = String(user.userId);
      }
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
    }
  } catch {
    // ignore
  }
  return headers;
}

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    return { ok: false, message: data.message || 'Lỗi server', data: null };
  }
  return { ok: true, data: data.data, total: data.total, page: data.page, pageSize: data.pageSize, message: data.message };
}

export async function apiGetNewsList({ status, categoryId, search, page, pageSize } = {}) {
  try {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (categoryId) params.set('categoryId', categoryId);
    if (search) params.set('search', search);
    if (page) params.set('page', page);
    if (pageSize) params.set('pageSize', pageSize);

    const query = params.toString();
    const url = query ? `${API_BASE}?${query}` : API_BASE;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (err) {
    return { ok: false, message: 'Không thể kết nối đến server', data: [] };
  }
}

export async function apiGetNewsById(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (err) {
    return { ok: false, message: 'Không thể kết nối đến server', data: null };
  }
}

export async function apiCreateNews(payload) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  } catch (err) {
    return { ok: false, message: 'Không thể kết nối đến server', data: null };
  }
}

export async function apiUpdateNews(id, payload) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  } catch (err) {
    return { ok: false, message: 'Không thể kết nối đến server', data: null };
  }
}

export async function apiDeleteNews(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (err) {
    return { ok: false, message: 'Không thể kết nối đến server', data: null };
  }
}
