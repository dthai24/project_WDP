const { sql } = require('../config/db');

// get Mentor's list question bank -> return Array Object
const getAllListQuestionBankByMentorId = async (mentorId) => {
    try {
        const request = new sql.Request();

        request.input('mentorId', sql.Int, Number(mentorId));

        const result = await request.query(`
  select c.CourseId,  
c.CourseName,
c.Description as CourseDescription,
count (DISTINCT q.QuestionId) as TotalQuestion,
    COUNT(DISTINCT CASE 
        WHEN q.IsActive = 1 THEN q.QuestionId 
    END) AS TotalQuestionIsPublic,
count(DISTINCT qp.PathId) as PathHasQuestion,
qb.UpdatedAt,
c.IsPublished,
c.Thumbnail

from Courses c
left join Question_Bank qb
on  c.CourseId = qb.CourseId
left join Questions_Path qp
on qp.BankId = qb.BankId
left join Questions q
on q.Question_Path_Id = qp.Question_Path_Id
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
        console.error(error.message)
        return []
    }
}

module.exports = {
    getAllListQuestionBankByMentorId
}