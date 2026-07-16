import { SKILL_TO_TYPE_ID } from '@/features/mentor/utils/mentorTestContentUtils';
import { getSectionQuestionGroups } from '@/features/learning/utils/courseTestPaperUtils';

function findQuestionResult(questionResults = [], question = {}) {
  const questionId = String(question?.tempId ?? question?.QuestionId ?? '');
  return questionResults.find((item) => String(item.questionId) === questionId) ?? null;
}

function countQuestionStats(questions = [], questionResults = []) {
  let correctCount = 0;
  let wrongCount = 0;

  questions.forEach((question) => {
    const result = findQuestionResult(questionResults, question);
    if (result?.isCorrect) {
      correctCount += 1;
    } else {
      wrongCount += 1;
    }
  });

  return {
    correctCount,
    wrongCount,
    totalCount: questions.length,
  };
}

function resolveSectionId(group = {}, index = 0) {
  return String(group.sectionId ?? group.groupId ?? `section_${index}`);
}

export function buildTestResultStats(paper, questionResults = []) {
  const skillSections = paper?.sections ?? [];

  const skills = skillSections.map((skillSection) => {
    const skillType = skillSection.skillType;
    const typeId = SKILL_TO_TYPE_ID[skillType] ?? null;
    const groups = getSectionQuestionGroups(skillSection);

    const sections = groups.map((group, index) => {
      const questions = group.questions ?? [];
      const counts = countQuestionStats(questions, questionResults);

      return {
        sectionId: resolveSectionId(group, index),
        displayName: group.displayName ?? `Section ${index + 1}`,
        ...counts,
      };
    });

    const correctCount = sections.reduce((sum, section) => sum + section.correctCount, 0);
    const wrongCount = sections.reduce((sum, section) => sum + section.wrongCount, 0);

    return {
      skillType,
      typeId,
      sectionCount: sections.length,
      sections,
      correctCount,
      wrongCount,
      totalCount: correctCount + wrongCount,
    };
  });

  return {
    skillCount: skills.length,
    skills,
    correctCount: skills.reduce((sum, skill) => sum + skill.correctCount, 0),
    wrongCount: skills.reduce((sum, skill) => sum + skill.wrongCount, 0),
    totalCount: skills.reduce((sum, skill) => sum + skill.totalCount, 0),
  };
}
