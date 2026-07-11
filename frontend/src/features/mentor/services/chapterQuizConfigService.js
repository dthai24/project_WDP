/**
 * Cấu hình Quiz/Test theo chương — chapter: API; course quiz: localStorage (tạm).
 */
import axios from 'axios';
import { getUser } from '@/features/auth/utils/authUtils';
import {
  getDefaultChapterQuizConfig,
  getDefaultCourseQuizConfig,
  COURSE_QUIZ_CHAPTER_ID,
} from '@/features/mentor/utils/mentorChapterQuizConfigUtils';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api';
const STORAGE_KEY = 'mentor_chapter_quiz_configs_v1';

function getAuthHeaders() {
  const userId = getUser()?.userId;
  const headers = { 'Content-Type': 'application/json' };
  if (userId) headers['x-user-id'] = String(userId);
  return headers;
}

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

export async function getChapterQuizConfig(courseId, chapterId, meta = {}) {
  if (courseId == null || chapterId == null) {
    return {
      ok: false,
      message: 'Thiếu thông tin khóa học hoặc chương',
    };
  }

  try {
    const { data: payload } = await axios.get(
      `${API_BASE}/mentor/courses/${encodeURIComponent(courseId)}/paths/${encodeURIComponent(chapterId)}/chapter-quiz-config`,
      { headers: getAuthHeaders() },
    );

    if (payload.success === false) {
      return {
        ok: false,
        message: payload.message ?? 'Không tải được thiết lập kiểm tra.',
      };
    }

    const stored = payload.data?.config;
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
  } catch (error) {
    console.error('getChapterQuizConfig error:', error);
    return {
      ok: false,
      message: error.response?.data?.message ?? 'Lỗi kết nối khi tải thiết lập kiểm tra.',
    };
  }
}

export async function saveChapterQuizConfig(config) {
  if (config?.courseId == null || config?.chapterId == null) {
    return { ok: false, message: 'Thiếu thông tin khóa học hoặc chương' };
  }

  try {
    const { data: payload } = await axios.put(
      `${API_BASE}/mentor/courses/${encodeURIComponent(config.courseId)}/paths/${encodeURIComponent(config.chapterId)}/chapter-quiz-config`,
      { config },
      { headers: getAuthHeaders() },
    );

    if (payload.success === false) {
      return {
        ok: false,
        message: payload.message ?? 'Không thể lưu thiết lập',
      };
    }

    return {
      ok: true,
      config: payload.data?.config ?? config,
    };
  } catch (error) {
    console.error('saveChapterQuizConfig error:', error);
    return {
      ok: false,
      message: error.response?.data?.message ?? 'Lỗi kết nối khi lưu thiết lập kiểm tra.',
    };
  }
}

export async function getCourseQuizConfig(courseId, meta = {}) {
  const map = loadAllConfigs();
  const key = configKey(courseId, COURSE_QUIZ_CHAPTER_ID);
  const stored = map[key];

  if (stored) {
    return { ok: true, config: stored };
  }

  return {
    ok: true,
    config: getDefaultCourseQuizConfig({
      courseId,
      courseTitle: meta.courseTitle,
    }),
  };
}

export async function saveCourseQuizConfig(config) {
  const map = loadAllConfigs();
  const key = configKey(config.courseId, COURSE_QUIZ_CHAPTER_ID);
  const now = new Date().toISOString();
  const existing = map[key];
  const saved = {
    ...config,
    chapterId: COURSE_QUIZ_CHAPTER_ID,
    id: existing?.id ?? null,
    updatedAt: now,
  };
  map[key] = saved;
  saveAllConfigs(map);
  return { ok: true, config: saved };
}

export async function getChapterQuizConfigsByCourse(courseId) {
  try {
    const { data: payload } = await axios.get(
      `${API_BASE}/mentor/courses/${encodeURIComponent(courseId)}/chapter-quiz-configs`,
      { headers: getAuthHeaders() },
    );

    if (payload.success === false) {
      return {
        ok: false,
        message: payload.message ?? 'Không tải được danh sách thiết lập kiểm tra.',
        configs: [],
      };
    }

    return {
      ok: true,
      configs: payload.data?.configs ?? [],
    };
  } catch (error) {
    console.error('getChapterQuizConfigsByCourse error:', error);
    return {
      ok: false,
      message: error.response?.data?.message ?? 'Lỗi kết nối khi tải danh sách thiết lập.',
      configs: [],
    };
  }
}
