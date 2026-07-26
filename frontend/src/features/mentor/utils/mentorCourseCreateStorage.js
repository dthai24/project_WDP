import { buildCreateCourseStep1Payload } from './mentorCourseFormUtils';
import { sanitizePathsForStorage, stripNonLearningMaterials } from './mentorCourseContentUtils';

export const MENTOR_COURSE_CREATE_STORAGE_KEY = 'mentor_course_create_draft';

function isLegacyStep1Payload(data) {
  return Boolean(data && !data.course && ('CourseName' in data || 'InstructorId' in data));
}

export function normalizeCreateCourseDraft(data) {
  if (!data) return null;

  if (isLegacyStep1Payload(data)) {
    return {
      course: data,
      paths: [],
      test: [],
    };
  }

  return {
    course: data.course ?? null,
    paths: stripNonLearningMaterials(data.paths ?? []),
    test: Array.isArray(data.test) ? data.test : [],
    meta: {
      contentDraftSaved: Boolean(data.meta?.contentDraftSaved),
    },
  };
}

export function saveCreateCourseDraft(draft) {
  const normalized = normalizeCreateCourseDraft(draft);
  sessionStorage.setItem(MENTOR_COURSE_CREATE_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function loadCreateCourseDraft() {
  try {
    const raw = sessionStorage.getItem(MENTOR_COURSE_CREATE_STORAGE_KEY);
    if (!raw) return null;
    return normalizeCreateCourseDraft(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveCreateCourseStep1ToStorage(form, instructorId) {
  const course = buildCreateCourseStep1Payload(form, instructorId);
  course.CourseId = form.CourseId ?? form.courseId ?? null;
  course.courseId = course.CourseId;
  const existing = loadCreateCourseDraft();
  if (existing?.course?.FinalWritingPrompt) {
    course.FinalWritingPrompt = existing.course.FinalWritingPrompt;
  }
  return saveCreateCourseDraft({
    course,
    paths: existing?.paths ?? [],
    test: existing?.test ?? [],
    meta: existing?.meta ?? {},
  });
}

export function loadCreateCourseStep1FromStorage() {
  const draft = loadCreateCourseDraft();
  return draft?.course ?? null;
}

export function saveCreateCourseContentToStorage(course, paths, meta = {}) {
  const existing = loadCreateCourseDraft();
  return saveCreateCourseDraft({
    course,
    paths: sanitizePathsForStorage(paths),
    test: existing?.test ?? [],
    meta: {
      ...(existing?.meta ?? {}),
      ...meta,
      contentDraftSaved: true,
    },
  });
}

// Câu hỏi bài kiểm tra cuối khóa (bước 3) — lưu vào draft, chỉ thực sự tạo trên server sau khi khóa học được tạo xong
export function saveCreateCourseTestToStorage(test) {
  const existing = loadCreateCourseDraft();
  if (!existing?.course) return null;
  return saveCreateCourseDraft({
    ...existing,
    test: Array.isArray(test) ? test : [],
  });
}

export function loadCreateCourseTestFromStorage() {
  const draft = loadCreateCourseDraft();
  return draft?.test ?? [];
}

// Đề bài Viết (Writing) cuối khóa (bước 4) — lưu trực tiếp vào course, gửi lên server cùng lúc tạo khóa học
export function saveCreateCourseWritingPromptToStorage(writingPrompt) {
  const existing = loadCreateCourseDraft();
  if (!existing?.course) return null;
  return saveCreateCourseDraft({
    ...existing,
    course: { ...existing.course, FinalWritingPrompt: writingPrompt || '' },
  });
}

export function loadCreateCourseWritingPromptFromStorage() {
  const draft = loadCreateCourseDraft();
  return draft?.course?.FinalWritingPrompt ?? '';
}

export function clearCreateCourseDraft() {
  sessionStorage.removeItem(MENTOR_COURSE_CREATE_STORAGE_KEY);
}

export function formFromStep1Payload(payload) {
  const course = payload?.course ?? payload;
  if (!course) return null;

  return {
    CourseName: course.CourseName ?? '',
    Description: course.Description ?? '',
    CategoryId: course.CategoryId ?? '',
    LevelId: course.LevelId ?? '',
    Thumbnail: course.Thumbnail ?? '',
    IsPublished: Boolean(course.IsPublished),
    IsPaid: Boolean(course.IsPaid),
    Price: course.Price ?? '',
    DiscountPercentage: course.DiscountPercentage ?? 0,
  };
}
