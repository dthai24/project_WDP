/**
 * Question bank service — API client.
 */

import axios from 'axios';
import {
  buildTestSectionPayload,
  normalizeQuestionBankSectionForSave,
  TEST_SKILL_READING,
} from '@/features/mentor/utils/mentorTestContentUtils';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api';

const TODO = 'Question bank API chưa được implement.';

export async function fetchChapterSections(courseId, pathId) {
  try {
    const { data: payload } = await axios.get(
      `${API_BASE}/question-bank/courses/${encodeURIComponent(courseId)}/paths/${encodeURIComponent(pathId)}/sections`,
    );

    if (payload.success === false) {
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
    return {
      ok: false,
      message: error.response?.data?.message ?? 'Lỗi kết nối khi tải section.',
      sections: [],
    };
  }
}

export async function fetchSectionQuestions(sectionId, { courseId, pathId } = {}) {
  try {
    const params = {};
    if (courseId) params.courseId = String(courseId);
    if (pathId) params.pathId = String(pathId);

    const { data: payload } = await axios.get(
      `${API_BASE}/question-bank/sections/${encodeURIComponent(sectionId)}/questions`,
      { params },
    );

    if (payload.success === false) {
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
    return {
      ok: false,
      message: error.response?.data?.message ?? 'Lỗi kết nối khi tải câu hỏi.',
      questions: [],
    };
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

export async function saveQuestionBankSection({
  courseId,
  pathId,
  questionPathId,
  section,
  sectionOrder,
}) {
  try {
    const normalized = normalizeQuestionBankSectionForSave(section);
    let sectionPayload = buildTestSectionPayload(normalized, sectionOrder);

    if (normalized.SkillType === TEST_SKILL_READING) {
      sectionPayload = {
        ...sectionPayload,
        ReadingSourceType: normalized.ReadingSourceType ?? null,
        MaterialUrl: String(normalized.MaterialUrl ?? '').trim() || null,
        FileName: normalized.FileName ?? null,
        FileSize: normalized.FileSize ?? null,
      };
    }

    const payload = {
      courseId: Number(courseId),
      pathId: Number(pathId),
      questionPathId: questionPathId ?? null,
      sectionOrder: Number(sectionOrder) || 1,
      section: {
        ...sectionPayload,
        SectionId: normalized.SectionId ?? null,
      },
    };

    const sectionId = section.SectionId;
    const url = sectionId
      ? `${API_BASE}/question-bank/sections/${encodeURIComponent(sectionId)}`
      : `${API_BASE}/question-bank/courses/${encodeURIComponent(courseId)}/paths/${encodeURIComponent(pathId)}/sections`;

    const { data } = sectionId
      ? await axios.put(url, payload)
      : await axios.post(url, payload);

    if (data?.success === false) {
      return {
        ok: false,
        message: data.message ?? 'Không thể cập nhật section.',
      };
    }

    return {
      ok: true,
      sectionId: data?.data?.sectionId ?? sectionId ?? null,
      message: data?.message ?? 'Đã cập nhật section.',
    };
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 501) {
      return {
        ok: true,
        localOnly: true,
        sectionId: section.SectionId ?? null,
        message: 'Đã lưu thay đổi section (chờ API backend).',
      };
    }

    console.error('saveQuestionBankSection error:', error);
    return {
      ok: false,
      message: error.response?.data?.message ?? 'Không thể cập nhật section.',
    };
  }
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
