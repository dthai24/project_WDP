import axios from "axios";

// Create Axios instance for API requests
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5050",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("learnpath_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const authApi = {
  login: async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  }
};

// Admin API calls
export const adminApi = {
  // Statistics
  getDashboardStats: async () => {
    const response = await api.get("/api/admin/statistics");
    return response.data;
  },

  // Category Management
  getCategories: async (params = {}) => {
    const response = await api.get("/api/admin/categories", { params });
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post("/api/admin/categories", categoryData);
    return response.data;
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/api/admin/categories/${categoryId}`, categoryData);
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/api/admin/categories/${categoryId}`);
    return response.data;
  },

  getCategoryHistory: async (params = {}) => {
    const response = await api.get("/api/admin/categories/history", { params });
    return response.data;
  },

  // User Control
  getUsers: async (params = {}) => {
    const response = await api.get("/api/admin/users", { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/api/admin/users/${userId}`);
    return response.data;
  },

  toggleUserBlock: async (userId, isBlocked) => {
    const response = await api.patch(`/api/admin/users/${userId}/block`, { isBlocked });
    return response.data;
  },

  // Course Control
  getCourses: async (params = {}) => {
    const response = await api.get("/api/admin/courses", { params });
    return response.data;
  },

  toggleCourseStatus: async (courseId, status) => {
    const response = await api.patch(`/api/admin/courses/${courseId}/status`, { status });
    return response.data;
  },

  // Mentor Registration Queue
  getMentorRegistrations: async (params = {}) => {
    const response = await api.get("/api/admin/mentors/registrations", { params });
    return response.data;
  },

  processMentorRegistration: async (regId, status, rejectReason = "") => {
    const response = await api.patch(`/api/admin/mentors/registrations/${regId}`, { status, rejectReason });
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get("/api/mentor/applications");
    const data = response.data || [];
    const mapped = data.map(app => ({
      _id: app._id,
      title: `Yêu cầu Mentor từ ${app.fullName}`,
      message: `Họ tên: ${app.fullName}\nEmail: ${app.email}\nPortfolio: ${app.portfolioUrl}\nGiới thiệu: ${app.bio}`,
      type: "MENTOR_APPLICATION",
      isRead: app.isReadByAdmin || app.status !== "pending",
      createdAt: app.createdAt
    }));
    return { success: true, data: mapped };
  },

  toggleNotificationReadStatus: async (id, isRead) => {
    const response = await api.post("/api/mentor/applications/mark-read");
    return { success: true, data: response.data };
  },

  markAllNotificationsRead: async () => {
    const response = await api.post("/api/mentor/applications/mark-read");
    return { success: true, data: response.data };
  }
  }
};

export const healthApi = {
  checkHealth: async () => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5050"}/api/health`);
    return response.data;
  }
};

export default api;
