const API_BASE = 'http://localhost:5000/api/auth';

/** Helper: POST với JSON body */
const apiFetch = async (endpoint, body) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
};

/** Helper: GET */
const apiGet = async (endpoint) => {
  const response = await fetch(`${API_BASE}${endpoint}`);
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
};

const apiGetBase = async (url) => {
  const response = await fetch(`http://localhost:5000${url}`);
  const data = await response.json();
  return { ok: response.ok, data };
};

const apiPostBase = async (url, body) => {
  const response = await fetch(`http://localhost:5000${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return { ok: response.ok, data };
};

export const getCoursesApi = () =>
  apiGetBase('/api/courses');

export const getTopCoursesApi = (limit = 4) =>
  apiGetBase(`/api/courses/top?limit=${limit}`);

export const enrollCourseApi = (userId, courseId) =>
  apiPostBase('/api/courses/enroll', { userId, courseId });

export const getMyCoursesApi = (userId) =>
  apiGetBase(`/api/courses/my?userId=${userId}`);

/** POST /api/auth/login */
export const loginApi = (email, password) =>
  apiFetch('/login', { email, password });

/** POST /api/auth/register */
export const registerApi = (formData) =>
  apiFetch('/register', formData);

/** POST /api/auth/verify-otp */
export const verifyOtpApi = (email, otpCode) =>
  apiFetch('/verify-otp', { email, otpCode });

/** GET /api/auth/tags — lấy danh sách 12 chủ đề */
export const getTagsApi = () =>
  apiGet('/tags');

/** POST /api/auth/save-preferences — lưu sở thích */
export const savePreferencesApi = (userId, tagIds) =>
  apiFetch('/save-preferences', { userId, tagIds });

/** POST /api/auth/forgot-password — chỉ gửi email, không cần role */
export const forgotPasswordApi = (email) =>
  apiFetch('/forgot-password', { email });

/** POST /api/auth/reset-password — xác nhận OTP + cập nhật mật khẩu */
export const resetPasswordApi = (email, otp, newPassword) =>
  apiFetch('/reset-password', { email, otp, newPassword });
