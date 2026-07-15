const studentTestModel = require('../Models/studentTestModel');

const SKILL_LISTENING = 'LISTENING';
const SKILL_READING = 'READING';
const SKILL_VOCABULARY = 'VOCABULARY';

const TYPE_LISTENING = 1;
const TYPE_READING = 2;
const TYPE_VOCABULARY = 3;

function parseCourseSectionTempId(sectionTempId) {
  const raw = String(sectionTempId ?? '');
  const composite = raw.match(/^(\d+)::section_(\d+)$/);
  if (composite) {
    return {
      pathId: Number(composite[1]),
      sectionId: Number(composite[2]),
    };
  }
  const simple = raw.match(/^section_(\d+)$/);
  return {
    pathId: null,
    sectionId: simple ? Number(simple[1]) : null,
  };
}

function buildCourseSectionTempId(pathId, sectionId) {
  return `${pathId}::section_${sectionId}`;
}

function getPartConfig(config, part) {
  return (config?.questionConfigs ?? []).find((entry) => entry.part === part) ?? {};
}

function cloneConfig(config = {}) {
  return JSON.parse(JSON.stringify(config));
}

function getVocabularyEntries(config) {
  return (getPartConfig(config, SKILL_VOCABULARY).sectionQuestionCounts ?? [])
    .map((entry) => ({
      sectionTempId: String(entry.sectionTempId ?? ''),
      questionCount: Math.max(0, Number(entry.questionCount ?? 0) || 0),
    }))
    .filter((entry) => entry.sectionTempId && entry.questionCount > 0);
}

function getVocabularyTotal(config) {
  return getVocabularyEntries(config).reduce((sum, entry) => sum + entry.questionCount, 0);
}

function computeWrongRate(wrongCount, totalCount) {
  const wrong = Math.max(0, Number(wrongCount) || 0);
  const total = Math.max(0, Number(totalCount) || 0);
  if (total <= 0) return 0;
  return wrong / total;
}

function aggregateChapterSkillStats(statsRows = [], typeIds = []) {
  const allowed = new Set(typeIds);
  const chapterMap = new Map();

  statsRows.forEach((row) => {
    const typeId = Number(row.TypeId ?? row.typeId);
    if (!allowed.has(typeId)) return;

    const pathId = Number(row.PathId ?? row.pathId);
    if (!Number.isInteger(pathId) || pathId <= 0) return;

    if (!chapterMap.has(pathId)) {
      chapterMap.set(pathId, {
        pathId,
        correctCount: 0,
        wrongCount: 0,
        totalCount: 0,
      });
    }

    const bucket = chapterMap.get(pathId);
    bucket.correctCount += Number(row.CorrectCount ?? row.correctCount) || 0;
    bucket.wrongCount += Number(row.WrongCount ?? row.wrongCount) || 0;
    bucket.totalCount += Number(row.TotalCount ?? row.totalCount) || 0;
  });

  return Array.from(chapterMap.values()).map((item) => ({
    ...item,
    wrongRate: computeWrongRate(item.wrongCount, item.totalCount),
  }));
}

function buildChapterWeightMap(chapterStats = [], fallbackWeight = 1) {
  const weights = new Map();
  if (!chapterStats.length) return weights;

  chapterStats.forEach((item) => {
    // Chương sai nhiều hơn → trọng số cao hơn để được ưu tiên random thêm section/câu.
    const weight = 1 + item.wrongRate;
    weights.set(item.pathId, weight);
  });

  if (weights.size === 0) {
    chapterStats.forEach((item) => weights.set(item.pathId, fallbackWeight));
  }

  return weights;
}

