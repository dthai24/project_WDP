/**
 * authService.js  ─  Tất cả API calls liên quan đến xác thực & người dùng
 *
 * Base URL: http://localhost:5000
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  Mỗi hàm trả về: { ok: boolean, data: object }         │
 * │  ok = true  → request thành công (HTTP 2xx)             │
 * │  ok = false → lỗi server / network                      │
 * └─────────────────────────────────────────────────────────┘
 */

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

// ─────────────────────────────────────────────────────────────────────────────
// COURSES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/courses
 * Lấy danh sách khóa học công khai (có thể filter theo userId để biết đã enroll chưa).
 *
 * Request header (tuỳ chọn):
 *   x-user-id: "42"
 *
 * Response JSON:
 * {
 *   success: true,
 *   courses: [
 *     {
 *       courseId:    number,
 *       title:       string,
 *       description: string,
 *       category:    string,
 *       level:       string,       // "Cơ bản" | "Trung cấp" | "Nâng cao"
 *       instructor:  string,
 *       thumbnail:   string,       // URL
 *       duration:    string,       // "8 giờ"
 *       lessonCount: number,
 *       rating:      number,
 *       reviewCount: number,
 *       studentCount:number,
 *       isFree:      boolean,
 *       isEnrolled:  boolean,      // chỉ có nếu gửi x-user-id
 *       progress:    number        // 0–100, chỉ có nếu đã enroll
 *     }
 *   ]
 * }
 */
export const getCoursesApi = (userId) => {
  const headers = {};
  if (userId) {
    headers['x-user-id'] = String(userId);
  }
  return fetch('http://localhost:5000/api/courses', { headers })
    .then((response) => response.json())
    .then((data) => ({ ok: true, data }))
    .catch(() => ({ ok: false, data: {} }));
};

/**
 * GET /api/courses/top?limit=4
 * Lấy top N khóa học nổi bật cho HomePage.
 *
 * Query params:
 *   limit: number  (mặc định 4)
 *
 * Response JSON:
 * {
 *   success: true,
 *   courses: [ { courseId, title, thumbnail, rating, studentCount, ... } ]
 * }
 */
export const getTopCoursesApi = (limit = 4) =>
  apiGetBase(`/api/courses/top?limit=${limit}`);

/**
 * POST /api/courses/enroll
 * Đăng ký học một khóa học.
 *
 * Request JSON:
 * {
 *   userId:   number,
 *   courseId: number
 * }
 *
 * Response JSON:
 * {
 *   success: true,
 *   message: "Đăng ký thành công."
 * }
 */
export const enrollCourseApi = (userId, courseId) =>
  apiPostBase('/api/courses/enroll', { userId, courseId });

/**
 * GET /api/courses/my?userId=42
 * Lấy danh sách khóa học đang học của student.
 *
 * Query params:
 *   userId: number
 *
 * Response JSON:
 * {
 *   success: true,
 *   courses: [
 *     {
 *       courseId:           number,
 *       title:              string,
 *       thumbnail:          string,
 *       progressPercentage: number,   // 0–100
 *       enrollmentStatus:   string,   // "in_progress" | "completed"
 *       enrolledAt:         string,   // ISO date
 *       lastActivity:       string,   // "2 ngày trước"
 *       currentStage:       string,   // tên chương hiện tại
 *       currentLesson:      string,   // tên bài học hiện tại
 *       instructor:         string,
 *       category:           string,
 *       level:              string
 *     }
 *   ]
 * }
 */
export const getMyCoursesApi = (userId) =>
  apiGetBase(`/api/courses/my?userId=${userId}`);

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Đăng nhập bằng email + mật khẩu.
 *
 * Request JSON:
 * {
 *   email:    string,
 *   password: string
 * }
 *
 * Response JSON (success):
 * {
 *   success: true,
 *   message: "Đăng nhập thành công.",
 *   user: {
 *     userId:      number,
 *     fullName:    string,
 *     email:       string,
 *     role:        string,    // "Student" | "Mentor" | "Admin"
 *     isFirstLogin: boolean
 *   }
 * }
 *
 * Response JSON (fail):
 * {
 *   success: false,
 *   message: "Email hoặc mật khẩu không đúng."
 * }
 */
