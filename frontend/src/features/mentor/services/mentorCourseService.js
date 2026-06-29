/**
 * mentorCourseService.js  ─  Tất cả API calls của Mentor liên quan đến khóa học
 *
 * Base URL: http://localhost:5000/api
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  Mỗi hàm trả về: { ok: boolean, ...payload }           │
 * │  ok = true  → thành công                               │
 * │  ok = false → lỗi + message: string                    │
 * └─────────────────────────────────────────────────────────┘
 */

import { normalizeMentorCourse } from '@/features/mentor/utils/mentorCourseUtils';
import { normalizeMentorCourseDetail } from '@/features/mentor/utils/mentorCourseDetailUtils';
import {
  computeCourseStudentStats,
  normalizeCourseStudent,
} from '@/features/mentor/utils/mentorCourseStudentsUtils';
import { buildCreateCourseStep1Payload } from '@/features/mentor/utils/mentorCourseFormUtils';
import { saveCreateCourseStep1ToStorage, saveCreateCourseContentToStorage } from '@/features/mentor/utils/mentorCourseCreateStorage';
import { buildCourseContentPayload, buildFullCreateCoursePayload } from '@/features/mentor/utils/mentorCourseContentUtils';
import { uploadPendingMaterialsInPaths } from '@/features/mentor/utils/mentorMaterialUploadUtils';
import { getUser } from '@/features/auth/utils/authUtils';
import { mapMentorCourseComment } from '@/features/mentor/utils/mentorCourseCommentsUtils';
import { getInitialComments } from '@/features/courses/data/courseCommentsMock';

const API_BASE = 'http://localhost:5000/api';

function getMentorAuthHeaders() {
  const userId = getUser()?.userId;
  const headers = { 'Content-Type': 'application/json' };
  if (userId) {
    headers['x-user-id'] = String(userId);
  }
  return headers;
}