function buildVocabularySectionStatMap(statsRows = []) {
  const map = new Map();

  statsRows
    .filter((row) => Number(row.TypeId ?? row.typeId) === TYPE_VOCABULARY)
    .forEach((row) => {
      const pathId = Number(row.PathId ?? row.pathId);
      const sectionId = Number(row.SectionId ?? row.sectionId);
      const { correctCount, wrongCount, totalCount } = readStatCounts(row);
      const stat = {
        pathId,
        sectionId,
        correctCount,
        wrongCount,
        totalCount,
        wrongRate: computeWrongRate(wrongCount, totalCount),
        isExtreme: hasExtremePerformance(correctCount, wrongCount, totalCount),
      };

      if (Number.isInteger(pathId) && pathId > 0 && Number.isInteger(sectionId) && sectionId > 0) {
        map.set(buildCourseSectionTempId(pathId, sectionId), stat);
      }
      if (Number.isInteger(sectionId) && sectionId > 0) {
        map.set(`section_${sectionId}`, stat);
      }
    });

  return map;
}

function getVocabularySectionStat(entry, sectionStatMap) {
  const parsed = parseCourseSectionTempId(entry.sectionTempId);
  const keys = [entry.sectionTempId];

  if (parsed.pathId != null && parsed.sectionId != null) {
    keys.push(buildCourseSectionTempId(parsed.pathId, parsed.sectionId));
  }
  if (parsed.sectionId != null) {
    keys.push(`section_${parsed.sectionId}`);
  }

  for (const key of keys) {
    if (sectionStatMap.has(key)) {
      return sectionStatMap.get(key);
    }
  }
  return null;
}

function isVocabularySectionLocked(entry, sectionStatMap) {
  const stat = getVocabularySectionStat(entry, sectionStatMap);
  return Boolean(stat?.isExtreme);
}

function redistributeVocabularyQuestionCounts(baseEntries, sectionStatMap, originalTotal) {
  if (!baseEntries.length || originalTotal <= 0) {
    return { entries: baseEntries, lockedSectionTempIds: [] };
  }

  const entries = baseEntries.map((entry) => ({
    ...entry,
    originalCount: entry.questionCount,
  }));

  const lockedSectionTempIds = [];
  const lockedEntries = [];
  const flexibleEntries = [];

  entries.forEach((entry) => {
    if (isVocabularySectionLocked(entry, sectionStatMap)) {
      entry.questionCount = entry.originalCount;
      lockedSectionTempIds.push(entry.sectionTempId);
      lockedEntries.push(entry);
    } else {
      flexibleEntries.push(entry);
    }
  });

  const lockedTotal = lockedEntries.reduce((sum, entry) => sum + entry.questionCount, 0);
  const flexiblePool = Math.max(0, originalTotal - lockedTotal);

  if (flexibleEntries.length === 0) {
    return {
      entries: entries.filter((entry) => entry.questionCount > 0),
      lockedSectionTempIds,
    };
  }

  if (flexiblePool <= 0) {
    flexibleEntries.forEach((entry) => {
      entry.questionCount = 0;
    });
    return {
      entries: entries.filter((entry) => entry.questionCount > 0),
      lockedSectionTempIds,
    };
  }

  const scored = flexibleEntries.map((entry) => {
    const stat = getVocabularySectionStat(entry, sectionStatMap);
    return {
      entry,
      wrongRate: stat?.wrongRate ?? 0,
      originalCount: entry.originalCount,
    };
  });

  const epsilon = 0.05;
  const weightSum = scored.reduce((sum, item) => sum + item.wrongRate + epsilon, 0);
  let allocated = 0;

  scored.forEach((item, index) => {
    if (index === scored.length - 1) {
      item.entry.questionCount = Math.max(0, flexiblePool - allocated);
      return;
    }
    const target = Math.round(((item.wrongRate + epsilon) / weightSum) * flexiblePool);
    item.entry.questionCount = target;
    allocated += target;
  });

  let currentTotal = entries.reduce((sum, entry) => sum + entry.questionCount, 0);
  const addOrder = [...flexibleEntries].sort((a, b) => {
    const rateA = getVocabularySectionStat(a, sectionStatMap)?.wrongRate ?? 0;
    const rateB = getVocabularySectionStat(b, sectionStatMap)?.wrongRate ?? 0;
    return rateB - rateA;
  });
  const removeOrder = [...addOrder].reverse();

  let guard = 0;
  while (currentTotal < originalTotal && guard < originalTotal * 4) {
    const target = addOrder[guard % addOrder.length];
    target.questionCount += 1;
    currentTotal += 1;
    guard += 1;
  }

  guard = 0;
  while (currentTotal > originalTotal && guard < originalTotal * 4) {
    const target = removeOrder[guard % removeOrder.length];
    if (target.questionCount > 0 && !lockedSectionTempIds.includes(target.sectionTempId)) {
      target.questionCount -= 1;
      currentTotal -= 1;
    }
    guard += 1;
  }

  return {
    entries: entries.filter((entry) => entry.questionCount > 0),
    lockedSectionTempIds,
  };
}

