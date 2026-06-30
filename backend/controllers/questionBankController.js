const questionBankModel = require('../Models/questionBankModel');

const SKILL_TYPE_MAP = {
    LISTENING: 'LISTENING',
    READING: 'READING',
    WRITING: 'WRITING',
};

function normalizeSkillType(rawName) {
    const name = String(rawName ?? '').trim().toUpperCase();
    return SKILL_TYPE_MAP[name] ?? 'WRITING';
}

function groupQuestionsWithChoices(rows = []) {
    const questionMap = new Map();

    rows.forEach((row) => {
        if (!questionMap.has(row.QuestionId)) {
            questionMap.set(row.QuestionId, {
                questionId: row.QuestionId,
                sectionId: row.SectionId,
                title: row.Title,
                typeId: row.TypeId,
                skillType: normalizeSkillType(row.SkillType),
                url: row.URL,
                order: row.QuestionOrder,
                isActive: Boolean(row.IsActive),
                choices: [],
            });
        }

        if (row.ChoiceId != null) {
            questionMap.get(row.QuestionId).choices.push({
                choiceId: row.ChoiceId,
                title: row.ChoiceTitle,
                order: row.ChoiceOrder,
                isTrue: Boolean(row.IsTrue),
            });
        }
    });

    return Array.from(questionMap.values()).sort((a, b) => a.order - b.order);
}

const getAllBankOfMentor = async (req, res) => {
    try {
        const userId = Number(req.query.userId);
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'userId không hợp lệ',
            });
        }

        const listQuestionBanks = await questionBankModel.getAllListQuestionBankByMentorId(userId);

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách Question Bank thành công',
            questionBanks: listQuestionBanks,
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success: false,
            message: 'Lỗi questionBankController hàm getAllBankOfMentor',
            questionBanks: [],
        });
    }
};

const getChapterSections = async (req, res) => {
    try {
        const courseId = Number(req.params.courseId);
        const pathId = Number(req.params.pathId);

        if (!Number.isInteger(courseId) || courseId <= 0) {
            return res.status(400).json({ success: false, message: 'courseId không hợp lệ' });
        }
        if (!Number.isInteger(pathId) || pathId <= 0) {
            return res.status(400).json({ success: false, message: 'pathId không hợp lệ' });
        }

        const rows = await questionBankModel.getSectionsByPath(courseId, pathId);
        const questionPathId = rows[0]?.QuestionPathId ?? null;

        const sections = rows.map((row) => ({
            sectionId: row.SectionId,
            sectionName: row.SectionName,
            typeId: row.TypeId,
            skillType: normalizeSkillType(row.SkillType),
            order: row.SectionOrder,
            questionCount: Number(row.QuestionCount) || 0,
        }));

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách section thành công',
            data: {
                courseId,
                pathId,
                questionPathId,
                sections,
            },
        });
    } catch (error) {
        console.error('getChapterSections error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách section',
            data: { sections: [] },
        });
    }
};

const getSectionQuestions = async (req, res) => {
    try {
        const sectionId = Number(req.params.sectionId);
        const courseId = Number(req.query.courseId);
        const pathId = Number(req.query.pathId);

        if (!Number.isInteger(sectionId) || sectionId <= 0) {
            return res.status(400).json({ success: false, message: 'sectionId không hợp lệ' });
        }

        if (Number.isInteger(courseId) && courseId > 0 && Number.isInteger(pathId) && pathId > 0) {
            const allowed = await questionBankModel.sectionBelongsToCoursePath(sectionId, courseId, pathId);
            if (!allowed) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy section' });
            }
        }

        const rows = await questionBankModel.getQuestionsBySection(sectionId);
        const questions = groupQuestionsWithChoices(rows);

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách câu hỏi thành công',
            data: {
                sectionId,
                questions,
            },
        });
    } catch (error) {
        console.error('getSectionQuestions error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy câu hỏi của section',
            data: { questions: [] },
        });
    }
};

module.exports = {
    getAllBankOfMentor,
    getChapterSections,
    getSectionQuestions,
};
