const studentTestModel = require('../Models/studentTestModel');

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

/** Lấy stat Test_Attempt_Section_Stats của lần làm bài toàn khóa gần nhất. */
async function getLatestCourseTestAttemptStats({ userId, courseId }) {
  const safeUserId = Number(userId);
  const safeCourseId = Number(courseId);

  if (!Number.isInteger(safeUserId) || safeUserId <= 0) {
    return { sectionStats: [], attemptId: null };
  }
  if (!Number.isInteger(safeCourseId) || safeCourseId <= 0) {
    return { sectionStats: [], attemptId: null };
  }

  const testId = await studentTestModel.getTestIdByCourseForFinal(safeCourseId);
  if (!testId) {
    return { sectionStats: [], attemptId: null };
  }

  const attemptId = await studentTestModel.getLatestSubmittedAttemptId(safeUserId, testId);
  if (!attemptId) {
    return { sectionStats: [], attemptId: null };
  }

  const rawRows = await studentTestModel.getAttemptSectionStats(attemptId);
  const sectionStats = (rawRows ?? []).map(mapSectionStatRow);

  return {
    sectionStats,
    attemptId: Number(attemptId),
  };
}

/**
 * Khung đề xuất bài kiểm tra toàn khóa — tự implement phần xử lý bên trong.
 *
 * @param {object[]} sectionStats - stat lần attempt gần nhất
 * @param {object} mentorConfig - config mentor gốc
 */
function recommendCourseTestFromStats(sectionStats, mentorConfig) {
  return mentorConfig;
}

module.exports = {
  getLatestCourseTestAttemptStats,
  recommendCourseTestFromStats,
  mapSectionStatRow,
};