function buildRecommendedQuestionConfigs(baseConfig, statsRows = []) {
  const nextConfig = cloneConfig(baseConfig);
  const questionConfigs = nextConfig.questionConfigs ?? [];

  const listeningStats = aggregateChapterSkillStats(statsRows, [TYPE_LISTENING]);
  const readingStats = aggregateChapterSkillStats(statsRows, [TYPE_READING]);
  const vocabularyStats = aggregateChapterSkillStats(statsRows, [TYPE_VOCABULARY]);

  const listeningWeights = buildChapterWeightMap(listeningStats);
  const readingWeights = buildChapterWeightMap(readingStats);

  const vocabularySectionStatMap = buildVocabularySectionStatMap(statsRows);

  const originalVocabularyTotal = getVocabularyTotal(baseConfig);
  const baseVocabularyEntries = getVocabularyEntries(baseConfig);
  const vocabularyRedistribution = redistributeVocabularyQuestionCounts(
    baseVocabularyEntries,
    vocabularySectionStatMap,
    originalVocabularyTotal,
  );
  const recommendedVocabularyEntries = vocabularyRedistribution.entries;

  const recommendedVocabularyTotal = recommendedVocabularyEntries
    .reduce((sum, entry) => sum + entry.questionCount, 0);

  questionConfigs.forEach((partConfig) => {
    if (partConfig.part === SKILL_VOCABULARY) {
      partConfig.sectionQuestionCounts = recommendedVocabularyEntries.map((entry) => ({
        sectionTempId: entry.sectionTempId,
        questionCount: entry.questionCount,
      }));
      partConfig.sectionCount = 0;
    }
  });

  return {
    config: nextConfig,
    chapterWeights: {
      [SKILL_LISTENING]: listeningWeights,
      [SKILL_READING]: readingWeights,
    },
    recommendationMeta: {
      mode: 'recommended',
      sourceStatsCount: statsRows.length,
      listeningChapterStats: listeningStats,
      readingChapterStats: readingStats,
      vocabularyChapterStats: vocabularyStats,
      vocabularyLockedSections: vocabularyRedistribution.lockedSectionTempIds,
      vocabularyOriginalTotal: originalVocabularyTotal,
      vocabularyRecommendedTotal: recommendedVocabularyTotal,
    },
  };
}

async function hasSubmittedFinalCourseTest(userId, testId) {
  const count = await studentTestModel.getSubmittedAttemptCountByUserAndTest(userId, testId);
  return count > 0;
}

async function getLatestSubmittedFinalSectionStats(userId, testId) {
  const attemptId = await studentTestModel.getLatestSubmittedAttemptId(userId, testId);
  if (!attemptId) return [];

  return studentTestModel.getAttemptSectionStats(attemptId);
}

function readStatCounts(row) {
  const correctCount = Number(row.CorrectCount ?? row.correctCount) || 0;
  const wrongCount = Number(row.WrongCount ?? row.wrongCount) || 0;
  const totalCount = Number(row.TotalCount ?? row.totalCount) || 0;
  return { correctCount, wrongCount, totalCount };
}

function hasExtremePerformance(correctCount, wrongCount, totalCount) {
  if (totalCount <= 0) return false;
  return correctCount === totalCount || wrongCount === totalCount;
}

