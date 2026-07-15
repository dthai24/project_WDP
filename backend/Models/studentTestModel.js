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
        SET Point = @score, Status = @status, IsPass = @isPass, SubmittedAt = GETDATE()
        WHERE AttemptId = @attemptId
    `);
    return true;
};

const getTestAttemptsHistory = async (userId, testId) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, Number(userId));
    request.input('testId', sql.Int, Number(testId));
    const result = await request.query(`
        SELECT AttemptId, StartedAt, SubmittedAt, Status, Point, IsPass, ScorePercentage 
        FROM dbo.Test_Attempts
        WHERE UserId = @userId AND TestId = @testId AND Status = 'submitted'
        ORDER BY AttemptId DESC
    `);
    return result.recordset;
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
// Lưu chi tiết lịch sử làm bài của học viên vào Database.
const saveTestAttemptAnswers = async (attemptId, questionResults) => {
    const { sql } = require('../config/db');
    const request = new sql.Request();
    
    // Nếu không có kết quả câu hỏi nào thì bỏ qua
    if (!questionResults || questionResults.length === 0) return true;
    let values = [];
    const safeAttemptId = Number(attemptId);
    for (const result of questionResults) {
        // Xử lý câu học viên bỏ trống (không chọn gì) -> gán mảng chứa giá trị null
        const choices = (result.userChoiceIds && result.userChoiceIds.length > 0) 
                        ? result.userChoiceIds 
                        : [null];
        
        const isCorrectBit = result.isCorrect ? 1 : 0;
        const qId = Number(result.questionId);
        for (const choiceId of choices) {
            // Nếu là null thì in chữ NULL ra cho câu SQL, ngược lại thì ép kiểu Số
            const cStr = choiceId === null ? 'NULL' : Number(choiceId);
            values.push(`(${safeAttemptId}, ${qId}, ${cStr}, ${isCorrectBit}, GETDATE())`);
        }
    }
    if (values.length > 0) {
        // Gộp lại thành 1 câu lệnh INSERT duy nhất
        const insertQuery = `
            INSERT INTO dbo.Test_Attempt_Answers (AttemptId, QuestionId, ChoiceId, IsCorrect, AnsweredAt)
            VALUES ${values.join(', ')};
        `;
        await request.query(insertQuery);
    }
    
    return true;
};
// lấy chi tiết các câu trả lời sai của học viên dựa vào AttemptId
const getWrongAnswersDetail = async (attemptId) => {
    const { sql } = require('../config/db');
    const request = new sql.Request();
    request.input('attemptId', sql.Int, Number(attemptId));
    
    const result = await request.query(`
        SELECT 
            t.PathId AS ChapterId,
            p.PathName AS ChapterName,
            q.SectionId,
            qs.Title AS SectionTitle,
            q.QuestionId,
            q.Title AS QuestionTitle,
            taa.ChoiceId AS UserChoiceId,
            qc.Title AS UserChoiceText,
            taa.IsCorrect
        FROM dbo.Test_Attempt_Answers taa
        JOIN dbo.Questions q ON taa.QuestionId = q.QuestionId
        JOIN dbo.Question_Sections qs ON q.SectionId = qs.SectionId
        JOIN dbo.Test_Attempts ta ON taa.AttemptId = ta.AttemptId
        JOIN dbo.Tests t ON ta.TestId = t.TestId
        LEFT JOIN dbo.Paths p ON t.PathId = p.PathId
        LEFT JOIN dbo.Question_Choices qc ON taa.ChoiceId = qc.ChoiceId
        WHERE taa.AttemptId = @attemptId 
          
    `);
    
    return result.recordset;
};

module.exports = {
    createTestAttempt,
    submitTestAttemptModel,
    getTestIdByCourseAndPath,   
    getTestInfoByAttempt,
    getAttemptCountByUserAndTest,
    getTestAttemptsHistory,
    saveTestAttemptAnswers, 
    getWrongAnswersDetail
};