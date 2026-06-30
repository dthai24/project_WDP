/**
 * Question bank service — API client.
 */

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api';

const TODO = 'Question bank API chưa được implement.';

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function fetchChapterSections(courseId, pathId) {
  try {
    const response = await fetch(
      `${API_BASE}/question-bank/courses/${encodeURIComponent(courseId)}/paths/${encodeURIComponent(pathId)}/sections`,
    );
    const payload = await parseJsonResponse(response);

    if (!response.ok || payload.success === false) {
      return {
        ok: false,
        message: payload.message ?? 'Không tải được danh sách section.',
        sections: [],
      };
    }

    return {
      ok: true,
      questionPathId: payload.data?.questionPathId ?? null,
      sections: payload.data?.sections ?? [],
    };
  } catch (error) {
    console.error('fetchChapterSections error:', error);
    return { ok: false, message: 'Lỗi kết nối khi tải section.', sections: [] };
  }
}

export async function fetchSectionQuestions(sectionId, { courseId, pathId } = {}) {
  try {
    const params = new URLSearchParams();
    if (courseId) params.set('courseId', String(courseId));
    if (pathId) params.set('pathId', String(pathId));
    const query = params.toString();

    const response = await fetch(
      `${API_BASE}/question-bank/sections/${encodeURIComponent(sectionId)}/questions${query ? `?${query}` : ''}`,
    );
    const payload = await parseJsonResponse(response);

    if (!response.ok || payload.success === false) {
      return {
        ok: false,
        message: payload.message ?? 'Không tải được câu hỏi.',
        questions: [],
      };
    }

    return {
      ok: true,
      questions: payload.data?.questions ?? [],
    };
  } catch (error) {
    console.error('fetchSectionQuestions error:', error);
    return { ok: false, message: 'Lỗi kết nối khi tải câu hỏi.', questions: [] };
  }
}

const emptyStats = {
  ok: true,
  hasBank: false,
  message: TODO,
  questionCountBySkill: {
    LISTENING: 0,
    READING: 0,
    WRITING: 0,
  },
  writingSectionGroups: [],
  totalActive: 0,
};

export function invalidateQuestionBankListCache() {}

export async function getChapterQuestionBankActiveStats() {
  return { ...emptyStats };
}

export async function getCourseQuestionBankActiveStats() {
  return {
    ok: true,
    chapters: [],
    questionCountBySkill: emptyStats.questionCountBySkill,
    totalActive: 0,
  };
}

export async function getQuestionBanks() {
  return { ok: true, banks: [] };
}

export async function fetchPathQuestionBank() {
  return { ok: false, message: TODO };
}

export async function fetchBankPathList() {
  return { ok: false, message: TODO, bank: null, paths: [] };
}

export async function fetchQuestionBankById() {
  return { ok: false, message: TODO };
}

export async function getQuestionBankById() {
  return { ok: false, message: TODO };
}

export async function setChapterQuestionPublic() {
  return { ok: false, message: TODO };
}

export async function deleteChapterQuestion() {
  return { ok: false, message: TODO };
}

export async function setAllChapterQuestionsPublic() {
  return { ok: false, message: TODO };
}

export async function findQuestionBankByChapter() {
  return { ok: false, message: TODO };
}

export async function getQuestionBankByChapter() {
  return { ok: false, message: TODO };
}

export async function getQuestionBanksByCourse() {
  return { ok: true, banks: [] };
}

export async function getQuestionBanksByScope(_courseId, _scope, _chapterId = null) {
  return { ok: true, banks: [] };
}

export async function getQuestionBanksForQuiz() {
  return { ok: true, banks: [] };
}

export async function getCourseChapterBankStats() {
  return {
    ok: true,
    chapterBankCount: 0,
    chaptersWithQuestions: 0,
    questionCountBySkill: emptyStats.questionCountBySkill,
    totalQuestions: 0,
    banks: [],
  };
}

export async function getQuestionBankListSummaries() {
  return { ok: true, items: [] };
}

export async function createQuestionBank() {
  return { ok: false, message: TODO };
}

export async function updatePathQuestions() {
  return { ok: false, message: TODO };
}

export async function updateQuestionBank() {
  return { ok: false, message: TODO };
}

export async function fetchCoursesForQB() {
  return { ok: true, courses: [] };
}

export async function fetchCourseForQB() {
  return { ok: false, message: TODO };
}

export async function fetchCourseContentOutlineForQB() {
  return { ok: true, chapters: [] };
}

export async function fetchChaptersForCourse() {
  return { ok: true, chapters: [] };
}

export const getCourseChapters = fetchChaptersForCourse;

export async function fetchChaptersWithoutQuestionBank() {
  return { ok: true, chapters: [] };
}

export async function fetchCoursesWithChaptersMissingBank() {
  return { ok: true, courses: [] };
}

export async function fetchCoursesWithoutQuestionBank() {
  return fetchCoursesWithChaptersMissingBank();
}
