const { sql } = require('../config/db.js');

const getStudentsInCourseModel = async (courseId) => {
    const request = new sql.Request();

    request.input('courseId', sql.Int, Number(courseId));

    const result = await request.query(`
    SELECT 
      uc.UserId,
      u.FullName,
      u.Email,
      uc.CourseId,
      uc.ProgressPercentage,
      uc.EnrollmentDate
    FROM [LearningPath_Base].[dbo].[User_Courses] uc
    INNER JOIN [LearningPath_Base].[dbo].[Users] u
      ON uc.UserId = u.UserId
    WHERE uc.CourseId = @courseId
    ORDER BY uc.EnrollmentDate DESC
  `);

    return result.recordset;
};

module.exports = {
    getStudentsInCourseModel
}