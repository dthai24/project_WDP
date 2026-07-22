const mongoose = require('mongoose');
const Test = require('../models/MongoDB/Test');
const TestAttempt = require('../models/MongoDB/TestAttempt');
const TestQuestion = require('../models/MongoDB/TestQuestion');
const TestQuestionChoice = require('../models/MongoDB/TestQuestionChoice');
const TestQuestionCollection = require('../models/MongoDB/TestQuestionCollection');
const Path = require('../models/MongoDB/Path');
const Course = require('../models/MongoDB/Course');

// GET /api/courses/:courseId/tests/:scope/meta?chapterId=
const getTestMeta = async (req, res) => {
  try {
    const { courseId, scope } = req.params;
    const { chapterId } = req.query;
    const userId = req.headers['x-user-id'] || req.query.userId;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Thiếu courseId' });
    }

    let query = { courseId };
    if (scope === 'final') {
      // Find the last test of the course
      const paths = await Path.find({ courseId }).sort({ order: -1 }).lean();
      if (paths.length > 0) {
        query.pathId = paths[0]._id; // Use first or last path as fallback
      }
    } else if (chapterId && mongoose.Types.ObjectId.isValid(chapterId)) {
      query.pathId = chapterId;
    }

    let test = await Test.findOne(query).lean();
    if (!test) {
      // Auto-create or fallback if no test is found
      const path = await Path.findOne({ courseId });
      if (!path) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy chương nào trong khóa học này.' });
      }
      test = await Test.create({
        courseId,
        pathId: path._id
      });
    }

    // Count attempts
    let attemptsCount = 0;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      attemptsCount = await TestAttempt.countDocuments({ userId, testId: test._id });
    }

    // Get collection questions count
    let totalQuestions = 0;
    const collection = await TestQuestionCollection.findOne({ testId: test._id }).lean();
    if (collection) {
      totalQuestions = await TestQuestion.countDocuments({ collectionId: collection._id });
    }

    const timeLimitMinutes = scope === 'final' ? 30 : 15;
    const maxAttempts = 3;

    return res.status(200).json({
      ok: true,
      meta: {
        title: scope === 'final' ? 'Bài kiểm tra cuối khóa' : 'Bài kiểm tra chương',
        scope,
        courseId,
        chapterId: chapterId || null,
        timeLimitMinutes,
        passingScore: 70,
        maxAttempts,
        totalQuestions,
        attemptsUsed: attemptsCount,
        remainingAttempts: Math.max(0, maxAttempts - attemptsCount),
        enabled: true
      }
    });
  } catch (error) {
    console.error('getTestMeta error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin bài thi' });
  }
};

// POST /api/courses/:courseId/tests/:scope/start
const startTestAttempt = async (req, res) => {
  try {
    const { courseId, scope } = req.params;
    const { chapterId } = req.query;
    const userId = req.headers['x-user-id'] || req.body.userId;

    if (!courseId || !userId) {
      return res.status(400).json({ success: false, message: 'Thiếu courseId hoặc userId' });
    }

    let query = { courseId };
    if (scope === 'final') {
      const paths = await Path.find({ courseId }).sort({ order: -1 }).lean();
      if (paths.length > 0) {
        query.pathId = paths[0]._id;
      }
    } else if (chapterId && mongoose.Types.ObjectId.isValid(chapterId)) {
      query.pathId = chapterId;
    }

    let test = await Test.findOne(query).lean();
    if (!test) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cấu hình bài thi.' });
    }

    // Get collection & questions
    const collection = await TestQuestionCollection.findOne({ testId: test._id }).lean();
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi bài thi.' });
    }

    const questions = await TestQuestion.find({ collectionId: collection._id }).lean();
    const formattedQuestions = [];

    for (const q of questions) {
      const choices = await TestQuestionChoice.find({ questionId: q._id }).sort({ order: 1 }).lean();
      formattedQuestions.push({
        tempId: q._id.toString(),
        questionType: 'MULTIPLE_CHOICE',
        questionText: q.title,
        allowMultipleAnswers: false,
        order: q.order || 0,
        options: choices.map(c => ({
          tempId: c._id.toString(),
          optionText: c.title
        })),
        audioUrl: q.url || null
      });
    }

    const attemptsCount = await TestAttempt.countDocuments({ userId, testId: test._id });
    const timeLimitMinutes = scope === 'final' ? 30 : 15;
    const maxAttempts = 3;

    if (attemptsCount >= maxAttempts) {
      return res.status(400).json({ success: false, message: 'Bạn đã hết lượt làm bài thi này.' });
    }

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + timeLimitMinutes * 60 * 1000);
    
    // Create new attempt record in DB
    const newAttempt = await TestAttempt.create({
      userId,
      testId: test._id,
      point: 0
    });

    const testMeta = {
      title: scope === 'final' ? 'Bài kiểm tra cuối khóa' : 'Bài kiểm tra chương',
      scope,
      courseId,
      chapterId: chapterId || null,
      timeLimitMinutes,
      passingScore: 70,
      maxAttempts,
      totalQuestions: formattedQuestions.length,
      attemptsUsed: attemptsCount + 1,
      remainingAttempts: Math.max(0, maxAttempts - (attemptsCount + 1)),
      enabled: true
    };

    return res.status(200).json({
      ok: true,
      meta: testMeta,
      attempt: {
        attemptId: newAttempt._id.toString(),
        status: 'in_progress',
        startedAt: startedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        remainingSeconds: timeLimitMinutes * 60,
        timeLimitMinutes
      },
      paper: {
        paperId: test._id.toString(),
        totalQuestions: formattedQuestions.length,
        totalScore: 100,
        scoringMode: 'all_or_nothing',
        sections: [
          {
            skillType: 'LISTENING',
            displayName: 'Nghe & Hiểu',
            score: 100,
            questionGroups: [
              {
                groupId: 'group_main',
                displayName: 'Phần trắc nghiệm',
                questions: formattedQuestions
              }
            ]
          }
        ]
      }
    });
  } catch (error) {
    console.error('startTestAttempt error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi bắt đầu làm bài' });
  }
};

