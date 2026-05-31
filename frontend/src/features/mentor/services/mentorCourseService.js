/**
 * mentorCourseService.js  ─  Tất cả API calls của Mentor liên quan đến khóa học
 *
 * Base URL: http://localhost:5000/api
 *
 * Auth header bắt buộc cho mọi endpoint mentor:
 *   x-user-id: "<mentorUserId>"
 *
 * ⚠️  HIỆN TẠI ĐANG DÙNG MOCK DATA — thay thế từng hàm khi backend sẵn sàng.
 *     Tìm từ khoá "TODO: replace" để biết điểm cần tích hợp API thật.
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  Mỗi hàm trả về: { ok: boolean, ...payload }           │
 * │  ok = true  → thành công                               │
 * │  ok = false → lỗi + message: string                    │
 * └─────────────────────────────────────────────────────────┘
 */

import { mentorCourseDetailById } from '@/features/mentor/data/mentorCourseDetailMock';
import { mentorCourseStudentsByCourseId } from '@/features/mentor/data/mentorCourseStudentsMock';
import { normalizeMentorCourse } from '@/features/mentor/utils/mentorCourseUtils';
import { normalizeMentorCourseDetail } from '@/features/mentor/utils/mentorCourseDetailUtils';
import {
  computeCourseStudentStats,
  normalizeCourseStudent,
} from '@/features/mentor/utils/mentorCourseStudentsUtils';
import { buildCreateCourseStep1Payload } from '@/features/mentor/utils/mentorCourseFormUtils';
import { saveCreateCourseStep1ToStorage, saveCreateCourseContentToStorage } from '@/features/mentor/utils/mentorCourseCreateStorage';
import { buildCourseContentPayload, buildFullCreateCoursePayload } from '@/features/mentor/utils/mentorCourseContentUtils';

const API_BASE = 'http://localhost:5000/api';

// ─────────────────────────────────────────────────────────────────────────────
// DANH SÁCH KHÓA HỌC
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/mentor/courses
 * Lấy danh sách khóa học của mentor hiện tại.
 *
 * Query params (tuỳ chọn):
 *   q        : string   — tìm theo tên
 *   status   : string   — "published" | "draft" | "all"
 *   category : string
 *   level    : string
 *   sort     : string   — "newest" | "oldest" | "name_asc"
 *   page     : number
 *   pageSize : number
 *
 * Request header:
 *   x-user-id: "42"
 *
 * Response JSON:
 * {
 *   success: true,
 *   courses: [
 *     {
 *       courseId:      number,
 *       courseName:    string,
 *       description:   string,
 *       category:      string,
 *       level:         string,
 *       thumbnail:     string,
 *       isPublished:   boolean,
 *       createdAt:     string,    // ISO date
 *       updatedAt:     string,
 *       chapterCount:  number,
 *       lessonCount:   number,
 *       materialCount: number,
 *       studentCount:  number,
 *       rating:        number
 *     }
 *   ],
 *   total: number
 * }
 *
 * TODO: replace mock with real API call
 */
