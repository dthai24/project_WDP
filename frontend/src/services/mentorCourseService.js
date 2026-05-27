import { mentorCoursesMock } from '../data/mentorCoursesMock';
import { normalizeMentorCourse } from '../utils/mentorCourseUtils';

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

function delay(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}
