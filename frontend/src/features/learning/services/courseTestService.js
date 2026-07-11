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
  buildTestPaper,
  gradeTestAnswers,
} from '@/features/learning/utils/courseTestPaperUtils';
import {
  createDemoTestMeta,
  createDemoTestPaper,
  DEMO_ANSWER_KEY,
} from '@/features/learning/data/courseTestMock';

const ATTEMPTS_STORAGE_KEY = 'student_test_attempts_v1';
const SESSIONS_STORAGE_KEY = 'student_test_sessions_v1';

/** TODO: tắt khi backend enforce giới hạn lượt làm bài */
export const BYPASS_ATTEMPT_LIMIT = true;

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

/**
 * API MOCK: Lấy thông tin chung (metadata) của bài thi phục vụ cho trang giới thiệu bài thi (TestIntroPanel).
 */
export async function getTestMeta(courseId, scope, chapterId, meta = {}) {
  await delay();

  const configRes = await loadQuizConfig(courseId, scope, chapterId, meta);
  const config = configRes.ok ? configRes.config : null;

  if (config?.enabled && hasConfiguredQuizSources(config)) {
    const paperRes = buildTestPaper(courseId, scope, chapterId, config);
    const totalQuestions = paperRes.ok ? paperRes.paper.totalQuestions : getChapterQuizConfigTotal(config);
    const prerequisiteStatus = scope === 'final'
      ? { ok: true, blockers: [] }
      : await resolvePrerequisiteStatus(courseId, config);

    return {
      ok: true,
      meta: {
        ...buildMetaFromConfig(config, scope, {
          courseId,
          chapterId,
          chapterTitle: meta.chapterTitle,
          totalQuestions,
        }),
        prerequisitesMet: prerequisiteStatus.ok,
        prerequisiteBlockers: prerequisiteStatus.blockers,
      },
    };
  }

  const demoMeta = createDemoTestMeta(scope);
  return {
    ok: true,
    meta: {
      ...demoMeta,
      courseId,
      chapterId: scope === 'final' ? null : chapterId,
      chapterTitle: meta.chapterTitle ?? null,
    },
  };
}

/**
 * API MOCK: Bắt đầu một lượt thi mới. Tạo attemptId, trộn đề thi (nếu có), thiết lập thời gian làm bài.
 */
export async function startTestAttempt(courseId, scope, chapterId, meta = {}) {
  await delay();

  const configRes = await loadQuizConfig(courseId, scope, chapterId, meta);
  const config = configRes.ok ? configRes.config : null;

  let paper;
  let isDemo = false;
  let gradingQuestions = [];

  if (config?.enabled && hasConfiguredQuizSources(config)) {
    const prerequisiteStatus = scope === 'final'
      ? { ok: true, blockers: [] }
      : await resolvePrerequisiteStatus(courseId, config);

    if (!prerequisiteStatus.ok) {
      return {
        ok: false,
        message: 'Bạn chưa đủ điều kiện làm bài kiểm tra này.',
        prerequisiteBlockers: prerequisiteStatus.blockers,
      };
    }

    const paperRes = buildTestPaper(courseId, scope, chapterId, config);
    if (!paperRes.ok) {
      paper = createDemoTestPaper();
      isDemo = true;
      gradingQuestions = buildDemoGradingQuestions(paper);
    } else {
      paper = paperRes.paper;
      gradingQuestions = paper.gradingQuestions ?? [];
      delete paper.gradingQuestions;
    }
  } else {
    paper = createDemoTestPaper();
    isDemo = true;
    gradingQuestions = buildDemoGradingQuestions(paper);
  }

  const testMeta = config
    ? buildMetaFromConfig(config, scope, {
        courseId,
        chapterId,
        chapterTitle: meta.chapterTitle,
        totalQuestions: paper.totalQuestions,
        isDemo,
      })
    : {
        ...createDemoTestMeta(scope),
        courseId,
        chapterId: scope === 'final' ? null : chapterId,
        totalQuestions: paper.totalQuestions,
      };

  if (!BYPASS_ATTEMPT_LIMIT && testMeta.remainingAttempts <= 0) {
    return {
      ok: false,
      message: 'Bạn đã hết lượt làm bài kiểm tra.',
    };
  }

  const startedAt = new Date();
  const remainingSeconds = testMeta.timeLimitMinutes * 60;
  const expiresAt = new Date(startedAt.getTime() + remainingSeconds * 1000);
  const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const attempt = {
    attemptId,
    paperId: paper.paperId,
    status: 'in_progress',
    startedAt: startedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    attemptNumber: testMeta.attemptsUsed + 1,
    remainingSeconds,
    timeLimitMinutes: testMeta.timeLimitMinutes,
  };

  saveSession(attemptId, {
    attempt,
    meta: testMeta,
    paper,
    gradingQuestions,
    answers: {},
    scope,
    courseId,
    chapterId: scope === 'final' ? COURSE_QUIZ_CHAPTER_ID : chapterId,
    isDemo,
  });

  return {
    ok: true,
    meta: testMeta,
    attempt,
    paper: {
      paperId: paper.paperId,
      totalQuestions: paper.totalQuestions,
      totalScore: paper.totalScore,
      scoringMode: paper.scoringMode,
      sections: paper.sections,
    },
  };
}

