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

module.exports = {
  getTestMeta,
  startTestAttempt,
  submitTestAttempt
};
