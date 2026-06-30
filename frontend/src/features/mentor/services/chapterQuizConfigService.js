/**
 * Mock service — cấu hình Quiz/Test theo chương (localStorage).
 * TODO: replace bằng API khi backend sẵn sàng.
 */
import { getDefaultChapterQuizConfig, getDefaultCourseQuizConfig, COURSE_QUIZ_CHAPTER_ID } from '@/features/mentor/utils/mentorChapterQuizConfigUtils';

const STORAGE_KEY = 'mentor_chapter_quiz_configs_v1';

function configKey(courseId, chapterId) {
  return `${courseId}_${chapterId}`;
}

function loadAllConfigs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllConfigs(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // storage full or unavailable
  }
}

function nextConfigId(map) {
  const ids = Object.values(map)
    .map((item) => Number(item?.id))
    .filter((id) => Number.isFinite(id) && id > 0);
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

export async function getChapterQuizConfig(courseId, chapterId, meta = {}) {
  if (courseId == null || chapterId == null) {
    return {
      ok: false,
      message: 'Thiếu thông tin khóa học hoặc chương',
    };
  }

  const map = loadAllConfigs();
  const key = configKey(courseId, chapterId);
  const stored = map[key];

  if (stored) {
    return { ok: true, config: stored };
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
  if (config?.courseId == null || config?.chapterId == null) {
    return { ok: false, message: 'Thiếu thông tin khóa học hoặc chương' };
  }

  const map = loadAllConfigs();
  const key = configKey(config.courseId, config.chapterId);
  const now = new Date().toISOString();
  const existing = map[key];

  const saved = {
    ...config,
    id: existing?.id ?? nextConfigId(map),
    updatedAt: now,
  };

  map[key] = saved;
  saveAllConfigs(map);

  return { ok: true, config: saved };
}

export async function getCourseQuizConfig(courseId, meta = {}) {
  const res = await getChapterQuizConfig(courseId, COURSE_QUIZ_CHAPTER_ID, {
    chapterTitle: meta.courseTitle,
    chapterIndex: 0,
  });
  if (!res.ok) return res;
  if (res.config?.updatedAt) return res;
  return {
    ok: true,
    config: getDefaultCourseQuizConfig({
      courseId,
      courseTitle: meta.courseTitle,
    }),
  };
}

export async function saveCourseQuizConfig(config) {
  return saveChapterQuizConfig({
    ...config,
    chapterId: COURSE_QUIZ_CHAPTER_ID,
  });
}

export async function getChapterQuizConfigsByCourse(courseId) {
  const map = loadAllConfigs();
  const configs = Object.values(map).filter(
    (item) => String(item?.courseId) === String(courseId),
  );
  return { ok: true, configs };
}
