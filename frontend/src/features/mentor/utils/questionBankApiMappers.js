import {
  getPendingDeleteSections,
  QUESTION_TYPE_MULTIPLE_CHOICE,
  READING_SOURCE_COMPOSE,
  READING_SOURCE_UPLOAD,
  TEST_SKILL_LISTENING,
  TEST_SKILL_READING,
  TEST_SKILL_WRITING,
  buildQuestionContentSnapshot,
  buildTestQuestionPayload,
  buildTestSectionPayload,
  cloneSectionQuestions,
  getFilledTestQuestions,
  isFilledTestQuestion,
  LISTENING_SOURCE_LINK,
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

function resolveSectionSourceUrlFromApi(apiSection = {}) {
  const raw = apiSection.sourceUrl ?? apiSection.audioUrl ?? apiSection.materialUrl ?? '';
  return String(raw).trim();
}

function resolveSectionSourceUrlForSave(sectionPayload = {}) {
  const skill = sectionPayload.SkillType;
  if (skill === TEST_SKILL_LISTENING) {
    return String(sectionPayload.AudioUrl ?? '').trim() || null;
  }
  if (skill === TEST_SKILL_READING) {
    return String(sectionPayload.MaterialUrl ?? '').trim() || null;
  }
  return String(sectionPayload.MaterialUrl ?? sectionPayload.AudioUrl ?? '').trim() || null;
}

export function mapApiSectionToEditorSection(apiSection) {
  const skillType = mapSkillType(apiSection.skillType);
  const sectionName = String(apiSection.sectionName ?? '').trim();
  const displayName = String(apiSection.displayName ?? sectionName).trim();
  const sourceUrl = resolveSectionSourceUrlFromApi(apiSection);

  const base = {
    tempId: `section_${apiSection.sectionId}`,
    SectionId: apiSection.sectionId,
    SectionTitle: sectionName,
    DisplayName: displayName || sectionName,
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

  if (skillType === TEST_SKILL_LISTENING) {
    base.AudioUrl = sourceUrl;
    if (sourceUrl) {
      base.AudioSourceType = LISTENING_SOURCE_LINK;
    }
  }

  if (skillType === TEST_SKILL_READING && sourceUrl) {
    base.MaterialUrl = sourceUrl;
    base.ReadingSourceType = READING_SOURCE_UPLOAD;
  }

  return base;
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
    Score: Number(apiQuestion.score) || 1,
    AllowMultipleAnswers:
      apiQuestion.allowMultipleAnswers != null
        ? Boolean(apiQuestion.allowMultipleAnswers)
        : correctCount > 1,
    isActive: apiQuestion.isActive !== false,
    Options: choices,
    AudioUrl: apiQuestion.url ?? '',
  });
}

