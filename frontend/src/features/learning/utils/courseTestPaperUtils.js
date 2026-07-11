import {
  TEST_SKILL_LISTENING,
  TEST_SKILL_READING,
  TEST_SKILL_QB_LABELS,
  getActiveFilledTestQuestions,
  getSectionsBySkill,
  DEFAULT_TEST_TOTAL_SCORE,
} from '@/features/mentor/utils/mentorTestContentUtils';
import {
  CHAPTER_QUIZ_SKILLS,
  getSectionCountForPart,
  getSectionQuestionCountsForPart,
  isSkillSectionRandomPick,
  isCourseQuizChapterId,
  buildCourseSectionTempId,
} from '@/features/mentor/utils/mentorChapterQuizConfigUtils';
import { findQuestionBankByChapter } from '@/features/mentor/services/questionBankService';

function shuffleArray(items = []) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function pickRandom(items = [], count = 0) {
  const pool = shuffleArray(items);
  return pool.slice(0, Math.max(0, Math.min(count, pool.length)));
}

function setsEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
}

function resolveSectionAudio(section) {
  const url = String(section?.AudioUrl ?? '').trim();
  return url || null;
}

function toStudentQuestion(question, order, shuffleAnswers, sourceSection = null) {
  let options = (question.Options ?? []).map((option) => ({
    tempId: option.tempId,
    optionText: option.OptionText,
  }));
  if (shuffleAnswers) {
    options = shuffleArray(options);
  }

  return {
    tempId: question.tempId,
    questionType: 'MULTIPLE_CHOICE',
    skillType: question.SkillType ?? sourceSection?.SkillType ?? null,
    questionText: question.QuestionText,
    score: Number(question.Score) || 1,
    order,
    options,
    audioUrl: null,
  };
}

function toGradingQuestion(question, sourceSection = null) {
  const correctOptionTempIds = (question.Options ?? [])
    .filter((option) => option.IsCorrect)
    .map((option) => option.tempId);

  return {
    tempId: question.tempId,
    score: Number(question.Score) || 1,
    correctOptionTempIds,
    questionText: question.QuestionText,
    skillType: sourceSection?.SkillType ?? null,
    sectionDisplayName: sourceSection?.DisplayName ?? null,
    audioUrl: resolveSectionAudio(sourceSection),
  };
}

function isSectionUseForTest(section) {
  return section?.isUseForTest !== false;
}

function resolveSectionConfigKey(section, pathId = null) {
  const base = section?.tempId ?? (section?.SectionId ? `section_${section.SectionId}` : '');
  if (!base) return '';
  return pathId != null ? buildCourseSectionTempId(pathId, base) : base;
}

function flattenBankSections(bankList = []) {
  return bankList.flatMap((bank) => {
    const pathId = bank.pathId ?? bank.PathId ?? null;
    return (bank.sections ?? []).map((section) => ({ section, pathId }));
  });
}

function pickQuestionsForSkill(config, bankList, skill) {
  const entries = flattenBankSections(bankList);
  const isCourseScope = isCourseQuizChapterId(config?.chapterId);

  if (isSkillSectionRandomPick(skill)) {
    const inTestEntries = entries.filter(({ section }) =>
      getSectionsBySkill([section], skill).length > 0 && isSectionUseForTest(section));
    const pickedEntries = pickRandom(inTestEntries, getSectionCountForPart(config, skill));
    return pickedEntries.flatMap(({ section }) =>
      getActiveFilledTestQuestions(section.Questions ?? []).map((question) => ({
        question,
        section,
      })),
    );
  }

  const countBySection = new Map(
    getSectionQuestionCountsForPart(config, skill).map((entry) => [
      String(entry.sectionTempId),
      entry.questionCount,
    ]),
  );

  return entries.flatMap(({ section, pathId }) => {
    if (!getSectionsBySkill([section], skill).length || !isSectionUseForTest(section)) {
      return [];
    }

    const configKey = isCourseScope
      ? resolveSectionConfigKey(section, pathId)
      : resolveSectionConfigKey(section);
    const fallbackKey = resolveSectionConfigKey(section);
    const configuredCount = countBySection.get(configKey)
      ?? countBySection.get(fallbackKey)
      ?? 0;

    if (configuredCount <= 0) return [];

    const pool = getActiveFilledTestQuestions(section.Questions ?? []).map((question) => ({
      question,
      section,
    }));
    return pickRandom(pool, configuredCount);
  });
}

function buildSkillSection(skillType, questionsWithSource, shuffleAnswers, startOrder) {
  if (!questionsWithSource.length) return null;

  const groupsMap = new Map();
  questionsWithSource.forEach(({ question, section }) => {
    const groupId = section?.tempId ?? section?.DisplayName ?? `group_${groupsMap.size + 1}`;
    if (!groupsMap.has(groupId)) {
      groupsMap.set(groupId, {
        groupId,
        displayName:
          String(section?.DisplayName ?? '').trim() ||
          `Nhóm ${groupsMap.size + 1}`,
        audioUrl: skillType === TEST_SKILL_LISTENING ? resolveSectionAudio(section) : null,
        items: [],
      });
    }
    groupsMap.get(groupId).items.push({ question, section });
  });

  let order = startOrder;
  const questionGroups = [...groupsMap.values()].map((group, index) => {
    const questions = group.items.map(({ question, section }) => {
      const studentQ = toStudentQuestion(question, order, shuffleAnswers, section);
      studentQ.audioUrl =
        skillType === TEST_SKILL_LISTENING ? resolveSectionAudio(section) : null;
      order += 1;
      return studentQ;
    });

    return {
      groupId: group.groupId,
      displayName: group.displayName || `Nhóm ${index + 1}`,
      audioUrl: group.audioUrl,
      questions,
    };
  });

  const studentQuestions = questionGroups.flatMap((group) => group.questions);
  const firstAudio =
    skillType === TEST_SKILL_LISTENING
      ? questionGroups.map((group) => group.audioUrl).find(Boolean) ?? null
      : null;

  return {
    skillType,
    displayName: `Phần ${TEST_SKILL_QB_LABELS[skillType]}`,
    description: `Hoàn thành ${studentQuestions.length} câu hỏi phần ${TEST_SKILL_QB_LABELS[skillType].toLowerCase()}.`,
    audioUrl: firstAudio,
    questionGroups,
    questions: studentQuestions,
  };
}