/**
 * Fallback toàn bài chỉ áp dụng Nghe/Đọc.
 * Từ vựng: section 100% đúng/sai được giữ nguyên số câu trong redistributeVocabularyQuestionCounts.
 */
function detectExtremePerformanceFallback(statsRows = []) {
  const listeningReadingRows = statsRows.filter((row) => {
    const typeId = Number(row.TypeId ?? row.typeId);
    return typeId === TYPE_LISTENING || typeId === TYPE_READING;
  });

  const triggers = [];

  listeningReadingRows.forEach((row) => {
    const { correctCount, wrongCount, totalCount } = readStatCounts(row);
    if (!hasExtremePerformance(correctCount, wrongCount, totalCount)) return;

    triggers.push({
      level: 'section',
      pathId: Number(row.PathId ?? row.pathId),
      sectionId: Number(row.SectionId ?? row.sectionId),
      typeId: Number(row.TypeId ?? row.typeId),
      skillType: row.SkillType ?? row.skillType ?? null,
      correctCount,
      wrongCount,
      totalCount,
      correctRate: correctCount / totalCount,
      wrongRate: wrongCount / totalCount,
    });
  });

  const chapterTotals = new Map();
  listeningReadingRows.forEach((row) => {
    const pathId = Number(row.PathId ?? row.pathId);
    if (!Number.isInteger(pathId) || pathId <= 0) return;

    if (!chapterTotals.has(pathId)) {
      chapterTotals.set(pathId, { correctCount: 0, wrongCount: 0, totalCount: 0 });
    }

    const bucket = chapterTotals.get(pathId);
    const counts = readStatCounts(row);
    bucket.correctCount += counts.correctCount;
    bucket.wrongCount += counts.wrongCount;
    bucket.totalCount += counts.totalCount;
  });

  chapterTotals.forEach((bucket, pathId) => {
    if (!hasExtremePerformance(bucket.correctCount, bucket.wrongCount, bucket.totalCount)) {
      return;
    }

    triggers.push({
      level: 'chapter',
      pathId: Number(pathId),
      sectionId: null,
      typeId: null,
      skillType: null,
      correctCount: bucket.correctCount,
      wrongCount: bucket.wrongCount,
      totalCount: bucket.totalCount,
      correctRate: bucket.correctCount / bucket.totalCount,
      wrongRate: bucket.wrongCount / bucket.totalCount,
    });
  });

  return {
    shouldFallback: triggers.length > 0,
    triggers,
  };
}

function applyBaseListeningReadingParts(targetConfig, baseConfig) {
  const targetParts = targetConfig?.questionConfigs ?? [];

  [SKILL_LISTENING, SKILL_READING].forEach((part) => {
    const basePart = getPartConfig(baseConfig, part);
    const targetIndex = targetParts.findIndex((entry) => entry.part === part);
    if (targetIndex < 0) return;

    targetParts[targetIndex] = {
      ...targetParts[targetIndex],
      sectionCount: Math.max(0, Number(basePart.sectionCount ?? 0) || 0),
      sectionQuestionCounts: [],
    };
  });

  targetConfig.questionConfigs = targetParts;
  return targetConfig;
}

function buildBaseGenerationPlan(courseId, testId, userId, reason, extra = {}) {
  return {
    mode: 'base',
    config: extra.baseConfig,
    chapterWeights: null,
    recommendationMeta: {
      mode: 'base',
      reason,
      courseId: Number(courseId),
      testId: Number(testId),
      userId: userId != null ? Number(userId) : null,
      ...extra.meta,
    },
  };
}

/**
 * Bước 1: kiểm tra lịch sử làm bài toàn khóa.
 * - Chưa từng làm: dùng config gốc.
 * - Đã từng làm: điều chỉnh config theo Test_Attempt_Section_Stats lần gần nhất.
 * - Section/chương Nghe/Đọc 100% đúng hoặc 100% sai: giữ config gốc phần Nghe/Đọc.
 * - Section Từ vựng 100% đúng/sai: giữ nguyên số câu section đó, chỉ điều chỉnh section còn lại.
 */