export async function fetchMentorCourses() {
  try {
    const rawUser = sessionStorage.getItem("user");

    if (!rawUser) {
      return {
        ok: false,
        message: "Chưa đăng nhập.",
      };
    }

    const user = JSON.parse(rawUser);

    const userId = user.userId;

    if (!userId) {
      return {
        ok: false,
        message: "Không tìm thấy userId trong sessionStorage.",
      };
    }

    const response = await fetch(`${API_BASE}/courses/my-courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: Number(userId),
        roleName: "mentor",
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        ok: false,
        message: data.message || "Không lấy được khóa học mentor.",
      };
    }

    return {
      ok: true,
      courses: data.data,
      total: data,
    };
  } catch (error) {
    console.error("fetchMentorCourses error:", error);

    return {
      ok: false,
      courses: [],
      total: 0,
      message: "Không thể kết nối máy chủ.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP (CATEGORIES & LEVELS)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/categories
 * Lấy danh sách thể loại khóa học.
 *
 * Response JSON:
 * {
 *   success: true,
 *   categories: [
 *     { categoryId: number, displayName: string }
 *   ]
 * }
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
      categories: data.categories.map((item) => ({
        value: item.categoryId,
        label: item.displayName,
      })),
    };
  } catch {
    return { ok: false, categories: [], message: 'Không thể kết nối máy chủ.' };
  }
}

/**
 * GET /api/levels
 * Lấy danh sách cấp độ khóa học.
 *
 * Response JSON:
 * {
 *   success: true,
 *   levels: [
 *     { levelId: number, displayName: string }
 *   ]
 * }
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

// ─────────────────────────────────────────────────────────────────────────────
// TẠO KHÓA HỌC MỚI (3 BƯỚC)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/mentor/courses/draft  (Bước 1)
 * Tạo bản nháp khóa học với thông tin cơ bản.
 *
 * Request JSON:
 * {
 *   courseName:  string,
 *   description: string,
 *   categoryId:  number,
 *   levelId:     number,
 *   thumbnail:   string | null,   // base64 hoặc URL
 *   isFree:      boolean,
 *   price:       number | null
 * }
 *
 * Request header:
 *   x-user-id: "42"
 *
 * Response JSON:
 * {
 *   success:  true,
 *   courseId: number,             // ID bản nháp vừa tạo
 *   message:  "Bản nháp đã được tạo."
 * }
 *
 * TODO: replace mock with real API call
 */
export async function saveCreateCourseStep1(form, instructorId) {
  const payload = buildCreateCourseStep1Payload(form, instructorId);

  // TODO: replace with real API
  // const response = await fetch(`${API_BASE}/mentor/courses/draft`, {
  //   method:  'POST',
  //   headers: { 'Content-Type': 'application/json', 'x-user-id': String(instructorId) },
  //   body:    JSON.stringify(payload),
  // });
  // const data = await response.json();
  // if (!response.ok) return { ok: false, message: data.message };

  await delay(200);
  saveCreateCourseStep1ToStorage(form, instructorId);
  return { ok: true, payload };
}

/**
 * PUT /api/mentor/courses/:courseId/content  (Bước 2 — lưu nháp nội dung)
 * Lưu cấu trúc nội dung (chương → bài → học liệu).
 *
 * Request JSON:
 * {
 *   paths: [
 *     {
 *       pathId:      number | null,
 *       title:       string,
 *       description: string,
 *       order:       number,
 *       nodes: [
 *         {
 *           nodeId:   number | null,
 *           title:    string,
 *           order:    number,
 *           materials: [
 *             {
 *               materialId:   number | null,
 *               materialType: "VIDEO" | "DOCUMENT" | "TEST",
 *               title:        string,
 *               order:        number,
 *               videoUrl:     string | null,
 *               content:      string | null,
 *               testData:     object | null
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 * Response JSON:
 * {
 *   success: true,
 *   message: "Nội dung đã được lưu."
 * }
 *
 * TODO: replace mock with real API call
 */
export async function saveCreateCourseContent(course, paths, meta) {
  const contentPayload = buildCourseContentPayload(paths);

  // TODO: replace with real API
  // await fetch(`${API_BASE}/mentor/courses/${courseId}/content`, {
  //   method: 'PUT', headers: {...}, body: JSON.stringify(contentPayload),
  // });

  await delay(200);
  saveCreateCourseContentToStorage(course, paths, meta);
  return { ok: true, payload: contentPayload };
}

/**
 * POST /api/mentor/courses  (Bước 3 — xuất bản)
 * Tạo khóa học hoàn chỉnh (info + content) cùng lúc.
 *
 * Request JSON:  (xem buildFullCreateCoursePayload để biết schema đầy đủ)
 * {
 *   courseName:  string,
 *   description: string,
 *   categoryId:  number,
 *   levelId:     number,
 *   thumbnail:   string | null,
 *   isFree:      boolean,
 *   isPublished: boolean,
 *   paths:       [ ...same as saveCreateCourseContent above... ]
 * }
 *
 * Response JSON:
 * {
 *   success:  true,
 *   courseId: number,
 *   message:  "Khóa học đã được tạo."
 * }
 *
 * TODO: replace mock with real API call
 */
export async function createCourseWithContent(course, paths) {
  const payload = buildFullCreateCoursePayload(course, paths);

  // TODO: replace with real API
  // const response = await fetch(`${API_BASE}/mentor/courses`, {
  //   method: 'POST', headers: {...}, body: JSON.stringify(payload),
  // });

  void payload;
  await delay(600);
  return { ok: true, courseId: Date.now() };
}

/**
 * POST /api/mentor/courses  (alias đơn giản hơn)
 *
 * TODO: replace mock with real API call
 */
export async function createCourse(payload) {
  // TODO: replace with real API
  // const response = await fetch(`${API_BASE}/mentor/courses`, {
  //   method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': String(getUser()?.userId) },
  //   body: JSON.stringify(payload),
  // });
  // const data = await response.json();
  // return { ok: response.ok, courseId: data.courseId, message: data.message };

  void payload;
  await delay(600);
  return { ok: true, courseId: Date.now() };
}

// ─────────────────────────────────────────────────────────────────────────────
// CHI TIẾT KHÓA HỌC
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/mentor/courses/:courseId
 * Lấy toàn bộ thông tin + cây nội dung của một khóa học.
 *
 * Request header:
 *   x-user-id: "42"
 *
 * Response JSON:
 * {
 *   success: true,
 *   course: {
 *     courseId:      number,
 *     courseName:    string,
 *     description:   string,
 *     category:      string,
 *     level:         string,
 *     thumbnail:     string,
 *     isPublished:   boolean,
 *     isFree:        boolean,
 *     createdAt:     string,
 *     updatedAt:     string,
 *     studentCount:  number,
 *     rating:        number,
 *     paths: [
 *       {
 *         pathId:      number,
 *         title:       string,
 *         description: string,
 *         order:       number,
 *         nodes: [
 *           {
 *             nodeId:   number,
 *             title:    string,
 *             order:    number,
 *             materials: [
 *               {
 *                 materialId:   number,
 *                 materialType: "VIDEO" | "DOCUMENT" | "TEST",
 *                 title:        string,
 *                 order:        number,
 *                 videoUrl:     string | null,
 *                 content:      string | null,
 *                 testData:     object | null
 *               }
 *             ]
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * }
 *
 * TODO: replace mock with real API call
 */
export async function fetchMentorCourseDetail(courseId) {
  // TODO: replace with real API
  // const response = await fetch(`${API_BASE}/mentor/courses/${courseId}`, {
  //   headers: { 'x-user-id': String(getUser()?.userId) },
  // });
  // const data = await response.json();
  // if (!response.ok) return { ok: false, message: data.message };
  // return { ok: true, course: normalizeMentorCourseDetail(data.course) };

  await delay(350);
  const id = Number(courseId);
  const raw = mentorCourseDetailById[id];

  if (!raw) {
    return { ok: false, message: 'Không tìm thấy khóa học.' };
  }

  return { ok: true, course: normalizeMentorCourseDetail(raw) };
}

// ─────────────────────────────────────────────────────────────────────────────
// CẬP NHẬT KHÓA HỌC
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PATCH /api/mentor/courses/:courseId
 * Cập nhật thông tin cơ bản (tên, mô tả, thumbnail, v.v.).
 *
 * Request JSON:
 * {
 *   courseName:  string,
 *   description: string,
 *   categoryId:  number,
 *   levelId:     number,
 *   thumbnail:   string | null,
 *   isFree:      boolean
 * }
 *
 * Request header:
 *   x-user-id: "42"
 *
 * Response JSON:
 * {
 *   success:  true,
 *   courseId: number,
 *   message:  "Cập nhật thành công."
 * }
 *
 * TODO: replace mock with real API call
 */
export async function updateCourseBasicInfo(courseId, payload) {
  // TODO: replace with real API
  // const response = await fetch(`${API_BASE}/mentor/courses/${courseId}`, {
  //   method:  'PATCH',
  //   headers: { 'Content-Type': 'application/json', 'x-user-id': String(getUser()?.userId) },
  //   body:    JSON.stringify(payload),
  // });
  // const data = await response.json();
  // if (!response.ok) return { ok: false, message: data.message };
  // return { ok: true, courseId };

  void courseId; void payload;
  await delay(400);
  return { ok: true, courseId };
}

/**
 * PUT /api/mentor/courses/:courseId/content
 * Thay toàn bộ cấu trúc nội dung của khóa học (overwrite).
 *
 * Request JSON: (schema giống saveCreateCourseContent)
 * {
 *   paths: [ ...cấu trúc chương → bài → học liệu... ]
 * }
 *
 * Response JSON:
 * {
 *   success: true,
 *   message: "Nội dung đã được cập nhật."
 * }
 *
 * TODO: replace mock with real API call
 */
export async function updateCourseContent(courseId, paths) {
  // TODO: replace with real API
  // const payload = buildCourseContentPayload(paths);
  // const response = await fetch(`${API_BASE}/mentor/courses/${courseId}/content`, {
  //   method:  'PUT',
  //   headers: { 'Content-Type': 'application/json', 'x-user-id': String(getUser()?.userId) },
  //   body:    JSON.stringify(payload),
  // });
  // const data = await response.json();
  // if (!response.ok) return { ok: false, message: data.message };
  // return { ok: true };

  void courseId; void paths;
  await delay(400);
  return { ok: true };
}

/**
 * PATCH /api/mentor/courses/:courseId/publish
 * Bật/tắt trạng thái xuất bản.
 *
 * Request JSON:
 * {
 *   isPublished: boolean
 * }
 *
 * Request header:
 *   x-user-id: "42"
 *
 * Response JSON:
 * {
 *   success: true,
 *   course: { courseId, isPublished, updatedAt, ...thông tin khóa học }
 * }
 *
 * TODO: replace mock with real API call
 */
export async function updateCoursePublishStatus(courseId, isPublished) {
  // TODO: replace with real API
  // const response = await fetch(`${API_BASE}/mentor/courses/${courseId}/publish`, {
  //   method:  'PATCH',
  //   headers: { 'Content-Type': 'application/json', 'x-user-id': String(getUser()?.userId) },
  //   body:    JSON.stringify({ isPublished }),
  // });
  // const data = await response.json();
  // if (!response.ok) return { ok: false, message: data.message };
  // return { ok: true, course: normalizeMentorCourseDetail(data.course) };

  await delay(400);
  const id = Number(courseId);
  const raw = mentorCourseDetailById[id];

  if (!raw) {
    return { ok: false, message: 'Không tìm thấy khóa học.' };
  }

  const updated = { ...raw, IsPublished: Boolean(isPublished) };
  mentorCourseDetailById[id] = updated;

  return { ok: true, course: normalizeMentorCourseDetail(updated) };
}

// ─────────────────────────────────────────────────────────────────────────────
// HỌC VIÊN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/mentor/courses/:courseId/students
 * Lấy danh sách học viên trong khóa học (có filter + phân trang).
 *
 * Query params (tuỳ chọn):
 *   q        : string   — tìm theo tên / email
 *   status   : string   — "in_progress" | "completed" | "all"
 *   sort     : string   — "name_asc" | "progress_desc" | "recent"
 *   page     : number
 *   pageSize : number
 *
 * Request header:
 *   x-user-id: "42"
 *
 * Response JSON:
 * {
 *   success: true,
 *   students: [
 *     {
 *       userId:             number,
 *       fullName:           string,
 *       email:              string,
 *       avatar:             string | null,
 *       enrolledAt:         string,     // ISO date
 *       progressPercentage: number,     // 0–100
 *       completedLessons:   number,
 *       totalLessons:       number,
 *       lastActivity:       string,
 *       status:             "in_progress" | "completed"
 *     }
 *   ],
 *   total: number
 * }
 *
 * TODO: replace mock with real API call
 */
export async function fetchCourseStudents(courseId, filters = {}) {
  // TODO: replace with real API
  // const params = new URLSearchParams(filters);
  // const response = await fetch(`${API_BASE}/mentor/courses/${courseId}/students?${params}`, {
  //   headers: { 'x-user-id': String(getUser()?.userId) },
  // });
  // const data = await response.json();
  // return { ok: response.ok, students: data.students.map(normalizeCourseStudent) };

  void filters;
  await delay(300);
  const id = Number(courseId);
  const rawStudents = mentorCourseStudentsByCourseId[id] ?? [];

  return { ok: true, students: rawStudents.map(normalizeCourseStudent) };
}

/**
 * GET /api/mentor/courses/:courseId/students/stats
 * Lấy thống kê tổng hợp học viên (dùng cho dashboard card).
 *
 * Response JSON:
 * {
 *   success: true,
 *   stats: {
 *     totalStudents:    number,
 *     completedCount:   number,
 *     inProgressCount:  number,
 *     avgProgress:      number,   // 0–100
 *     recentCount:      number    // enroll trong 7 ngày
 *   }
 * }
 *
 * TODO: replace mock with real API call
 */
export async function fetchCourseStudentStats(courseId) {
  await delay(200);
  const id = Number(courseId);
  const rawStudents = mentorCourseStudentsByCourseId[id] ?? [];
  const students = rawStudents.map(normalizeCourseStudent);

  return { ok: true, stats: computeCourseStudentStats(students) };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function delay(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}
