import {
  QUESTION_TYPE_MULTIPLE_CHOICE,
  READING_SOURCE_COMPOSE,
  TEST_SKILL_LISTENING,
  TEST_SKILL_READING,
  TEST_SKILL_WRITING,
  buildQuestionContentSnapshot,
  getFilledTestQuestions,
  getListeningSectionFields,
  getReadingSectionFields,
  normalizeQuestionBankSectionForSave,
  normalizeTestQuestion,
} from '@/features/mentor/utils/mentorTestContentUtils';

function mapSkillType(rawSkillType) {
  const name = String(rawSkillType ?? '').trim().toUpperCase();
  if (name === TEST_SKILL_LISTENING) return TEST_SKILL_LISTENING;
  if (name === TEST_SKILL_READING) return TEST_SKILL_READING;
  return TEST_SKILL_WRITING;
}

export function mapApiSectionToEditorSection(apiSection) {
  const skillType = mapSkillType(apiSection.skillType);
  const sectionName = String(apiSection.sectionName ?? '').trim();

  return {
    tempId: `section_${apiSection.sectionId}`,
    SectionId: apiSection.sectionId,
    SectionTitle: sectionName,
    DisplayName: sectionName,
    SkillType: skillType,
    Description: '',
    Questions: [],
    questionsLoaded: false,
    questionsLoading: false,
    questionCount: Number(apiSection.questionCount) || 0,
    sectionOrder: Number(apiSection.order) || 0,
    ...(skillType === TEST_SKILL_LISTENING ? getListeningSectionFields() : {}),
    ...(skillType === TEST_SKILL_READING ? getReadingSectionFields() : {}),
  };
}

export function mapApiQuestionToEditorQuestion(apiQuestion) {
  const choices = (apiQuestion.choices ?? []).map((choice) => ({
    tempId: `choice_${choice.choiceId}`,
    ChoiceId: choice.choiceId,
    OptionText: choice.title ?? '',
    IsCorrect: Boolean(choice.isTrue),
  }));

  const correctCount = choices.filter((item) => item.IsCorrect).length;

  return normalizeTestQuestion({
    tempId: `question_${apiQuestion.questionId}`,
    QuestionId: apiQuestion.questionId,
    QuestionType: QUESTION_TYPE_MULTIPLE_CHOICE,
    QuestionText: apiQuestion.title ?? '',
    Score: 1,
    AllowMultipleAnswers: correctCount > 1,
    isActive: apiQuestion.isActive !== false,
    Options: choices,
    AudioUrl: apiQuestion.url ?? '',
  });
}

export function mergeQuestionsIntoSection(section, apiQuestions = []) {
  const questions = apiQuestions.map(mapApiQuestionToEditorQuestion);
  const nextSection = {
    ...section,
    Questions: questions,
    questionsLoaded: true,
    questionsLoading: false,
  };

  if (section.SkillType === TEST_SKILL_LISTENING) {
    const audioUrl = apiQuestions.find((item) => item.url)?.url ?? section.AudioUrl ?? '';
    nextSection.AudioUrl = audioUrl;
  }

  return nextSection;
}

export function getSectionDisplayQuestionCount(section) {
  const loadedCount = (section?.Questions ?? []).filter(
    (question) => String(question?.QuestionText ?? '').trim(),
  ).length;
  if (loadedCount > 0) return loadedCount;
  return Number(section?.questionCount) || 0;
}

/** Snapshot so sánh section đã lưu vs đang chỉnh (không gồm File blob). */
export function buildSectionEditorSnapshot(section) {
  const normalized = normalizeQuestionBankSectionForSave(section ?? {});
  const payload = {
    SectionTitle: normalized.SectionTitle,
    DisplayName: normalized.DisplayName,
    Description: normalized.Description,
    SkillType: normalized.SkillType,
    MaterialUrl: String(normalized.MaterialUrl ?? '').trim(),
    FileName: normalized.FileName ?? null,
    FileSize: normalized.FileSize ?? null,
    AudioUrl: String(normalized.AudioUrl ?? '').trim(),
    AudioSourceType: normalized.AudioSourceType ?? null,
    ReadingSourceType: normalized.ReadingSourceType ?? null,
    Questions: getFilledTestQuestions(normalized.Questions).map((question) =>
      buildQuestionContentSnapshot(question),
    ),
  };

  if (normalized.SkillType === TEST_SKILL_LISTENING) {
    const title = String(normalized.SectionTitle ?? '').trim();
    const desc = String(normalized.Description ?? '').trim();
    payload.ListeningPrompt = title && desc ? `${title}\n\n${desc}` : title || desc;
  }

  if (normalized.SkillType === TEST_SKILL_READING) {
    payload.ReadingSourceType =
      normalized.ReadingSourceType === READING_SOURCE_COMPOSE
        ? READING_SOURCE_COMPOSE
        : normalized.ReadingSourceType;
  }

  return JSON.stringify(payload);
}

export function buildSectionBaselinesMap(sections = []) {
  return Object.fromEntries(
    (sections ?? [])
      .filter((section) => section?.tempId)
      .map((section) => [section.tempId, buildSectionEditorSnapshot(section)]),
  );
}

export function isSectionEditorDirty(section, baselines = {}) {
  if (!section?.tempId) return false;
  const baseline = baselines[section.tempId];
  if (baseline == null) return true;
  return buildSectionEditorSnapshot(section) !== baseline;
}

export function getDirtySectionTempIds(sections = [], baselines = {}) {
  return (sections ?? [])
    .filter((section) => isSectionEditorDirty(section, baselines))
    .map((section) => section.tempId);
}

export function countQuestionsBySkillFromSections(sections = []) {
  return sections.reduce(
    (acc, section) => {
      const skill = section?.SkillType;
      if (!skill) return acc;
      acc[skill] = (acc[skill] ?? 0) + getSectionDisplayQuestionCount(section);
      return acc;
    },
    {
      [TEST_SKILL_LISTENING]: 0,
      [TEST_SKILL_READING]: 0,
      [TEST_SKILL_WRITING]: 0,
    },
  );
}
