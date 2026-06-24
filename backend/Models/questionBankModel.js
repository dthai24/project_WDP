const { sql } = require('../config/db');

const getQuestionBankByMentorId = async (mentorId) => {
    const request = new sql.Request();
    request.input("mentorId", sql.Int, mentorId);
    const result = await request.query(
        `
        select BankId,qBank.CourseId, c.Thumbnail, qBank.InstructorId, qBank.CourseName, qBank.CourseDescription, qbank.BankDescription, qBank.UpdatedAt
from Question_Bank qBank
join Courses c
on qBank.CourseId = c.CourseId
where qBank.InstructorId = @mentorId
`,
    );
    return result.recordset;
}

module.exports = {
    getQuestionBankByMentorId
};
