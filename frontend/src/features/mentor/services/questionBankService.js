/**
 * questionBankService.js  ─  Mock service cho Question Bank
 *
 * Mô hình: mỗi chương có đúng 1 ngân hàng câu hỏi.
 * Quiz chương lấy từ bank chương; final test random từ nhiều bank chương.
 *
 * TODO: replace mỗi hàm bằng API thật khi backend sẵn sàng.
 */

import { mentorCoursesMock } from '@/features/mentor/data/mentorCoursesMock';
import { mentorQuestionBankMock } from '@/features/mentor/data/mentorQuestionBankMock';
import { mentorQuestionBankSeed } from '@/features/mentor/data/mentorQuestionBankSeed';
import { getUser } from '@/features/auth/utils/authUtils';
import {
  TEST_SKILL_LISTENING,
  TEST_SKILL_READING,
  TEST_SKILL_WRITING,
  getQuestionBankSectionDisplayTitle,
  getSectionsBySkill,
} from '@/features/mentor/utils/mentorTestContentUtils';

const QB_STORAGE_KEY = 'mentor_question_banks_v1';
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api';
const QB_LIST_CACHE_TTL_MS = 60_000;

let banksApiCache = null;
let mentorCoursesApiCache = null;

export function invalidateQuestionBankListCache() {
  banksApiCache = null;
  mentorCoursesApiCache = null;
}

function readBanksCache() {
  if (!banksApiCache) return null;
  if (Date.now() - banksApiCache.fetchedAt > QB_LIST_CACHE_TTL_MS) {
    banksApiCache = null;
    return null;
  }
  return banksApiCache.banks;
}

function writeBanksCache(banks) {
  banksApiCache = { banks, fetchedAt: Date.now() };
}

function readMentorCoursesCache() {
  if (!mentorCoursesApiCache) return null;
  if (Date.now() - mentorCoursesApiCache.fetchedAt > QB_LIST_CACHE_TTL_MS) {
    mentorCoursesApiCache = null;
    return null;
  }
  return mentorCoursesApiCache.courses;
}

function writeMentorCoursesCache(courses) {
  mentorCoursesApiCache = { courses, fetchedAt: Date.now() };
}

async function fetchMentorCoursesCached(options = {}) {
  const { force = false } = options;
  if (!force) {
    const cached = readMentorCoursesCache();
    if (cached) {
      return { ok: true, courses: cached, total: cached.length };
    }
  }

  const res = await fetchMentorCourses();
  if (res.ok) {
    writeMentorCoursesCache(Array.isArray(res.courses) ? res.courses : []);
  }
  return res;
}

function getAuthHeaders() {
  const userId = getUser()?.userId;
  const headers = { 'Content-Type': 'application/json' };
  if (userId) {
    headers['x-user-id'] = String(userId);
  }
  return headers;
}

function mapPathsToChapters(paths = []) {
  return paths.map((path, pathIndex) => {
    const nodes = path.Nodes ?? path.nodes ?? [];
    return {
      chapterId: path.PathId ?? path.pathId,
      chapterTitle:
        (path.PathName ?? path.pathName)?.trim() || `Chương ${pathIndex + 1}`,
      order: path.Order ?? path.PathOrder ?? path.order ?? pathIndex + 1,
      lessons: nodes.map((node, nodeIndex) => ({
        lessonId: node.NodeId ?? node.nodeId,
        lessonTitle:
          (node.NodeName ?? node.nodeName)?.trim() || `Bài ${nodeIndex + 1}`,
        order: node.NodeOrder ?? node.nodeOrder ?? nodeIndex + 1,
      })),
    };
  });
}

