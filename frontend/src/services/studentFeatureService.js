const API_BASE = 'http://localhost:5050/api/student';

const studentFeatureService = {
  async submitPlacementTest(userId, correctCount) {
    try {
      const response = await fetch(`${API_BASE}/placement-test/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, correctCount }),
      });
      const data = await response.json();
      return { ok: response.ok, ...data };
    } catch (error) {
      console.error('submitPlacementTest failed:', error);
      return { ok: false, message: 'Không thể kết nối đến máy chủ.' };
    }
  },

  async submitEssay(userId, courseId, nodeId, essayText) {
    try {
      const response = await fetch(`${API_BASE}/essay/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, courseId, nodeId, essayText }),
      });
      const data = await response.json();
      return { ok: response.ok, ...data };
    } catch (error) {
      console.error('submitEssay failed:', error);
      return { ok: false, message: 'Không thể kết nối đến máy chủ.' };
    }
  },

  async getEssayHistory(userId) {
    try {
      const response = await fetch(`${API_BASE}/essay/history?userId=${userId}`);
      const data = await response.json();
      return { ok: response.ok, ...data };
    } catch (error) {
      console.error('getEssayHistory failed:', error);
      return { ok: false, message: 'Không thể kết nối đến máy chủ.' };
    }
  },
};

export default studentFeatureService;