function buildUpdateCourseBasicPayload(course = {}) {
  const thumbnail = course.Thumbnail ?? course.thumbnail ?? null;
  return {
    CourseName: course.CourseName ?? course.courseName ?? '',
    Description: course.Description ?? course.description ?? '',
    Thumbnail: thumbnail != null && String(thumbnail).trim() !== '' ? thumbnail : null,
    CategoryId: course.CategoryId ?? course.categoryId ?? null,
    LevelId: course.LevelId ?? course.levelId ?? null,
    IsPublished: Boolean(course.IsPublished ?? course.isPublished),
    InstructorId: course.InstructorId ?? course.instructorId ?? getUser()?.userId ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DANH SÁCH KHÓA HỌC
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/courses/my-courses
 * Lấy danh sách khóa học của mentor hiện tại.
 */
export async function fetchMentorCourses() {
  try {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) {
      return { ok: false, message: "Chưa đăng nhập." };
    }

    const user = JSON.parse(rawUser);
    const userId = user.userId;

    if (!userId) {
      return { ok: false, message: "Không tìm thấy userId trong localStorage." };
    }

    const response = await fetch(`${API_BASE}/courses/my-courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: Number(userId), roleName: "mentor" }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return { ok: false, message: data.message || "Không lấy được khóa học mentor." };
    }

    const courses = Array.isArray(data.data) ? data.data : [];
    return { ok: true, courses: courses.map(normalizeMentorCourse), total: courses.length };
  } catch (error) {
    console.error("fetchMentorCourses error:", error);
    return { ok: false, courses: [], total: 0, message: "Không thể kết nối máy chủ." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP (CATEGORIES & LEVELS)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/categories
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
      categories: (data.data ?? []).map((item) => ({
        value: item.categoryId,
        label: item.displayName,
      })),
    };
  } catch (error) {
    return { ok: false, categories: [], message: error.message };
  }
}

/**
 * GET /api/levels
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
      levels: (data.data ?? []).map((item) => ({
        value: item.levelId,
        label: item.displayName,
      })),
    };
  } catch (err) {
    console.error(err.message);
    return { ok: false, levels: [], message: 'Lỗi fetchCourseLevels' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TẠO KHÓA HỌC MỚI (3 BƯỚC)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/mentor/courses/draft  (Bước 1)
 * Tạo bản nháp khóa học với thông tin cơ bản.
 */
export async function saveCreateCourseStep1(form, instructorId) {
  const payload = buildCreateCourseStep1Payload(form, instructorId);

  try {
    const response = await fetch(`${API_BASE}/courses/mentor/courses/save/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': String(instructorId) },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!data.success) return { ok: false, message: data.message };

    return { ok: true, courseId: data.courseId ?? data.data?.courseId ?? null, payload };
  } catch (error) {
    // Fallback: save to session storage
    saveCreateCourseStep1ToStorage(form, instructorId);
    return { ok: true, payload };
  }
}

/**
 * PUT /api/mentor/courses/:courseId/content  (Bước 2 — lưu nháp nội dung)
 */
export async function saveCreateCourseContent(course, paths, meta) {
  const contentPayload = buildCourseContentPayload(paths);

  try {
    const courseId = course.courseId ?? course.CourseId;
    if (courseId) {
      const response = await fetch(`${API_BASE}/mentor/courses/${courseId}/content`, {
        method: 'PUT',
        headers: getMentorAuthHeaders(),
        body: JSON.stringify(contentPayload),
      });
      const data = await response.json();
      if (data.success) return { ok: true, payload: contentPayload };
    }
  } catch (e) {
    // fall through
  }

  saveCreateCourseContentToStorage(course, paths, meta);
  return { ok: true, payload: contentPayload };
}

/**
 * POST /api/courses/mentor/courses/createCourse  (Bước 3 — xuất bản)
 */
export async function createCourseWithContent(course, paths) {
  try {
    const uploadedPaths = await uploadPendingMaterialsInPaths(paths);
    const payload = buildFullCreateCoursePayload(course, uploadedPaths);

    const response = await fetch(`${API_BASE}/courses/mentor/courses/createCourse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      return { success: false, message: data.message ?? 'Không thể tạo khóa học.' };
    }

    const courseId = data.courseId ?? data.data?.courseId ?? null;
    return { success: true, courseId, payload };
  } catch (error) {
    console.error('[createCourseWithContent]', error);
    return { success: false, message: error.message ?? 'Không thể tạo khóa học.' };
  }
}

/**
 * POST /api/mentor/courses  (alias đơn giản hơn)
 */
export async function createCourse(payload) {
  try {
    const response = await fetch(`${API_BASE}/mentor/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': String(getUser()?.userId) },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return { ok: response.ok, courseId: data.courseId, message: data.message };
  } catch {
    return { ok: true, courseId: Date.now() };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHI TIẾT KHÓA HỌC
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/courses/my-courses/:courseId?tab=course
 * Lấy toàn bộ thông tin + cây nội dung của một khóa học.
 */
export async function fetchMentorCourseDetail(courseId) {
  try {
    const [courseRes, studentsRes] = await Promise.all([
      fetch(`${API_BASE}/courses/my-courses/${courseId}?tab=course`),
      fetch(`${API_BASE}/mentor/courses/${courseId}/students`),
    ]);
    const res = await courseRes.json();
    if (!res.success) {
      return { success: false, message: res.message, course: {} };
    }

    const course = Array.isArray(res.data) ? res.data[0] : res.data;
    if (course && studentsRes.ok) {
      const studentsJson = await studentsRes.json();
      if (studentsJson.success && Array.isArray(studentsJson.data)) {
        course.StudentCount = studentsJson.data.length;
      }
    }

    return { success: true, message: 'Lấy course detail thành công', course };
  } catch (error) {
    return { success: false, message: 'Lỗi Server', course: {} };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CẬP NHẬT KHÓA HỌC
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PATCH /api/mentor/courses/:courseId
 * Cập nhật thông tin cơ bản (tên, mô tả, thumbnail, v.v.).
 */
export async function updateCourseBasicInfo(courseId, payload) {
  try {
    const response = await fetch(`${API_BASE}/mentor/courses/${courseId}`, {
      method: 'PATCH',
      headers: getMentorAuthHeaders(),
      body: JSON.stringify(buildUpdateCourseBasicPayload(payload)),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      return { ok: false, message: data.message ?? 'Không thể cập nhật thông tin khóa học.' };
    }

    return { ok: true, courseId: data.courseId ?? Number(courseId) };
  } catch (error) {
    console.error('[updateCourseBasicInfo]', error);
    return { ok: false, message: 'Lỗi kết nối khi cập nhật khóa học.' };
  }
}

/**
 * PUT /api/mentor/courses/:courseId/content
 * Thay toàn bộ cấu trúc nội dung của khóa học (overwrite).
 */
export async function updateCourseContent(courseId, paths) {
  try {
    const uploadedPaths = await uploadPendingMaterialsInPaths(paths);
    const payload = buildCourseContentPayload(uploadedPaths);
    const response = await fetch(`${API_BASE}/mentor/courses/${courseId}/content`, {
      method: 'PUT',
      headers: getMentorAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      return { ok: false, message: data.message ?? 'Không thể cập nhật nội dung khóa học.' };
    }

    return { ok: true };
  } catch (error) {
    console.error('[updateCourseContent]', error);
    return { ok: false, message: error.message ?? 'Lỗi kết nối khi cập nhật nội dung khóa học.' };
  }
}

/**
 * PATCH /api/mentor/courses/:courseId/publish
 * Bật/tắt trạng thái xuất bản.
 */
export async function updateCoursePublishStatus(courseId, isPublished) {
  try {
    const endpoint = isPublished ? 'setPublic' : 'setDraft';
    const response = await fetch(`${API_BASE}/mentor/courses/${courseId}/${endpoint}`);
    const data = await response.json();
    if (!data.success) return { ok: false, message: data.message };
    return { ok: true, courseIdUpdate: data.courseIdUpdate };
  } catch (error) {
    return { ok: false, message: error.message ?? 'Lỗi kết nối.' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HỌC VIÊN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/mentor/courses/:courseId/students
 */
export async function fetchCourseStudents(courseId, filters = {}) {
  void filters;
  try {
    const response = await fetch(`${API_BASE}/mentor/courses/${courseId}/students`);
    const res = await response.json();
    if (!response.ok || !res.success) {
      return { ok: false, students: [], message: res.message ?? 'Không lấy được danh sách học viên.' };
    }
    const rows = Array.isArray(res.data) ? res.data : [];
    return { ok: true, students: rows.map(normalizeCourseStudent) };
  } catch (error) {
    return { ok: false, students: [], message: error.message ?? 'Lỗi kết nối server.' };
  }
}

/**
 * GET /api/mentor/courses/:courseId/students/stats
 */
export async function fetchCourseStudentStats(courseId) {
  const result = await fetchCourseStudents(courseId);
  if (!result.ok) {
    return { ok: false, stats: computeCourseStudentStats([]), message: result.message };
  }
  return { ok: true, stats: computeCourseStudentStats(result.students) };
}

// ─────────────────────────────────────────────────────────────────────────────
// BÌNH LUẬN KHÓA HỌC
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/mentor/courses/:courseId/comments
 */
export async function fetchMentorCourseComments(courseId) {
  try {
    const response = await fetch(`${API_BASE}/mentor/courses/${courseId}/comments`, {
      headers: getMentorAuthHeaders(),
    });
    const res = await response.json();

    if (!response.ok || !res.success) {
      return { ok: false, comments: [], message: res.message ?? 'Không lấy được bình luận.' };
    }

    const rows = Array.isArray(res.data) ? res.data : [];
    return {
      ok: true,
      comments: rows.length > 0 ? rows.map(mapMentorCourseComment) : getInitialComments(),
    };
  } catch (error) {
    return { ok: false, comments: getInitialComments(), message: error.message ?? 'Lỗi kết nối server.' };
  }
}

/**
 * PATCH /api/mentor/courses/:courseId/comments/:commentId/reply
 */
export async function replyMentorCourseComment(courseId, commentId, content) {
  try {
    const response = await fetch(
      `${API_BASE}/mentor/courses/${courseId}/comments/${commentId}/reply`,
      {
        method: 'PATCH',
        headers: getMentorAuthHeaders(),
        body: JSON.stringify({ content }),
      },
    );
    const res = await response.json();

    if (!response.ok || !res.success || !res.data) {
      return { ok: false, message: res.message ?? 'Không thể gửi phản hồi.' };
    }

    return { ok: true, comment: mapMentorCourseComment(res.data) };
  } catch (error) {
    return { ok: false, message: error.message ?? 'Lỗi kết nối server.' };
  }
}

/**
 * POST /api/mentor/courses/:courseId/comments
 */
export async function createMentorCourseComment(courseId, content) {
  try {
    const response = await fetch(`${API_BASE}/mentor/courses/${courseId}/comments`, {
      method: 'POST',
      headers: getMentorAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    const res = await response.json();

    if (!response.ok || !res.success || !res.data) {
      return { ok: false, message: res.message ?? 'Không thể gửi bình luận.' };
    }

    return { ok: true, comment: mapMentorCourseComment(res.data) };
  } catch (error) {
    return { ok: false, message: error.message ?? 'Lỗi kết nối server.' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function delay(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}