function loadStoredBanks() {
  try {
    const raw = localStorage.getItem(QB_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredBanks(banks) {
  try {
    localStorage.setItem(QB_STORAGE_KEY, JSON.stringify(banks));
  } catch {
    // storage full or unavailable
  }
}

/** Chỉ bank gắn chương (bỏ legacy scope COURSE không có chapterId). */
function normalizeBank(bank) {
  if (bank?.chapterId == null || bank.chapterId === '') return null;
  const { scope: _scope, ...rest } = bank;
  const chapterTitle = rest.chapterTitle?.trim() ?? '';
  return {
    ...rest,
    title: chapterTitle || rest.title?.trim() || '',
  };
}

function getAllBanks() {
  const stored = loadStoredBanks();
  const storedIds = new Set(stored.map((b) => b.id));
  const seeded = mentorQuestionBankSeed
    .map(normalizeBank)
    .filter(Boolean)
    .filter((b) => !storedIds.has(b.id));
  return [...stored.map(normalizeBank).filter(Boolean), ...seeded];
}

function nextId() {
  const banks = getAllBanks();
  const maxId = banks.reduce((m, b) => (typeof b.id === 'number' && b.id > m ? b.id : m), 0);
  return maxId + 1;
}

function countSectionQuestions(sections = []) {
  return sections.reduce((sum, s) => sum + (s.Questions?.length ?? 0), 0);
}

function filterByCourse(banks, courseId) {
  return banks.filter((b) => String(b.courseId) === String(courseId));
}

function countActiveQuestionsInSection(section) {
  return (section?.Questions ?? []).filter(
    (q) => String(q?.QuestionText ?? '').trim() && q?.isActive !== false,
  ).length;
}

function getWritingSectionGroupsFromSections(sections = []) {
  const bankSections = getSectionsBySkill(sections, TEST_SKILL_WRITING);
  return bankSections.map((section) => ({
    sectionTempId: section.tempId,
    sectionTitle: getQuestionBankSectionDisplayTitle(section, sections),
    activeCount: countActiveQuestionsInSection(section),
  }));
}

function countQuestionsBySkill(sections = []) {
  return sections.reduce(
    (acc, section) => {
      const skill = section.SkillType;
      if (!skill) return acc;
      const activeCount = (section.Questions ?? []).filter(
        (q) => String(q?.QuestionText ?? '').trim() && q?.isActive !== false,
      ).length;
      acc[skill] = (acc[skill] ?? 0) + activeCount;
      return acc;
    },
    {
      [TEST_SKILL_LISTENING]: 0,
      [TEST_SKILL_READING]: 0,
      [TEST_SKILL_WRITING]: 0,
    },
  );
}

/** Thống kê câu hỏi đang bật trong bank của một chương. */
export async function getChapterQuestionBankActiveStats(courseId, chapterId) {
  const res = findQuestionBankByChapter(courseId, chapterId);
  if (!res.ok) {
    return { ok: true, hasBank: false, message: res.message };
  }

  const questionCountBySkill = countQuestionsBySkill(res.bank.sections ?? []);
  const writingSectionGroups = getWritingSectionGroupsFromSections(res.bank.sections ?? []);
  const totalActive = Object.values(questionCountBySkill).reduce((sum, count) => sum + count, 0);

  return {
    ok: true,
    hasBank: true,
    bank: res.bank,
    questionCountBySkill,
    writingSectionGroups,
    totalActive,
  };
}

/** Gom thống kê câu đang bật từ mọi ngân hàng câu hỏi theo chương của khóa học. */
export async function getCourseQuestionBankActiveStats(courseId) {
  const banks = filterByCourse(getAllBanks(), courseId);
  const outlineRes = await fetchCourseContentOutlineForQB(courseId);
  const outlineChapters = outlineRes.ok ? outlineRes.chapters : [];

  const bankByChapterId = new Map(banks.map((bank) => [String(bank.chapterId), bank]));

  const chapters = outlineChapters.map((outlineChapter) => {
    const bank = bankByChapterId.get(String(outlineChapter.chapterId));
    if (!bank) {
      return {
        chapterId: outlineChapter.chapterId,
        chapterTitle: outlineChapter.chapterTitle,
        hasBank: false,
        totalActive: 0,
        questionCountBySkill: {
          [TEST_SKILL_LISTENING]: 0,
          [TEST_SKILL_READING]: 0,
          [TEST_SKILL_WRITING]: 0,
        },
        writingSectionGroups: [],
      };
    }

    const questionCountBySkill = countQuestionsBySkill(bank.sections ?? []);
    const chapterLabel = bank.chapterTitle?.trim() || outlineChapter.chapterTitle;
    const writingSectionGroups = getWritingSectionGroupsFromSections(bank.sections ?? []).map(
      (group) => ({
        sectionTempId: `${bank.chapterId}::${group.sectionTempId}`,
        sectionTitle: `${chapterLabel} · ${group.sectionTitle}`,
        activeCount: group.activeCount,
        chapterId: bank.chapterId,
      }),
    );
    const totalActive = Object.values(questionCountBySkill).reduce((sum, count) => sum + count, 0);

    return {
      chapterId: bank.chapterId,
      chapterTitle: chapterLabel,
      hasBank: true,
      totalActive,
      questionCountBySkill,
      writingSectionGroups,
    };
  });

  banks.forEach((bank) => {
    if (chapters.some((chapter) => String(chapter.chapterId) === String(bank.chapterId))) {
      return;
    }

    const questionCountBySkill = countQuestionsBySkill(bank.sections ?? []);
    const chapterLabel = bank.chapterTitle?.trim() || `Chương ${bank.chapterId}`;
    const writingSectionGroups = getWritingSectionGroupsFromSections(bank.sections ?? []).map(
      (group) => ({
        sectionTempId: `${bank.chapterId}::${group.sectionTempId}`,
        sectionTitle: `${chapterLabel} · ${group.sectionTitle}`,
        activeCount: group.activeCount,
        chapterId: bank.chapterId,
      }),
    );
    const totalActive = Object.values(questionCountBySkill).reduce((sum, count) => sum + count, 0);

    chapters.push({
      chapterId: bank.chapterId,
      chapterTitle: chapterLabel,
      hasBank: true,
      totalActive,
      questionCountBySkill,
      writingSectionGroups,
    });
  });

  if (banks.length === 0) {
    return {
      ok: true,
      hasBank: false,
      bankCount: 0,
      chapters,
      message: 'Khóa học chưa có ngân hàng câu hỏi nào',
    };
  }

  const questionCountBySkill = {
    [TEST_SKILL_LISTENING]: 0,
    [TEST_SKILL_READING]: 0,
    [TEST_SKILL_WRITING]: 0,
  };
  const writingSectionGroups = [];

  chapters
    .filter((chapter) => chapter.hasBank)
    .forEach((chapter) => {
      Object.keys(questionCountBySkill).forEach((skill) => {
        questionCountBySkill[skill] += chapter.questionCountBySkill?.[skill] ?? 0;
      });
      writingSectionGroups.push(...(chapter.writingSectionGroups ?? []));
    });

  const totalActive = Object.values(questionCountBySkill).reduce((sum, count) => sum + count, 0);

  return {
    ok: true,
    hasBank: true,
    bankCount: banks.length,
    chapters,
    questionCountBySkill,
    writingSectionGroups,
    totalActive,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getQuestionBanks() {
  return { ok: true, banks: getAllBanks() };
}

export async function getQuestionBankById(id) {
  const bank = getAllBanks().find((b) => String(b.id) === String(id));
  if (!bank) return { ok: false, message: 'Không tìm thấy question bank' };
  return { ok: true, bank };
}

export function findQuestionBankByChapter(courseId, chapterId) {
  const bank = getAllBanks().find(
    (b) =>
      String(b.courseId) === String(courseId) && String(b.chapterId) === String(chapterId),
  );
  if (!bank) return { ok: false, message: 'Chương này chưa có ngân hàng câu hỏi' };
  return { ok: true, bank };
}

export async function getQuestionBankByChapter(courseId, chapterId) {
  return findQuestionBankByChapter(courseId, chapterId);
}

export async function getQuestionBanksByCourse(courseId) {
  return { ok: true, banks: filterByCourse(getAllBanks(), courseId) };
}

/** @deprecated — mỗi chương 1 bank, dùng getQuestionBankByChapter */
export async function getQuestionBanksByScope(courseId, _scope, chapterId = null) {
  if (chapterId != null) {
    const res = await getQuestionBankByChapter(courseId, chapterId);
    return { ok: true, banks: res.ok ? [res.bank] : [] };
  }
  return getQuestionBanksByCourse(courseId);
}

/**
 * Quiz chương: bank duy nhất của chương đó.
 */
export async function getQuestionBanksForQuiz({ courseId, chapterId = null }) {
  if (chapterId != null && chapterId !== '') {
    const res = await getQuestionBankByChapter(courseId, chapterId);
    return { ok: true, banks: res.ok ? [res.bank] : [] };
  }
  return { ok: true, banks: [] };
}

/**
 * Thống kê câu hỏi từ tất cả bank chương (cho final test random).
 */
export async function getCourseChapterBankStats(courseId) {
  const banks = filterByCourse(getAllBanks(), courseId);
  const questionCountBySkill = {
    [TEST_SKILL_LISTENING]: 0,
    [TEST_SKILL_READING]: 0,
    [TEST_SKILL_WRITING]: 0,
  };

  banks.forEach((bank) => {
    const bySkill = countQuestionsBySkill(bank.sections ?? []);
    Object.keys(questionCountBySkill).forEach((skill) => {
      questionCountBySkill[skill] += bySkill[skill] ?? 0;
    });
  });

  const totalQuestions = Object.values(questionCountBySkill).reduce((a, b) => a + b, 0);
  const chaptersWithBank = banks.length;
  const chaptersWithQuestions = banks.filter((b) => countSectionQuestions(b.sections) > 0).length;

  return {
    ok: true,
    chapterBankCount: chaptersWithBank,
    chaptersWithQuestions,
    questionCountBySkill,
    totalQuestions,
    banks,
  };
}

export async function getQuestionBankListSummaries() {
  const banks = getAllBanks();
  const byCourse = new Map();

  mentorQuestionBankMock.forEach((item) => {
    byCourse.set(item.courseId, { ...item });
  });

  banks.forEach((bank) => {
    const existing = byCourse.get(bank.courseId);
    const qCount = bank.totalQuestionCount ?? countSectionQuestions(bank.sections);
    const hasQuestions = qCount > 0;

    if (existing) {
      byCourse.set(bank.courseId, {
        ...existing,
        totalQuestionCount: (existing.totalQuestionCount ?? 0) + qCount,
        draftQuestionCount: (existing.draftQuestionCount ?? 0) + (bank.draftQuestionCount ?? qCount),
        chapterWithQuestionCount:
          (existing.chapterWithQuestionCount ?? 0) + (hasQuestions ? 1 : 0),
        questionBankUpdatedAt: bank.updatedAt ?? bank.questionBankUpdatedAt,
      });
    } else {
      byCourse.set(bank.courseId, {
        courseId: bank.courseId,
        courseName: bank.courseTitle,
        description: bank.description ?? '',
        status: bank.status === 'PUBLISHED' ? 'published' : 'draft',
        totalQuestionCount: qCount,
        publishedQuestionCount: bank.publishedQuestionCount ?? 0,
        draftQuestionCount: bank.draftQuestionCount ?? qCount,
        chapterWithQuestionCount: hasQuestions ? 1 : 0,
        quizCount: 0,
        questionBankUpdatedAt: bank.updatedAt ?? bank.questionBankUpdatedAt,
      });
    }
  });

  return { ok: true, items: Array.from(byCourse.values()) };
}

export async function createQuestionBank(payload) {
  if (payload.chapterId == null || payload.chapterId === '') {
    return { ok: false, message: 'Vui lòng chọn chương để tạo ngân hàng câu hỏi' };
  }

  const existing = await getQuestionBankByChapter(payload.courseId, payload.chapterId);
  if (existing.ok) {
    return { ok: false, message: 'Chương này đã có ngân hàng câu hỏi' };
  }

  const banks = loadStoredBanks();
  const now = new Date().toISOString();
  const questionCount = countSectionQuestions(payload.sections ?? []);

  const newBank = {
    id: nextId(),
    courseId: payload.courseId,
    courseTitle: payload.courseTitle ?? '',
    chapterId: payload.chapterId,
    chapterTitle: payload.chapterTitle ?? '',
    title: payload.title?.trim() || payload.chapterTitle?.trim() || '',
    description: payload.description ?? '',
    sections: payload.sections ?? [],
    totalQuestionCount: questionCount,
    publishedQuestionCount: 0,
    draftQuestionCount: questionCount,
    createdAt: now,
    updatedAt: now,
    questionBankUpdatedAt: now,
  };

  banks.unshift(newBank);
  saveStoredBanks(banks);
  return { ok: true, bank: newBank };
}

export async function updateQuestionBank(id, patch) {
  const banks = loadStoredBanks();
  const idx = banks.findIndex((b) => b.id === id);
  if (idx === -1) {
    const seedIdx = mentorQuestionBankSeed.findIndex((b) => b.id === id);
    if (seedIdx === -1) return { ok: false, message: 'Không tìm thấy question bank' };
    const updated = {
      ...normalizeBank(mentorQuestionBankSeed[seedIdx]),
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    updated.totalQuestionCount = countSectionQuestions(updated.sections ?? []);
    updated.draftQuestionCount = updated.totalQuestionCount;
    banks.unshift(updated);
    saveStoredBanks(banks);
    return { ok: true, bank: updated };
  }

  const now = new Date().toISOString();
  const questionCount = countSectionQuestions(patch.sections ?? banks[idx].sections ?? []);
  banks[idx] = {
    ...banks[idx],
    ...patch,
    updatedAt: now,
    questionBankUpdatedAt: now,
    totalQuestionCount: questionCount,
    draftQuestionCount: questionCount,
  };
  saveStoredBanks(banks);
  return { ok: true, bank: banks[idx] };
}

export async function fetchCoursesForQB() {
  return { ok: true, courses: mentorCoursesMock };
}

export async function fetchCourseForQB(courseId) {
  const course = mentorCoursesMock.find((c) => String(c.courseId) === String(courseId));
  if (!course) return { ok: false, message: 'Không tìm thấy khóa học' };
  return { ok: true, course };
}

export async function fetchCourseContentOutlineForQB(courseId) {
  try {
    const response = await fetch(
      `${API_BASE}/courses/my-courses/${courseId}/chapters`,
      { headers: getAuthHeaders() },
    );
    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        ok: false,
        message: data.message ?? 'Không thể tải danh sách chương.',
        chapters: [],
      };
    }

    const paths = data.data?.Paths ?? data.data?.paths ?? [];
    return { ok: true, chapters: mapPathsToChapters(paths) };
  } catch (error) {
    console.error('[fetchCourseContentOutlineForQB]', error);
    return {
      ok: false,
      message: 'Lỗi kết nối khi tải danh sách chương.',
      chapters: [],
    };
  }
}

export async function fetchChaptersForCourse(courseId) {
  const res = await fetchCourseContentOutlineForQB(courseId);
  if (!res.ok) return res;
  const chapters = res.chapters.map((ch) => ({
    id: ch.chapterId,
    chapterId: ch.chapterId,
    courseId: Number(courseId),
    title: ch.chapterTitle,
    chapterTitle: ch.chapterTitle,
    order: ch.order,
  }));
  return { ok: true, chapters };
}

/** @deprecated alias */
export const getCourseChapters = fetchChaptersForCourse;

/** Chương chưa có bank trong một khóa học. */
export async function fetchChaptersWithoutQuestionBank(courseId) {
  const outline = await fetchCourseContentOutlineForQB(courseId);
  if (!outline.ok) return outline;

  const banks = filterByCourse(getAllBanks(), courseId);
  const bankChapterIds = new Set(banks.map((b) => String(b.chapterId)));

  return {
    ok: true,
    chapters: outline.chapters.filter((ch) => !bankChapterIds.has(String(ch.chapterId))),
  };
}

/** Khóa học còn ít nhất một chương chưa có bank. */
export async function fetchCoursesWithChaptersMissingBank() {
  const courses = [];
  for (const course of mentorCoursesMock) {
    const res = await fetchChaptersWithoutQuestionBank(course.courseId);
    if (res.ok && res.chapters.length > 0) {
      courses.push({
        ...course,
        chaptersWithoutBank: res.chapters.length,
      });
    }
  }
  return { ok: true, courses };
}

/** @deprecated — dùng fetchCoursesWithChaptersMissingBank */
export async function fetchCoursesWithoutQuestionBank() {
  return fetchCoursesWithChaptersMissingBank();
}
