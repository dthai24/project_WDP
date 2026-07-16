/**
 * Question bank service — UI-only stub (không gọi API, không mock data).
 */

const EMPTY_CHAPTER_STATS = {
  ok: true,
  hasBank: false,
  questionCountBySkill: { LISTENING: 0, READING: 0, VOCABULARY: 0 },
  listeningSectionGroups: [],
  readingSectionGroups: [],
  vocabularySectionGroups: [],
  totalActive: 0,
  questionPathId: null,
};

const EMPTY_COURSE_STATS = {
  ok: true,
  hasBank: false,
  bankCount: 0,
  chapters: [],
  questionCountBySkill: { LISTENING: 0, READING: 0, VOCABULARY: 0 },
  totalActive: 0,
};

export function invalidateQuestionBankListCache() {}

export async function fetchChapterSections() {
  return { ok: true, questionPathId: null, sections: [] };
}

export async function fetchSectionQuestions() {
  return { ok: true, questions: [] };
}

export async function getChapterQuestionBankActiveStats() {
  return EMPTY_CHAPTER_STATS;
}

export async function getCourseQuestionBankActiveStats() {
  return EMPTY_COURSE_STATS;
}

export async function saveQuestionBankSection() {
  return { ok: true, message: 'UI-only: chưa lưu lên server.' };
}

export async function ensureQuestionPath() {
  return { ok: true, questionPathId: null };
}

export async function patchQuestionUseForTest() {
  return { ok: true };
}

export async function patchSectionSourceUrl() {
  return { ok: true };
}
