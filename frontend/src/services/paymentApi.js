import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5050').replace(/\/+$/, '') + '/api';

function getPaymentAuthHeaders() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const headers = {};
  const token = user.token || localStorage.getItem('token');

  if (token && token !== 'null' && token !== 'undefined') {
    headers.Authorization = `Bearer ${token}`;
  }
  if (user.userId) {
    headers['x-user-id'] = String(user.userId);
  }

  return headers;
}

const paymentApi = {
  // Lấy thông tin giá khóa học
  getCoursePricing: async (courseId) => {
    try {
      const response = await axios.get(`${API_URL}/payment/pricing/${courseId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch pricing' };
    }
  },

  // Tạo thanh toán
  createPayment: async (courseId, paymentType = 'one-time', subscriptionDurationMonths = 1, bankCode) => {
    try {
      const response = await axios.post(
        `${API_URL}/payment/create`,
        {
          courseId,
          paymentType,
          subscriptionDurationMonths,
          bankCode
        },
        { headers: getPaymentAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create payment' };
    }
  },

  // Lấy trạng thái thanh toán
  getPaymentStatus: async (paymentId) => {
    try {
      const response = await axios.get(
        `${API_URL}/payment/status/${paymentId}`,
        { headers: getPaymentAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch payment status' };
    }
  },

  // Lấy danh sách thanh toán của user
  getUserPayments: async (status = null, limit = 10, skip = 0) => {
    try {
      let url = `${API_URL}/payment/user-payments?limit=${limit}&skip=${skip}`;
      if (status) url += `&status=${status}`;

      const response = await axios.get(url, {
        headers: getPaymentAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch payments' };
    }
  },

  // Kiểm tra quyền truy cập khóa học
  checkCourseAccess: async (courseId) => {
    try {
      const response = await axios.get(
        `${API_URL}/payment/check-access/${courseId}`,
        { headers: getPaymentAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to check course access' };
    }
  },

  // Hoàn tiền
  refundPayment: async (paymentId, refundReason = '') => {
    try {
      const response = await axios.post(
        `${API_URL}/payment/refund/${paymentId}`,
        { refundReason },
        { headers: getPaymentAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to refund payment' };
    }
  }
};

export default paymentApi;
