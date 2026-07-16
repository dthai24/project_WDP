/**
 * Student test service — mock local, API-ready shape.
 *
 * TODO backend:
 *   GET  /api/courses/:courseId/tests/:scope/meta?chapterId=
 *   POST /api/courses/:courseId/tests/:scope/start
 *   POST /api/courses/:courseId/tests/attempts/:attemptId/submit
 */
import { getUser } from '@/features/auth/utils/authUtils';
import {
  getChapterQuizConfig,
  getCourseQuizConfig,
  getChapterQuizConfigsByCourse,
} from '@/features/mentor/services/chapterQuizConfigService';
import {
  COURSE_QUIZ_CHAPTER_ID,
  getChapterQuizConfigTotal,
  hasConfiguredQuizSources,
  getRequiredChapterIdsFromConfig,
  evaluateQuizPrerequisites,
} from '@/features/mentor/utils/mentorChapterQuizConfigUtils';
import {
  normalizeTestPaper,
  gradeTestAnswers,
} from '@/features/learning/utils/courseTestPaperUtils';
import { getConfiguredSkillTypes } from '@/features/mentor/utils/mentorChapterQuizConfigUtils';
import {
  createDemoTestMeta,
  createDemoTestPaper,
  DEMO_ANSWER_KEY,
} from '@/features/learning/data/courseTestMock';
import axios from 'axios'; 
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api';
function getAuthHeaders() {
  const userId = getUser()?.userId;
  const headers = { 'Content-Type': 'application/json' };
  if (userId) headers['x-user-id'] = String(userId);
  return headers;
}
const ATTEMPTS_STORAGE_KEY = 'student_test_attempts_v1';
const SESSIONS_STORAGE_KEY = 'student_test_sessions_v1';

/** TODO: tắt khi backend enforce giới hạn lượt làm bài */
export const BYPASS_ATTEMPT_LIMIT = false;

/**
 * Hàm tạo hiệu ứng trễ (delay) giả lập thời gian phản hồi của mạng khi gọi API.
 */
