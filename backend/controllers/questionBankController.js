const questionBankModel = require('../Models/questionBankModel');

function getInstructorId(req) {
  const userId = req.user?.userId ?? req.headers['x-user-id'] ?? req.query.userId;
  const parsed = Number(userId);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

const getAllQuestionBankByMentorId = async (req, res) => {
  try {
    const mentorId = getInstructorId(req);
    if (!mentorId) {
      return res.status(401).json({
        success: false,
        message: 'Thiếu thông tin người dùng (x-user-id).',
        data: [],
      });
    }

    const banks = await questionBankModel.getQuestionBankByMentorId(mentorId);

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách ngân hàng câu hỏi thành công',
      data: banks,
    });
  } catch (error) {
    console.error('getAllQuestionBankByMentorId error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách ngân hàng câu hỏi',
      data: [],
    });
  }
};

module.exports = {
  getAllQuestionBankByMentorId,
};