export const loginApi = (email, password) =>
  apiFetch('/login', { email, password });

/**
 * POST /api/auth/register
 * Đăng ký tài khoản — gửi OTP về email.
 *
 * Request JSON:
 * {
 *   fullName:    string,
 *   email:       string,
 *   phone:       string,
 *   password:    string,
 *   dateOfBirth: string   // "YYYY-MM-DD"
 * }
 *
 * Response JSON (success):
 * {
 *   success: true,
 *   message: "Mã OTP đã được gửi đến email của bạn."
 * }
 *
 * Response JSON (fail):
 * {
 *   success: false,
 *   message: "Email đã tồn tại." | "Số điện thoại đã tồn tại."
 * }
 */
export const registerApi = (formData) =>
  apiFetch('/register', formData);

/**
 * POST /api/auth/verify-otp
 * Xác minh OTP sau khi đăng ký.
 *
 * Request JSON:
 * {
 *   email:   string,
 *   otpCode: string    // 6 chữ số
 * }
 *
 * Response JSON (success):
 * {
 *   success: true,
 *   message: "Tài khoản đã được tạo thành công.",
 *   user: { userId, fullName, email, role, isFirstLogin }
 * }
 *
 * Response JSON (fail):
 * {
 *   success: false,
 *   message: "Mã OTP không hợp lệ hoặc đã hết hạn."
 * }
 */
export const verifyOtpApi = (email, otpCode) =>
  apiFetch('/verify-otp', { email, otpCode });

/**
 * GET /api/auth/tags
 * Lấy danh sách 12 chủ đề sở thích cho màn Survey.
 *
 * Response JSON:
 * {
 *   success: true,
 *   tags: [
 *     { tagId: number, tagName: string, displayName: string }
 *   ]
 * }
 */
export const getTagsApi = () =>
  apiGet('/tags');

/**
 * POST /api/auth/save-preferences
 * Lưu sở thích của user (sau Survey).
 *
 * Request JSON:
 * {
 *   userId: number,
 *   tagIds: number[]   // VD: [1, 3, 7]
 * }
 *
 * Response JSON:
 * {
 *   success: true,
 *   message: "Sở thích đã được lưu."
 * }
 */
export const savePreferencesApi = (userId, tagIds) =>
  apiFetch('/save-preferences', { userId, tagIds });

/**
 * POST /api/auth/forgot-password
 * Gửi OTP về email để đặt lại mật khẩu.
 *
 * Request JSON:
 * {
 *   email: string
 * }
 *
 * Response JSON:
 * {
 *   success: true,
 *   message: "Mã OTP đã được gửi."
 * }
 *
 * Response JSON (fail):
 * {
 *   success: false,
 *   message: "Email không tồn tại trong hệ thống."
 * }
 */
export const forgotPasswordApi = (email) =>
  apiFetch('/forgot-password', { email });

/**
 * POST /api/auth/reset-password
 * Xác nhận OTP + đặt mật khẩu mới.
 *
 * Request JSON:
 * {
 *   email:       string,
 *   otp:         string,    // 6 chữ số
 *   newPassword: string
 * }
 *
 * Response JSON (success):
 * {
 *   success: true,
 *   message: "Mật khẩu đã được cập nhật thành công."
 * }
 *
 * Response JSON (fail):
 * {
 *   success: false,
 *   message: "OTP không hợp lệ hoặc đã hết hạn."
 * }
 */
export const resetPasswordApi = (email, otp, newPassword) =>
  apiFetch('/reset-password', { email, otp, newPassword });
