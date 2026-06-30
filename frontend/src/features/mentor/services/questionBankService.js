/**
 * Question bank service — stub. Logic xử lý đã gỡ; implement lại khi cần.
 */

const TODO = 'Question bank API chưa được implement.';

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
