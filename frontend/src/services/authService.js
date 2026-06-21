// Đường dẫn gốc cấu trúc Auth nội bộ
const API_BASE = 'http://localhost:5000/api/auth';

// Hàm giải mã JSON an toàn, chống sập ứng dụng khi Backend lỗi
const safeJson = async (response) => {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
  } catch (error) {
    // Bỏ qua lỗi ép kiểu dữ liệu
  }
  return { success: false, message: "Lỗi hệ thống hoặc sai đường dẫn API" };
};


// 1. API Đăng ký khóa học (Sửa dứt điểm lỗi 400 và lỗi trả về)
export const enrollCourseApi = async (data) => {
  try {
    const response = await fetch('http://localhost:5000/api/courses/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await safeJson(response);
    // Trả về đồng bộ thuộc tính success để file giao diện check điều kiện chuẩn
    return { success: response.ok, ...result };
  } catch (error) {
    console.error("Lỗi kết nối đăng ký:", error);
    return { success: false, message: "Không thể kết nối đến server." };
  }
};

// 2. API Lấy danh sách khóa học hệ thống (Đồng bộ format)
export const getCoursesApi = async (userId) => {
  try {
    const headers = {};
    if (userId) headers['x-user-id'] = String(userId);

    const response = await fetch('http://localhost:5000/api/courses', { headers });
    const result = await safeJson(response);
    return { success: response.ok, ...result };
  } catch {
    return { success: false, data: [] };
  }
};

// 3. API Lấy danh sách khóa học nổi bật (Top)
export const getTopCoursesApi = async (limit = 4) => {
  const response = await fetch(`http://localhost:5000/api/courses/top?limit=${limit}`);
  const result = await safeJson(response);
  return { success: response.ok, ...result };
};

// 4. API Lấy danh sách khóa học cá nhân của tôi
export const getMyCoursesApi = async (userId) => {
  const response = await fetch(`http://localhost:5000/api/courses/my?userId=${userId}`);
  const result = await safeJson(response);
  return { success: response.ok, ...result };
};

// 5. API Đăng nhập tài khoản
export const loginApi = async (email, password) => {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const result = await safeJson(response);
  return { success: response.ok, status: response.status, ...result };
};

// 6. API Đăng ký tài khoản mới
export const registerApi = async (formData) => {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  const result = await safeJson(response);
  return { success: response.ok, status: response.status, ...result };
};

// 7. API Xác thực mã OTP
export const verifyOtpApi = async (email, otpCode) => {
  const response = await fetch(`${API_BASE}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otpCode }),
  });
  const result = await safeJson(response);
  return { success: response.ok, status: response.status, ...result };
};

// 8. API Lấy danh sách thẻ chủ đề (Tags)
export const getTagsApi = async () => {
  const response = await fetch(`${API_BASE}/tags`);
  const result = await safeJson(response);
  return { success: response.ok, status: response.status, ...result };
};

// 9. API Lưu cấu hình sở thích người dùng
export const savePreferencesApi = async (userId, tagIds) => {
  const response = await fetch(`${API_BASE}/save-preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, tagIds }),
  });
  const result = await safeJson(response);
  return { success: response.ok, status: response.status, ...result };
};

// 10. API Yêu cầu quên mật khẩu
export const forgotPasswordApi = async (email) => {
  const response = await fetch(`${API_BASE}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const result = await safeJson(response);
  return { success: response.ok, status: response.status, ...result };
};

// 11. API Đặt lại mật khẩu mới bằng OTP
export const resetPasswordApi = async (email, otp, newPassword) => {
  const response = await fetch(`${API_BASE}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword }),
  });
  const result = await safeJson(response);
  return { success: response.ok, status: response.status, ...result };
};

// 12. API Tải lên ảnh đại diện cá nhân (Avatar)
export const uploadAvatarApi = async (blob, userId) => {
  const formData = new FormData();
  formData.append('avatar', blob, 'avatar.png');

  const response = await fetch('http://localhost:5000/api/users/avatar', {
    method: 'POST',
    headers: { 'x-user-id': String(userId) },
    body: formData,
  });
  const result = await safeJson(response);
  return { success: response.ok, ...result };
};