function delay(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Đọc và phân tích cú pháp JSON từ localStorage. Trả về đối tượng trống nếu không tồn tại.
 */
function loadMap(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Lưu trữ đối tượng JSON map vào localStorage bằng cách chuyển thành chuỗi String.
 */
function saveMap(key, map) {
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/**
 * Trả về khóa định danh dựa trên phạm vi bài kiểm tra (cuối khóa hoặc cuối chương).
 */
function getScopeKey(scope, chapterId) {
  return scope === 'final' ? 'final' : String(chapterId ?? '');
}

/**
 * Tạo chuỗi khóa duy nhất để quản lý lịch sử làm bài dựa trên userId, courseId và phạm vi thi.
 */
function getAttemptHistoryKey(userId, courseId, scope, chapterId) {
  return `${userId}_${courseId}_${getScopeKey(scope, chapterId)}`;
}

/**
 * Lấy danh sách lịch sử các lượt làm bài của học viên từ localStorage.
 */
function getAttemptHistory(userId, courseId, scope, chapterId) {
  const map = loadMap(ATTEMPTS_STORAGE_KEY);
  return map[getAttemptHistoryKey(userId, courseId, scope, chapterId)] ?? [];
}

/**
 * Ghi đè hoặc thêm mới một bản ghi lịch sử làm bài kiểm tra của học viên.
 */
function saveAttemptRecord(userId, courseId, scope, chapterId, record) {
  const map = loadMap(ATTEMPTS_STORAGE_KEY);
  const key = getAttemptHistoryKey(userId, courseId, scope, chapterId);
  const history = map[key] ?? [];
  map[key] = [...history, record];
  saveMap(ATTEMPTS_STORAGE_KEY, map);
}

/**
 * Lưu thông tin phiên làm bài thi hiện tại (các câu hỏi, câu trả lời tạm thời...) vào localStorage.
 */
function saveSession(attemptId, session) {
  const map = loadMap(SESSIONS_STORAGE_KEY);
  map[attemptId] = session;
  saveMap(SESSIONS_STORAGE_KEY, map);
}

/**
 * Lấy thông tin phiên làm bài đang diễn ra thông qua ID của lượt làm bài (attemptId).
 */
function getSession(attemptId) {
  const map = loadMap(SESSIONS_STORAGE_KEY);
  return map[attemptId] ?? null;
}

/**
 * Tải cấu hình bài kiểm tra (thiết lập bởi Mentor) của chương học hoặc khóa học.
 */
async function loadQuizConfig(courseId, scope, chapterId, meta = {}) {
  if (scope === 'final') {
    return getCourseQuizConfig(courseId, { courseTitle: meta.courseTitle ?? '' });
  }
  return getChapterQuizConfig(courseId, chapterId, {
    chapterTitle: meta.chapterTitle ?? '',
    chapterIndex: meta.chapterIndex ?? 0,
  });
}

function hasPassedChapterQuiz(userId, courseId, chapterId) {
  const history = getAttemptHistory(userId, courseId, 'chapter', chapterId);
  return history.some((item) => item.status === 'submitted' && item.passed);
}

async function resolvePrerequisiteStatus(courseId, config) {
  const requiredChapterIds = getRequiredChapterIdsFromConfig(config);
  if (requiredChapterIds.length === 0) {
    return { ok: true, blockers: [] };
  }

  const userId = getUser()?.userId;
  const configsRes = await getChapterQuizConfigsByCourse(courseId);
  const configByChapterId = new Map(
    (configsRes.ok ? configsRes.configs : [])
      .filter((item) => String(item?.chapterId) !== COURSE_QUIZ_CHAPTER_ID)
      .map((item) => [String(item.chapterId), item]),
  );

  return evaluateQuizPrerequisites(requiredChapterIds, (requiredChapterId) => {
    const chapterConfig = configByChapterId.get(String(requiredChapterId)) ?? {};
    return {
      chapterTitle: chapterConfig.title ?? `Chương ${requiredChapterId}`,
      quizTitle: chapterConfig.title ?? 'Bài kiểm tra chương',
      quizEnabled: Boolean(chapterConfig.enabled),
      passed: userId ? hasPassedChapterQuiz(userId, courseId, requiredChapterId) : false,
    };
  });
}

/**
 * Tổng hợp và chuẩn hóa thông tin thô thành một đối tượng Metadata chứa các quy chế thi chuẩn để hiển thị lên UI.
 */
function buildMetaFromConfig(config, scope, extras = {}) {
  const userId = getUser()?.userId;
  const history = getAttemptHistory(
    userId,
    extras.courseId,
    scope,
    extras.chapterId,
  );
  const submittedCount = history.filter((item) => item.status === 'submitted').length;
  const maxAttempts = Number(config.maxAttempts) || 3;
  const totalQuestions =
    extras.totalQuestions ?? getChapterQuizConfigTotal(config);

  return {
    title: config.title,
    scope,
    courseId: extras.courseId,
    chapterId: extras.chapterId ?? null,
    chapterTitle: extras.chapterTitle ?? null,
    timeLimitMinutes: Number(config.timeLimitMinutes) || 15,
    passingScore: Number(config.passingScore) || 70,
    maxAttempts,
    totalQuestions,
    attemptsUsed: submittedCount,
    remainingAttempts: Math.max(0, maxAttempts - submittedCount),
    enabled: Boolean(config.enabled),
    isDemo: Boolean(extras.isDemo),
  };
}

/**
 * Tạo danh sách đáp án đúng mẫu (Demo Key) dùng để chấm điểm thử cho các bộ đề Demo.
 */
function buildDemoGradingQuestions(paper) {
  return (paper?.sections ?? []).flatMap((section) =>
    (section.questions ?? []).map((question) => ({
      tempId: question.tempId,
      score: 1,
      correctOptionTempIds: DEMO_ANSWER_KEY[question.tempId] ?? [],
      questionText: question.questionText,
      skillType: section.skillType,
    })),
  );
}

function enrichMetaWithConfig(meta = {}, config = {}, paper = null) {
  const configuredSkills = getConfiguredSkillTypes(config);
  const resolvedSkills = configuredSkills.length > 0
    ? configuredSkills
    : (meta.skills ?? []);
  const totalQuestions = paper?.totalQuestions
    ?? meta.totalQuestions
    ?? getChapterQuizConfigTotal(config);

  return {
    ...meta,
    skills: resolvedSkills,
    totalQuestions,
    title: config?.title || meta.title,
  };
}

export async function getTestMeta(courseId, scope, chapterId, meta = {}) {
  try {
    const configRes = await loadQuizConfig(courseId, scope, chapterId, meta);
    const url = `${API_BASE}/courses/${courseId}/tests/${scope}/meta`;
    const { data } = await axios.get(url, { params: { chapterId }, headers: getAuthHeaders() });

    if (!data?.ok) return data;

    return {
      ...data,
      meta: configRes.ok
        ? enrichMetaWithConfig(data.meta, configRes.config)
        : data.meta,
    };
  } catch (error) {
    console.error('getTestMeta error:', error);
    return { ok: false, message: 'Không tải được thông tin bài kiểm tra.' };
  }
}

export async function startTestAttempt(courseId, scope, chapterId, meta = {}) {
  try {
    let body = { chapterId };
    const configResult = await loadQuizConfig(courseId, scope, chapterId, meta);
    const config = configResult.ok ? configResult.config : null;

    if (scope === 'final') {
      const finalConfig = config || {};
      body.timeLimitMinutes = finalConfig.timeLimitMinutes || 45;
      body.sources = finalConfig.sources || [];
    }

    const url = `${API_BASE}/courses/${courseId}/tests/${scope}/start`;
    const { data } = await axios.post(url, body, { headers: getAuthHeaders() });

    if (!data.ok) return data;

    const paper = data.paper ? normalizeTestPaper(data.paper) : null;

    const metaRes = await getTestMeta(courseId, scope, chapterId, meta);
    const resolvedMeta = enrichMetaWithConfig(
      metaRes.ok ? metaRes.meta : data.meta,
      config,
      paper,
    );

    return {
      ok: true,
      meta: resolvedMeta,
      attempt: {
        attemptId: data.attempt.attemptId,
        expiresAt: data.attempt.expiresAt,
        timeLimitMinutes: resolvedMeta?.timeLimitMinutes || body.timeLimitMinutes,
        status: 'in_progress',
      },
      paper,
    };
  } catch (error) {
    console.error('startTestAttempt error:', error);
    return { ok: false, message: error.response?.data?.message || 'Lỗi khi tạo đề thi mới.' };
  }
}

// 3. Nộp bài (Gửi đáp án xuống Backend chấm điểm)
export async function submitTestAttempt(
  courseId,
  chapterId,
  attemptId,
  answers,
  timeSpentSeconds,
  totalQuestions,
  options = {},
) {
  try {
    const url = `${API_BASE}/courses/${courseId}/tests/attempts/${attemptId}/submit`;
    const { data } = await axios.post(
      url,
      {
        answers,
        timeSpentSeconds,
        chapterId,
        totalQuestions,
        scope: options.scope ?? 'chapter',
        paperSections: options.paperSections ?? [],
      },
      { headers: getAuthHeaders() }
    );
    return data;
  } catch (error) {
    console.error('submitTestAttempt error:', error);
    return { ok: false, message: 'Lỗi khi nộp bài.' };
  }
}

export async function fetchAttemptSectionStats(courseId, attemptId) {
  try {
    const url = `${API_BASE}/courses/${courseId}/tests/attempts/${attemptId}/section-stats`;
    const { data } = await axios.get(url, { headers: getAuthHeaders() });
    return data;
  } catch (error) {
    console.error('fetchAttemptSectionStats error:', error);
    return {
      ok: false,
      message: error.response?.data?.message ?? 'Không tải được thống kê lần làm bài.',
    };
  }
}
