const studentTestModel = require('../Models/studentTestModel');
const { allocateSectionCountsByChapterWeight } = require('./testPaperRandomService');

const SKILL_LISTENING = 'LISTENING';
const SKILL_READING = 'READING';

function cloneConfig(config = {}) {
  return JSON.parse(JSON.stringify(config));
}

function mapSectionStatRow(row = {}) {
  return {
    attemptSectionStatId: row.AttemptSectionStatId ?? row.attemptSectionStatId ?? null,
    attemptId: Number(row.AttemptId ?? row.attemptId) || null,
    courseId: Number(row.CourseId ?? row.courseId) || null,
    pathId: Number(row.PathId ?? row.pathId) || null,
    typeId: Number(row.TypeId ?? row.typeId) || null,
    skillType: String(row.SkillType ?? row.skillType ?? '').trim().toUpperCase() || null,
    sectionId: Number(row.SectionId ?? row.sectionId) || null,
    sectionTitle: row.SectionTitle ?? row.sectionTitle ?? null,
    correctCount: Number(row.CorrectCount ?? row.correctCount) || 0,
    wrongCount: Number(row.WrongCount ?? row.wrongCount) || 0,
    totalCount: Number(row.TotalCount ?? row.totalCount) || 0,
    createdAt: row.CreatedAt ?? row.createdAt ?? null,
  };
}

function pickLatestAttemptSectionStats(rows = []) {
  if (!rows.length) {
    return { attemptId: null, sectionStats: [] };
  }

  const sorted = rows.toSorted((a, b) => {
    const submittedA = new Date(a.SubmittedAt ?? a.StartedAt ?? 0).getTime();
    const submittedB = new Date(b.SubmittedAt ?? b.StartedAt ?? 0).getTime();
    if (submittedB !== submittedA) return submittedB - submittedA;
    return Number(b.AttemptId ?? 0) - Number(a.AttemptId ?? 0);
  });

  const latestAttemptId = Number(sorted[0]?.AttemptId);
  if (!latestAttemptId) {
    return { attemptId: null, sectionStats: [] };
  }

  return {
    attemptId: latestAttemptId,
    sectionStats: sorted
      .filter((row) => Number(row.AttemptId) === latestAttemptId)
      .map(mapSectionStatRow),
  };
}

/** Lấy stat lần làm bài toàn khóa gần nhất theo userId + testId. */
async function getLatestCourseTestAttemptStats({ userId, courseId, testId }) {
  const safeUserId = Number(userId);
  const safeCourseId = Number(courseId);

  if (!Number.isInteger(safeUserId) || safeUserId <= 0) {
    return { sectionStats: [], attemptId: null };
  }
  if (!Number.isInteger(safeCourseId) || safeCourseId <= 0) {
    return { sectionStats: [], attemptId: null };
  }

  const resolvedTestId = Number(testId)
    || await studentTestModel.getTestIdByCourseForFinal(safeCourseId);
  if (!resolvedTestId) {
    return { sectionStats: [], attemptId: null };
  }

  const rows = await studentTestModel.getSectionStatsByUserAndTest(safeUserId, resolvedTestId);
  return pickLatestAttemptSectionStats(rows);
}

/**
 * Bước 1 (Nghe/Đọc): tỷ lệ sai từng chương.
 * wrongRate = Σ wrongCount / Σ totalCount (mọi section cùng pathId + kỹ năng).
 */
function computeChapterWrongRatesBySkill(sectionStats = [], skillType) {
  const chapterMap = new Map();

  sectionStats.forEach((row) => {
    if (String(row.skillType ?? '').toUpperCase() !== skillType) return;

    const pathId = Number(row.pathId);
    if (!Number.isInteger(pathId) || pathId <= 0) return;

    if (!chapterMap.has(pathId)) {
      chapterMap.set(pathId, {
        pathId,
        wrongCount: 0,
        totalCount: 0,
      });
    }

    const bucket = chapterMap.get(pathId);
    bucket.wrongCount += Number(row.wrongCount) || 0;
    bucket.totalCount += Number(row.totalCount) || 0;
  });

  return Array.from(chapterMap.values())
    .map((item) => {
      const wrongRate = item.totalCount > 0 ? item.wrongCount / item.totalCount : 0;
      return {
        pathId: item.pathId,
        wrongCount: item.wrongCount,
        totalCount: item.totalCount,
        wrongRate,
        wrongRatePercent: Math.round(wrongRate * 100),
      };
    })
    .toSorted((a, b) => a.pathId - b.pathId);
}

/**
 * Bước 2 (Nghe/Đọc): trọng số chương = wrongRate.
 * Ví dụ C1=0.2, C2=0.35, C3=0.7, C4=0.4 → tổng = 1.65.
 */
function buildChapterWeightMap(chapterStats = []) {
  const weights = new Map();
  let weightTotal = 0;

  chapterStats.forEach((item) => {
    const weight = item.wrongRate;
    weights.set(item.pathId, weight);
    weightTotal += weight;
  });

  return { weights, weightTotal };
}

/** Tất cả chương cùng weight → dùng Test_Config gốc của mentor cho kỹ năng đó. */
function hasUniformChapterWeights(chapterStats = []) {
  if (chapterStats.length <= 1) {
    return chapterStats.length > 0;
  }

  const firstWeight = chapterStats[0].wrongRate;
  return chapterStats.every(
    (item) => Math.abs(item.wrongRate - firstWeight) < 1e-9,
  );
}

function getSectionCountForPart(config, part) {
  const entry = (config?.questionConfigs ?? []).find((item) => item.part === part);
  return Math.max(0, Number(entry?.sectionCount ?? 0) || 0);
}

