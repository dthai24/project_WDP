const { sql } = require('../config/db');

const resolveQuestionPathId = async ({ courseId, pathId, questionPathId = null }) => {
  const request = new sql.Request();

  if (questionPathId) {
    request.input('questionPathId', sql.Int, Number(questionPathId));
    request.input('courseId', sql.Int, Number(courseId));
    request.input('pathId', sql.Int, Number(pathId));
    const result = await request.query(`
      SELECT TOP 1 qp.Question_Path_Id AS QuestionPathId
      FROM dbo.Questions_Path qp
      INNER JOIN dbo.Question_Bank qb ON qb.BankId = qp.BankId
      WHERE qp.Question_Path_Id = @questionPathId
        AND qb.CourseId = @courseId
        AND qp.PathId = @pathId
    `);
    if (result.recordset[0]?.QuestionPathId) {
      return result.recordset[0].QuestionPathId;
    }
    const error = new Error('questionPathId không thuộc course/path này.');
    error.statusCode = 400;
    throw error;
  }

  request.input('courseId', sql.Int, Number(courseId));
  request.input('pathId', sql.Int, Number(pathId));
  const result = await request.query(`
    SELECT TOP 1 qp.Question_Path_Id AS QuestionPathId
    FROM dbo.Questions_Path qp
    INNER JOIN dbo.Question_Bank qb ON qb.BankId = qp.BankId
    WHERE qb.CourseId = @courseId
      AND qp.PathId = @pathId
    ORDER BY qp.Question_Path_Id
  `);

  const resolved = result.recordset[0]?.QuestionPathId ?? null;
  if (!resolved) {
    const error = new Error('Chưa có Questions_Path cho chương này. Tạo question bank trước.');
    error.statusCode = 404;
    throw error;
  }
  return resolved;
};

const questionBelongsToSection = async (questionId, sectionId, transaction = null) => {
  const request = transaction ? new sql.Request(transaction) : new sql.Request();
  request.input('questionId', sql.Int, Number(questionId));
  request.input('sectionId', sql.Int, Number(sectionId));
  const result = await request.query(`
    SELECT TOP 1 QuestionId
    FROM dbo.Questions
    WHERE QuestionId = @questionId AND SectionId = @sectionId
  `);
  return result.recordset.length > 0;
};

const getSectionDeleteContext = async (sectionId, courseId, pathId) => {
  const request = new sql.Request();
  request.input('sectionId', sql.Int, Number(sectionId));
  request.input('courseId', sql.Int, Number(courseId));
  request.input('pathId', sql.Int, Number(pathId));
  const result = await request.query(`
    SELECT TOP 1
      qs.SectionId,
      qs.TypeId,
      qs.Question_Path_Id AS QuestionPathId
    FROM dbo.Question_Sections qs
    INNER JOIN dbo.Questions_Path qp ON qp.Question_Path_Id = qs.Question_Path_Id
    INNER JOIN dbo.Question_Bank qb ON qb.BankId = qp.BankId
    WHERE qs.SectionId = @sectionId
      AND qp.PathId = @pathId
      AND qb.CourseId = @courseId
  `);
  return result.recordset[0] ?? null;
};

const countSectionsByPathAndType = async (questionPathId, typeId, transaction = null) => {
  const request = transaction ? new sql.Request(transaction) : new sql.Request();
  request.input('questionPathId', sql.Int, Number(questionPathId));
  request.input('typeId', sql.Int, Number(typeId));
  const result = await request.query(`
    SELECT COUNT(*) AS SectionCount
    FROM dbo.Question_Sections
    WHERE Question_Path_Id = @questionPathId
      AND TypeId = @typeId
  `);
  return Number(result.recordset[0]?.SectionCount) || 0;
};

module.exports = {
  resolveQuestionPathId,
  questionBelongsToSection,
  getSectionDeleteContext,
  countSectionsByPathAndType,
};
