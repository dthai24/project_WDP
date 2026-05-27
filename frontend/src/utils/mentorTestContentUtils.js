// TODO: backend should support TEST material details: Sections, SkillType, Questions, Options, Pairs, Answers

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
  [TEST_SKILL_WRITING]: 'Viết',
};

export const TEST_SKILL_CHIP_COLORS = {
  [TEST_SKILL_LISTENING]: { color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
  [TEST_SKILL_READING]: { color: '#0891B2', bg: 'rgba(8,145,178,0.12)' },
  [TEST_SKILL_WRITING]: { color: '#EA580C', bg: 'rgba(234,88,12,0.12)' },
};

export const LISTENING_SOURCE_UPLOAD = 'UPLOAD';
export const LISTENING_SOURCE_LINK = 'LINK';

export const AUDIO_ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm'];

export function getListeningSectionFields() {
  return {
    AudioSourceType: LISTENING_SOURCE_UPLOAD,
    File: null,
    FileName: null,
    FileSize: null,
    AudioUrl: '',
  };
}

export function isAllowedAudioFile(file) {
  if (!file?.name) return false;
  const lower = file.name.toLowerCase();
  if (AUDIO_ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext))) return true;
  if (file.type?.startsWith('audio/')) return true;
  return false;
}

function isSimpleUrl(value) {
  const trimmed = String(value ?? '').trim();
  return /^https?:\/\/.+/i.test(trimmed);
}

export const QUESTION_TYPE_FILL_BLANK = 'FILL_BLANK';
export const QUESTION_TYPE_MULTIPLE_CHOICE = 'MULTIPLE_CHOICE';
export const QUESTION_TYPE_TEXT_ANSWER = 'TEXT_ANSWER';
export const QUESTION_TYPE_MATCHING = 'MATCHING';

export const QUESTION_TYPES = [
  QUESTION_TYPE_FILL_BLANK,
  QUESTION_TYPE_MULTIPLE_CHOICE,
  QUESTION_TYPE_TEXT_ANSWER,
  QUESTION_TYPE_MATCHING,
];

export const QUESTION_TYPE_LABELS = {
  [QUESTION_TYPE_FILL_BLANK]: 'Điền vào chỗ trống',
  [QUESTION_TYPE_MULTIPLE_CHOICE]: 'Trắc nghiệm',
  [QUESTION_TYPE_TEXT_ANSWER]: 'Trả lời tự luận',
  [QUESTION_TYPE_MATCHING]: 'Ghép nối',
};

export const SCORING_MODE_AUTO = 'AUTO';
export const SCORING_MODE_MANUAL = 'MANUAL';

export const SCORING_MODES = [SCORING_MODE_AUTO, SCORING_MODE_MANUAL];

export const SCORING_MODE_LABELS = {
  [SCORING_MODE_AUTO]: 'Tự chia đều',
  [SCORING_MODE_MANUAL]: 'Nhập điểm thủ công',
};

export const DEFAULT_TEST_TOTAL_SCORE = 100;

export function getTestDefaultFields() {
  return {
    Description: '',
    MaterialUrl: '',
    TotalScore: DEFAULT_TEST_TOTAL_SCORE,
    ScoringMode: SCORING_MODE_AUTO,
    Sections: [],
  };
}

export function getEffectiveScoringMode(material) {
  return material?.ScoringMode === SCORING_MODE_MANUAL ? SCORING_MODE_MANUAL : SCORING_MODE_AUTO;
}

export function getAllQuestions(sections = []) {
  return sections.flatMap((section) => section.Questions ?? []);
}

export function getQuestionCount(sections = []) {
  return getAllQuestions(sections).length;
}

