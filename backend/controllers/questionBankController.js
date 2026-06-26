const { sql } = require('../config/db');

const questionBankModel = require('../Models/questionBankModel')

const getAllBankOfMentor = async (req, res) => {
    try {
        const userId = Number(req.query.userId)
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'userId không hợp lệ',
            });
        }
        const listQuestionBanks = await questionBankModel.getAllListQuestionBankByMentorId(userId)

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách Question Bank thành công',
            questionBanks: listQuestionBanks
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