/** Bước 3: phân bổ số section theo trọng số — weight/tổng × sectionCount mentor chọn. */
function buildSectionAllocationPreview(chapterStats = [], sectionCount = 0) {
  if (sectionCount <= 0 || chapterStats.length === 0) {
    return [];
  }

  const chapterEntries = chapterStats.map((item) => ({
    pathId: item.pathId,
    weight: item.wrongRate,
  }));
  const allocation = allocateSectionCountsByChapterWeight(chapterEntries, sectionCount);

  return Array.from(allocation.entries())
    .map(([pathId, count]) => ({
      pathId: Number(pathId),
      sectionCount: count,
      weight: chapterStats.find((item) => item.pathId === Number(pathId))?.wrongRate ?? 0,
    }))
    .toSorted((left, right) => left.pathId - right.pathId);
}

/**
 * Đề xuất config bài kiểm tra toàn khóa dựa trên stat lần làm gần nhất.
 *
 * @param {Array<{
 *   attemptSectionStatId: number|null,
 *   attemptId: number|null,
 *   courseId: number|null,
 *   pathId: number|null,
 *   typeId: number|null,           // 1=Nghe, 2=Đọc, 3=Từ vựng
 *   skillType: string|null,        // 'LISTENING' | 'READING' | 'VOCABULARY'
 *   sectionId: number|null,
 *   sectionTitle: string|null,
 *   correctCount: number,
 *   wrongCount: number,
 *   totalCount: number,
 *   createdAt: string|null,
 * }>} sectionStats
 *   Các dòng Test_Attempt_Section_Stats của lần làm đã nộp gần nhất
 *   (output từ getLatestCourseTestAttemptStats → sectionStats).
 *
 * @param {object} mentorConfig
 *   Config gốc mentor lưu trong Test_Config / Test_Config_Section, ví dụ:
 *   {
 *     id: number,                  // TestId
 *     courseId: number,
 *     chapterId: string,           // '__course__'
 *     title: string,
 *     enabled: boolean,
 *     timeLimitMinutes: number,
 *     passingScore: number,
 *     maxAttempts: number,
 *     selectedChapterIds: string[], // chương nguồn câu hỏi
 *     requiredChapterIds: string[],
 *     questionConfigs: [
 *       { part: 'LISTENING'|'READING', sectionCount: number, sectionQuestionCounts: [] },
 *       { part: 'VOCABULARY', sectionCount: 0, sectionQuestionCounts: [
 *         { sectionTempId: '12::section_5', questionCount: number }
 *       ]},
 *     ],
 *   }
 *
 * @returns {object} config cùng shape với mentorConfig — truyền thẳng vào buildCourseTestPaper().
 *   Bước 1: recommendationMeta.listeningChapterWrongRates / readingChapterWrongRates.
 *   Bước 2: chapterWeights (Map pathId → weight = wrongRate) + weightTotal theo kỹ năng.
 *   Bước 3: sectionAllocation — số section/chương = weight/tổng × sectionCount mentor.
 *   Nếu weight mọi chương bằng nhau (Nghe/Đọc) → giữ Test_Config mentor, không gắn chapterWeights.
 */
function recommendCourseTestFromStats(sectionStats, mentorConfig) {
  if (!Array.isArray(sectionStats) || sectionStats.length === 0 || !mentorConfig) {
    return mentorConfig;
  }

  const listeningChapterWrongRates = computeChapterWrongRatesBySkill(
    sectionStats,
    SKILL_LISTENING,
  );
  const readingChapterWrongRates = computeChapterWrongRatesBySkill(
    sectionStats,
    SKILL_READING,
  );

  const listeningWeights = buildChapterWeightMap(listeningChapterWrongRates);
  const readingWeights = buildChapterWeightMap(readingChapterWrongRates);

  const listeningSectionCount = getSectionCountForPart(mentorConfig, SKILL_LISTENING);
  const readingSectionCount = getSectionCountForPart(mentorConfig, SKILL_READING);

  const listeningUniform = hasUniformChapterWeights(listeningChapterWrongRates);
  const readingUniform = hasUniformChapterWeights(readingChapterWrongRates);

  const nextConfig = cloneConfig(mentorConfig);
  const chapterWeights = {};

  if (listeningWeights.weights.size > 0 && !listeningUniform) {
    chapterWeights[SKILL_LISTENING] = listeningWeights.weights;
  }
  if (readingWeights.weights.size > 0 && !readingUniform) {
    chapterWeights[SKILL_READING] = readingWeights.weights;
  }

  nextConfig.recommendationMeta = {
    ...(mentorConfig.recommendationMeta ?? {}),
    listeningChapterWrongRates,
    readingChapterWrongRates,
    listeningWeightTotal: listeningWeights.weightTotal,
    readingWeightTotal: readingWeights.weightTotal,
    listeningUseMentorConfig: listeningUniform || listeningChapterWrongRates.length === 0,
    readingUseMentorConfig: readingUniform || readingChapterWrongRates.length === 0,
    listeningSectionAllocation: listeningUniform
      ? []
      : buildSectionAllocationPreview(listeningChapterWrongRates, listeningSectionCount),
    readingSectionAllocation: readingUniform
      ? []
      : buildSectionAllocationPreview(readingChapterWrongRates, readingSectionCount),
  };

  if (Object.keys(chapterWeights).length > 0) {
    nextConfig.chapterWeights = chapterWeights;
  }

  return nextConfig;
}

module.exports = {
  getLatestCourseTestAttemptStats,
  recommendCourseTestFromStats,
  mapSectionStatRow,
};