async function resolveCourseTestGenerationPlan({ userId, courseId, baseConfig, testId }) {
  if (!baseConfig || !testId || !userId) {
    return buildBaseGenerationPlan(courseId, testId, userId, 'missing_inputs', { baseConfig });
  }

  const hasHistory = await hasSubmittedFinalCourseTest(userId, testId);
  if (!hasHistory) {
    return buildBaseGenerationPlan(courseId, testId, userId, 'first_attempt', { baseConfig });
  }

  const statsRows = await getLatestSubmittedFinalSectionStats(userId, testId);
  if (!statsRows.length) {
    return buildBaseGenerationPlan(courseId, testId, userId, 'no_section_stats', { baseConfig });
  }

  const extremeCheck = detectExtremePerformanceFallback(statsRows);
  const recommended = buildRecommendedQuestionConfigs(baseConfig, statsRows);

  if (extremeCheck.shouldFallback) {
    const mergedConfig = applyBaseListeningReadingParts(
      cloneConfig(recommended.config),
      baseConfig,
    );

    return {
      mode: 'recommended',
      config: mergedConfig,
      chapterWeights: null,
      recommendationMeta: {
        ...recommended.recommendationMeta,
        reason: 'extreme_performance_lr',
        fallbackTriggers: extremeCheck.triggers,
        listeningReadingFallbackToBase: true,
        courseId: Number(courseId),
        testId: Number(testId),
        userId: Number(userId),
      },
    };
  }

  return {
    mode: 'recommended',
    config: recommended.config,
    chapterWeights: recommended.chapterWeights,
    recommendationMeta: {
      ...recommended.recommendationMeta,
      courseId: Number(courseId),
      testId: Number(testId),
      userId: Number(userId),
    },
  };
}

function mapWeightsToArray(weightMap) {
  if (!(weightMap instanceof Map)) return [];
  return [...weightMap.entries()]
    .map(([pathId, weight]) => ({
      pathId: Number(pathId),
      weight: Number(weight),
    }))
    .sort((a, b) => b.weight - a.weight);
}

function summarizeConfig(config = {}) {
  const listeningPart = getPartConfig(config, SKILL_LISTENING);
  const readingPart = getPartConfig(config, SKILL_READING);
  const vocabularyEntries = getVocabularyEntries(config);

  const vocabularyByChapter = new Map();
  vocabularyEntries.forEach((entry) => {
    const { pathId } = parseCourseSectionTempId(entry.sectionTempId);
    if (pathId == null) return;
    vocabularyByChapter.set(
      pathId,
      (vocabularyByChapter.get(pathId) || 0) + entry.questionCount,
    );
  });

  return {
    listeningSectionCount: Math.max(0, Number(listeningPart.sectionCount ?? 0) || 0),
    readingSectionCount: Math.max(0, Number(readingPart.sectionCount ?? 0) || 0),
    vocabularyTotal: getVocabularyTotal(config),
    vocabularyEntries,
    vocabularyByChapter: [...vocabularyByChapter.entries()].map(([pathId, questionCount]) => ({
      pathId: Number(pathId),
      questionCount,
    })),
  };
}

function buildVocabularyComparison(baseConfig, recommendedConfig, vocabularyStats = [], lockedSections = []) {
  const baseEntries = getVocabularyEntries(baseConfig);
  const recommendedEntries = getVocabularyEntries(recommendedConfig);
  const wrongRateByChapter = new Map(
    vocabularyStats.map((item) => [item.pathId, item.wrongRate]),
  );
  const lockedSet = new Set(lockedSections.map(String));

  const sectionKeys = new Set([
    ...baseEntries.map((entry) => entry.sectionTempId),
    ...recommendedEntries.map((entry) => entry.sectionTempId),
  ]);

  return [...sectionKeys].map((sectionTempId) => {
    const { pathId } = parseCourseSectionTempId(sectionTempId);
    const baseCount = baseEntries.find((entry) => entry.sectionTempId === sectionTempId)?.questionCount ?? 0;
    const recommendedCount = recommendedEntries.find((entry) => entry.sectionTempId === sectionTempId)?.questionCount ?? 0;

    return {
      sectionTempId,
      pathId,
      baseCount,
      recommendedCount,
      delta: recommendedCount - baseCount,
      chapterWrongRate: pathId != null ? (wrongRateByChapter.get(pathId) ?? 0) : 0,
      isLocked: lockedSet.has(String(sectionTempId)),
    };
  }).sort((a, b) => b.chapterWrongRate - a.chapterWrongRate || b.delta - a.delta);
}

