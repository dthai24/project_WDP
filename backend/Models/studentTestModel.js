const { sql } = require('../config/db');

// Hàm tạo một lượt làm bài mới
const createTestAttempt = async (userId, testId, remainingSeconds) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    request.input('testId', sql.Int, testId);
    
    // Tính thời gian hết hạn
    const expiresAt = new Date(Date.now() + remainingSeconds * 1000);
    request.input('expiresAt', sql.DateTime, expiresAt);

    // Vì AttemptId là INT tự tăng, ta không truyền ID vào mà dùng OUTPUT INSERTED để lấy ID mới tạo
     const result = await request.query(`
        INSERT INTO dbo.Test_Attempts (UserId, TestId, Point, StartedAt, ExpiresAt, Status, IsPass)
        OUTPUT INSERTED.AttemptId
        VALUES (@userId, @testId, 0, GETDATE(), @expiresAt, 'in_progress', 0)
    `);
    
    return {
        attemptId: result.recordset[0].AttemptId.toString(),
        startedAt: new Date(),
        expiresAt: expiresAt,
        status: 'in_progress'
    };
};

// Cập nhật điểm và nộp bài
const submitTestAttemptModel = async (attemptId, score, status, isPass = 0) => {
    const request = new sql.Request();
    request.input('attemptId', sql.Int, Number(attemptId));
    request.input('score', sql.Decimal(18,2), score);
    request.input('status', sql.VarChar, status);
    request.input('isPass', sql.Bit, isPass);

    await request.query(`
        UPDATE dbo.Test_Attempts 
        SET Point = @score, Status = @status, IsPass = @isPass
        WHERE AttemptId = @attemptId
    `);
    return true;
};
const getTestIdByCourseAndPath = async (courseId, pathId) => {
    const request = new sql.Request();
    request.input('courseId', sql.Int, Number(courseId));
    request.input('pathId', sql.Int, Number(pathId));
    const result = await request.query(`
        SELECT TOP 1 TestId 
        FROM dbo.Tests 
        WHERE CourseId = @courseId AND PathId = @pathId
    `);
    // Nếu có bài test, trả về ID. Nếu không có trả về null
    return result.recordset.length > 0 ? result.recordset[0].TestId : null;
};
// Lấy thông tin TestId, CourseId, PathId từ AttemptId

const getTestInfoByAttempt = async (attemptId) => {
    const request = new sql.Request();
    request.input('attemptId', sql.Int, Number(attemptId));
    const result = await request.query(`
        SELECT t.TestId, t.CourseId, t.PathId 
        FROM dbo.Test_Attempts ta
        INNER JOIN dbo.Tests t ON t.TestId = ta.TestId
        WHERE ta.AttemptId = @attemptId
    `);
    return result.recordset.length > 0 ? result.recordset[0] : null;
};
// Đếm số lần học viên đã làm bài test này
const getAttemptCountByUserAndTest = async (userId, testId) => {
    const { sql } = require('../config/db');
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    request.input('testId', sql.Int, testId);
    
    const result = await request.query(`
        SELECT COUNT(*) as count
        FROM dbo.Test_Attempts
        WHERE UserId = @userId AND TestId = @testId
    `);
    return result.recordset[0].count;
};
module.exports = {
    createTestAttempt,
    submitTestAttemptModel,
    getTestIdByCourseAndPath,   
    getTestInfoByAttempt,
    getAttemptCountByUserAndTest
};