import {
  TEST_SKILL_LISTENING,
  TEST_SKILL_QB_LABELS,
  TEST_SKILL_READING,
  TEST_SKILL_VOCABULARY,
  QUESTION_BANK_SKILLS,
  normalizeQuestionBankSkillType,
} from '@/features/mentor/utils/mentorTestContentUtils';

/** Quiz / làm bài kiểm tra: Nghe, Đọc, Từ vựng / Ngữ pháp. */
export const CHAPTER_QUIZ_SKILLS = QUESTION_BANK_SKILLS;

/** chapterId đặc biệt lưu cấu hình quiz toàn khóa trong cùng storage chapter quiz. */
export const COURSE_QUIZ_CHAPTER_ID = '__course__';

export const QUIZ_SETUP_SCOPE_CHAPTER = 'chapter';
export const QUIZ_SETUP_SCOPE_COURSE = 'course';

export function isCourseQuizChapterId(chapterId) {
  return String(chapterId) === COURSE_QUIZ_CHAPTER_ID;
}

function createPartConfig(part, questionCount = 0) {
  return { part, questionCount: Math.max(0, Number(questionCount) || 0) };
}

export function buildSectionGroupsFromChapterSections(sections = [], skillType) {
  const target = normalizeQuestionBankSkillType(skillType);
  return (sections ?? [])
    .filter((section) => normalizeQuestionBankSkillType(section.skillType) === target)
    .map((section) => ({
      sectionTempId: `section_${section.sectionId}`,
      sectionTitle: section.displayName || section.sectionName || 'Section',
      availableCount: Math.max(0, Number(section.questionCount) || 0),
      isUseForTest: section.isUseForTest !== false,
    }));
}

export function getSkillSectionGroupsFromStats(stats = null, skillType) {
  if (!stats) return [];
  if (skillType === TEST_SKILL_LISTENING) return stats.listeningSectionGroups ?? [];
  if (skillType === TEST_SKILL_READING) return stats.readingSectionGroups ?? [];
  if (skillType === TEST_SKILL_VOCABULARY) return stats.vocabularySectionGroups ?? [];
  return [];
}

export function buildCourseSectionTempId(pathId, sectionTempId) {
  const base = String(sectionTempId ?? '');
  if (!base) return '';
  if (base.includes('::')) return base;
  return `${pathId}::${base}`;
}

export function aggregateSkillSectionGroupsFromChapters(
  chapters = [],
  selectedChapterIds = [],
  skillType,
) {
  const selected = new Set(selectedChapterIds.map(String));
  const groups = [];

  chapters
    .filter((chapter) => chapter.hasBank && selected.has(String(chapter.PathId)))
    .forEach((chapter) => {
      getSkillSectionGroupsFromStats(chapter, skillType).forEach((group) => {
        groups.push({
          sectionTempId: buildCourseSectionTempId(chapter.PathId, group.sectionTempId),
          sectionTitle: `${chapter.PathName} · ${group.sectionTitle}`,
          availableCount: Math.max(0, Number(group.availableCount ?? 0)),
          isUseForTest: group.isUseForTest !== false,
        });
      });
    });

  return groups;
}

export function isFirstChapterQuiz(chapterIndex = 0) {
  return Math.max(0, Number(chapterIndex) || 0) === 0;
}

export function getRequiredChapterIdsFromConfig(config = {}) {
  return (config.requiredChapterIds ?? []).map(String);
}

export function sanitizeChapterPrerequisites(config = {}, chapterIndex = 0) {
  if (isFirstChapterQuiz(chapterIndex)) {
    return { ...config, requiredChapterIds: [] };
  }
  return {
    ...config,
    requiredChapterIds: getRequiredChapterIdsFromConfig(config),
  };
}

export function patchRequiredChapterSelection(config = {}, chapterId, selected) {
  const id = String(chapterId);
  const current = new Set(getRequiredChapterIdsFromConfig(config));

  if (selected) {
    current.add(id);
  } else {
    current.delete(id);
  }

  return {
    ...config,
    requiredChapterIds: [...current],
  };
}

export function buildPreviousChapterQuizOptions(paths = [], currentChapterIndex = 0, storedConfigs = []) {
  if (isFirstChapterQuiz(currentChapterIndex)) return [];

  const configByChapterId = new Map(
    (storedConfigs ?? [])
      .filter((item) => !isCourseQuizChapterId(item?.chapterId))
      .map((item) => [String(item.chapterId), item]),
  );

  return paths
    .slice(0, Math.max(0, currentChapterIndex))
    .map((path, index) => {
      const chapterId = String(path.pathId ?? path.PathId ?? '');
      const chapterTitle = path.PathName ?? path.pathName ?? `Chương ${index + 1}`;
      const stored = configByChapterId.get(chapterId);

      return {
        chapterId,
        chapterIndex: index,
        chapterTitle,
        quizTitle: stored?.title?.trim() || `Quiz ${chapterTitle}`,
        quizEnabled: Boolean(stored?.enabled),
      };
    })
    .filter((item) => item.chapterId);
}