function buildPaperFromBanks(config, bankList, options = {}) {
  const shuffleAnswers = false;

  const pickedBySkill = Object.fromEntries(
    CHAPTER_QUIZ_SKILLS.map((skill) => [
      skill,
      pickQuestionsForSkill(config, bankList, skill),
    ]),
  );

  let order = 1;
  const paperSections = [];
  const gradingQuestions = [];

  CHAPTER_QUIZ_SKILLS.forEach((skill) => {
    const section = buildSkillSection(skill, pickedBySkill[skill], shuffleAnswers, order);
    if (!section) return;
    paperSections.push(section);
    order += section.questions.length;

    pickedBySkill[skill].forEach(({ question, section: sourceSection }) => {
      gradingQuestions.push(toGradingQuestion(question, sourceSection));
    });
  });

  const totalQuestions = paperSections.reduce(
    (sum, section) => sum + section.questions.length,
    0,
  );

  return {
    paperId: `paper_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    totalQuestions,
    totalScore: DEFAULT_TEST_TOTAL_SCORE,
    scoringMode: 'AUTO',
    sections: paperSections,
    gradingQuestions,
    isDemo: Boolean(options.isDemo),
  };
}

export function buildChapterTestPaper(courseId, chapterId, config) {
  const bankRes = findQuestionBankByChapter(courseId, chapterId);
  if (!bankRes.ok || !bankRes.bank) {
    return { ok: false, message: 'Chương chưa có ngân hàng câu hỏi.' };
  }

  const paper = buildPaperFromBanks(config, [bankRes.bank]);
  if (paper.totalQuestions <= 0) {
    return { ok: false, message: 'Không đủ câu hỏi để tạo đề kiểm tra.' };
  }

  return { ok: true, paper };
}

export function buildCourseTestPaper(courseId, config) {
  const selectedIds = (config.selectedChapterIds ?? []).map(String);
  const banks = selectedIds
    .map((chapterId) => findQuestionBankByChapter(courseId, chapterId))
    .filter((res) => res.ok && res.bank)
    .map((res) => res.bank);

  if (!banks.length) {
    return { ok: false, message: 'Khóa học chưa có ngân hàng câu hỏi phù hợp.' };
  }

  const paper = buildPaperFromBanks(config, banks);
  if (paper.totalQuestions <= 0) {
    return { ok: false, message: 'Không đủ câu hỏi để tạo đề kiểm tra.' };
  }

  return { ok: true, paper };
}

export function buildTestPaper(courseId, scope, chapterId, config) {
  if (scope === 'final' || isCourseQuizChapterId(config?.chapterId)) {
    return buildCourseTestPaper(courseId, config);
  }
  return buildChapterTestPaper(courseId, chapterId, config);
}

export function gradeTestAnswers(gradingQuestions = [], answers = {}, totalScore = 100) {
  const totalQuestions = gradingQuestions.length;
  if (totalQuestions === 0) {
    return {
      score: 0,
      maxScore: totalScore,
      percentage: 0,
      passed: false,
      correctCount: 0,
      totalQuestions: 0,
      questionReview: [],
    };
  }

  const perQuestionScore = totalScore / totalQuestions;
  let correctCount = 0;
  let earnedScore = 0;

  const questionReview = gradingQuestions.map((question) => {
    const selected = [...(answers[question.tempId] ?? [])].sort();
    const correct = [...(question.correctOptionTempIds ?? [])].sort();
    const isCorrect = setsEqual(selected, correct);
    if (isCorrect) {
      correctCount += 1;
      earnedScore += perQuestionScore;
    }

    return {
      questionTempId: question.tempId,
      questionText: question.questionText,
      isCorrect,
      selectedOptionTempIds: selected,
      correctOptionTempIds: correct,
    };
  });

  const score = Math.round(earnedScore * 10) / 10;
  const percentage = Math.round((score / totalScore) * 1000) / 10;

  return {
    score,
    maxScore: totalScore,
    percentage,
    correctCount,
    totalQuestions,
    questionReview,
  };
}

export function formatTimer(seconds = 0) {
  const safe = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function flattenPaperQuestions(paper) {
  return (paper?.sections ?? []).flatMap((section) => section.questions ?? []);
}

export function getSectionQuestionGroups(section) {
  if (section?.questionGroups?.length) {
    return section.questionGroups;
  }
  if (!section?.questions?.length) {
    return [];
  }
  return [
    {
      groupId: 'default',
      displayName: 'Câu hỏi',
      audioUrl: section.audioUrl ?? null,
      questions: section.questions,
    },
  ];
}
