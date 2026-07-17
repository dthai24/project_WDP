const SKILL_LISTENING = 'LISTENING';
const SKILL_READING = 'READING';
const SKILL_VOCABULARY = 'VOCABULARY';

function isSectionUseForTest(section) {
  return section?.IsUseForTest !== false && section?.IsUseForTest !== 0;
}

function shuffleArray(items = []) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function getPartConfig(config, part) {
  return (config?.questionConfigs ?? []).find((entry) => entry.part === part) ?? {};
}

function getSectionCountForPart(config, part) {
  return Math.max(0, Number(getPartConfig(config, part).sectionCount ?? 0) || 0);
}

function getSectionQuestionCountsForPart(config, part) {
  return (getPartConfig(config, part).sectionQuestionCounts ?? [])
    .map((entry) => ({
      sectionTempId: String(entry.sectionTempId ?? ''),
      questionCount: Math.max(0, Number(entry.questionCount ?? 0) || 0),
    }))
    .filter((entry) => entry.sectionTempId);
}

function parseSectionIdFromTempId(sectionTempId) {
  const match = String(sectionTempId ?? '').match(/^section_(\d+)$/);
  return match ? Number(match[1]) : null;
}

function parseCourseSectionTempId(sectionTempId) {
  const raw = String(sectionTempId ?? '');
  const composite = raw.match(/^(\d+)::section_(\d+)$/);
  if (composite) {
    return {
      pathId: Number(composite[1]),
      sectionId: Number(composite[2]),
    };
  }
  return {
    pathId: null,
    sectionId: parseSectionIdFromTempId(raw),
  };
}

function buildQuestionsFromRows(rawQuestions = []) {
  const questionsMap = new Map();

  for (const row of rawQuestions) {
    if (row.IsUseForTest === false || row.IsUseForTest === 0) continue;

    if (!questionsMap.has(row.QuestionId)) {
      questionsMap.set(row.QuestionId, {
        tempId: row.QuestionId.toString(),
        questionText: row.Title,
        skillType: row.SkillType,
        options: [],
        correctCount: 0,
      });
    }

    if (row.ChoiceId) {
      const question = questionsMap.get(row.QuestionId);
      question.options.push({
        tempId: row.ChoiceId.toString(),
        optionText: row.ChoiceTitle,
      });
      if (row.IsTrue) question.correctCount += 1;
    }
  }

  return Array.from(questionsMap.values()).map((question) => {
    const next = {
      ...question,
      isMultipleChoice: question.correctCount > 1,
    };
    delete next.correctCount;
    return next;
  });
}

function pickWeightedWithoutReplacement(items, count, weightFn) {
  const pool = [...items];
  const picked = [];

  while (picked.length < count && pool.length > 0) {
    const totalWeight = pool.reduce((sum, item) => sum + Math.max(0, weightFn(item)), 0);
    if (totalWeight <= 0) {
      picked.push(...shuffleArray(pool).slice(0, count - picked.length));
      break;
    }

    let threshold = Math.random() * totalWeight;
    let selectedIndex = 0;
    for (let i = 0; i < pool.length; i += 1) {
      threshold -= Math.max(0, weightFn(pool[i]));
      if (threshold <= 0) {
        selectedIndex = i;
        break;
      }
    }

    picked.push(pool[selectedIndex]);
    pool.splice(selectedIndex, 1);
  }

  return picked;
}

function getSectionPathId(section) {
  const pathId = Number(section.PathId ?? section.pathId);
  return Number.isFinite(pathId) ? pathId : null;
}

function getChaptersFromCandidates(candidates = []) {
  const chapterMap = new Map();

  for (const section of candidates) {
    const pathId = getSectionPathId(section);
    if (pathId == null) continue;

    if (!chapterMap.has(pathId)) {
      const pathOrder = Number(section.PathOrder ?? section.pathOrder);
      chapterMap.set(pathId, {
        pathId,
        pathOrder: Number.isFinite(pathOrder) && pathOrder > 0 ? pathOrder : pathId,
      });
    }
  }

  return Array.from(chapterMap.values())
    .sort((left, right) => left.pathOrder - right.pathOrder || left.pathId - right.pathId);
}

function shouldDistributeEvenlyAcrossChapters(pickCount, chapterCount) {
  return pickCount > 0
    && chapterCount > 0
    && pickCount <= chapterCount
    && chapterCount % pickCount === 0;
}

