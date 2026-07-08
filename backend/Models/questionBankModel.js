const { sql } = require('../config/db');



const getAllListQuestionBankByMentorId = async (mentorId) => {
    try {
        const request = new sql.Request();
        request.input('mentorId', sql.Int, Number(mentorId));
        const result = await request.query(`
            SELECT
                c.CourseId,
                qb.BankId,
                c.CourseName,
                c.Description AS CourseDescription,
                COUNT(DISTINCT q.QuestionId) AS TotalQuestion,
                COUNT(DISTINCT CASE WHEN q.IsActive = 1 THEN q.QuestionId END) AS TotalQuestionIsPublic,
                COUNT(DISTINCT CASE WHEN q.QuestionId IS NOT NULL THEN qp.PathId END) AS PathHasQuestion,
                qb.UpdatedAt,
                c.IsPublished,
                c.Thumbnail
            FROM dbo.Question_Bank qb
            INNER JOIN dbo.Courses c ON c.CourseId = qb.CourseId
            LEFT JOIN dbo.Questions_Path qp ON qp.BankId = qb.BankId
            LEFT JOIN dbo.Question_Sections qs ON qs.Question_Path_Id = qp.Question_Path_Id
            LEFT JOIN dbo.Questions q ON q.SectionId = qs.SectionId
            WHERE qb.InstructorId = @mentorId
            GROUP BY
                c.CourseId,
                qb.BankId,
                c.CourseName,
                c.Description,
                qb.UpdatedAt,
                c.IsPublished,
                c.Thumbnail
            ORDER BY qb.UpdatedAt DESC, c.CourseId DESC
        `);
        return result.recordset;
    } catch (error) {
        console.error(error.message);
        return [];
    }

};



const getSectionsByPath = async (courseId, pathId) => {
    const request = new sql.Request();
    request.input('courseId', sql.Int, Number(courseId));
    request.input('pathId', sql.Int, Number(pathId));
    const result = await request.query(`
        SELECT
            qp.Question_Path_Id AS QuestionPathId,
            qs.SectionId,
            qs.SectionName,
            qs.Title,
            qs.TypeId,
            RTRIM(st.Name) AS SkillType,
            qs.[Order] AS SectionOrder,
            qs.SourceUrl,
            qs.IsUseForTest,
            COUNT(q.QuestionId) AS QuestionCount

        FROM dbo.Questions_Path qp
        INNER JOIN dbo.Question_Bank qb
            ON qb.BankId = qp.BankId
        INNER JOIN dbo.Question_Sections qs
            ON qs.Question_Path_Id = qp.Question_Path_Id
        INNER JOIN dbo.Section_Type st
            ON st.TypeId = qs.TypeId
        LEFT JOIN dbo.Questions q
            ON q.SectionId = qs.SectionId
           AND q.IsActive = 1
        WHERE qp.PathId = @pathId
          AND qb.CourseId = @courseId
        GROUP BY
            qp.Question_Path_Id,
            qs.SectionId,
            qs.SectionName,
            qs.Title,
            qs.TypeId,
            st.Name,
            qs.[Order],
            qs.SourceUrl,
            qs.IsUseForTest
        ORDER BY qs.[Order], qs.SectionId
    `);
    return result.recordset;
};



const getQuestionsBySection = async (sectionId) => {
    const request = new sql.Request();
    request.input('sectionId', sql.Int, Number(sectionId));
    const result = await request.query(`
        SELECT
            q.QuestionId,
            q.SectionId,
            q.Title,
            qs.TypeId,
            RTRIM(st.Name) AS SkillType,
            qs.SourceUrl AS SourceUrl,
            q.[Order] AS QuestionOrder,
            q.IsActive,
            q.IsUseForTest,
            qc.ChoiceId,
            qc.Title AS ChoiceTitle,
            qc.[Order] AS ChoiceOrder,
            qc.IsTrue

        FROM dbo.Questions q
        INNER JOIN dbo.Question_Sections qs
            ON qs.SectionId = q.SectionId
        INNER JOIN dbo.Section_Type st
            ON st.TypeId = qs.TypeId
        LEFT JOIN dbo.Question_Choices qc
            ON qc.QuestionId = q.QuestionId
        WHERE q.SectionId = @sectionId
          AND q.IsActive = 1
        ORDER BY q.[Order], q.QuestionId, qc.[Order], qc.ChoiceId
    `);
    return result.recordset;
};



const sectionBelongsToCoursePath = async (sectionId, courseId, pathId) => {
    const request = new sql.Request();
    request.input('sectionId', sql.Int, Number(sectionId));
    request.input('courseId', sql.Int, Number(courseId));
    request.input('pathId', sql.Int, Number(pathId));
    const result = await request.query(`
        SELECT TOP 1 qs.SectionId
        FROM dbo.Question_Sections qs
        INNER JOIN dbo.Questions_Path qp
            ON qp.Question_Path_Id = qs.Question_Path_Id
        INNER JOIN dbo.Question_Bank qb
            ON qb.BankId = qp.BankId
        WHERE qs.SectionId = @sectionId
          AND qp.PathId = @pathId
          AND qb.CourseId = @courseId
    `);
    return result.recordset.length > 0;
};

// get information question bank by it's id
const getQuestionBankByIdModel = async (bankId) => {
    const request = new sql.Request();
    request.input("bankId", sql.Int, Number(bankId));
    const result = await request.query(`
        SELECT TOP (1000) [BankId]
      ,[InstructorId]
      ,[CourseId]
      ,[CourseName]
      ,[CourseDescription]
      ,[BankDescription]
      ,[CreatedAt]
      ,[UpdatedAt]
      ,[IsPublished]
  FROM [LearningPath_Base].[dbo].[Question_Bank]
Where BankId = @bankId
        `);
    return result.recordset
}

// get question bank paths by bank's id
const getQuestionBankPathsByBankIdModel = async (bankId) => {
    const request = new sql.Request();
    request.input('bankId', sql.Int, Number(bankId));
    const result = await request.query(
        `
  SELECT [Question_Path_Id]
      ,[BankId]
      ,[PathId]
  FROM [LearningPath_Base].[dbo].[Questions_Path]
  Where BankId = @bankId
        `
    )

    return result.recordset
}

const updateQuestionUseForTestById = async (questionId, isUseForTest) => {
    const request = new sql.Request();
    request.input('questionId', sql.Int, Number(questionId));
    request.input('isUseForTest', sql.Bit, isUseForTest ? 1 : 0);
    const result = await request.query(`
        UPDATE dbo.Questions
        SET IsUseForTest = @isUseForTest
        WHERE QuestionId = @questionId
          AND IsActive = 1
    `);
    return Number(result.rowsAffected?.[0] || 0) > 0;
}

module.exports = {
    getAllListQuestionBankByMentorId,
    getSectionsByPath,
    getQuestionsBySection,
    sectionBelongsToCoursePath,
    getQuestionBankByIdModel,
    getQuestionBankPathsByBankIdModel,
    updateQuestionUseForTestById
};

