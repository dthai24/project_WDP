const { sql } = require('../config/db');

const getCourseComments = async (courseId) => {
    const request = new sql.Request();
    request.input('courseId', sql.Int, Number(courseId));
    const result = await request.query(`
        SELECT cc.CommentId,
               cc.CourseId,
               cc.UserId,
               cc.Rating,
               cc.Content,
               cc.CreatedAt,
               u.FullName,
               u.AvatarUrl
        FROM Course_Comments cc
        INNER JOIN Users u ON u.UserId = cc.UserId
        WHERE cc.CourseId = @courseId
        ORDER BY cc.CreatedAt DESC
    `);
    return result.recordset;
};

const createCourseComment = async ({ courseId, userId, rating, content }) => {
    const request = new sql.Request();
    request.input('courseId', sql.Int, Number(courseId));
    request.input('userId', sql.Int, Number(userId));
    request.input('rating', sql.TinyInt, rating ?? null);
    request.input('content', sql.NVarChar(sql.MAX), String(content).trim());

    const result = await request.query(`
        INSERT INTO Course_Comments (CourseId, UserId, Rating, Content, CreatedAt)
        OUTPUT INSERTED.CommentId, INSERTED.CourseId, INSERTED.UserId, INSERTED.Rating, INSERTED.Content, INSERTED.CreatedAt
        VALUES (@courseId, @userId, @rating, @content, GETDATE())
    `);

    const row = result.recordset[0];
    const userReq = new sql.Request();
    userReq.input('userId', sql.Int, Number(userId));
    const userResult = await userReq.query(`
        SELECT FullName, AvatarUrl FROM Users WHERE UserId = @userId
    `);

    return {
        ...row,
        FullName: userResult.recordset[0]?.FullName ?? 'Học viên',
        AvatarUrl: userResult.recordset[0]?.AvatarUrl ?? null,
    };
};

module.exports = {
    getCourseComments,
    createCourseComment,
};