function partitionChaptersIntoGroups(chapters, pickCount) {
  const groupSize = chapters.length / pickCount;
  const groups = [];

  for (let index = 0; index < pickCount; index += 1) {
    groups.push(chapters.slice(index * groupSize, (index + 1) * groupSize));
  }

  return groups;
}

function pickSectionsFromChapterGroup(groupChapters, candidates, pickCount, weightMap) {
  const pathIds = new Set(groupChapters.map((chapter) => chapter.pathId));
  const pool = candidates.filter((section) => pathIds.has(getSectionPathId(section)));

  if (pool.length === 0 || pickCount <= 0) {
    return [];
  }

  if (weightMap) {
    return pickWeightedWithoutReplacement(
      pool,
      Math.min(pickCount, pool.length),
      (section) => weightMap.get(getSectionPathId(section)) ?? 1,
    );
  }

  return shuffleArray(pool).slice(0, Math.min(pickCount, pool.length));
}

function pickEvenlyAcrossChapters(candidates, pickCount, weightMap) {
  const chapters = getChaptersFromCandidates(candidates);
  if (!shouldDistributeEvenlyAcrossChapters(pickCount, chapters.length)) {
    return null;
  }

  const chapterGroups = partitionChaptersIntoGroups(chapters, pickCount);
  const orderedCandidates = [];

  for (const group of chapterGroups) {
    orderedCandidates.push(
      ...pickSectionsFromChapterGroup(group, candidates, 1, weightMap),
    );
  }

  return orderedCandidates;
}

async function buildSectionPaperEntry(section, limitCount, pathId, loadQuestionsForSection) {
  const rawQuestions = await loadQuestionsForSection(section.SectionId);
  let questions = buildQuestionsFromRows(rawQuestions);
  questions = shuffleArray(questions);

  if (limitCount != null) {
    questions = questions.slice(0, limitCount);
  }

  if (questions.length === 0) {
    return null;
  }

  return {
    sectionId: section.SectionId.toString(),
    pathId: Number(pathId ?? section.PathId ?? section.pathId ?? 0) || null,
    pathName: section.PathName ?? section.pathName ?? null,
    pathOrder: (() => {
      const parsed = Number(section.PathOrder ?? section.pathOrder);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    })(),
    title: section.Title || section.SectionName,
    skillType: section.SkillType,
    audioUrl: section.SkillType === SKILL_LISTENING ? (section.SourceUrl || null) : null,
    readingUrl: section.SkillType === SKILL_READING ? (section.SourceUrl || null) : null,
    questions,
  };
}

async function pickListeningReadingSections(
  sectionsData,
  skill,
  pickCount,
  chapterWeights,
  loadQuestionsForSection,
) {
  if (pickCount <= 0) return [];

  const candidates = sectionsData.filter(
    (section) => section.SkillType === skill && isSectionUseForTest(section),
  );

  const weightMap = chapterWeights instanceof Map ? chapterWeights : null;
  const evenlyDistributedCandidates = pickEvenlyAcrossChapters(candidates, pickCount, weightMap);
  const orderedCandidates = evenlyDistributedCandidates ?? (
    weightMap
      ? pickWeightedWithoutReplacement(
        candidates,
        Math.min(pickCount, candidates.length),
        (section) => weightMap.get(getSectionPathId(section)) ?? 1,
      )
      : shuffleArray(candidates)
  );

  const picked = [];
  for (const section of orderedCandidates) {
    if (picked.length >= pickCount) break;

    const entry = await buildSectionPaperEntry(
      section,
      null,
      section.PathId ?? section.pathId ?? null,
      loadQuestionsForSection,
    );
    if (entry) {
      picked.push(entry);
    }
  }

  return picked;
}

function findVocabularySection(sectionsData, entry) {
  const parsed = parseCourseSectionTempId(entry.sectionTempId);
  if (!parsed.sectionId) return null;

  return sectionsData.find((item) => {
    if (parsed.pathId != null) {
      return Number(item.SectionId) === parsed.sectionId
        && Number(item.PathId) === parsed.pathId;
    }
    return Number(item.SectionId) === parsed.sectionId;
  }) ?? null;
}

async function pickVocabularySections(sectionsData, config, loadQuestionsForSection) {
  const entries = getSectionQuestionCountsForPart(config, SKILL_VOCABULARY)
    .filter((entry) => entry.questionCount > 0);

  const picked = [];

  for (const entry of entries) {
    const parsed = parseCourseSectionTempId(entry.sectionTempId);
    const section = findVocabularySection(sectionsData, entry);
    if (!section || !isSectionUseForTest(section)) continue;

    const paperEntry = await buildSectionPaperEntry(
      section,
      entry.questionCount,
      parsed.pathId ?? section.PathId ?? null,
      loadQuestionsForSection,
    );
    if (paperEntry) {
      picked.push(paperEntry);
    }
  }

  return picked;
}

