// TODO: backend should support TEST material details: Sections, SkillType, Questions, Options, Pairs, Answers

import {
  AUDIO_EXTENSION_NAMES as AUDIO_ALLOWED_EXTENSION_NAMES,
  getFileExtension as getListeningAudioExtension,
  getMaterialMaxFileSizeLabel as getListeningAudioMaxSizeLabel,
  isAllowedListeningAudioExtension,
  isAllowedListeningAudioFile,
  isAllowedReadingDocExtension,
  isSimpleHttpUrl as isSimpleUrl,
  LISTENING_AUDIO_FILE_ACCEPT,
  LISTENING_AUDIO_INVALID_TYPE_MESSAGE,
  LISTENING_LINK_INVALID_MESSAGE,
  LISTENING_UPLOAD_FAILED_MESSAGE,
  MATERIAL_UPLOAD_MAX_BYTES,
  MATERIAL_UPLOAD_MAX_SIZE_MESSAGE,
  READING_DOC_EXTENSIONS,
  READING_DOC_EXTENSION_NAMES,
  READING_DOC_FILE_ACCEPT,
  READING_DOC_INVALID_TYPE_MESSAGE,
  validateListeningAudioFile,
  validateListeningAudioUrl,
  validateReadingDocFile,
} from '@/shared/utils/materialUploadValidation';
import { isHtmlContentEmpty } from '@/features/mentor/utils/mentorCourseContentUtils';

export {
  MATERIAL_UPLOAD_MAX_BYTES,
  MATERIAL_UPLOAD_MAX_SIZE_MESSAGE,
  READING_DOC_EXTENSIONS,
  READING_DOC_EXTENSION_NAMES,
  READING_DOC_FILE_ACCEPT,
  READING_DOC_INVALID_TYPE_MESSAGE,
  LISTENING_AUDIO_FILE_ACCEPT,
  LISTENING_AUDIO_INVALID_TYPE_MESSAGE,
  LISTENING_LINK_INVALID_MESSAGE,
  LISTENING_UPLOAD_FAILED_MESSAGE,
  AUDIO_EXTENSION_NAMES as AUDIO_ALLOWED_EXTENSION_NAMES,
  validateReadingDocFile,
  validateListeningAudioFile,
  validateListeningAudioUrl,
} from '@/shared/utils/materialUploadValidation';

export { getListeningAudioExtension, getListeningAudioMaxSizeLabel };

export { getCloudinaryDeliveryUrl } from '@/shared/utils/cloudinaryDeliveryUtils';

let testTempIdCounter = 0;

function createTestTempId(prefix = 'tmp') {
  testTempIdCounter += 1;
  return `${prefix}_${Date.now()}_${testTempIdCounter}`;
}

export { createTestTempId };

export const TEST_SKILL_LISTENING = 'LISTENING';
export const TEST_SKILL_READING = 'READING';
export const TEST_SKILL_WRITING = 'WRITING';

export const TEST_SKILLS = [TEST_SKILL_LISTENING, TEST_SKILL_READING, TEST_SKILL_WRITING];

export const TEST_SKILL_LABELS = {
  [TEST_SKILL_LISTENING]: 'Nghe',
  [TEST_SKILL_READING]: 'Đọc',
  [TEST_SKILL_WRITING]: 'Từ vựng / Ngữ pháp',
};

export const TEST_SKILL_QB_LABELS = TEST_SKILL_LABELS;