// POST /api/courses/:courseId/tests/attempts/:attemptId/submit
const submitTestAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;
    const userId = req.headers['x-user-id'] || req.body.userId;

    if (!attemptId || !userId) {
      return res.status(400).json({ success: false, message: 'Thiếu attemptId hoặc userId' });
    }

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phiên làm bài.' });
    }

    const test = await Test.findById(attempt.testId).lean();
    if (!test) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cấu hình bài thi.' });
    }

    const collection = await TestQuestionCollection.findOne({ testId: test._id }).lean();
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi.' });
    }

    const questions = await TestQuestion.find({ collectionId: collection._id }).lean();
    
    let correctCount = 0;
    const totalQuestions = questions.length;

    for (const q of questions) {
      const correctChoice = await TestQuestionChoice.findOne({ questionId: q._id, isTrue: true }).lean();
      const userSelected = answers[q._id.toString()]; // Expect array of string IDs from frontend

      if (correctChoice && userSelected && userSelected.includes(correctChoice._id.toString())) {
        correctCount++;
      }
    }

    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const scorePoints = scorePercentage; // Out of 100
    
    // Update score in DB
    attempt.point = scorePoints;
    await attempt.save();

    const attemptsCount = await TestAttempt.countDocuments({ userId, testId: test._id });
    const maxAttempts = 3;
    const remainingAttempts = Math.max(0, maxAttempts - attemptsCount);

    return res.status(200).json({
      ok: true,
      meta: {
        title: 'Kết quả bài thi',
        maxAttempts,
        attemptsUsed: attemptsCount,
        remainingAttempts,
        enabled: true
      },
      attempt: {
        attemptId: attempt._id.toString(),
        status: 'submitted',
        submittedAt: new Date().toISOString()
      },
      result: {
        score: scorePoints,
        percentage: scorePercentage,
        passed: scorePercentage >= 70,
        passingScore: 70,
        timeSpentSeconds: 120, // dummy
        correctCount,
        total: totalQuestions,
        canRetry: remainingAttempts > 0,
        remainingAttempts
      }
    });
  } catch (error) {
    console.error('submitTestAttempt error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi nộp bài thi' });
  }
};

// ============================================================
// Mentor CRUD — quản lý câu hỏi bài kiểm tra cuối khóa (scope='final')
// ============================================================

async function assertMentorOwnsCourse(courseId, userId) {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return { ok: false, status: 400, message: 'courseId không hợp lệ.' };
  }
  const course = await Course.findById(courseId).select('instructorId').lean();
  if (!course) {
    return { ok: false, status: 404, message: 'Không tìm thấy khóa học.' };
  }
  if (userId && String(course.instructorId) !== String(userId)) {
    return { ok: false, status: 403, message: 'Bạn không có quyền quản lý bài kiểm tra của khóa học này.' };
  }
  return { ok: true, course };
}

// Tìm hoặc tạo Test cho scope='final' của khóa học (giống logic trong getTestMeta)
async function findOrCreateFinalTest(courseId) {
  const paths = await Path.find({ courseId }).sort({ order: -1 }).lean();
  if (paths.length === 0) return null;

  let test = await Test.findOne({ courseId, pathId: paths[0]._id });
  if (!test) {
    test = await Test.create({ courseId, pathId: paths[0]._id });
  }
  return test;
}

async function findOrCreateCollection(testId) {
  let collection = await TestQuestionCollection.findOne({ testId });
  if (!collection) {
    collection = await TestQuestionCollection.create({ testId });
  }
  return collection;
}

const QuestionType = require('../models/MongoDB/QuestionType');
async function getDefaultQuestionType() {
  let type = await QuestionType.findOne({ name: 'MC' });
  if (!type) type = await QuestionType.create({ name: 'MC' });
  return type;
}

