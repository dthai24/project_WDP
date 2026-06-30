const QuestionBank = require('../models/MongoDB/QuestionBank');
const Course = require('../models/MongoDB/Course');
const QuestionsPath = require('../models/MongoDB/QuestionsPath');
const Question = require('../models/MongoDB/Question');

const getAllBankOfMentor = async (req, res) => {
    try {
        const userId = String(req.query.userId)
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId không hợp lệ',
            });
        }

        // Get all question banks for this mentor
        const banks = await QuestionBank.find({ instructorId: userId })
            .populate('courseId', 'courseName description isPublished')
            .lean();

        // For each bank, get the total questions and paths with questions
        const result = await Promise.all(banks.map(async (bank) => {
            const questionPaths = await QuestionsPath.find({ bankId: bank._id }).lean();
            const pathIds = questionPaths.map(qp => qp.pathId);

            const totalQuestions = await Question.countDocuments({
                question_Path_Id: { $in: questionPaths.map(qp => qp._id) }
            });

            const activeQuestions = await Question.countDocuments({
                question_Path_Id: { $in: questionPaths.map(qp => qp._id) },
                isActive: true
            });

            return {
                bankId: bank._id,
                courseId: bank.courseId?._id,
                courseName: bank.courseId?.courseName || '',
                courseDescription: bank.courseId?.description || '',
                totalQuestions,
                totalActiveQuestions: activeQuestions,
                pathCount: pathIds.length,
                updatedAt: bank.updatedAt,
                isPublished: bank.courseId?.isPublished || false,
            };
        }));

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách Question Bank thành công',
            questionBanks: result
        })
    } catch (error) {
        console.error(error.message)
        return res.status(500).json(
            {
                success: false,
                message: 'Lỗi questionBankController hàm getAllBankOfMentor',
                questionBanks: []
            }
        )
    }
}

module.exports = {
    getAllBankOfMentor
}
