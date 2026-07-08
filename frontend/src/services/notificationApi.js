import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5050').replace(/\/+$/, '') + '/api';

function getAuthHeaders() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const headers = {};
  const token = localStorage.getItem('token');

  if (token && token !== 'null' && token !== 'undefined') {
    headers.Authorization = `Bearer ${token}`;
  }
  if (user.userId) {
    headers['x-user-id'] = String(user.userId);
  }

  return headers;
}

const notificationApi = {
  getNotifications: async (limit = 20, skip = 0) => {
    try {
      const response = await axios.get(
        `${API_URL}/notifications?limit=${limit}&skip=${skip}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch notifications' };
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/notifications/${notificationId}/read`,
        {},
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark notification as read' };
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await axios.patch(
        `${API_URL}/notifications/read-all`,
        {},
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark notifications as read' };
    }
  }
};

export default notificationApi;
