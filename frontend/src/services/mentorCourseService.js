import { normalizeMentorCourse } from '../utils/mentorCourseUtils';

/**
 * Fetch courses managed by the current mentor.
 * Gọi backend thật: POST /api/courses/my-courses
 */
export async function fetchMentorCourses(query = {}) {
  try {
    const rawUser = sessionStorage.getItem('user');

    if (!rawUser) {
      return {
        ok: false,
        courses: [],
        message: 'Chưa có user trong sessionStorage',
      };
    }

    const user = JSON.parse(rawUser);

    const userId =
      user.userId ||
      user.UserId ||
      user.id ||
      user.Id;

    if (!userId) {
      return {
        ok: false,
        courses: [],
        message: 'Không tìm thấy userId',
      };
    }

    const response = await fetch('http://localhost:5000/api/courses/my-courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: Number(userId),
        roleName: 'mentor',
      }),
    });

    const data = await response.json();

    console.log('FETCH MENTOR COURSES RESPONSE:', data);

    if (!response.ok || !data.success) {
      return {
        ok: false,
        courses: [],
        message: data.message || 'Không thể lấy khóa học của mentor',
      };
    }

    return {
      ok: true,
      courses: (data.data || []).map(normalizeMentorCourse),
    };
  } catch (error) {
    console.error('fetchMentorCourses error:', error);

    return {
      ok: false,
      courses: [],
      message: error.message,
    };
  }
}