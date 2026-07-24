const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('../models/MongoDB/User');
const Level = require('../models/MongoDB/Level');
const Course = require('../models/MongoDB/Course');
const Category = require('../models/MongoDB/Category');
const UserCategory = require('../models/MongoDB/UserCategory');
const EssaySubmission = require('../models/MongoDB/EssaySubmission');

// POST /api/student/placement-test/submit
const submitPlacementTest = async (req, res) => {
  try {
    const { userId, correctCount } = req.body;

    if (!userId || correctCount == null) {
      return res.status(400).json({ success: false, message: 'Thiếu userId hoặc correctCount' });
    }

    // Determine target level name based on score (out of 10 questions)
    let targetLevelName = 'Beginner';
    if (correctCount >= 8) {
      targetLevelName = 'Advanced';
    } else if (correctCount >= 4) {
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

// GET /api/student/placement-test/recommendations
const getPlacementTestRecommendations = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId' });
    }

    // 1. Lấy thông tin user (để biết Level hiện tại và learningGoal)
    const user = await User.findById(userId).populate('currentLevelId');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const currentLevel = user.currentLevelId;
    const learningGoal = user.learningGoal || '';

    // 2. Lấy danh sách các Lĩnh vực (Categories) mà user đã chọn khi khảo sát
    const userCats = await UserCategory.find({ userId });
    const categoryIds = userCats.map(uc => String(uc.categoryId));

    // Lấy chi tiết thông tin các Category này
    const categoriesDetails = await Category.find({ _id: { $in: categoryIds } });
    const categoryNames = categoriesDetails.map(c => c.displayName || c.categoryName);

    // 3. Truy vấn các khóa học đang hoạt động và đã xuất bản
    const courses = await Course.find({ isPublished: true, status: { $ne: 'inactive' } })
      .populate('categoryId', 'displayName categoryName')
      .populate('levelId', 'displayName levelName')
      .populate('instructorId', 'fullName email')
      .lean();

    // 4. Phân loại và xếp hạng khóa học dựa trên Cấp độ và Mục tiêu/Lĩnh vực
    const prioritizedCourses = courses.map(course => {
      let score = 0;
      const isSameLevel = String(course.levelId?._id) === String(currentLevel?._id);
      const isSameCategory = categoryIds.includes(String(course.categoryId?._id));

      if (isSameLevel && isSameCategory) {
        score = 3; // Trùng cả Level và Category
      } else if (isSameLevel) {
        score = 2; // Chỉ trùng Level
      } else if (isSameCategory) {
        score = 1; // Chỉ trùng Category
      }

      return { ...course, matchScore: score };
    });

    // Sắp xếp giảm dần theo matchScore
    const recommendedCourses = prioritizedCourses
      .filter(c => c.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);

    // 5. Sinh lộ trình học tập cá nhân hóa bằng AI/Template
    let roadmapMarkdown = '';
    const levelName = currentLevel?.displayName || currentLevel?.levelName || 'Beginner';
    const categoriesStr = categoryNames.join(', ') || 'Tiếng Anh tổng quát';

    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
    if (geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Bạn là Chuyên gia Tư vấn Lộ trình học tiếng Anh thông minh tại hệ thống English Master.
Hãy thiết kế một lộ trình học tập chi tiết, truyền cảm hứng và được cá nhân hóa cao cho học viên sau:
- Cấp độ hiện tại (Được đánh giá qua bài test đầu vào): ${levelName}
- Các lĩnh vực quan tâm: ${categoriesStr}
- Mục tiêu cá nhân: "${learningGoal}"

Yêu cầu định dạng kết quả dưới dạng Markdown tuyệt đẹp với các phần rõ ràng:
1. **Phân tích trình độ hiện tại**: Nhận xét ngắn gọn về điểm mạnh/yếu của cấp độ ${levelName} đối với mục tiêu "${learningGoal}".
2. **Lộ trình học tập đề xuất (3 Giai đoạn)**: 
   - Định dạng mỗi giai đoạn gồm: Tên giai đoạn, Thời gian dự kiến, Mục tiêu cần đạt, và các hoạt động học tập chính.
   - Các giai đoạn phải liên kết trực tiếp tới mục tiêu "${learningGoal}" và các lĩnh vực ${categoriesStr}.
3. **Lời khuyên học tập từ chuyên gia**: 2-3 mẹo nhỏ giúp học tập hiệu quả trên nền tảng English Master (sử dụng mô hình học 3 phần: Quiz, Video, Essay).

Lưu ý: Ngôn ngữ phản hồi bằng tiếng Việt thân thiện, chuyên nghiệp, sử dụng biểu tượng cảm xúc (emoji) phù hợp để tăng tính tương tác. Tránh dùng các định dạng tiêu đề h1 (#), hãy dùng h2 (##) hoặc h3 (###) trở xuống.`;

        const result = await model.generateContent(prompt);
        roadmapMarkdown = result.response.text();
      } catch (aiErr) {
        console.warn('[AI Roadmap Generation Error]', aiErr.message);
      }
    }

    if (!roadmapMarkdown) {
      roadmapMarkdown = `## 🎯 LỘ TRÌNH HỌC TẬP ĐỀ XUẤT CHO BẠN

Dựa trên kết quả bài đánh giá năng lực đầu vào (**${levelName}**) và mục tiêu học tập là **"${learningGoal}"**, English Master đề xuất lộ trình tối ưu sau:

### 📍 Giai đoạn 1: Xây dựng nền tảng cốt lõi
* **Mục tiêu**: Củng cố các chủ điểm ngữ pháp cơ bản, tích lũy 500+ từ vựng thông dụng liên quan đến các lĩnh vực **${categoriesStr}**.
* **Thời gian dự kiến**: 4 - 6 tuần.
* **Hoạt động chính**: Xem các bài giảng video của Mentor, làm các bài Quiz trắc nghiệm từ vựng & ngữ pháp để nắm chắc lý thuyết cơ bản.

### 📍 Giai đoạn 2: Tăng tốc & Thực hành thực tế
* **Mục tiêu**: Phát triển khả năng nghe hiểu nâng cao và luyện tập kỹ năng viết câu/đoạn văn tiếng Anh mạch lạc.
* **Thời gian dự kiến**: 6 - 8 tuần.
* **Hoạt động chính**: Viết các bài luận ngắn (Essay) theo chủ đề của khóa học và gửi cho Mentor chấm điểm, sửa lỗi chi tiết qua hệ thống AI phản hồi.

### 📍 Giai đoạn 3: Bứt phá mục tiêu & Chinh phục chứng chỉ
* **Mục tiêu**: Đạt chuẩn đầu ra phù hợp với mục tiêu cá nhân là **"${learningGoal}"**, tự tin giao tiếp hoặc đạt điểm số mong muốn trong kỳ thi.
* **Thời gian dự kiến**: 4 - 6 tuần.
* **Hoạt động chính**: Làm bài kiểm tra tổng hợp cuối khóa (Final Tests), nhận chứng chỉ hoàn thành khóa học từ English Master để lưu vào hồ sơ cá nhân.

---
### 💡 Lời khuyên học tập từ Mentor:
1. **Duy trì Streak**: Học tối thiểu 15-20 phút mỗi ngày tốt hơn học dồn vào cuối tuần để giữ phản xạ não bộ.
2. **Tận dụng mô hình 3 phần**: Đừng bỏ qua phần viết luận (Essay) vì đây là cách tốt nhất để bạn biến từ vựng thụ động thành chủ động.
3. **Thực hành với Chatbot AI**: Đặt câu hỏi cho trợ lý học tập AI ở góc màn hình bất cứ khi nào gặp cấu trúc câu khó hiểu!`;
    }

    return res.status(200).json({
      success: true,
      level: currentLevel,
      goal: learningGoal,
      categories: categoryNames,
      roadmap: roadmapMarkdown,
      courses: recommendedCourses
    });

  } catch (error) {
    console.error('getPlacementTestRecommendations error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy lộ trình gợi ý' });
  }
};

module.exports = {
  submitPlacementTest,
  submitEssay,
  getEssayHistory,
  getPlacementTestRecommendations
};