export function normalizeQuizQuestionConfigs(config = {}) {
  const questionConfigs = CHAPTER_QUIZ_SKILLS.map((part) => {
    const existing = (config.questionConfigs ?? []).find((entry) => entry.part === part);
    return createPartConfig(part, existing?.questionCount ?? 0);
  });

  return { ...config, questionConfigs };
}

export function getDefaultChapterQuizConfig({ courseId, chapterId, chapterTitle, chapterIndex = 0 }) {
  const fallbackTitle = chapterTitle?.trim() || `Chương ${chapterIndex + 1}`;
  return {
    id: null,
    courseId,
    chapterId,
    title: `Quiz ${fallbackTitle}`,
    enabled: false,
    timeLimitMinutes: 15,
    passingScore: 70,
    maxAttempts: 3,
    requiredChapterIds: [],
    questionConfigs: CHAPTER_QUIZ_SKILLS.map((part) => createPartConfig(part)),
    updatedAt: null,
  };
}

export function getDefaultCourseQuizConfig({ courseId, courseTitle = '' }) {
  const fallbackTitle = courseTitle?.trim() || 'toàn khóa';
  return {
    ...getDefaultChapterQuizConfig({
      courseId,
      chapterId: COURSE_QUIZ_CHAPTER_ID,
      chapterTitle: fallbackTitle,
    }),
    title: `Quiz ${fallbackTitle}`,
    timeLimitMinutes: 45,
    selectedChapterIds: [],
  };
}

export function getSelectedChapterIdsFromConfig(config = {}) {
  return (config.selectedChapterIds ?? []).map(String);
}

/** Khởi tạo / làm sạch danh sách chương được chọn khi mở dialog toàn khóa. */
export function initCourseQuizChapterSelection(config = {}, chapterOptions = []) {
  const validIds = new Set(chapterOptions.map((chapter) => String(chapter.PathId)));
  const withBank = chapterOptions.filter((chapter) => chapter.hasBank);
  const existing = getSelectedChapterIdsFromConfig(config).filter((id) => validIds.has(id));

  if (existing.length === 0 && withBank.length > 0) {
    return {
      ...config,
      selectedChapterIds: withBank.map((chapter) => String(chapter.PathId)),
    };
  }

  return {
    ...config,
    selectedChapterIds: existing,
  };
}

export function patchCourseChapterSelection(config = {}, chapterId, selected) {
  const id = String(chapterId);
  const current = new Set(getSelectedChapterIdsFromConfig(config));

  if (selected) {
    current.add(id);
  } else {
    current.delete(id);
  }

  return {
    ...config,
    selectedChapterIds: [...current],
  };
}

export function aggregateCourseStatsByChapterIds(chapters = [], selectedChapterIds = []) {
  const selected = new Set(selectedChapterIds.map(String));
  const selectedChapters = chapters.filter(
    (chapter) => chapter.hasBank && selected.has(String(chapter.PathId)),
  );

  const questionCountBySkill = {
    [TEST_SKILL_LISTENING]: 0,
    [TEST_SKILL_READING]: 0,
    [TEST_SKILL_VOCABULARY]: 0,
  };

  selectedChapters.forEach((chapter) => {
    questionCountBySkill[TEST_SKILL_LISTENING] +=
      chapter.questionCountBySkill?.[TEST_SKILL_LISTENING] ?? 0;
    questionCountBySkill[TEST_SKILL_READING] +=
      chapter.questionCountBySkill?.[TEST_SKILL_READING] ?? 0;
    questionCountBySkill[TEST_SKILL_VOCABULARY] +=
      chapter.questionCountBySkill?.[TEST_SKILL_VOCABULARY]
      ?? chapter.questionCountBySkill?.WRITING
      ?? 0;
  });

  const totalActive = Object.values(questionCountBySkill).reduce((sum, count) => sum + count, 0);

  return {
    ok: true,
    hasBank: selectedChapters.length > 0,
    bankCount: selectedChapters.length,
    questionCountBySkill,
    listeningSectionGroups: aggregateSkillSectionGroupsFromChapters(
      chapters,
      selectedChapterIds,
      TEST_SKILL_LISTENING,
    ),
    readingSectionGroups: aggregateSkillSectionGroupsFromChapters(
      chapters,
      selectedChapterIds,
      TEST_SKILL_READING,
    ),
    vocabularySectionGroups: aggregateSkillSectionGroupsFromChapters(
      chapters,
      selectedChapterIds,
      TEST_SKILL_VOCABULARY,
    ),
    totalActive,
    selectedChapterCount: selectedChapters.length,
  };
}