function validatePaperAgainstConfig(config, formattedSections) {
  const errors = [];

  const listeningRequired = getSectionCountForPart(config, SKILL_LISTENING);
  const listeningPicked = formattedSections.filter((s) => s.skillType === SKILL_LISTENING).length;
  if (listeningRequired > 0 && listeningPicked < listeningRequired) {
    errors.push(
      `Không đủ section Nghe (cần ${listeningRequired}, có ${listeningPicked}).`,
    );
  }

  const readingRequired = getSectionCountForPart(config, SKILL_READING);
  const readingPicked = formattedSections.filter((s) => s.skillType === SKILL_READING).length;
  if (readingRequired > 0 && readingPicked < readingRequired) {
    errors.push(
      `Không đủ section Đọc (cần ${readingRequired}, có ${readingPicked}).`,
    );
  }

  for (const entry of getSectionQuestionCountsForPart(config, SKILL_VOCABULARY)) {
    if (entry.questionCount <= 0) continue;

    const parsed = parseCourseSectionTempId(entry.sectionTempId);
    const picked = formattedSections.find((section) => {
      if (parsed.pathId != null) {
        return Number(section.sectionId) === parsed.sectionId
          && Number(section.pathId) === parsed.pathId;
      }
      return Number(section.sectionId) === parsed.sectionId;
    });
    const pickedCount = picked?.questions?.length ?? 0;

    if (pickedCount < entry.questionCount) {
      errors.push(
        `Section từ vựng ${entry.sectionTempId} thiếu câu (cần ${entry.questionCount}, có ${pickedCount}).`,
      );
    }
  }

  return errors;
}

/**
 * Random đề thi theo config mentor.
 *
 * @param {object} config - Cấu hình bài test từ mentor (questionConfigs, ...)
 * @param {Array} sectionsData - Danh sách section từ ngân hàng câu hỏi
 * @param {object} [options]
 * @param {object} [options.chapterWeights] - Trọng số chương theo kỹ năng (tuỳ chọn)
 * @param {Function} options.loadQuestionsForSection - async (sectionId) => question rows
 * @returns {Promise<{ sections: Array, totalQuestions: number }>}
 */
async function randomizeTestPaperFromConfig(config, sectionsData, options = {}) {
  const { chapterWeights = {}, loadQuestionsForSection } = options;

  if (!config || !Array.isArray(config.questionConfigs)) {
    const error = new Error('Thiếu config bài kiểm tra từ mentor.');
    error.code = 'INSUFFICIENT_TEST_QUESTIONS';
    throw error;
  }

  if (!Array.isArray(sectionsData)) {
    const error = new Error('Thiếu dữ liệu section từ ngân hàng câu hỏi.');
    error.code = 'INSUFFICIENT_TEST_QUESTIONS';
    throw error;
  }

  if (typeof loadQuestionsForSection !== 'function') {
    throw new Error('loadQuestionsForSection is required');
  }

  const formattedSections = [];

  const listeningSections = await pickListeningReadingSections(
    sectionsData,
    SKILL_LISTENING,
    getSectionCountForPart(config, SKILL_LISTENING),
    chapterWeights[SKILL_LISTENING] ?? null,
    loadQuestionsForSection,
  );
  formattedSections.push(...listeningSections);

  const readingSections = await pickListeningReadingSections(
    sectionsData,
    SKILL_READING,
    getSectionCountForPart(config, SKILL_READING),
    chapterWeights[SKILL_READING] ?? null,
    loadQuestionsForSection,
  );
  formattedSections.push(...readingSections);

  const vocabularySections = await pickVocabularySections(
    sectionsData,
    config,
    loadQuestionsForSection,
  );
  formattedSections.push(...vocabularySections);

  const validationErrors = validatePaperAgainstConfig(config, formattedSections);
  if (validationErrors.length > 0) {
    const error = new Error(validationErrors.join(' '));
    error.code = 'INSUFFICIENT_TEST_QUESTIONS';
    throw error;
  }

  const totalQuestions = formattedSections.reduce(
    (sum, section) => sum + (section.questions?.length ?? 0),
    0,
  );

  return { sections: formattedSections, totalQuestions };
}

module.exports = {
  randomizeTestPaperFromConfig,
};