/**
 * API MOCK: Nộp bài thi. Tiến hành so khớp đáp án để tính điểm, xác định Đạt/Không đạt và lưu lịch sử.
 */
export async function submitTestAttempt(attemptId, answers = {}, options = {}) {
  await delay();

  const session = getSession(attemptId);
  if (!session) {
    return { ok: false, message: 'Không tìm thấy phiên làm bài.' };
  }

  if (session.attempt.status === 'submitted') {
    return { ok: true, result: session.result, meta: session.meta, attempt: session.attempt };
  }

  const startedAt = new Date(session.attempt.startedAt);
  const submittedAt = new Date();
  const timeSpentSeconds = Math.max(
    0,
    Math.floor((submittedAt.getTime() - startedAt.getTime()) / 1000),
  );

  const graded = gradeTestAnswers(
    session.gradingQuestions,
    answers,
    session.paper.totalScore ?? 100,
  );

  const passed = graded.percentage >= (session.meta.passingScore ?? 70);
  const remainingAttempts = Math.max(
    0,
    (session.meta.maxAttempts ?? 3) -
      (session.meta.attemptsUsed ?? 0) -
      1,
  );

  const result = {
    ...graded,
    passed,
    passingScore: session.meta.passingScore ?? 70,
    timeSpentSeconds,
    canRetry: BYPASS_ATTEMPT_LIMIT || remainingAttempts > 0,
    remainingAttempts: BYPASS_ATTEMPT_LIMIT
      ? Math.max(remainingAttempts, 1)
      : remainingAttempts,
  };

  const nextAttempt = {
    ...session.attempt,
    status: options.autoExpired ? 'expired' : 'submitted',
    submittedAt: submittedAt.toISOString(),
    remainingSeconds: 0,
  };

  saveSession(attemptId, {
    ...session,
    attempt: nextAttempt,
    answers,
    result,
  });

  const userId = getUser()?.userId;
  if (userId) {
    saveAttemptRecord(userId, session.courseId, session.scope, session.chapterId, {
      attemptId,
      status: nextAttempt.status,
      score: result.score,
      percentage: result.percentage,
      passed,
      submittedAt: nextAttempt.submittedAt,
    });
  }

  return {
    ok: true,
    meta: {
      ...session.meta,
      attemptsUsed: (session.meta.attemptsUsed ?? 0) + 1,
      remainingAttempts: result.remainingAttempts,
    },
    attempt: nextAttempt,
    result,
  };
}
