const { sql } = require('../config/db');

const getAllListQuestionBankByMentorId = async (mentorId) => {
    try {
        const request = new sql.Request();
        request.input('mentorId', sql.Int, Number(mentorId));

        const result = await request.query(`
            SELECT c.CourseId,
                c.CourseName,
                c.Description AS CourseDescription,
                COUNT(DISTINCT q.QuestionId) AS TotalQuestion,
                COUNT(DISTINCT CASE WHEN q.IsActive = 1 THEN q.QuestionId END) AS TotalQuestionIsPublic,
                COUNT(DISTINCT qp.PathId) AS PathHasQuestion,
                qb.UpdatedAt,
                c.IsPublished,
                c.Thumbnail
            FROM Courses c
            RIGHT JOIN Question_Bank qb ON c.CourseId = qb.CourseId
            LEFT JOIN Questions_Path qp ON qp.BankId = qb.BankId
            LEFT JOIN Questions q ON q.Question_Path_Id = qp.Question_Path_Id
            GROUP BY c.CourseId,
                c.CourseName,
                c.Description,
                qp.PathId,
                qb.UpdatedAt,
                c.IsPublished,
                c.Thumbnail
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
            qs.TypeId,
            RTRIM(qt.Name) AS SkillType,
            qs.[Order] AS SectionOrder,
            COUNT(q.QuestionId) AS QuestionCount
        FROM dbo.Questions_Path qp
        INNER JOIN dbo.Question_Bank qb
            ON qb.BankId = qp.BankId
        INNER JOIN dbo.Question_Sections qs
            ON qs.Question_Path_Id = qp.Question_Path_Id
        INNER JOIN dbo.QuestionType qt
            ON qt.TypeId = qs.TypeId
        LEFT JOIN dbo.Questions q
            ON q.SectionId = qs.SectionId
           AND q.IsActive = 1
        WHERE qp.PathId = @pathId
          AND qb.CourseId = @courseId
        GROUP BY
            qp.Question_Path_Id,
            qs.SectionId,
            qs.SectionName,
            qs.TypeId,
            qt.Name,
            qs.[Order]
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
            q.TypeId,
            RTRIM(qt.Name) AS SkillType,
            q.URL,
            q.[Order] AS QuestionOrder,
            q.IsActive,
            qc.ChoiceId,
            qc.Title AS ChoiceTitle,
            qc.[Order] AS ChoiceOrder,
            qc.IsTrue
        FROM dbo.Questions q
        INNER JOIN dbo.QuestionType qt
            ON qt.TypeId = q.TypeId
        LEFT JOIN dbo.Question_Choices qc
            ON qc.QuestionId = q.QuestionId
        WHERE q.SectionId = @sectionId
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

module.exports = {
    getAllListQuestionBankByMentorId,
    getSectionsByPath,
    getQuestionsBySection,
    sectionBelongsToCoursePath,
};
