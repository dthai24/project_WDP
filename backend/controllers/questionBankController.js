const questionBankModel = require('../Models/questionBankModel');
const questionBankSaveService = require('../services/questionBankSaveService');



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

                score: Number(row.Score) || 1,

                allowMultipleAnswers: Boolean(row.AllowMultipleAnswers),

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

            displayName: row.Title ?? row.SectionName,

            typeId: row.TypeId,

            skillType: normalizeSkillType(row.SkillType),

            order: row.SectionOrder,

            questionCount: Number(row.QuestionCount) || 0,

            sourceUrl: row.SourceUrl ?? null,

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


// Get question Bank By Id 
const getQuestionBankByIdController = async (req, res) => {
    try {
        const bankId = Number(req.params.bankId)
        if (!bankId) {
            return res.status(400).json(
                {
                    success: false,
                    message: 'Server không nhận được bankId',
                    data: {}
                }
            )
        }

        const result = await questionBankModel.getQuestionBankByIdModel(Number(bankId))
        if (result.length === 0) {
            return res.status(404).json(
                {
                    success: false,
                    message: `Không tìm thấy BankId = ${bankId} trong Database`,
                    data: {}
                }
            )
        }
        //==========SUCCESS=============
        return res.status(200).json(
            {
                success: true,
                message: 'Lấy thông tin Question Bank by Id thành công',
                data: result[0]
            }
        )
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(
            {
                success: false,
                message: `Lỗi server khi lấy thông tin của Question Bank Id=${bankId}`,
                data: {}
            }
        )
    }
}

// Route getQuestionBankPathsByBankId
const getQuestionBankPathsByBankIdController = async (req, res) => {
    try {
        const bankId = Number(req.params.bankId)
        if (!bankId) {
            return res.status(400).json(
                {
                    success: false,
                    message: 'Server không nhận được bankId',
                    data: {}
                }
            )
        }

        const result = await questionBankModel.getQuestionBankPathsByBankIdModel(Number(bankId))
        if (result.length === 0) {
            return res.status(404).json(
                {
                    success: false,
                    message: `Không tìm thấy BankId = ${bankId} trong Database`,
                    data: {}
                }
            )
        }
        //==========SUCCESS=============
        return res.status(200).json(
            {
                success: true,
                message: 'Lấy thông tin Question Bank by Id thành công',
                data: result[0]
            }
        )
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(
            {
                success: false,
                message: `Lỗi server khi lấy thông tin của Question Bank Id=${bankId}`,
                data: {}
            }
        )
    }
}


const createSectionSave = async (req, res) => {
    try {
        const courseId = Number(req.params.courseId);
        const pathId = Number(req.params.pathId);
        const payload = req.body ?? {};

        if (!Number.isInteger(courseId) || courseId <= 0) {
            return res.status(400).json({ success: false, message: 'courseId không hợp lệ' });
        }
        if (!Number.isInteger(pathId) || pathId <= 0) {
            return res.status(400).json({ success: false, message: 'pathId không hợp lệ' });
        }

        payload.context = {
            ...(payload.context ?? {}),
            courseId,
            pathId,
            sectionId: null,
        };

        const result = await questionBankSaveService.saveQuestionBankSectionPayload(payload, {
            requireExistingSection: false,
        });

        return res.status(201).json({
            success: true,
            message: 'Đã tạo section thành công',
            data: {
                sectionId: result.sectionId,
                questionPathId: result.questionPathId,
                questionIdMap: result.questionIdMap,
                sourceUrl: result.sourceUrl ?? null,
            },
        });
    } catch (error) {
        console.error('createSectionSave error:', error.message);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Lỗi khi tạo section',
        });
    }
};

const updateSectionSave = async (req, res) => {
    try {
        const sectionId = Number(req.params.sectionId);
        const payload = req.body ?? {};

        if (!Number.isInteger(sectionId) || sectionId <= 0) {
            return res.status(400).json({ success: false, message: 'sectionId không hợp lệ' });
        }

        payload.context = {
            ...(payload.context ?? {}),
            sectionId,
        };

        const result = await questionBankSaveService.saveQuestionBankSectionPayload(payload, {
            requireExistingSection: true,
        });

        return res.status(200).json({
            success: true,
            message: 'Đã cập nhật section thành công',
            data: {
                sectionId: result.sectionId,
                questionPathId: result.questionPathId,
                questionIdMap: result.questionIdMap,
                sourceUrl: result.sourceUrl ?? null,
            },
        });
    } catch (error) {
        console.error('updateSectionSave error:', error.message);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Lỗi khi cập nhật section',
        });
    }
};

const patchSectionSourceUrl = async (req, res) => {
    try {
        const sectionId = Number(req.params.sectionId);
        const courseId = Number(req.body?.courseId ?? req.query.courseId);
        const pathId = Number(req.body?.pathId ?? req.query.pathId);
        const sourceUrl = req.body?.sourceUrl ?? null;

        if (!Number.isInteger(sectionId) || sectionId <= 0) {
            return res.status(400).json({ success: false, message: 'sectionId không hợp lệ' });
        }
        if (!Number.isInteger(courseId) || courseId <= 0) {
            return res.status(400).json({ success: false, message: 'courseId không hợp lệ' });
        }
        if (!Number.isInteger(pathId) || pathId <= 0) {
            return res.status(400).json({ success: false, message: 'pathId không hợp lệ' });
        }

        const result = await questionBankSaveService.updateSectionSourceUrl(sectionId, sourceUrl, {
            courseId,
            pathId,
        });

        return res.status(200).json({
            success: true,
            message: 'Đã cập nhật URL đề bài',
            data: {
                sectionId: result.sectionId,
                sourceUrl: result.sourceUrl,
            },
        });
    } catch (error) {
        console.error('patchSectionSourceUrl error:', error.message);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Lỗi khi cập nhật URL section',
        });
    }
};

const deleteSection = async (req, res) => {
    try {
        const sectionId = Number(req.params.sectionId);
        const courseId = Number(req.query.courseId);
        const pathId = Number(req.query.pathId);

        if (!Number.isInteger(sectionId) || sectionId <= 0) {
            return res.status(400).json({ success: false, message: 'sectionId không hợp lệ' });
        }
        if (!Number.isInteger(courseId) || courseId <= 0) {
            return res.status(400).json({ success: false, message: 'courseId không hợp lệ' });
        }
        if (!Number.isInteger(pathId) || pathId <= 0) {
            return res.status(400).json({ success: false, message: 'pathId không hợp lệ' });
        }

        const result = await questionBankSaveService.deleteQuestionBankSection(sectionId, {
            courseId,
            pathId,
        });

        return res.status(200).json({
            success: true,
            message: 'Đã xóa section thành công',
            data: {
                sectionId: result.sectionId,
            },
        });
    } catch (error) {
        console.error('deleteSection error:', error.message);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Lỗi khi xóa section',
        });
    }
};

module.exports = {
    getAllBankOfMentor,
    getChapterSections,
    getSectionQuestions,
    getQuestionBankByIdController,
    getQuestionBankPathsByBankIdController,
    createSectionSave,
    updateSectionSave,
    deleteSection,
    patchSectionSourceUrl,
};