export const TEST_SKILL_CHIP_COLORS = {
  [TEST_SKILL_LISTENING]: { color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
  [TEST_SKILL_READING]: { color: '#0891B2', bg: 'rgba(8,145,178,0.12)' },
  [TEST_SKILL_WRITING]: { color: '#EA580C', bg: 'rgba(234,88,12,0.12)' },
};

export const LISTENING_SOURCE_UPLOAD = 'UPLOAD';
export const LISTENING_SOURCE_LINK = 'LINK';

export const AUDIO_ALLOWED_EXTENSIONS = ['.mp3', '.mp4'];

/** Khớp giới hạn Cloudinary free tier — 10 MB. */
export const AUDIO_MAX_BYTES = MATERIAL_UPLOAD_MAX_BYTES;

export const LISTENING_AUDIO_MAX_SIZE_MESSAGE = MATERIAL_UPLOAD_MAX_SIZE_MESSAGE;

export function isAllowedListeningAudioFileName(fileName) {
  return isAllowedListeningAudioExtension(getListeningAudioExtension(fileName));
}

export function isAllowedAudioFile(file) {
  return isAllowedListeningAudioFile(file);
}

export function getListeningSectionFields() {
  return {
    AudioSourceType: LISTENING_SOURCE_UPLOAD,
    File: null,
    FileName: null,
    FileSize: null,
    AudioUrl: '',
  };
}

export const READING_SOURCE_UPLOAD = 'UPLOAD';
export const READING_SOURCE_COMPOSE = 'COMPOSE';

export function getReadingSectionFields() {
  return {
    ReadingSourceType: READING_SOURCE_COMPOSE,
    File: null,
    FileName: null,
    FileSize: null,
    MaterialUrl: '',
    Description: '',
  };
}

function isBrowserFile(value) {
  return typeof File !== 'undefined' && value instanceof File;
}

/** File .mp3/.mp4 (≤10MB) hoặc link nghe hợp lệ — dùng chung cho question bank & test material. */
export function validateQuestionBankListeningSource(section = {}) {
  const sErrors = {};
  const hasFile = Boolean(section.File || section.FileName);
  const audioUrl = String(section.AudioUrl ?? '').trim();
  const hasLink = Boolean(audioUrl);
  const isLinkSource = section.AudioSourceType === LISTENING_SOURCE_LINK;

  if (!hasFile && !hasLink) {
    sErrors._audio = 'Vui lòng tải file audio hoặc nhập link nghe';
    return sErrors;
  }

  if (isBrowserFile(section.File)) {
    const fileCheck = validateListeningAudioFile(section.File);
    if (!fileCheck.ok) {
      sErrors.File = fileCheck.message;
    }
  } else if (isLinkSource || (!section.FileName && hasLink)) {
    const linkCheck = validateListeningAudioUrl(audioUrl);
    if (!linkCheck.ok) {
      sErrors.AudioUrl = linkCheck.message;
    }
  } else if (hasFile) {
    if (section.FileName && !isAllowedListeningAudioFileName(section.FileName)) {
      sErrors.File = LISTENING_AUDIO_INVALID_TYPE_MESSAGE;
    } else if (Number(section.FileSize) > AUDIO_MAX_BYTES) {
      sErrors.File = LISTENING_AUDIO_MAX_SIZE_MESSAGE;
    }
  }

  return sErrors;
}

/** Bài đọc question bank — bắt buộc có nội dung soạn thảo. */
export function validateQuestionBankReadingComposeSource(section = {}) {
  const sErrors = {};
  if (isHtmlContentEmpty(section.Description)) {
    sErrors.Description = 'Vui lòng soạn nội dung bài đọc.';
  }
  return sErrors;
}

export const QUESTION_TYPE_MULTIPLE_CHOICE = 'MULTIPLE_CHOICE';

/** @deprecated Chỉ dùng khi đọc dữ liệu cũ — chuẩn hoá qua normalizeTestQuestion */
export const LEGACY_QUESTION_TYPE_SINGLE_CHOICE = 'SINGLE_CHOICE';

export const QUESTION_TYPES = [QUESTION_TYPE_MULTIPLE_CHOICE];

export const QUESTION_TYPE_LABELS = {
  [QUESTION_TYPE_MULTIPLE_CHOICE]: 'Trắc nghiệm',
};

export const ANSWER_MODE_SINGLE = 'single';
export const ANSWER_MODE_MULTIPLE = 'multiple';

export const ANSWER_MODE_LABELS = {
  [ANSWER_MODE_SINGLE]: 'Một đáp án',
  [ANSWER_MODE_MULTIPLE]: 'Nhiều đáp án',
};

export const TEST_QUESTION_TEXT_MAX = 250;
export const TEST_QUESTION_TEXT_MIN = 3;
export const TEST_QUESTION_OPTION_TEXT_MAX = 250;

export function isMultipleChoiceQuestion(question) {
  const type = question?.QuestionType;
  return (
    type === QUESTION_TYPE_MULTIPLE_CHOICE || type === LEGACY_QUESTION_TYPE_SINGLE_CHOICE
  );
}

function toBooleanDefaultTrue(value) {
  if (value == null) return true;
  return Boolean(value);
}

export function normalizeTestQuestion(question) {
  if (!question) return createEmptyTestQuestion();

  const legacySingle = question.QuestionType === LEGACY_QUESTION_TYPE_SINGLE_CHOICE;
  const isMc =
    question.QuestionType === QUESTION_TYPE_MULTIPLE_CHOICE || legacySingle;

  if (!isMc) {
    return createEmptyTestQuestion();
  }

  const options =
    (question.Options ?? []).length >= 2
      ? question.Options
      : createDefaultMultipleChoiceOptions();

  return {
    ...question,
    QuestionType: QUESTION_TYPE_MULTIPLE_CHOICE,
    isActive: toBooleanDefaultTrue(question.isActive),
    isUseForTest: toBooleanDefaultTrue(question.isUseForTest),
    Options: options,
  };
}

export function isQuestionActive(question) {
  return question?.isUseForTest !== false;
}

export function isPersistedQuestionLocked(question, persistedQuestionIds, coursePublished) {
  if (!coursePublished || !question?.tempId) return false;
  const ids = persistedQuestionIds instanceof Set
    ? persistedQuestionIds
    : new Set(persistedQuestionIds ?? []);
  return ids.has(question.tempId) && isFilledTestQuestion(question);
}

export function collectPersistedQuestionIds(sections = []) {
  const ids = new Set();
  (sections ?? []).forEach((section) => {
    getFilledTestQuestions(section?.Questions).forEach((question) => {
      if (question.tempId) ids.add(question.tempId);
    });
  });
  return ids;
}

export function buildQuestionContentSnapshot(question) {
  const payload = buildTestQuestionPayload(question);
  const { isActive: _isActive, isUseForTest: _isUseForTest, ...content } = payload;
  return JSON.stringify(content);
}

export function findInitialSectionQuestion(section, tempId) {
  if (!tempId) return null;
  return (section?.InitialQuestions ?? []).find((question) => question.tempId === tempId) ?? null;
}

/** So sánh nội dung câu (đề, choices, đáp án đúng) với bản ban đầu — không tính cờ sử dụng. */
export function isQuestionContentChangedFromInitial(question, initialQuestions = []) {
  if (!question?.tempId || !isFilledTestQuestion(question)) return false;
  const initial = initialQuestions.find((item) => item.tempId === question.tempId);
  if (!initial) return false;
  return buildQuestionContentSnapshot(question) !== buildQuestionContentSnapshot(initial);
}

/** Lưu bản Old Question vào danh sách đã xóa nếu câu đã bị sửa nội dung. */
export function buildDeletedQuestionArchive(question, initialQuestions = []) {
  const initial = initialQuestions.find((item) => item.tempId === question?.tempId);
  const hadContentChanges = Boolean(
    initial && isQuestionContentChangedFromInitial(question, initialQuestions),
  );

  if (!hadContentChanges || !initial) {
    return { question: { ...question }, hadContentChanges: false };
  }

  const [archivedInitial] = cloneSectionQuestions([initial]);

  return {
    question: {
      ...archivedInitial,
      tempId: question.tempId,
      QuestionId: question.QuestionId ?? initial.QuestionId,
    },
    hadContentChanges: true,
  };
}

export function buildQuestionBaselineMap(sections = []) {
  const map = new Map();
  (sections ?? []).forEach((section) => {
    getFilledTestQuestions(section?.Questions).forEach((question) => {
      if (!question.tempId) return;
      map.set(question.tempId, {
        snapshot: buildQuestionContentSnapshot(question),
        questionId: question.QuestionId ?? null,
      });
    });
  });
  return map;
}

export function buildQuestionSnapshotMap(sections = []) {
  const map = new Map();
  buildQuestionBaselineMap(sections).forEach((baseline, tempId) => {
    map.set(tempId, baseline.snapshot);
  });
  return map;
}

export function isQuestionDirty(question, baselineMap) {
  if (!question?.tempId || !isFilledTestQuestion(question)) return false;
  const baseline = baselineMap?.get(question.tempId);
  if (!baseline) return true;
  return buildQuestionContentSnapshot(question) !== baseline.snapshot;
}

/** tempId đã sửa / mới + QuestionId đã xóa so với baseline. */
export function collectQuestionChangeSet(sections = [], baselineMap = new Map()) {
  const dirtyTempIds = new Set();
  const deletedQuestionIds = [];

  (sections ?? []).forEach((section) => {
    getFilledTestQuestions(section?.Questions).forEach((question) => {
      if (isQuestionDirty(question, baselineMap)) {
        dirtyTempIds.add(question.tempId);
      }
    });
  });

  baselineMap.forEach((baseline, tempId) => {
    const stillExists = getAllQuestions(sections).some((question) => question.tempId === tempId);
    if (!stillExists && baseline.questionId) {
      deletedQuestionIds.push(baseline.questionId);
    }
  });

  return { dirtyTempIds, deletedQuestionIds };
}

export function validatePublishedQuestionBankIntegrity(sections, snapshotMap) {
  if (!snapshotMap?.size) return { ok: true };

  for (const [tempId, snapshot] of snapshotMap.entries()) {
    const current = getAllQuestions(sections).find((q) => q.tempId === tempId);
    if (!current) {
      return {
        ok: false,
        message: 'Không thể xóa câu hỏi khi khóa học đã xuất bản.',
      };
    }
    if (buildQuestionContentSnapshot(current) !== snapshot) {
      return {
        ok: false,
        message: 'Không thể sửa nội dung câu hỏi cũ khi khóa học đã xuất bản.',
      };
    }
  }

  return { ok: true };
}

function shuffleItems(items = []) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function shuffleTestQuestionOptions(question) {
  const normalized = normalizeTestQuestion(question);
  const options = normalized.Options ?? [];
  if (options.length < 2) return normalized;
  return { ...normalized, Options: shuffleItems(options) };
}

export function canShuffleTestQuestionOptions(question) {
  return (normalizeTestQuestion(question).Options ?? []).length >= 2;
}

export const SCORING_MODE_AUTO = 'AUTO';
export const SCORING_MODES = [SCORING_MODE_AUTO];

export const SCORING_MODE_LABELS = {
  [SCORING_MODE_AUTO]: 'Tự chia đều',
};

export const DEFAULT_TEST_TOTAL_SCORE = 100;

export const TEST_SOURCE_CHAPTER_QUIZ = 'CHAPTER_QUIZ';
export const TEST_SOURCE_COURSE_FINAL = 'COURSE_FINAL';

export function getDefaultFinalTestConfig() {
  return {
    totalQuestions: 30,
    listeningCount: 10,
    readingCount: 10,
    writingCount: 10,
  };
}

export function getTestDefaultFields() {
  return {
    Description: '',
    MaterialUrl: '',
    TotalScore: DEFAULT_TEST_TOTAL_SCORE,
    ScoringMode: SCORING_MODE_AUTO,
    TestSource: TEST_SOURCE_CHAPTER_QUIZ,
    FinalTestConfig: getDefaultFinalTestConfig(),
    QuestionBankId: null,
    QuestionBankTitle: null,
    QuestionBankScope: null,
    Sections: [],
  };
}

export function inferTestSource({ testSource } = {}) {
  return testSource === TEST_SOURCE_COURSE_FINAL ? TEST_SOURCE_COURSE_FINAL : TEST_SOURCE_CHAPTER_QUIZ;
}

export function getFinalTestConfigTotal(config = {}) {
  return (
    Number(config.listeningCount ?? 0) +
    Number(config.readingCount ?? 0) +
    Number(config.writingCount ?? 0)
  );
}

export function validateFinalTestConfig(config = {}, stats = null) {
  const errors = {};
  const listening = Number(config.listeningCount ?? 0);
  const reading = Number(config.readingCount ?? 0);
  const writing = Number(config.writingCount ?? 0);
  const total = getFinalTestConfigTotal(config);

  if (!Number.isFinite(total) || total <= 0) {
    errors._total = 'Vui lòng cấu hình ít nhất 1 câu hỏi cho bài kiểm tra cuối khóa';
    return errors;
  }

  [listening, reading, writing].forEach((value, index) => {
    const labels = ['Nghe', 'Đọc', 'Từ vựng / Ngữ pháp'];
    if (!Number.isFinite(value) || value < 0) {
      errors[`skill_${index}`] = `Số câu ${labels[index]} không hợp lệ`;
    }
  });

  if (stats?.questionCountBySkill) {
    if (listening > (stats.questionCountBySkill[TEST_SKILL_LISTENING] ?? 0)) {
      errors.listeningCount = 'Không đủ câu hỏi Nghe trong các bank chương';
    }
    if (reading > (stats.questionCountBySkill[TEST_SKILL_READING] ?? 0)) {
      errors.readingCount = 'Không đủ câu hỏi Đọc trong các bank chương';
    }
    if (writing > (stats.questionCountBySkill[TEST_SKILL_WRITING] ?? 0)) {
      errors.writingCount = 'Không đủ câu hỏi Từ vựng / Ngữ pháp trong các bank chương';
    }
    if ((stats.chapterBankCount ?? 0) === 0) {
      errors._banks = 'Khóa học chưa có ngân hàng câu hỏi theo chương';
    }
  }

  return errors;
}

export function getEffectiveScoringMode(material) {
  void material;
  return SCORING_MODE_AUTO;
}

export function getAllQuestions(sections = []) {
  return sections.flatMap((section) => section.Questions ?? []);
}

export function getQuestionCount(sections = []) {
  return getAllQuestions(sections).length;
}

export function isFilledTestQuestion(question) {
  return Boolean(String(question?.QuestionText ?? '').trim());
}

export function getFilledTestQuestions(questions = []) {
  return (questions ?? []).filter(isFilledTestQuestion);
}

export function getSectionDeletedQuestions(section) {
  return section?.DeletedQuestions ?? [];
}

/** Có câu hỏi đã lưu DB đang chờ xóa khi cập nhật section. */
export function hasPendingPersistedQuestionDeletes(section) {
  return (section?.DeletedQuestions ?? []).some((item) => item?.QuestionId);
}

export function cloneSectionQuestions(questions = []) {
  return (questions ?? []).map((question) => ({
    ...question,
    Options: (question.Options ?? []).map((option) => ({ ...option })),
  }));
}

export function attachInitialQuestionsToSection(section) {
  if (!section) return section;
  return {
    ...section,
    InitialQuestions: cloneSectionQuestions(section.Questions ?? []),
  };
}

/** Khôi phục danh sách câu hỏi về trạng thái ban đầu khi đã restore hết câu đã xóa. */
export function finalizeSectionAfterFullQuestionRestore(section) {
  if (!section?.InitialQuestions) return section;
  if ((section.DeletedQuestions ?? []).length > 0) return section;

  return {
    ...section,
    Questions: cloneSectionQuestions(section.InitialQuestions),
    DeletedQuestions: [],
  };
}

/** Khôi phục một câu hỏi về bản Old Question ban đầu. */
export function restoreQuestionFromInitial(currentQuestion, initialQuestion) {
  if (!currentQuestion?.tempId || !initialQuestion) return currentQuestion;

  const [cloned] = cloneSectionQuestions([initialQuestion]);

  return {
    ...cloned,
    tempId: currentQuestion.tempId,
    QuestionId: currentQuestion.QuestionId ?? initialQuestion.QuestionId,
  };
}

export function appendDeletedQuestionToSection(
  deletedQuestions = [],
  question,
  originalIndex = 0,
  initialQuestions = [],
) {
  if (!question?.tempId) return deletedQuestions;

  const hasContent =
    Boolean(question.QuestionId) || Boolean(String(question.QuestionText ?? '').trim());
  if (!hasContent) return deletedQuestions;

  if (deletedQuestions.some((item) => item.tempId === question.tempId)) {
    return deletedQuestions;
  }

  const safeIndex = Number.isInteger(originalIndex) && originalIndex >= 0 ? originalIndex : 0;
  const { question: archivedQuestion, hadContentChanges } = buildDeletedQuestionArchive(
    question,
    initialQuestions,
  );

  return [
    ...deletedQuestions,
    {
      ...archivedQuestion,
      deletedAt: new Date().toISOString(),
      deletedOrder: safeIndex,
      hadContentChanges,
    },
  ];
}

export function restoreDeletedQuestionToSection(section, question) {
  if (!section || !question?.tempId) return section;

  const deletedQuestions = (section.DeletedQuestions ?? []).filter(
    (item) => item.tempId !== question.tempId,
  );
  const questions = section.Questions ?? [];

  if (questions.some((item) => item.tempId === question.tempId)) {
    return { ...section, DeletedQuestions: deletedQuestions };
  }

  const {
    deletedAt: _deletedAt,
    deletedOrder,
    hadContentChanges: _hadContentChanges,
    ...restoredQuestion
  } = question;

  const insertIndex = Math.min(
    Number.isInteger(deletedOrder) && deletedOrder >= 0 ? deletedOrder : questions.length,
    questions.length,
  );

  const nextQuestions = [...questions];
  nextQuestions.splice(insertIndex, 0, restoredQuestion);

  return {
    ...section,
    Questions: nextQuestions,
    DeletedQuestions: deletedQuestions,
  };
}

export function getActiveFilledTestQuestions(questions = []) {
  return getFilledTestQuestions(questions).filter(isQuestionActive);
}

export function getActiveQuestionCount(sections = []) {
  return sections.reduce(
    (sum, section) => sum + getActiveFilledTestQuestions(section?.Questions).length,
    0,
  );
}

export function countActiveQuestionsBySkill(sections = []) {
  return {
    [TEST_SKILL_LISTENING]: getSectionsBySkill(sections, TEST_SKILL_LISTENING).reduce(
      (sum, section) => sum + getActiveFilledTestQuestions(section?.Questions).length,
      0,
    ),
    [TEST_SKILL_READING]: getSectionsBySkill(sections, TEST_SKILL_READING).reduce(
      (sum, section) => sum + getActiveFilledTestQuestions(section?.Questions).length,
      0,
    ),
    [TEST_SKILL_WRITING]: getSectionsBySkill(sections, TEST_SKILL_WRITING).reduce(
      (sum, section) => sum + getActiveFilledTestQuestions(section?.Questions).length,
      0,
    ),
  };
}

export function getFilledQuestionCount(sections = []) {
  return sections.reduce(
    (sum, section) => sum + getFilledTestQuestions(section.Questions).length,
    0,
  );
}

export function formatScoreValue(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return '0';
  const rounded = Math.round(score * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

export function calculateManualTotalScore(sections = []) {
  return getQuestionCount(sections);
}

export function calculateSectionManualScore(section) {
  return (section?.Questions ?? []).length;
}

export function calculateAutoQuestionScore(totalScore, questionCount) {
  const total = Number(totalScore);
  const count = Number(questionCount);
  if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(count) || count <= 0) {
    return 0;
  }
  return Math.round((total / count) * 100) / 100;
}

export function applyAutoScoresToQuestions(sections = [], totalScore) {
  const questionCount = getQuestionCount(sections);
  const perQuestion = calculateAutoQuestionScore(totalScore, questionCount);

  return sections.map((section) => ({
    ...section,
    Questions: (section.Questions ?? []).map((question) => ({
      ...question,
      Score: perQuestion,
    })),
  }));
}

export function scoresMatch(target, actual, epsilon = 0.01) {
  return Math.abs(Number(target) - Number(actual)) <= epsilon;
}

export function getSectionScoreLabel(section, scoringMode, totalScore, questionCountAll) {
  void scoringMode;
  const count = (section?.Questions ?? []).length;
  if (count === 0) return '0 câu';
  const perQuestion = calculateAutoQuestionScore(totalScore, questionCountAll);
  const sectionScore = Math.round(perQuestion * count * 100) / 100;
  return `${count} câu · khoảng ${formatScoreValue(sectionScore)} điểm`;
}

export function createEmptyTestSection(skillType = TEST_SKILL_READING) {
  return {
    tempId: createTestTempId('section'),
    SectionTitle: '',
    DisplayName: '',
    SkillType: skillType,
    Description: '',
    isUseForTest: true,
    Questions: [],
    ...(skillType === TEST_SKILL_LISTENING ? getListeningSectionFields() : {}),
    ...(skillType === TEST_SKILL_READING ? getReadingSectionFields() : {}),
  };
}

/** Ba bài mặc định (mỗi kỹ năng một bài) cho ngân hàng câu hỏi. */
export function createQuestionBankSkillSections() {
  return TEST_SKILLS.map((skill) => createEmptyTestSection(skill));
}

/** Giữ dữ liệu bank hiện có, bổ sung bài trống cho kỹ năng còn thiếu. */
export function ensureQuestionBankSkillSections(sections = []) {
  const persistedSections = getNonEmptyQuestionBankSections(sections);
  return TEST_SKILLS.flatMap((skill) => {
    const skillSections = getSectionsBySkill(persistedSections, skill);
    return skillSections.length > 0 ? skillSections : [createEmptyTestSection(skill)];
  });
}

export function getSectionsBySkill(sections = [], skillType) {
  return sections.filter((section) => section.SkillType === skillType);
}

export function getVisibleSectionsBySkill(sections = [], skillType) {
  return getSectionsBySkill(sections, skillType)
    .sort((a, b) => (Number(a.sectionOrder) || 0) - (Number(b.sectionOrder) || 0));
}

export function getSectionBySkill(sections = [], skillType) {
  return getSectionsBySkill(sections, skillType)[0] ?? null;
}

export function getSectionBaiNumber(section, sections = []) {
  if (!section) return 1;
  const skillSections = getSectionsBySkill(sections, section.SkillType);
  const index = skillSections.findIndex((item) => item.tempId === section.tempId);
  return index >= 0 ? index + 1 : skillSections.length + 1;
}

export function getQuestionBankSectionNameFallback(section, sections = []) {
  const index = getSectionBaiNumber(section, sections);
  if (section?.SkillType === TEST_SKILL_WRITING) {
    return `Nhóm ${index}`;
  }
  return `Bài số ${index}`;
}

export function getQuestionBankSectionNamePlaceholder(section) {
  if (section?.SkillType === TEST_SKILL_WRITING) {
    return 'Chưa có tên nhóm';
  }
  return 'Chưa có tên bài';
}

/** Nghe / Đọc / Từ vựng–Ngữ pháp đều có thể có nhiều bài hoặc nhóm. */
export function supportsQuestionBankMultiSection(_skillType) {
  return true;
}

/** Gộp mọi section WRITING thành một (migrate data cũ có nhiều nhóm). */
export function consolidateWritingSections(sections = []) {
  const writingSections = getSectionsBySkill(sections, TEST_SKILL_WRITING);
  if (writingSections.length <= 1) return sections;

  const mergedQuestions = writingSections.flatMap((section) => section.Questions ?? []);
  const primary = {
    ...writingSections[0],
    Questions: mergedQuestions,
    DisplayName: '',
    SectionTitle: '',
    Description: '',
  };

  let merged = false;
  return sections.reduce((acc, section) => {
    if (section.SkillType !== TEST_SKILL_WRITING) {
      acc.push(section);
      return acc;
    }
    if (!merged) {
      acc.push(primary);
      merged = true;
    }
    return acc;
  }, []);
}

/** @deprecated use getQuestionBankSectionNameFallback — kept for imports */
export function getQuestionBankSectionDisplayTitle(section, sections = []) {
  const name = String(section?.DisplayName ?? '').trim();
  if (name) return name;
  return getQuestionBankSectionNameFallback(section, sections);
}

export function getQuestionBankSectionTabLabel(section, sections = []) {
  const title = String(section?.SectionTitle ?? '').trim();
  if (title) return title;
  const name = String(section?.DisplayName ?? '').trim();
  if (name) return name;
  return getQuestionBankSectionNameFallback(section, sections);
}

export function isQuestionBankWritingSkill(skillType) {
  return skillType === TEST_SKILL_WRITING;
}

export function createQuestionBankSection(skillType = TEST_SKILL_READING) {
  return createEmptyTestSection(skillType);
}

export function getNonEmptyQuestionBankSections(sections = []) {
  return sections
    .map((section) => ({
      ...section,
      Questions: getFilledTestQuestions(section.Questions),
    }))
    .filter(
      (section) =>
        section.Questions.length > 0 || Number(section.questionCount) > 0,
    );
}

/** Trim SectionName trước khi gửi API — giữ nguyên space ở Title khi đang nhập trên form. */
export function normalizeQuestionBankSectionForSave(section) {
  const next = {
    ...section,
    DisplayName: String(section.DisplayName ?? '').trim(),
    SectionTitle: String(section.SectionTitle ?? ''),
    Description: String(section.Description ?? '').trim(),
  };
  if (section.SkillType === TEST_SKILL_LISTENING) {
    next.AudioUrl = String(section.AudioUrl ?? '').trim();
  }
  return next;
}

export function getSectionDisplayTitle(section) {
  const title = String(section?.SectionTitle ?? '').trim();
  if (title) return title;
  const skillLabel = TEST_SKILL_LABELS[section?.SkillType];
  return skillLabel ? `Phần ${skillLabel}` : 'Phần kiểm tra';
}

export function createDefaultMultipleChoiceOptions() {
  return ['A', 'B', 'C', 'D'].map((label, index) => ({
    tempId: createTestTempId('option'),
    OptionText: '',
    IsCorrect: index === 0,
  }));
}

export function createEmptyTestQuestion() {
  return {
    tempId: createTestTempId('question'),
    QuestionType: QUESTION_TYPE_MULTIPLE_CHOICE,
    QuestionText: '',
    Score: 1,
    isActive: true,
    isUseForTest: true,
    Options: createDefaultMultipleChoiceOptions(),
  };
}

export function computeTestSummary(questions = []) {
  const count = questions.length;
  const totalScore = questions.reduce((sum, question) => {
    const score = Number(question.Score);
    return sum + (Number.isFinite(score) && score > 0 ? score : 0);
  }, 0);
  return { count, totalScore };
}

export function computeMaterialTestSummary(sections = []) {
  return sections.reduce(
    (acc, section) => {
      const { count, totalScore } = computeTestSummary(section.Questions ?? []);
      return {
        sectionCount: acc.sectionCount + 1,
        questionCount: acc.questionCount + count,
        totalScore: acc.totalScore + totalScore,
      };
    },
    { sectionCount: 0, questionCount: 0, totalScore: 0 },
  );
}

export function validateTestQuestion(question, { validateScore = true } = {}) {
  void validateScore;
  const normalized = normalizeTestQuestion(question);
  const qErrors = {};
  const questionText = String(normalized.QuestionText ?? '').trim();

  if (!questionText) {
    qErrors.QuestionText = 'Vui lòng nhập nội dung câu hỏi';
  } else if (questionText.length < TEST_QUESTION_TEXT_MIN) {
    qErrors.QuestionText = `Đề bài câu hỏi phải có ít nhất ${TEST_QUESTION_TEXT_MIN} ký tự`;
  } else if (questionText.length > TEST_QUESTION_TEXT_MAX) {
    qErrors.QuestionText = `Tối đa ${TEST_QUESTION_TEXT_MAX} ký tự`;
  }

  const options = normalized.Options ?? [];
  if (options.length < 2) {
    qErrors._options = 'Mỗi câu hỏi phải có tối thiểu 2 đáp án';
  }
  const optionErrors = {};
  options.forEach((option) => {
    const optionText = String(option.OptionText ?? '').trim();
    if (!optionText) {
      optionErrors[option.tempId] = { OptionText: 'Vui lòng nhập nội dung đáp án' };
    } else if (optionText.length > TEST_QUESTION_OPTION_TEXT_MAX) {
      optionErrors[option.tempId] = {
        OptionText: `Tối đa ${TEST_QUESTION_OPTION_TEXT_MAX} ký tự`,
      };
    }
  });
  if (Object.keys(optionErrors).length > 0) {
    qErrors.Options = optionErrors;
  }
  const correctCount = options.filter((option) => option.IsCorrect).length;

  if (options.length >= 2 && correctCount < 1) {
    qErrors._correctOption = 'Mỗi câu hỏi phải có ít nhất 1 đáp án đúng (có thể chọn nhiều)';
  }

  return qErrors;
}

export function validateTestMaterial(material, options = {}) {
  const materialErrors = {};
  const { courseId, inlineSections = false, skipTitle = false, bankStats = null } = options;

  if (!skipTitle && !String(material.Title ?? '').trim()) {
    materialErrors.Title = 'Vui lòng nhập tiêu đề bài kiểm tra';
  }

  const testSource = inferTestSource({ testSource: material.TestSource });

  const sections = material.Sections ?? [];

  if (inlineSections) {
    const filledSections = getNonEmptyQuestionBankSections(sections);
    if (filledSections.length === 0) {
      materialErrors._sections = 'Vui lòng thêm ít nhất 1 câu hỏi';
      return materialErrors;
    }
  } else if (!courseId) {
    return materialErrors;
  } else if (testSource === TEST_SOURCE_COURSE_FINAL) {
    const configErrors = validateFinalTestConfig(material.FinalTestConfig ?? {}, bankStats);
    if (Object.keys(configErrors).length > 0) {
      materialErrors.FinalTestConfig = configErrors;
      if (configErrors._total) materialErrors._sections = configErrors._total;
      if (configErrors._banks) materialErrors._sections = configErrors._banks;
    }
    return materialErrors;
  } else if (!material.QuestionBankId) {
    materialErrors.QuestionBankId = 'Chương này chưa có ngân hàng câu hỏi';
    return materialErrors;
  } else if (sections.length === 0) {
    materialErrors._sections = 'Ngân hàng câu hỏi chương chưa có câu hỏi';
    return materialErrors;
  }

  const sectionErrors = {};
  const sectionsToValidate = inlineSections ? getNonEmptyQuestionBankSections(sections) : sections;

  sectionsToValidate.forEach((section) => {
    const sErrors = {};

    if (!TEST_SKILLS.includes(section.SkillType)) {
      sErrors.SkillType = 'Vui lòng chọn kỹ năng cho phần kiểm tra';
    }

    const questions = section.Questions ?? [];
    if (questions.length === 0) {
      sErrors._questions = 'Vui lòng thêm câu hỏi cho phần này';
    }

    if (section.SkillType === TEST_SKILL_LISTENING) {
      Object.assign(sErrors, validateQuestionBankListeningSource(section));
    }

    if (section.SkillType === TEST_SKILL_READING) {
      const sourceType =
        section.ReadingSourceType === READING_SOURCE_UPLOAD
          ? READING_SOURCE_UPLOAD
          : READING_SOURCE_COMPOSE;

      if (sourceType === READING_SOURCE_UPLOAD) {
        const materialUrl = String(section.MaterialUrl ?? '').trim();
        const hasUploaded = Boolean(materialUrl);
        const hasPendingFile = isBrowserFile(section.File);
        const hasFileMeta = Boolean(section.FileName);

        if (!hasUploaded && !hasPendingFile && !hasFileMeta) {
          sErrors.File = 'Vui lòng tải file PDF, DOC hoặc DOCX.';
        } else if (hasPendingFile) {
          const fileCheck = validateReadingDocFile(section.File);
          if (!fileCheck.ok) {
            sErrors.File = fileCheck.message;
          }
        } else if (hasFileMeta) {
          const ext = getListeningAudioExtension(section.FileName);
          if (!isAllowedReadingDocExtension(ext)) {
            sErrors.File = READING_DOC_INVALID_TYPE_MESSAGE;
          } else if (Number(section.FileSize) > MATERIAL_UPLOAD_MAX_BYTES) {
            sErrors.File = MATERIAL_UPLOAD_MAX_SIZE_MESSAGE;
          }
        }
      } else {
        Object.assign(sErrors, validateQuestionBankReadingComposeSource(section));
      }
    }

    const questionErrors = {};
    questions.forEach((question) => {
      if (!isFilledTestQuestion(question)) return;
      const qErrors = validateTestQuestion(question);
      if (Object.keys(qErrors).length > 0) {
        questionErrors[question.tempId] = qErrors;
      }
    });

    if (Object.keys(questionErrors).length > 0) {
      sErrors.Questions = questionErrors;
    }

    if (Object.keys(sErrors).length > 0) {
      sectionErrors[section.tempId] = sErrors;
    }
  });

  if (Object.keys(sectionErrors).length > 0) {
    materialErrors.Sections = sectionErrors;
  }

  return materialErrors;
}

/** Validate một section question bank (dùng trước khi cập nhật từng section). */
export function validateQuestionBankSection(
  section,
  { validateScore = false, requireQuestions = false, forSave = false } = {},
) {
  void validateScore;
  const sErrors = {};

  if (!section?.tempId) {
    return { _section: 'Section không hợp lệ' };
  }

  if (!TEST_SKILLS.includes(section.SkillType)) {
    sErrors.SkillType = 'Vui lòng chọn kỹ năng cho phần kiểm tra';
  }

  if (forSave) {
    if (!String(section.DisplayName ?? '').trim()) {
      sErrors.DisplayName = 'Vui lòng nhập Section name';
    }

    const sectionTitle = String(section.SectionTitle ?? '').trim()
      || (section.SkillType === TEST_SKILL_WRITING
        ? String(section.DisplayName ?? '').trim()
        : '');
    if (!sectionTitle) {
      sErrors.SectionTitle = 'Vui lòng nhập Title (đề bài)';
    }
  }

  const questions = section.Questions ?? [];
  if ((forSave || requireQuestions) && questions.length === 0) {
    sErrors._questions = 'Section phải có ít nhất 1 câu hỏi';
  }

  if (forSave && section.SkillType === TEST_SKILL_LISTENING) {
    Object.assign(sErrors, validateQuestionBankListeningSource(section));
  }

  if (forSave && section.SkillType === TEST_SKILL_READING) {
    Object.assign(sErrors, validateQuestionBankReadingComposeSource(section));
  }

  const questionErrors = {};
  const questionsToValidate = forSave ? questions : questions.filter(isFilledTestQuestion);
  questionsToValidate.forEach((question) => {
    const qErrors = validateTestQuestion(question);
    if (Object.keys(qErrors).length > 0) {
      questionErrors[question.tempId] = qErrors;
    }
  });

  if (Object.keys(questionErrors).length > 0) {
    sErrors.Questions = questionErrors;
  }

  return sErrors;
}

export function isQuestionBankSectionValid(section) {
  if (!section?.tempId) return false;
  const errors = validateQuestionBankSection(normalizeQuestionBankSectionForSave(section), {
    forSave: true,
  });
  return Object.keys(errors).length === 0;
}

export function getQuestionBankSectionValidationSummary(errors = {}, section = null) {
  if (errors.DisplayName) return errors.DisplayName;
  if (errors.SectionTitle) return errors.SectionTitle;
  if (errors._questions) return errors._questions;
  if (errors.Questions) {
    for (const [questionTempId, questionErrors] of Object.entries(errors.Questions)) {
      const questionMessage = buildQuestionBankQuestionValidationMessage(
        section,
        questionTempId,
        questionErrors,
      );
      if (questionMessage) return questionMessage;
    }
  }
  if (errors._audio) return errors._audio;
  if (errors.File) return errors.File;
  if (errors.AudioUrl) return errors.AudioUrl;
  if (errors.Description) return errors.Description;
  if (errors.SkillType) return errors.SkillType;
  if (errors._section) return errors._section;
  return 'Vui lòng kiểm tra lại thông tin section.';
}

function getQuestionValidationLabel(section, questionTempId) {
  const questions = section?.Questions ?? [];
  const questionIndex = questions.findIndex((question) => question.tempId === questionTempId);
  return questionIndex >= 0 ? `Câu ${questionIndex + 1}` : 'Câu';
}

function buildQuestionBankQuestionValidationMessage(section, questionTempId, questionErrors = {}) {
  const label = getQuestionValidationLabel(section, questionTempId);

  if (questionErrors._options) {
    return `${label} chưa có đáp án`;
  }

  if (questionErrors._correctOption) {
    return `${label} chưa có đáp án đúng (Tối thiểu 1 đáp án đúng)`;
  }

  if (questionErrors.Options && Object.keys(questionErrors.Options).length > 0) {
    return `${label} chưa có đáp án`;
  }

  if (questionErrors.QuestionText) {
    return questionErrors.QuestionText;
  }

  return null;
}

export const QUESTION_BANK_SAVE_WARNINGS = {
  MISSING_QUESTION_TITLE: 'Hãy thêm đề bài để tiếp tục',
  LISTENING_MISSING_AUDIO: 'Hãy thêm file nghe để tiếp tục',
  READING_MISSING_PROMPT: 'Hãy thêm đề bài để tiếp tục',
};

/** Kiểm tra section trước khi lưu — trả về cảnh báo đầu tiên nếu thiếu dữ liệu bắt buộc. */
export function findQuestionBankSectionSaveIssue(section) {
  if (!section?.tempId) {
    return { message: 'Section không hợp lệ' };
  }

  const errors = validateQuestionBankSection(normalizeQuestionBankSectionForSave(section), {
    forSave: true,
  });
  if (Object.keys(errors).length === 0) return null;

  if (errors.DisplayName) {
    return {
      message: errors.DisplayName,
      sectionTempId: section.tempId,
      field: 'DisplayName',
    };
  }

  if (errors.SectionTitle) {
    return {
      message: errors.SectionTitle,
      sectionTempId: section.tempId,
      field: 'SectionTitle',
    };
  }

  if (errors._questions) {
    return {
      message: errors._questions,
      sectionTempId: section.tempId,
    };
  }

  if (errors.Questions) {
    const questionTempId = Object.keys(errors.Questions)[0];
    const questionErrors = errors.Questions[questionTempId] ?? {};
    const questionMessage = buildQuestionBankQuestionValidationMessage(
      section,
      questionTempId,
      questionErrors,
    );
    if (questionMessage) {
      return {
        message: questionMessage,
        sectionTempId: section.tempId,
        questionTempId,
      };
    }
  }

  return {
    message: getQuestionBankSectionValidationSummary(errors, section),
    sectionTempId: section.tempId,
  };
}

/** Kiểm tra toàn bộ sections — dùng khi cần validate cả workspace. */
export function findQuestionBankSaveValidationIssue(sections = []) {
  for (const section of sections ?? []) {
    const issue = findQuestionBankSectionSaveIssue(section);
    if (issue) return issue;
  }
  return null;
}

export function buildQuestionBankSectionSaveErrors(section, issue) {
  if (!issue?.sectionTempId || section?.tempId !== issue.sectionTempId) {
    return {};
  }

  if (issue.questionTempId) {
    const errors = validateQuestionBankSection(normalizeQuestionBankSectionForSave(section), {
      forSave: true,
    });
    const questionErrors = errors.Questions?.[issue.questionTempId];
    if (questionErrors) {
      return {
        Questions: {
          [issue.questionTempId]: questionErrors,
        },
      };
    }
    return {
      Questions: {
        [issue.questionTempId]: {
          QuestionText: issue.message,
        },
      },
    };
  }

  if (issue.field === 'DisplayName') {
    return { DisplayName: issue.message };
  }

  if (issue.field === 'SectionTitle') {
    return { SectionTitle: issue.message };
  }

  if (issue.message?.includes('ít nhất 1 câu hỏi')) {
    return { _questions: issue.message };
  }

  if (issue.message === QUESTION_BANK_SAVE_WARNINGS.LISTENING_MISSING_AUDIO) {
    return { _audio: issue.message };
  }

  if (issue.message === QUESTION_BANK_SAVE_WARNINGS.READING_MISSING_PROMPT) {
    return { SectionTitle: issue.message };
  }

  return {};
}

export function buildTestQuestionPayload(question) {
  const normalized = normalizeTestQuestion(question);
  const { tempId, QuestionText, Options } = normalized;
  const mappedOptions = (Options ?? []).map(({ OptionText, IsCorrect }) => ({
    OptionText: String(OptionText ?? '').trim(),
    IsCorrect: Boolean(IsCorrect),
  }));

  return {
    tempId,
    QuestionType: QUESTION_TYPE_MULTIPLE_CHOICE,
    QuestionText: String(QuestionText ?? '').trim(),
    Score: 1,
    isActive: toBooleanDefaultTrue(normalized.isActive),
    isUseForTest: toBooleanDefaultTrue(normalized.isUseForTest),
    Options: mappedOptions,
  };
}

export function buildTestSectionPayload(section, sectionOrder) {
  const skillType = section.SkillType;
  const displayName = String(section.DisplayName ?? '').trim();

  const base = {
    tempId: section.tempId,
    SectionTitle: section.SectionTitle == null ? null : String(section.SectionTitle),
    DisplayName: displayName || getSectionDisplayTitle(section),
    SkillType: skillType,
    isUseForTest: section.isUseForTest !== false,
    Description: String(section.Description ?? '').trim() || null,
    SectionOrder: sectionOrder,
    Questions: (section.Questions ?? []).map(buildTestQuestionPayload),
  };

  if (skillType !== TEST_SKILL_LISTENING) {
    return base;
  }

  const audioUrl = String(section.AudioUrl ?? '').trim();
  const hasFile = Boolean(section.File || section.FileName);

  if (hasFile) {
    return {
      ...base,
      AudioSourceType: LISTENING_SOURCE_UPLOAD,
      AudioUrl: null,
      File: section.File ?? null,
      FileName: section.FileName ?? null,
      FileSize: section.FileSize ?? null,
    };
  }

  if (audioUrl) {
    return {
      ...base,
      AudioSourceType: LISTENING_SOURCE_LINK,
      AudioUrl: audioUrl,
      File: null,
      FileName: null,
      FileSize: null,
    };
  }

  return {
    ...base,
    AudioSourceType: LISTENING_SOURCE_UPLOAD,
    AudioUrl: null,
    File: null,
    FileName: null,
    FileSize: null,
  };
}

/**
 * Scroll tới kỹ năng / bài / câu hỏi trong builder Question Bank.
 */
export function scrollToQuestionBankItem(target, { delayMs = 180 } = {}) {
  window.setTimeout(() => {
    if (target?.type === 'question' && target.questionTempId) {
      document.getElementById(`qb-question-${target.questionTempId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    if (target?.sectionTempId) {
      document.getElementById(`qb-section-${target.sectionTempId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, delayMs);
}

export function buildTestMaterialPayload(material, base) {
  const totalScore = DEFAULT_TEST_TOTAL_SCORE;
  const sections = material.Sections ?? [];

  return {
    ...base,
    MaterialUrl: null,
    TotalScore: totalScore,
    ScoringMode: SCORING_MODE_AUTO,
    TestSource: material.TestSource ?? null,
    FinalTestConfig: material.FinalTestConfig ?? null,
    QuestionBankId: material.QuestionBankId ?? null,
    QuestionBankTitle: material.QuestionBankTitle ?? null,
    Sections: sections.map((section, index) => buildTestSectionPayload(section, index + 1)),
  };
}