export function formatScoreValue(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return '0';
  const rounded = Math.round(score * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

export function calculateManualTotalScore(sections = []) {
  return getAllQuestions(sections).reduce((sum, question) => {
    const score = Number(question.Score);
    return sum + (Number.isFinite(score) && score > 0 ? score : 0);
  }, 0);
}

export function calculateSectionManualScore(section) {
  return (section?.Questions ?? []).reduce((sum, question) => {
    const score = Number(question.Score);
    return sum + (Number.isFinite(score) && score > 0 ? score : 0);
  }, 0);
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
  const count = (section?.Questions ?? []).length;
  if (count === 0) return '0 câu';

  if (scoringMode === SCORING_MODE_AUTO) {
    const perQuestion = calculateAutoQuestionScore(totalScore, questionCountAll);
    const sectionScore = Math.round(perQuestion * count * 100) / 100;
    return `${count} câu · khoảng ${formatScoreValue(sectionScore)} điểm`;
  }

  const sectionScore = calculateSectionManualScore(section);
  return `${count} câu · ${formatScoreValue(sectionScore)} điểm`;
}

export function createEmptyTestSection(skillType = TEST_SKILL_READING) {
  return {
    tempId: createTestTempId('section'),
    SectionTitle: '',
    SkillType: skillType,
    Description: '',
    Questions: [],
    ...(skillType === TEST_SKILL_LISTENING ? getListeningSectionFields() : {}),
  };
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

export function createDefaultMatchingPairs() {
  return [
    { tempId: createTestTempId('pair'), LeftText: '', RightText: '' },
    { tempId: createTestTempId('pair'), LeftText: '', RightText: '' },
  ];
}

export function createEmptyTestQuestion(questionType = QUESTION_TYPE_MULTIPLE_CHOICE) {
  const base = {
    tempId: createTestTempId('question'),
    QuestionType: questionType,
    QuestionText: '',
    Score: 1,
  };

  switch (questionType) {
    case QUESTION_TYPE_FILL_BLANK:
      return { ...base, CorrectAnswer: '' };
    case QUESTION_TYPE_MULTIPLE_CHOICE:
      return { ...base, AllowMultipleAnswers: false, Options: createDefaultMultipleChoiceOptions() };
    case QUESTION_TYPE_TEXT_ANSWER:
      return { ...base, ExpectedAnswer: '' };
    case QUESTION_TYPE_MATCHING:
      return {
        ...base,
        QuestionText: 'Ghép từ với nghĩa phù hợp.',
        Pairs: createDefaultMatchingPairs(),
      };
    default:
      return base;
  }
}

export function rebuildQuestionForType(question, nextType) {
  const fresh = createEmptyTestQuestion(nextType);
  return {
    ...fresh,
    tempId: question.tempId,
    QuestionText: question.QuestionText ?? fresh.QuestionText,
    Score: question.Score ?? 1,
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

function isPositiveScore(value) {
  const score = Number(value);
  return Number.isFinite(score) && score > 0;
}

export function validateTestQuestion(question, { validateScore = true } = {}) {
  const qErrors = {};

  if (!QUESTION_TYPES.includes(question.QuestionType)) {
    qErrors.QuestionType = 'Vui lòng chọn kiểu câu hỏi';
  }

  if (!String(question.QuestionText ?? '').trim()) {
    qErrors.QuestionText = 'Vui lòng nhập nội dung câu hỏi';
  }

  if (validateScore && !isPositiveScore(question.Score)) {
    qErrors.Score = 'Vui lòng nhập điểm cho câu hỏi';
  }

  switch (question.QuestionType) {
    case QUESTION_TYPE_FILL_BLANK:
      if (!String(question.CorrectAnswer ?? '').trim()) {
        qErrors.CorrectAnswer = 'Vui lòng nhập đáp án đúng';
      }
      break;

    case QUESTION_TYPE_MULTIPLE_CHOICE: {
      const options = question.Options ?? [];
      if (options.length < 2) {
        qErrors._options = 'Cần ít nhất 2 đáp án';
      }
      const optionErrors = {};
      options.forEach((option) => {
        if (!String(option.OptionText ?? '').trim()) {
          optionErrors[option.tempId] = { OptionText: 'Vui lòng nhập đáp án' };
        }
      });
      if (Object.keys(optionErrors).length > 0) {
        qErrors.Options = optionErrors;
      }
      const correctCount = options.filter((option) => option.IsCorrect).length;
      const allowMultiple = Boolean(question.AllowMultipleAnswers);

      if (options.length >= 2) {
        if (allowMultiple) {
          if (correctCount < 1) {
            qErrors._correctOption = 'Vui lòng chọn ít nhất một đáp án đúng';
          }
        } else if (correctCount !== 1) {
          qErrors._correctOption = 'Vui lòng chọn đáp án đúng';
        }
      }
      break;
    }

    case QUESTION_TYPE_MATCHING: {
      const pairs = question.Pairs ?? [];
      if (pairs.length < 2) {
        qErrors._pairs = 'Vui lòng nhập đủ các cặp ghép';
      }
      const pairErrors = {};
      pairs.forEach((pair) => {
        const pairFieldErrors = {};
        if (!String(pair.LeftText ?? '').trim()) {
          pairFieldErrors.LeftText = 'Bắt buộc';
        }
        if (!String(pair.RightText ?? '').trim()) {
          pairFieldErrors.RightText = 'Bắt buộc';
        }
        if (Object.keys(pairFieldErrors).length > 0) {
          pairErrors[pair.tempId] = pairFieldErrors;
        }
      });
      if (Object.keys(pairErrors).length > 0) {
        qErrors.Pairs = pairErrors;
      } else if (pairs.length < 2) {
        qErrors._pairs = 'Vui lòng nhập đủ các cặp ghép';
      }
      break;
    }

    default:
      break;
  }

  return qErrors;
}

export function validateTestMaterial(material) {
  const materialErrors = {};

  if (!String(material.Title ?? '').trim()) {
    materialErrors.Title = 'Vui lòng nhập tiêu đề bài kiểm tra';
  }

  const scoringMode = getEffectiveScoringMode(material);
  const sections = material.Sections ?? [];
  if (sections.length === 0) {
    materialErrors._sections = 'Vui lòng thêm ít nhất 1 phần kiểm tra';
  }

  const sectionErrors = {};
  const validateScore = scoringMode === SCORING_MODE_MANUAL;

  sections.forEach((section) => {
    const sErrors = {};

    if (!TEST_SKILLS.includes(section.SkillType)) {
      sErrors.SkillType = 'Vui lòng chọn kỹ năng cho phần kiểm tra';
    }

    const questions = section.Questions ?? [];
    if (questions.length === 0) {
      sErrors._questions = 'Vui lòng thêm câu hỏi cho phần này';
    }

    if (
      section.SkillType === TEST_SKILL_LISTENING
    ) {
      const sourceType =
        section.AudioSourceType === LISTENING_SOURCE_LINK
          ? LISTENING_SOURCE_LINK
          : LISTENING_SOURCE_UPLOAD;

      if (sourceType === LISTENING_SOURCE_UPLOAD) {
        if (!section.File) {
          sErrors.File = 'Vui lòng chọn file audio';
        }
      } else {
        const audioUrl = String(section.AudioUrl ?? '').trim();
        if (!audioUrl || !isSimpleUrl(audioUrl)) {
          sErrors.AudioUrl = 'Vui lòng nhập link audio hoặc video nghe hợp lệ';
        }
      }
    }

    const questionErrors = {};
    questions.forEach((question) => {
      const qErrors = validateTestQuestion(question, { validateScore });
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

  if (scoringMode === SCORING_MODE_MANUAL) {
    const questionCount = getQuestionCount(sections);
    const targetTotal = DEFAULT_TEST_TOTAL_SCORE;
    if (questionCount > 0) {
      const manualTotal = calculateManualTotalScore(sections);
      if (!scoresMatch(targetTotal, manualTotal)) {
        materialErrors._scoreMismatch =
          'Tổng điểm câu hỏi chưa khớp với tổng điểm bài kiểm tra';
      }
    }
  }

  return materialErrors;
}

export function buildTestQuestionPayload(question) {
  const {
    tempId,
    QuestionType,
    QuestionText,
    Score,
    CorrectAnswer,
    Options,
    ExpectedAnswer,
    Pairs,
  } = question;

  const payload = {
    tempId,
    QuestionType,
    QuestionText: String(QuestionText ?? '').trim(),
    Score: Number(Score) || 1,
  };

  if (QuestionType === QUESTION_TYPE_FILL_BLANK) {
    return { ...payload, CorrectAnswer: String(CorrectAnswer ?? '').trim() };
  }

  if (QuestionType === QUESTION_TYPE_MULTIPLE_CHOICE) {
    return {
      ...payload,
      AllowMultipleAnswers: Boolean(question.AllowMultipleAnswers),
      Options: (Options ?? []).map(({ OptionText, IsCorrect }) => ({
        OptionText: String(OptionText ?? '').trim(),
        IsCorrect: Boolean(IsCorrect),
      })),
    };
  }

  if (QuestionType === QUESTION_TYPE_TEXT_ANSWER) {
    return {
      ...payload,
      ExpectedAnswer: String(ExpectedAnswer ?? '').trim() || null,
    };
  }

  if (QuestionType === QUESTION_TYPE_MATCHING) {
    return {
      ...payload,
      Pairs: (Pairs ?? []).map(({ LeftText, RightText }) => ({
        LeftText: String(LeftText ?? '').trim(),
        RightText: String(RightText ?? '').trim(),
      })),
    };
  }

  return payload;
}

export function buildTestSectionPayload(section, sectionOrder) {
  const skillType = section.SkillType;
  const sectionTitle = String(section.SectionTitle ?? '').trim();

  const base = {
    tempId: section.tempId,
    SectionTitle: sectionTitle || getSectionDisplayTitle(section),
    SkillType: skillType,
    Description: String(section.Description ?? '').trim() || null,
    SectionOrder: sectionOrder,
    Questions: (section.Questions ?? []).map(buildTestQuestionPayload),
  };

  if (skillType !== TEST_SKILL_LISTENING) {
    return base;
  }

  const sourceType =
    section.AudioSourceType === LISTENING_SOURCE_LINK
      ? LISTENING_SOURCE_LINK
      : LISTENING_SOURCE_UPLOAD;

  if (sourceType === LISTENING_SOURCE_LINK) {
    return {
      ...base,
      AudioSourceType: LISTENING_SOURCE_LINK,
      AudioUrl: String(section.AudioUrl ?? '').trim() || null,
      File: null,
      FileName: null,
      FileSize: null,
    };
  }

  return {
    ...base,
    AudioSourceType: LISTENING_SOURCE_UPLOAD,
    AudioUrl: null,
    File: section.File ?? null,
    FileName: section.FileName ?? null,
    FileSize: section.FileSize ?? null,
  };
}

export function buildTestMaterialPayload(material, base) {
  const scoringMode = getEffectiveScoringMode(material);
  const totalScore = DEFAULT_TEST_TOTAL_SCORE;
  let sections = material.Sections ?? [];

  if (scoringMode === SCORING_MODE_AUTO) {
    sections = applyAutoScoresToQuestions(sections, totalScore);
  }

  return {
    ...base,
    MaterialUrl: null,
    TotalScore: totalScore,
    ScoringMode: scoringMode,
    Sections: sections.map((section, index) => buildTestSectionPayload(section, index + 1)),
  };
}
