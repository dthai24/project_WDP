/**
 * Cấu hình Quiz/Test — UI-only stub (không gọi API).
 */
import {
  getDefaultChapterQuizConfig,
  getDefaultCourseQuizConfig,
  COURSE_QUIZ_CHAPTER_ID,
} from '@/features/mentor/utils/mentorChapterQuizConfigUtils';

export async function getChapterQuizConfig(courseId, chapterId, meta = {}) {
  if (courseId == null || chapterId == null) {
    return { ok: false, message: 'Thiếu thông tin khóa học hoặc chương' };
  }
  return {
    ok: true,
    config: getDefaultChapterQuizConfig({
      courseId,
      chapterId,
      chapterTitle: meta.chapterTitle,
      chapterIndex: meta.chapterIndex,
    }),
  };
}

export async function saveChapterQuizConfig(config) {
  void config;
  return { ok: true, config };
}

export async function getCourseQuizConfig(courseId, meta = {}) {
  if (courseId == null) {
    return { ok: false, message: 'Thiếu thông tin khóa học' };
  }
  return {
    ok: true,
    config: getDefaultCourseQuizConfig({
      courseId,
      courseTitle: meta.courseTitle ?? '',
    }),
  };
}

export async function saveCourseQuizConfig(config) {
  void config;
  return { ok: true, config };
}

export async function getChapterQuizConfigsByCourse(courseId) {
  void courseId;
  return { ok: true, configs: [] };
}

export { COURSE_QUIZ_CHAPTER_ID };
