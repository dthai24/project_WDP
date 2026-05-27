import { mentorCoursesMock } from '../data/mentorCoursesMock';
import { normalizeMentorCourse } from '../utils/mentorCourseUtils';
import { buildCreateCourseStep1Payload } from '../utils/mentorCourseFormUtils';
import { saveCreateCourseStep1ToStorage, saveCreateCourseContentToStorage } from '../utils/mentorCourseCreateStorage';
import { buildCourseContentPayload, buildFullCreateCoursePayload } from '../utils/mentorCourseContentUtils';

const API_BASE = 'http://localhost:5000/api';

/**
 * Fetch courses managed by the current mentor.
 * TODO: replace mock with real API call
 *   fetchMentorCourses({ q, status, category, level, sort, page, pageSize })
 */
export async function fetchMentorCourses(query = {}) {
  // const user = getUser();
  // const params = new URLSearchParams();
  // Object.entries(query).forEach(([key, value]) => {
  //   if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  // });
  // const response = await fetch(`http://localhost:5000/api/mentor/courses?${params}`, {
  //   headers: { 'x-user-id': String(user.userId) },
  // });
  // const data = await response.json();
  // return { ok: response.ok, courses: (data.courses ?? []).map(normalizeMentorCourse) };

  void query;
  await delay(300);
  return { ok: true, courses: mentorCoursesMock.map(normalizeMentorCourse) };
}

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
      categories: (data.categories ?? []).map((item) => ({
        value: item.categoryId,
        label: item.displayName,
      })),
    };
  } catch {
    return { ok: false, categories: [], message: 'Không thể kết nối máy chủ.' };
  }
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
export async function saveCreateCourseContent(course, paths, meta) {
  const contentPayload = buildCourseContentPayload(paths);

  // TODO: replace with API call
  // await createCourseContent(courseId, contentPayload);

  await delay(200);
  saveCreateCourseContentToStorage(course, paths, meta);
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