function formatSectionStatsRows(rows = []) {
  return rows.map((row) => ({
    attemptId: row.AttemptId ?? row.attemptId ?? null,
    pathId: Number(row.PathId ?? row.pathId),
    typeId: Number(row.TypeId ?? row.typeId),
    skillType: row.SkillType ?? row.skillType,
    sectionId: Number(row.SectionId ?? row.sectionId),
    sectionTitle: row.SectionTitle ?? row.sectionTitle ?? '',
    correctCount: Number(row.CorrectCount ?? row.correctCount) || 0,
    wrongCount: Number(row.WrongCount ?? row.wrongCount) || 0,
    totalCount: Number(row.TotalCount ?? row.totalCount) || 0,
    wrongRate: computeWrongRate(row.WrongCount ?? row.wrongCount, row.TotalCount ?? row.totalCount),
  }));
}

async function getCourseTestRecommendationPreview({ userId, courseId, baseConfig, testId }) {
  const plan = await resolveCourseTestGenerationPlan({
    userId,
    courseId,
    baseConfig,
    testId,
  });

  const latestAttemptId = await studentTestModel.getLatestSubmittedAttemptId(userId, testId);
  const latestStatsRows = latestAttemptId
    ? await studentTestModel.getAttemptSectionStats(latestAttemptId)
    : [];

  const formattedStats = formatSectionStatsRows(latestStatsRows);
  const baseSummary = summarizeConfig(baseConfig);
  const recommendedSummary = summarizeConfig(plan.config);

  return {
    mode: plan.mode,
    reason: plan.recommendationMeta?.reason ?? plan.mode,
    hasSubmittedBefore: await hasSubmittedFinalCourseTest(userId, testId),
    latestAttemptId,
    fallbackTriggers: plan.recommendationMeta?.fallbackTriggers ?? [],
    baseConfigSummary: baseSummary,
    recommendedConfigSummary: recommendedSummary,
    previousSectionStats: formattedStats,
    listeningChapterStats: plan.recommendationMeta?.listeningChapterStats ?? [],
    readingChapterStats: plan.recommendationMeta?.readingChapterStats ?? [],
    vocabularyChapterStats: plan.recommendationMeta?.vocabularyChapterStats ?? [],
    chapterWeights: {
      listening: mapWeightsToArray(plan.chapterWeights?.[SKILL_LISTENING]),
      reading: mapWeightsToArray(plan.chapterWeights?.[SKILL_READING]),
    },
    vocabularyComparison: buildVocabularyComparison(
      baseConfig,
      plan.config,
      plan.recommendationMeta?.vocabularyChapterStats ?? [],
      plan.recommendationMeta?.vocabularyLockedSections ?? [],
    ),
    recommendationMeta: plan.recommendationMeta,
  };
}

module.exports = {
  resolveCourseTestGenerationPlan,
  getCourseTestRecommendationPreview,
  buildRecommendedQuestionConfigs,
  detectExtremePerformanceFallback,
  aggregateChapterSkillStats,
  buildChapterWeightMap,
  buildVocabularySectionStatMap,
  getVocabularySectionStat,
  isVocabularySectionLocked,
  redistributeVocabularyQuestionCounts,
  applyBaseListeningReadingParts,
  parseCourseSectionTempId,
  buildCourseSectionTempId,
  getVocabularyTotal,
  summarizeConfig,
};
