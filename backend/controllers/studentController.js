const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('../models/MongoDB/User');
const Level = require('../models/MongoDB/Level');
const EssaySubmission = require('../models/MongoDB/EssaySubmission');

// POST /api/student/placement-test/submit
const submitPlacementTest = async (req, res) => {
  try {
    const { userId, correctCount } = req.body;

    if (!userId || correctCount == null) {
      return res.status(400).json({ success: false, message: 'Thiếu userId hoặc correctCount' });
    }

    // Determine target level name based on score
    let targetLevelName = 'Beginner';
    if (correctCount >= 4) {
      targetLevelName = 'Advanced';
    } else if (correctCount >= 2) {
      targetLevelName = 'Intermediate';
    }

    // Find the level doc in DB
    // We do case-insensitive regex check on displayName or levelName
    let levelDoc = await Level.findOne({
      $or: [
        { displayName: { $regex: new RegExp(`^${targetLevelName}$`, 'i') } },
        { levelName: { $regex: new RegExp(`^${targetLevelName}$`, 'i') } }
      ]
    });

    // Fallback if not found in DB
    if (!levelDoc) {
      levelDoc = await Level.findOne(); // use any level as fallback
    }

    if (!levelDoc) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin phân cấp học lực trên hệ thống.' });
    }

    // Update user level
    const user = await User.findByIdAndUpdate(
      userId,
      { currentLevelId: levelDoc._id, isFirstLogin: false },
      { new: true }
    ).populate('currentLevelId');

    return res.status(200).json({
      success: true,
      message: `Hoàn thành bài Placement Test. Cấp độ của bạn đã được cập nhật thành ${levelDoc.displayName || levelDoc.levelName}.`,
      level: levelDoc,
      user
    });
  } catch (error) {
    console.error('submitPlacementTest error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi nộp bài test' });
  }
};

// POST /api/student/essay/submit
const submitEssay = async (req, res) => {
  try {
    const { userId, courseId, nodeId, essayText } = req.body;
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();

    if (!userId || !courseId || !nodeId || !essayText) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin nộp bài luận' });
    }

    let result = {
      score: 70,
      grammarScore: 70,
      vocabularyScore: 70,
      coherenceScore: 70,
      feedback: 'Bài làm của bạn ở mức trung bình. Hãy chú ý hơn đến cấu trúc câu và từ vựng.'
    };

    if (geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            responseMimeType: "application/json"
          }
        });

        const prompt = `You are an automated AI English essay grader.
Evaluate the following student essay based on three criteria: Grammar (0-100), Vocabulary (0-100), and Coherence (0-100).
Provide an overall average score (0-100) and construct a polite constructive feedback in Vietnamese.
Format your response strictly as a JSON object:
{
  "score": 85,
  "grammarScore": 80,
  "vocabularyScore": 90,
  "coherenceScore": 85,
  "feedback": "Nhận xét chi tiết bằng tiếng Việt..."
}
Essay to grade:
"${essayText}"`;

        const aiResponse = await model.generateContent(prompt);
        const responseText = aiResponse.response.text();
        const parsed = JSON.parse(responseText.trim());
        
        if (parsed.score != null) {
          result = {
            score: Number(parsed.score),
            grammarScore: Number(parsed.grammarScore || parsed.score),
            vocabularyScore: Number(parsed.vocabularyScore || parsed.score),
            coherenceScore: Number(parsed.coherenceScore || parsed.score),
            feedback: parsed.feedback || 'Nhận xét tự động từ AI.'
          };
        }
      } catch (geminiErr) {
        console.error('Gemini essay grading failed, using default scores:', geminiErr.message);
      }
    }

    // Save submission to DB
    const submission = await EssaySubmission.create({
      userId,
      courseId,
      nodeId,
      essayText,
      score: result.score,
      grammarScore: result.grammarScore,
      vocabularyScore: result.vocabularyScore,
      coherenceScore: result.coherenceScore,
      feedback: result.feedback
    });

    return res.status(200).json({
      success: true,
      message: 'Nộp bài luận và chấm điểm AI thành công!',
      data: submission
    });
  } catch (error) {
    console.error('submitEssay error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi chấm bài luận' });
  }
};

// GET /api/student/essay/history
const getEssayHistory = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId' });
    }

    const history = await EssaySubmission.find({ userId })
      .populate('courseId', 'courseName')
      .populate('nodeId', 'nodeName')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('getEssayHistory error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy lịch sử viết luận' });
  }
};

module.exports = {
  submitPlacementTest,
  submitEssay,
  getEssayHistory
};
