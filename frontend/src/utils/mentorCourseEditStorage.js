import {
  createTempId,
  sanitizePathsForStorage,
  withNormalizedOrders,
} from './mentorCourseContentUtils';

const editKey = (courseId) => `mentor_course_edit_draft_${courseId}`;

/**
 * Convert server-side paths (PathId / NodeId / MaterialId + nested data)
 * to the UI path format used by MentorCourseContentBuilder.
 * Each level gets a fresh tempId while real IDs are preserved for update APIs.
 */
export function mapDetailPathsToEditPaths(detailPaths = []) {
  return withNormalizedOrders(
    (detailPaths ?? []).map((path) => ({
      ...path,
      tempId: createTempId('path'),
      nodes: (path.nodes ?? []).map((node) => ({
        ...node,
        tempId: createTempId('node'),
        materials: (node.materials ?? []).map((material) => ({
          ...material,
          tempId: createTempId('material'),
        })),
      })),
    })),
  );
}

/**
 * Map normalized course detail (camelCase) → PascalCase draft.course format.
 * The draft.course must be PascalCase so it is compatible with
 * validateCourseDraft / buildReviewChecklist / MentorCourseInfoReview.
 */
export function courseDetailToEditCourse(course) {
  return {
    CourseId: course.courseId ?? null,
    CourseName: course.courseName ?? '',
    Description: course.description ?? '',
    Thumbnail: course.thumbnail ?? null,
    CategoryId: course.categoryId ?? null,
    LevelId: course.levelId ?? null,
    InstructorId: course.instructorId ?? null,
    IsPublished: course.status === 'published',
  };
}

/**
 * Map normalized course detail (camelCase) → form state for MentorCourseCreateForm.
 */
export function courseDetailToEditForm(course) {
  return {
    CourseName: course.courseName ?? '',
    Description: course.description ?? '',
    CategoryId: course.categoryId != null ? String(course.categoryId) : '',
    LevelId: course.levelId != null ? String(course.levelId) : '',
    Thumbnail: course.thumbnail ?? '',
    IsPublished: course.status === 'published',
  };
}

export function saveEditCourseDraft(courseId, draft) {
  sessionStorage.setItem(editKey(courseId), JSON.stringify(draft));
}

export function loadEditCourseDraft(courseId) {
  try {
    const raw = sessionStorage.getItem(editKey(courseId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearEditCourseDraft(courseId) {
  sessionStorage.removeItem(editKey(courseId));
}

/**
 * Persist basic-info changes into edit storage; keep existing paths.
 */
export function persistEditStep1(courseId, coursePascal, paths) {
  const prev = loadEditCourseDraft(courseId) ?? {};
  saveEditCourseDraft(courseId, {
    ...prev,
    courseId: Number(courseId),
    course: coursePascal,
    paths: sanitizePathsForStorage(paths ?? prev.paths ?? []),
  });
}

/**
 * Persist content paths into edit storage; keep existing course.
 */
export function persistEditContent(courseId, coursePascal, paths) {
  const prev = loadEditCourseDraft(courseId) ?? {};
  saveEditCourseDraft(courseId, {
    ...prev,
    courseId: Number(courseId),
    course: coursePascal ?? prev.course,
    paths: sanitizePathsForStorage(paths),
    meta: { ...(prev.meta ?? {}), contentSaved: true },
  });
}
