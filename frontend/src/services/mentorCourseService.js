import { normalizeMentorCourse } from '../utils/mentorCourseUtils';
import { buildCreateCourseStep1Payload } from '../utils/mentorCourseFormUtils';
import { saveCreateCourseStep1ToStorage, saveCreateCourseContentToStorage } from '../utils/mentorCourseCreateStorage';
import { buildCourseContentPayload, buildFullCreateCoursePayload } from '../utils/mentorCourseContentUtils';

const API_BASE = 'http://localhost:5000/api';

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
      /**
       * Fetch course categories for create form.
       */
      export async function fetchCourseCategories() {
        try {
          const response = await fetch(`${API_BASE}/categories`);
          const data = await response.json();

          if (!response.ok || !data.success) {
            return { ok: false, categories: [], message: data.message };
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

        /**
         * Fetch course levels for create form.
         */
        export async function fetchCourseLevels() {
          try {
            const response = await fetch(`${API_BASE}/levels`);
            const data = await response.json();

            if (!response.ok || !data.success) {
              return { ok: false, levels: [], message: data.message };
            }

            return {
              ok: true,
              levels: (data.levels ?? []).map((item) => ({
                value: item.levelId,
                label: item.displayName,
              })),
            };
          } catch {
            return { ok: false, levels: [], message: 'Không thể kết nối máy chủ.' };
          }
        }

        /**
         * Persist Step 1 draft locally and prepare for Step 2.
         * TODO: replace with API call when backend is ready — createCourseDraft(payload)
         */
        export async function saveCreateCourseStep1(form, instructorId) {
          const payload = buildCreateCourseStep1Payload(form, instructorId);

          // TODO: replace with API call when backend is ready
          // const response = await fetch('http://localhost:5000/api/mentor/courses/draft', {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json',
          //     'x-user-id': String(instructorId),
          //   },
          //   body: JSON.stringify(payload),
          // });
          // const data = await response.json();
          // if (!response.ok) return { ok: false, message: data.message };

          await delay(200);
          saveCreateCourseStep1ToStorage(form, instructorId);
          return { ok: true, payload };
        }

        /**
         * Persist Step 2 content draft locally.
         * TODO: replace with API call — createCourseContent(courseId, payload)
         */
        export async function saveCreateCourseContent(course, paths) {
          const contentPayload = buildCourseContentPayload(paths);

          // TODO: replace with API call
          // await createCourseContent(courseId, contentPayload);

          await delay(200);
          saveCreateCourseContentToStorage(course, paths);
          return { ok: true, payload: contentPayload };
        }

        /**
         * Full create course + content payload (API-ready).
         * TODO: replace with API call — createCourseWithContent(payload)
         */
        export async function createCourseWithContent(course, paths) {
          const payload = buildFullCreateCoursePayload(course, paths);

          // TODO: replace with API call
          // const response = await fetch(`${API_BASE}/mentor/courses`, { method: 'POST', body: JSON.stringify(payload) });

          void payload;
          await delay(600);
          return { ok: true, courseId: Date.now() };
        }

        /**
         * Create a new mentor course (draft or published).
         * TODO: replace with createCourse API
         *   createCourse(payload) → POST /api/mentor/courses
         */
        export async function createCourse(payload) {
          // const user = getUser();
          // const response = await fetch('http://localhost:5000/api/mentor/courses', {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json',
          //     'x-user-id': String(user.userId),
          //   },
          //   body: JSON.stringify(payload),
          // });
          // const data = await response.json();
          // return { ok: response.ok, courseId: data.courseId, message: data.message };

          void payload;
          await delay(600);
          return { ok: true, courseId: Date.now() };
        }

        function delay(ms) {
          return new Promise((resolve) => { setTimeout(resolve, ms); });
        }
      }
    }
  }
}
}