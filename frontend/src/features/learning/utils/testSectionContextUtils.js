import {
  TEST_SKILL_LISTENING,
  TEST_SKILL_READING,
  TEST_SKILL_VOCABULARY,
} from '@/features/mentor/utils/mentorTestContentUtils';

export function formatChapterCourseNumber(group = {}) {
  const order = Number(group?.pathOrder ?? group?.PathOrder ?? 0);
  if (Number.isFinite(order) && order > 0) {
    return `Chương ${order}`;
  }
  return null;
}

export function formatChapterLabel(group) {
  const order = Number(group?.pathOrder ?? group?.PathOrder ?? 0);
  const name = String(group?.pathName ?? group?.PathName ?? '').trim();

  if (order > 0) {
    return name ? `Chương ${order}: ${name}` : `Chương ${order}`;
  }

  if (name) return name;

  const pathId = group?.pathId ?? group?.PathId;
  if (pathId != null && Number(pathId) > 0) {
    return `Chương #${pathId}`;
  }

  return null;
}

export function formatSectionLabel(group) {
  return String(
    group?.displayName
    ?? group?.title
    ?? group?.sectionName
    ?? '',
  ).trim() || null;
}

export function buildTestGroupToolbarMeta(skillType, group) {
  const chapter = formatChapterLabel(group);
  const questionCount = group?.questions?.length ?? 0;
  const countMeta = `${questionCount} câu`;

  if (skillType === TEST_SKILL_LISTENING || skillType === TEST_SKILL_READING) {
    const parts = [];
    if (chapter) parts.push(chapter);
    parts.push(countMeta);
    return parts.join(' · ');
  }

  if (skillType === TEST_SKILL_VOCABULARY) {
    const parts = [];
    if (chapter) parts.push(chapter);
    parts.push(countMeta);
    return parts.join(' · ');
  }

  return countMeta;
}

export function buildVocabularyQuestionContextMeta(group) {
  const section = formatSectionLabel(group);
  const chapter = formatChapterLabel(group);
  const parts = [];

  if (section) parts.push(`Section: ${section}`);
  if (chapter) parts.push(chapter);

  return parts.length ? parts.join(' · ') : null;
}