// GET /api/courses/:courseId/tests/final/questions — mentor xem toàn bộ câu hỏi + đáp án
const listTestQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.headers['x-user-id'] || req.query.userId;

    const ownership = await assertMentorOwnsCourse(courseId, userId);
    if (!ownership.ok) return res.status(ownership.status).json({ success: false, message: ownership.message });

    const test = await findOrCreateFinalTest(courseId);
    if (!test) return res.status(404).json({ success: false, message: 'Khóa học chưa có chương nào, không thể tạo bài kiểm tra.' });

    const collection = await findOrCreateCollection(test._id);
    const questions = await TestQuestion.find({ collectionId: collection._id }).lean();

    const formatted = [];
    for (const q of questions) {
      const choices = await TestQuestionChoice.find({ questionId: q._id }).sort({ order: 1 }).lean();
      formatted.push({
        id: q._id.toString(),
        question: q.title,
        explanation: q.explanation || '',
        options: choices.map((c) => ({
          id: c._id.toString(),
          label: c.title,
          correct: c.isTrue,
        })),
      });
    }

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('listTestQuestions error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách câu hỏi' });
  }
};

// POST /api/courses/:courseId/tests/final/questions — tạo câu hỏi mới
const createTestQuestion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.headers['x-user-id'] || req.body.userId;
    const { question, explanation, options } = req.body;

    const ownership = await assertMentorOwnsCourse(courseId, userId);
    if (!ownership.ok) return res.status(ownership.status).json({ success: false, message: ownership.message });

    if (!question || !Array.isArray(options) || options.length < 2 || !options.some((o) => o.correct)) {
      return res.status(400).json({ success: false, message: 'Cần có nội dung câu hỏi, ít nhất 2 đáp án và 1 đáp án đúng.' });
    }

    const test = await findOrCreateFinalTest(courseId);
    if (!test) return res.status(404).json({ success: false, message: 'Khóa học chưa có chương nào, không thể tạo bài kiểm tra.' });
    const collection = await findOrCreateCollection(test._id);
    const questionType = await getDefaultQuestionType();

    const newQuestion = await TestQuestion.create({
      collectionId: collection._id,
      title: question,
      typeId: questionType._id,
      explanation: explanation || '',
    });

    for (let i = 0; i < options.length; i++) {
      await TestQuestionChoice.create({
        questionId: newQuestion._id,
        title: options[i].label,
        order: i + 1,
        isTrue: Boolean(options[i].correct),
      });
    }

    return res.status(201).json({ success: true, message: 'Đã thêm câu hỏi.', data: { id: newQuestion._id.toString() } });
  } catch (error) {
    console.error('createTestQuestion error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tạo câu hỏi' });
  }
};

// PUT /api/courses/:courseId/tests/final/questions/:questionId — sửa câu hỏi
const updateTestQuestion = async (req, res) => {
  try {
    const { courseId, questionId } = req.params;
    const userId = req.headers['x-user-id'] || req.body.userId;
    const { question, explanation, options } = req.body;

    const ownership = await assertMentorOwnsCourse(courseId, userId);
    if (!ownership.ok) return res.status(ownership.status).json({ success: false, message: ownership.message });

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ success: false, message: 'questionId không hợp lệ.' });
    }
    const existing = await TestQuestion.findById(questionId);
    if (!existing) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi.' });

    if (!question || !Array.isArray(options) || options.length < 2 || !options.some((o) => o.correct)) {
      return res.status(400).json({ success: false, message: 'Cần có nội dung câu hỏi, ít nhất 2 đáp án và 1 đáp án đúng.' });
    }

    existing.title = question;
    existing.explanation = explanation || '';
    await existing.save();

    await TestQuestionChoice.deleteMany({ questionId: existing._id });
    for (let i = 0; i < options.length; i++) {
      await TestQuestionChoice.create({
        questionId: existing._id,
        title: options[i].label,
        order: i + 1,
        isTrue: Boolean(options[i].correct),
      });
    }

    return res.status(200).json({ success: true, message: 'Đã cập nhật câu hỏi.' });
  } catch (error) {
    console.error('updateTestQuestion error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật câu hỏi' });
  }
};

// DELETE /api/courses/:courseId/tests/final/questions/:questionId
const deleteTestQuestion = async (req, res) => {
  try {
    const { courseId, questionId } = req.params;
    const userId = req.headers['x-user-id'] || req.query.userId;

    const ownership = await assertMentorOwnsCourse(courseId, userId);
    if (!ownership.ok) return res.status(ownership.status).json({ success: false, message: ownership.message });

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ success: false, message: 'questionId không hợp lệ.' });
    }

    await TestQuestionChoice.deleteMany({ questionId });
    const result = await TestQuestion.findByIdAndDelete(questionId);
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi.' });

    return res.status(200).json({ success: true, message: 'Đã xóa câu hỏi.' });
  } catch (error) {
    console.error('deleteTestQuestion error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa câu hỏi' });
  }
};

module.exports = {
  getTestMeta,
  startTestAttempt,
  submitTestAttempt,
  listTestQuestions,
  createTestQuestion,
  updateTestQuestion,
  deleteTestQuestion,
};
