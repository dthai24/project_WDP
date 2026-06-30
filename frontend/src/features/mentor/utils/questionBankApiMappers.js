import {
  QUESTION_TYPE_MULTIPLE_CHOICE,
  TEST_SKILL_LISTENING,
  TEST_SKILL_READING,
  TEST_SKILL_WRITING,
  getListeningSectionFields,
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