export function getQuestionCountForPart(config = {}, part) {
  const item = (config.questionConfigs ?? []).find((entry) => entry.part === part);
  return Math.max(0, Number(item?.questionCount ?? 0));
}

export function getChapterQuizConfigTotal(config = {}) {
  return CHAPTER_QUIZ_SKILLS.reduce(
    (sum, part) => sum + getQuestionCountForPart(config, part),
    0,
  );
}

/** Chuẩn hoá config quiz — Nghe / Đọc / Từ vựng–Ngữ pháp. */
export function syncChapterQuizConfigWithStats(config = {}, stats = null) {
  if (!config) return config;
  if (!stats?.hasBank) return normalizeQuizQuestionConfigs(config);
  return normalizeQuizQuestionConfigs(config);
}

export function patchQuestionConfig(config, part, questionCount) {
  const nextCount = Math.max(0, Number.parseInt(String(questionCount), 10) || 0);
  const questionConfigs = CHAPTER_QUIZ_SKILLS.map((skill) => {
    const existing = (config.questionConfigs ?? []).find((entry) => entry.part === skill);
    if (skill === part) {
      return createPartConfig(skill, nextCount);
    }
    return createPartConfig(skill, Math.max(0, Number(existing?.questionCount ?? 0)));
  });

  return { ...config, questionConfigs };
}

export function validateChapterQuizConfig(config = {}, stats = null) {
  const errors = {};

  if (!stats?.hasBank) {
    errors._bank = isCourseQuizChapterId(config.chapterId)
      ? 'Không thể lưu thiết lập vì khóa học chưa có ngân hàng câu hỏi nào.'
      : 'Không thể lưu thiết lập vì chương chưa có ngân hàng câu hỏi.';
    return errors;
  }

  const title = String(config.title ?? '').trim();
  if (!title) {
    errors.title = 'Vui lòng nhập tên bài kiểm tra';
  }

  const timeLimit = Number(config.timeLimitMinutes ?? 0);
  if (!Number.isFinite(timeLimit) || timeLimit <= 0) {
    errors.timeLimitMinutes = 'Thời gian làm bài phải lớn hơn 0';
  }

  const passingScore = Number(config.passingScore ?? 0);
  if (!Number.isFinite(passingScore) || passingScore < 0 || passingScore > 100) {
    errors.passingScore = 'Điểm đạt phải từ 0 đến 100';
  }

  const maxAttempts = Number(config.maxAttempts ?? 0);
  if (!Number.isFinite(maxAttempts) || maxAttempts < 1) {
    errors.maxAttempts = 'Số lần làm lại phải ít nhất 1';
  }

  if (!config.enabled) {
    return errors;
  }

  if (isCourseQuizChapterId(config.chapterId)) {
    const selectedChapterIds = getSelectedChapterIdsFromConfig(config);
    if (selectedChapterIds.length === 0) {
      errors._chapters = 'Vui lòng chọn ít nhất một chương khi bật kiểm tra toàn khóa.';
      return errors;
    }
  }

  const total = getChapterQuizConfigTotal(config);
  if (total <= 0) {
    errors._total = 'Vui lòng cấu hình ít nhất 1 câu hỏi khi bật kiểm tra';
  }

  CHAPTER_QUIZ_SKILLS.forEach((part) => {
    const count = getQuestionCountForPart(config, part);
    const available =
      stats?.questionCountBySkill?.[part]
      ?? (part === TEST_SKILL_VOCABULARY ? stats?.questionCountBySkill?.WRITING : undefined)
      ?? 0;
    const label = TEST_SKILL_QB_LABELS[part];

    if (!Number.isFinite(count) || count < 0) {
      errors[part] = `Số câu ${label} không hợp lệ`;
      return;
    }

    if (count > available) {
      errors[part] =
        `Phần ${label} hiện chỉ có ${available} câu đang bật, không đủ để lấy ${count} câu.`;
    }
  });

  return errors;
}

export function hasChapterQuizConfigErrors(errors = {}) {
  return Object.keys(errors).length > 0;
}

export function evaluateQuizPrerequisites(requiredChapterIds = [], resolveChapterQuizMeta) {
  const required = (requiredChapterIds ?? []).map(String).filter(Boolean);
  if (required.length === 0) {
    return { ok: true, blockers: [] };
  }

  const blockers = required
    .map((chapterId) => {
      const meta = resolveChapterQuizMeta?.(chapterId) ?? {};
      const passed = Boolean(meta.passed);
      if (passed) return null;
      return {
        chapterId,
        chapterTitle: meta.chapterTitle ?? `Chương ${chapterId}`,
        quizTitle: meta.quizTitle ?? 'Bài kiểm tra chương',
        quizEnabled: meta.quizEnabled !== false,
      };
    })
    .filter(Boolean);

  return {
    ok: blockers.length === 0,
    blockers,
  };
}