export function mergeQuestionsIntoSection(section, apiQuestions = []) {
  const activeQuestions = (apiQuestions ?? []).filter((item) => item.isActive !== false);
  const questions = activeQuestions.map(mapApiQuestionToEditorQuestion);
  const nextSection = {
    ...section,
    Questions: questions,
    questionsLoaded: true,
    questionsLoading: false,
    questionCount: activeQuestions.length || section.questionCount || 0,
  };

  if (section.SkillType === TEST_SKILL_LISTENING) {
    const audioUrl =
      String(section.AudioUrl ?? '').trim() ||
      activeQuestions.find((item) => item.url)?.url ||
      '';
    if (audioUrl) {
      nextSection.AudioUrl = audioUrl;
      nextSection.AudioSourceType = LISTENING_SOURCE_LINK;
    }
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

function hasPendingUploadFile(section) {
  return typeof File !== 'undefined' && section?.File instanceof File;
}

/** Snapshot phần nguồn (file / soạn thảo) — dùng cho Nghe & Đọc. */
export function buildSectionSourceSnapshot(section) {
  const normalized = normalizeQuestionBankSectionForSave(section ?? {});
  const skill = normalized.SkillType;

  if (skill === TEST_SKILL_LISTENING) {
    return JSON.stringify({
      AudioUrl: String(normalized.AudioUrl ?? '').trim(),
    });
  }

  if (skill === TEST_SKILL_READING) {
    return JSON.stringify({
      MaterialUrl: String(normalized.MaterialUrl ?? '').trim(),
    });
  }

  return null;
}

export function buildSectionSourceBaselinesMap(sections = []) {
  return Object.fromEntries(
    (sections ?? [])
      .filter((section) => section?.tempId && buildSectionSourceSnapshot(section) != null)
      .map((section) => [section.tempId, buildSectionSourceSnapshot(section)]),
  );
}

export function isSectionSourceDirty(section, sourceBaselines = {}) {
  if (!section?.tempId) return false;
  if (hasPendingUploadFile(section)) return true;

  const snapshot = buildSectionSourceSnapshot(section);
  if (snapshot == null) return false;

  const baseline = sourceBaselines[section.tempId];
  if (baseline == null) return true;
  return snapshot !== baseline;
}

function getSectionQuestionsSnapshotList(section) {
  const normalized = normalizeQuestionBankSectionForSave(section ?? {});
  return getFilledTestQuestions(normalized.Questions).map((question) =>
    buildQuestionContentSnapshot(question),
  );
}

export function isSectionQuestionsDirty(section, baselines = {}) {
  if (!section?.tempId) return false;

  const baselineJson = baselines[section.tempId];
  if (baselineJson == null) return false;

  try {
    const baselinePayload = JSON.parse(baselineJson);
    const baselineQuestions = baselinePayload.Questions ?? [];
    const currentQuestions = getSectionQuestionsSnapshotList(section);
    return JSON.stringify(currentQuestions) !== JSON.stringify(baselineQuestions);
  } catch {
    return false;
  }
}

/** Nghe/Đọc: dirty khi đổi file/soạn thảo hoặc thay đổi câu hỏi; Viết: dirty toàn section. */
export function isSectionSaveDirty(section, baselines = {}, sourceBaselines = {}) {
  const skill = section?.SkillType;
  if (skill === TEST_SKILL_LISTENING || skill === TEST_SKILL_READING) {
    return (
      isSectionSourceDirty(section, sourceBaselines) ||
      isSectionQuestionsDirty(section, baselines)
    );
  }
  return isSectionEditorDirty(section, baselines);
}

/** Section khớp baseline (kể cả sau khi khôi phục câu hỏi đã xóa). */
export function isSectionSyncedWithBaseline(section, baselines = {}, sourceBaselines = {}) {
  if (!section?.tempId) return true;
  if ((section.DeletedQuestions ?? []).length > 0) return false;
  return !isSectionSaveDirty(section, baselines, sourceBaselines);
}

export function hasSectionUnsavedChanges(section, baselines = {}, sourceBaselines = {}) {
  return !isSectionSyncedWithBaseline(section, baselines, sourceBaselines);
}

export function hasPendingSectionDeletes(sections = []) {
  return getPendingDeleteSections(sections).length > 0;
}

export function hasQuestionBankWorkspaceChanges(
  sections = [],
  activeSection,
  baselines = {},
  sourceBaselines = {},
) {
  if (hasPendingSectionDeletes(sections)) return true;
  if (!activeSection) return false;
  return hasSectionUnsavedChanges(activeSection, baselines, sourceBaselines);
}

function buildSectionsDeleteRows(sections = []) {
  return getPendingDeleteSections(sections).map((section) => ({
    table: 'Question_Sections',
    sectionId: section.SectionId ?? null,
    sectionTempId: section.tempId ?? null,
  }));
}

export function buildQuestionBankWorkspaceSavePayload(
  section,
  context,
  baselines = {},
  sourceBaselines = {},
  allSections = [],
) {
  const payload = buildQuestionBankSectionSavePayload(section, context, baselines, sourceBaselines);
  const sectionsDelete = buildSectionsDeleteRows(allSections);

  payload.sectionsDelete = sectionsDelete;
  payload.summary = {
    ...payload.summary,
    sectionsDelete: sectionsDelete.length,
  };

  return payload;
}

function isNonJsonSerializable(value) {
  if (value == null) return false;
  if (typeof File !== 'undefined' && value instanceof File) return true;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return true;
  return typeof value === 'function' || typeof value === 'symbol';
}

/** Loại bỏ File/Blob và đảm bảo payload gửi API là JSON thuần. */
export function serializeQuestionBankSavePayload(payload) {
  if (payload == null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Payload lưu section không hợp lệ.');
  }

  try {
    return JSON.parse(JSON.stringify(payload, (_key, value) => {
      if (isNonJsonSerializable(value)) return undefined;
      return value;
    }));
  } catch {
    throw new Error('Payload chứa dữ liệu không thể chuyển thành JSON.');
  }
}

/** Reset phần Questions trong baseline về trạng thái ban đầu sau khi khôi phục hết câu đã xóa. */
export function applyInitialQuestionsBaseline(section, sectionBaselines = {}, initialSectionBaselines = {}) {
  const tempId = section?.tempId;
  if (!tempId) return sectionBaselines;

  const initialJson = initialSectionBaselines[tempId];
  if (!initialJson) return sectionBaselines;

  try {
    const initialPayload = JSON.parse(initialJson);
    const currentJson = sectionBaselines[tempId] ?? initialJson;
    const currentPayload = JSON.parse(currentJson);

    return {
      ...sectionBaselines,
      [tempId]: JSON.stringify({
        ...currentPayload,
        Questions: initialPayload.Questions ?? [],
      }),
    };
  } catch {
    return sectionBaselines;
  }
}

/** Khôi phục section về trạng thái đã lưu (baseline) khi user bỏ qua thay đổi. */
export function revertSectionToSavedBaseline(section, baselines = {}, sourceBaselines = {}) {
  if (!section?.tempId) return section;

  const baselineJson = baselines[section.tempId];
  if (!baselineJson) return section;

  try {
    const payload = JSON.parse(baselineJson);
    const next = { ...section };

    next.SectionTitle = payload.SectionTitle ?? next.SectionTitle;
    next.DisplayName = payload.DisplayName ?? next.DisplayName;
    next.Description = payload.Description ?? next.Description ?? '';
    next.MaterialUrl = payload.MaterialUrl ?? '';
    next.DeletedQuestions = [];
    delete next.File;

    if (section.InitialQuestions) {
      next.Questions = cloneSectionQuestions(section.InitialQuestions);
    }

    if (section.SkillType === TEST_SKILL_LISTENING) {
      next.AudioUrl = payload.AudioUrl ?? '';
      next.FileName = payload.FileName ?? null;
      next.FileSize = payload.FileSize ?? null;
      next.AudioSourceType = payload.AudioSourceType ?? next.AudioSourceType;
    }

    if (section.SkillType === TEST_SKILL_READING) {
      next.ReadingSourceType = payload.ReadingSourceType ?? next.ReadingSourceType;
    }

    const sourceJson = sourceBaselines[section.tempId];
    if (sourceJson) {
      const source = JSON.parse(sourceJson);
      if (section.SkillType === TEST_SKILL_LISTENING) {
        next.AudioUrl = source.AudioUrl ?? next.AudioUrl;
        next.FileName = source.FileName ?? next.FileName;
        next.FileSize = source.FileSize ?? next.FileSize;
        next.AudioSourceType = source.AudioSourceType ?? next.AudioSourceType;
        delete next.File;
      }
      if (section.SkillType === TEST_SKILL_READING) {
        next.Description = source.Description ?? next.Description;
        next.ReadingSourceType = source.ReadingSourceType ?? next.ReadingSourceType;
      }
    }

    return next;
  } catch {
    return section;
  }
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

function stripSectionFileBlob(sectionPayload = {}) {
  const { File: _file, ...rest } = sectionPayload;
  return rest;
}

function buildSectionPayloadForPreview(section, sectionOrder) {
  const normalized = normalizeQuestionBankSectionForSave(section ?? {});
  let sectionPayload = stripSectionFileBlob(buildTestSectionPayload(normalized, sectionOrder));

  if (normalized.SectionId) {
    sectionPayload = { ...sectionPayload, SectionId: normalized.SectionId };
  }

  return { normalized, sectionPayload };
}

function buildChoiceApiRows(question) {
  return (question.Options ?? [])
    .map((option, index) => ({
      title: String(option?.OptionText ?? '').trim(),
      order: index + 1,
      isTrue: Boolean(option?.IsCorrect),
    }))
    .filter((choice) => choice.title);
}

function buildQuestionApiData(question) {
  const payload = buildTestQuestionPayload(question);
  return {
    title: payload.QuestionText,
    isActive: payload.isActive,
    score: payload.Score,
    allowMultipleAnswers: payload.AllowMultipleAnswers,
  };
}

function buildSectionApiData(normalized, sectionPayload = {}) {
  return {
    sectionName: sectionPayload.SectionTitle ?? null,
    skillType: sectionPayload.SkillType ?? null,
    sourceUrl: resolveSectionSourceUrlForSave({
      SkillType: normalized.SkillType,
      AudioUrl: normalized.AudioUrl,
      MaterialUrl: normalized.MaterialUrl,
    }),
  };
}

const SECTION_FIELD_BASELINE_MAP = {
  SectionTitle: 'sectionName',
};

function resolveBaselineSourceUrl(baseline = {}, skillType) {
  return resolveSectionSourceUrlForSave({
    SkillType: skillType,
    AudioUrl: baseline.AudioUrl,
    MaterialUrl: baseline.MaterialUrl,
  }) ?? '';
}

function resolveSectionSourceBaselineUrl(baselines = {}, sourceBaselines = {}, tempId, skillType) {
  const sourceJson = sourceBaselines[tempId];
  if (sourceJson) {
    try {
      const source = JSON.parse(sourceJson);
      return String(source.AudioUrl ?? source.MaterialUrl ?? '').trim();
    } catch {
      // ignore invalid source baseline
    }
  }

  try {
    const baselineJson = baselines[tempId];
    const baseline = baselineJson ? JSON.parse(baselineJson) : null;
    if (baseline) {
      return resolveBaselineSourceUrl(baseline, skillType);
    }
  } catch {
    // ignore invalid baseline
  }

  return '';
}

function buildSectionSourceUpdate(normalized, baselines = {}, sourceBaselines = {}, tempId, sectionId) {
  if (!sectionId) return null;

  const currentUrl = resolveSectionSourceUrlForSave({
    SkillType: normalized.SkillType,
    AudioUrl: normalized.AudioUrl,
    MaterialUrl: normalized.MaterialUrl,
  }) ?? '';
  const baselineUrl = resolveSectionSourceBaselineUrl(
    baselines,
    sourceBaselines,
    tempId,
    normalized.SkillType,
  );

  if (currentUrl === baselineUrl) return null;

  return {
    table: 'Question_Sections',
    sectionId,
    sourceUrl: currentUrl || null,
  };
}

function buildSectionUpdateSet(sectionPayload, baselines = {}, _sourceBaselines = {}, tempId) {
  const set = {};

  try {
    const baselineJson = baselines[tempId];
    const baseline = baselineJson ? JSON.parse(baselineJson) : null;

    if (baseline) {
      Object.entries(SECTION_FIELD_BASELINE_MAP).forEach(([baselineKey, apiKey]) => {
        const currentValue = sectionPayload[baselineKey] ?? null;
        const baselineValue = baseline[baselineKey] ?? null;
        if (String(currentValue ?? '') !== String(baselineValue ?? '')) {
          set[apiKey] = currentValue;
        }
      });
    }
  } catch {
    // ignore invalid baseline
  }

  return set;
}

function buildQuestionUpdatePatch(current, initial) {
  const currentPayload = buildTestQuestionPayload(current);
  const initialPayload = buildTestQuestionPayload(initial);
  const set = {};

  if (currentPayload.QuestionText !== initialPayload.QuestionText) {
    set.title = currentPayload.QuestionText;
  }
  if (currentPayload.isActive !== initialPayload.isActive) {
    set.isActive = currentPayload.isActive;
  }
  if (currentPayload.Score !== initialPayload.Score) {
    set.score = currentPayload.Score;
  }
  if (currentPayload.AllowMultipleAnswers !== initialPayload.AllowMultipleAnswers) {
    set.allowMultipleAnswers = currentPayload.AllowMultipleAnswers;
  }

  const choicesChanged =
    JSON.stringify(buildChoiceApiRows(current)) !== JSON.stringify(buildChoiceApiRows(initial));

  return {
    set,
    choicesReplace: choicesChanged ? buildChoiceApiRows(current) : null,
  };
}

function countChoicesReplace(questionsUpdate = []) {
  return questionsUpdate.filter((item) => Array.isArray(item.choicesReplace)).length;
}

function buildQuestionsDeleteRows(sectionId, currentQuestions, initialQuestions, deletedQuestions = []) {
  const rows = [];
  const seen = new Set();

  initialQuestions.forEach((initial) => {
    if (!isFilledTestQuestion(initial) || !initial.QuestionId) return;
    const stillExists = currentQuestions.some((question) => question.tempId === initial.tempId);
    if (stillExists) return;

    const questionId = Number(initial.QuestionId);
    if (!questionId || seen.has(questionId)) return;
    seen.add(questionId);
    rows.push({
      table: 'Questions',
      questionId,
      sectionId,
    });
  });

  deletedQuestions.forEach((deleted) => {
    const questionId = Number(deleted?.QuestionId);
    if (!questionId || seen.has(questionId)) return;
    seen.add(questionId);
    rows.push({
      table: 'Questions',
      questionId,
      sectionId,
    });
  });

  return rows;
}

/** Chỉ xóa câu hỏi — không đổi section / nguồn đề / nội dung câu còn lại. */
export function isQuestionBankDeleteOnlyPayload(payload) {
  if (!payload) return false;
  if ((payload.questionsDelete?.length ?? 0) === 0) return false;
  if (payload.sectionInsert || payload.sectionUpdate || payload.sectionSourceUpdate) return false;
  if ((payload.questionsInsert?.length ?? 0) > 0) return false;
  if ((payload.questionsUpdate?.length ?? 0) > 0) return false;
  return true;
}

/**
 * Payload lưu section — mỗi key map 1 thao tác DB đơn giản.
 * Backend xử lý theo thứ tự: sectionsDelete → questionsDelete → sectionSourceUpdate → sectionUpdate → questionsUpdate → sectionInsert/questionsInsert.
 */
export function buildQuestionBankSectionSavePayload(
  section,
  {
    courseId,
    pathId,
    questionPathId = null,
    sectionOrder,
  },
  baselines = {},
  sourceBaselines = {},
) {
  const { normalized, sectionPayload } = buildSectionPayloadForPreview(section, sectionOrder);
  const sectionId = normalized.SectionId ?? null;
  const currentQuestions = getFilledTestQuestions(normalized.Questions);
  const initialQuestions = normalized.InitialQuestions ?? [];

  const context = {
    courseId: Number(courseId) || null,
    pathId: Number(pathId) || null,
    questionPathId: questionPathId ?? null,
    sectionOrder: Number(sectionOrder) || 1,
    sectionId,
    sectionTempId: normalized.tempId ?? null,
    skillType: normalized.SkillType ?? null,
  };

  const payload = {
    context,
    summary: {
      sectionInsert: 0,
      sectionUpdate: 0,
      sectionSourceUpdate: 0,
      questionsInsert: 0,
      questionsUpdate: 0,
      questionsDelete: 0,
      sectionsDelete: 0,
    },
    sectionInsert: null,
    sectionUpdate: null,
    sectionSourceUpdate: null,
    questionsInsert: [],
    questionsUpdate: [],
    questionsDelete: [],
    sectionsDelete: [],
  };

  if (!sectionId) {
    payload.sectionInsert = {
      table: 'Question_Sections',
      data: {
        ...buildSectionApiData(normalized, sectionPayload),
        order: context.sectionOrder,
      },
      questions: currentQuestions.map((question, index) => ({
        table: 'Questions',
        clientRef: question.tempId,
        order: index + 1,
        data: buildQuestionApiData(question),
        choicesInsert: buildChoiceApiRows(question).map((choice) => ({
          table: 'Question_Choices',
          data: choice,
        })),
      })),
    };
    payload.summary.sectionInsert = 1;
    payload.summary.questionsInsert = currentQuestions.length;
    return payload;
  }

  const sectionUpdateSet = buildSectionUpdateSet(
    sectionPayload,
    baselines,
    sourceBaselines,
    normalized.tempId,
  );
  if (Object.keys(sectionUpdateSet).length > 0) {
    payload.sectionUpdate = {
      table: 'Question_Sections',
      sectionId,
      set: sectionUpdateSet,
    };
    payload.summary.sectionUpdate = 1;
  }

  const sectionSourceUpdate = buildSectionSourceUpdate(
    normalized,
    baselines,
    sourceBaselines,
    normalized.tempId,
    sectionId,
  );
  if (sectionSourceUpdate) {
    payload.sectionSourceUpdate = sectionSourceUpdate;
    payload.summary.sectionSourceUpdate = 1;
  }

  currentQuestions.forEach((question, index) => {
    if (!question.QuestionId) {
      payload.questionsInsert.push({
        table: 'Questions',
        sectionId,
        clientRef: question.tempId,
        order: index + 1,
        data: buildQuestionApiData(question),
        choicesInsert: buildChoiceApiRows(question).map((choice) => ({
          table: 'Question_Choices',
          data: choice,
        })),
      });
      return;
    }

    const initial = initialQuestions.find((item) => item.tempId === question.tempId);
    if (!initial) {
      payload.questionsInsert.push({
        table: 'Questions',
        sectionId,
        clientRef: question.tempId,
        order: index + 1,
        data: buildQuestionApiData(question),
        choicesInsert: buildChoiceApiRows(question).map((choice) => ({
          table: 'Question_Choices',
          data: choice,
        })),
      });
      return;
    }

    if (buildQuestionContentSnapshot(question) === buildQuestionContentSnapshot(initial)) {
      return;
    }

    const { set, choicesReplace } = buildQuestionUpdatePatch(question, initial);
    payload.questionsUpdate.push({
      table: 'Questions',
      questionId: question.QuestionId,
      sectionId,
      order: index + 1,
      set,
      ...(choicesReplace ? { choicesReplace } : {}),
    });
  });

  payload.questionsDelete = buildQuestionsDeleteRows(
    sectionId,
    currentQuestions,
    initialQuestions,
    normalized.DeletedQuestions ?? [],
  );

  payload.summary.questionsInsert = payload.questionsInsert.length;
  payload.summary.questionsUpdate = payload.questionsUpdate.length;
  payload.summary.questionsDelete = payload.questionsDelete.length;
  payload.summary.choicesReplace = countChoicesReplace(payload.questionsUpdate);

  return payload;
}
