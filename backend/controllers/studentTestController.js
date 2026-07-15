const studentTestModel = require('../Models/studentTestModel');
const questionBankModel = require('../Models/questionBankModel');
const chapterQuizConfigService = require('../services/chapterQuizConfigService');
const courseModel = require('../models/coursesModel');
const studentTestPaperService = require('../services/studentTestPaperService');
const courseTestRecommendationService = require('../services/courseTestRecommendationService');
const testAttemptSectionStatsService = require('../services/testAttemptSectionStatsService');

async function checkPrerequisites(courseId, userId, scope, chapterId) {
    const learningPath = await courseModel.getCourseLearningPath(courseId, userId);
    let prerequisitesMet = true;
    let prerequisiteBlockers = [];

    if (learningPath && learningPath.length > 0) {
        const modulesMap = new Map();
        for (const row of learningPath) {
            if (!modulesMap.has(row.PathId)) {
                modulesMap.set(row.PathId, { id: row.PathId, isTestPassed: row.IsTestPassed, lessons: [] });
            }
            if (row.NodeId) {
                modulesMap.get(row.PathId).lessons.push({ isCompleted: row.IsCompleted });
            }
        }

        const modules = Array.from(modulesMap.values());
        for (let i = 0; i < modules.length; i++) {
            const mod = modules[i];
            const allLessonsDone = mod.lessons.every(l => l.isCompleted);
            const hasConfigRes = await chapterQuizConfigService.getChapterQuizConfig(courseId, mod.id);
            const hasActiveTest = hasConfigRes.ok && hasConfigRes.config?.enabled !== false && hasConfigRes.config != null;
            mod.isCompleted = allLessonsDone && (!hasActiveTest || mod.isTestPassed);
            mod.allLessonsDone = allLessonsDone;
        }

        if (scope === 'chapter' && chapterId) {
            const targetMod = modules.find(m => m.id === Number(chapterId));
            if (targetMod) {
                const targetIndex = modules.findIndex(m => m.id === Number(chapterId));
                const isLocked = targetIndex > 0 ? !modules[targetIndex - 1].isCompleted : false;

                if (isLocked) {
                    prerequisitesMet = false;
                    prerequisiteBlockers.push("Chương này đang bị khóa do chưa hoàn thành chương trước đó.");
                } else if (!targetMod.allLessonsDone) {
                    prerequisitesMet = false;
                    prerequisiteBlockers.push("Bạn phải học xong tất cả bài học trong chương trước khi làm bài kiểm tra.");
                }
            }
        } else if (scope === 'final') {
            const allCompleted = modules.every(m => m.isCompleted);
            if (!allCompleted) {
                prerequisitesMet = false;
                prerequisiteBlockers.push("Bạn phải hoàn thành tất cả các chương trước khi làm bài kiểm tra cuối khóa.");
            }
        }
    }
    return { prerequisitesMet, prerequisiteBlockers };
}

const getTestMeta = async (req, res) => {
    try {
        const { courseId, scope } = req.params;
        const chapterId = req.query.chapterId;
        const userId = req.headers['x-user-id'] || req.user?.userId || 1; // Lấy ID Học viên

        const prereq = await checkPrerequisites(courseId, userId, scope, chapterId);

        let meta = {
            title: "Bài kiểm tra", courseId: Number(courseId),
            timeLimitMinutes: 15, passingScore: 70, maxAttempts: 3,
            attemptsUsed: 0, remainingAttempts: 3, enabled: true,
            skills: [], history: [],
            prerequisitesMet: prereq.prerequisitesMet,
            prerequisiteBlockers: prereq.prerequisiteBlockers
        };
        if (scope === 'chapter' && chapterId) {
            // 1. ĐẾM SỐ LƯỢT ĐÃ LÀM CỦA HỌC VIÊN DƯỚI DB
            const testId = await studentTestModel.getTestIdByCourseAndPath(courseId, chapterId);
            if (testId) {
                meta.attemptsUsed = await studentTestModel.getAttemptCountByUserAndTest(userId, testId);
                const history = await studentTestModel.getTestAttemptsHistory(userId, testId);
                meta.history = history;
            }
            const configResult = await chapterQuizConfigService.getChapterQuizConfig(courseId, chapterId);
            if (configResult.ok && configResult.config) {
                // 2. LẤY GIỚI HẠN TỐI ĐA TỪ MENTOR
                meta.timeLimitMinutes = configResult.config.timeLimitMinutes || 15;
                meta.passingScore = configResult.config.passingScore || 70;
                meta.maxAttempts = configResult.config.maxAttempts || 3;

                // 3. TÍNH TOÁN LƯỢT CÒN LẠI THEO THỜI GIAN THỰC
                meta.remainingAttempts = Math.max(0, meta.maxAttempts - meta.attemptsUsed);

                if (studentTestPaperService.hasConfiguredQuizSources(configResult.config)) {
                    meta.skills = studentTestPaperService.getConfiguredSkillTypes(configResult.config);
                }
            }
        } else if (scope === 'final') {
            const configResult = await chapterQuizConfigService.getCourseQuizConfig(courseId);
            if (configResult.ok && configResult.config) {
                meta.title = configResult.config.title || meta.title;
                meta.timeLimitMinutes = configResult.config.timeLimitMinutes || 45;
                meta.passingScore = configResult.config.passingScore || 70;
                meta.maxAttempts = configResult.config.maxAttempts || 3;
                meta.enabled = configResult.config.enabled !== false;

                const testId = configResult.config.id
                    ?? await studentTestModel.getTestIdByCourseForFinal(courseId);
                if (testId) {
                    meta.attemptsUsed = await studentTestModel.getAttemptCountByUserAndTest(userId, testId);
                    meta.history = await studentTestModel.getTestAttemptsHistory(userId, testId);
                }
                meta.remainingAttempts = Math.max(0, meta.maxAttempts - meta.attemptsUsed);

                if (studentTestPaperService.hasConfiguredQuizSources(configResult.config)) {
                    meta.skills = studentTestPaperService.getConfiguredSkillTypes(configResult.config);
                }
            }
        }
        res.json({ ok: true, meta });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};
const startTestAttempt = async (req, res) => {
    try {
        const { courseId, scope } = req.params;
        const userId = req.headers['x-user-id'] || req.user?.userId || 1;
        let pathId = req.body.chapterId;

        const prereq = await checkPrerequisites(courseId, userId, scope, pathId);
        if (!prereq.prerequisitesMet) {
            return res.status(403).json({ ok: false, message: prereq.prerequisiteBlockers.join(" ") });
        }

        let testId = null;
        let config = {};
        let paper = null;

        if (scope === 'final') {
            const configResult = await chapterQuizConfigService.getCourseQuizConfig(courseId);
            if (!configResult.ok) {
                return res.status(400).json({ ok: false, message: configResult.message });
            }
            if (!configResult.config?.enabled) {
                return res.status(400).json({
                    ok: false,
                    message: 'Bài kiểm tra toàn khóa chưa được bật.',
                });
            }

            config = configResult.config;
            testId = config.id ?? await studentTestModel.getTestIdByCourseForFinal(courseId);
            if (!testId) {
                return res.status(404).json({
                    ok: false,
                    message: 'Giảng viên chưa tạo bài kiểm tra toàn khóa!',
                });
            }

            try {
                const generationPlan = await courseTestRecommendationService.resolveCourseTestGenerationPlan({
                    userId,
                    courseId,
                    baseConfig: config,
                    testId,
                });

                paper = await studentTestPaperService.buildCourseTestPaper(
                    generationPlan.config,
                    courseId,
                    { chapterWeights: generationPlan.chapterWeights },
                );

                config = {
                    ...generationPlan.config,
                    recommendationMeta: generationPlan.recommendationMeta,
                };
            } catch (paperError) {
                if (paperError.code === 'INSUFFICIENT_TEST_QUESTIONS') {
                    return res.status(400).json({ ok: false, message: paperError.message });
                }
                throw paperError;
            }
        } else {
            if (!pathId) return res.status(400).json({ ok: false, message: "Thiếu chapterId" });
            testId = await studentTestModel.getTestIdByCourseAndPath(courseId, pathId);
            if (!testId) return res.status(404).json({ ok: false, message: "Giảng viên chưa tạo bài kiểm tra!" });

            const configResult = await chapterQuizConfigService.getChapterQuizConfig(courseId, pathId);
            if (!configResult.ok) {
                return res.status(400).json({ ok: false, message: configResult.message });
            }
            if (!configResult.config) {
                return res.status(400).json({
                    ok: false,
                    message: 'Giảng viên chưa thiết lập bài kiểm tra cho chương này.',
                });
            }
            if (!configResult.config.enabled) {
                return res.status(400).json({
                    ok: false,
                    message: 'Bài kiểm tra chương chưa được bật.',
                });
            }

            config = configResult.config;

            const sectionsData = await questionBankModel.getSectionsByPath(courseId, pathId);
            try {
                paper = await studentTestPaperService.buildChapterTestPaper(config, sectionsData);
            } catch (paperError) {
                if (paperError.code === 'INSUFFICIENT_TEST_QUESTIONS') {
                    return res.status(400).json({ ok: false, message: paperError.message });
                }
                throw paperError;
            }

            paper.sections = (paper.sections ?? []).map((section) => ({
                ...section,
                pathId: Number(pathId),
            }));
        }

        const timeLimitSeconds = (config.timeLimitMinutes || 15) * 60;
        const attempt = await studentTestModel.createTestAttempt(userId, testId, timeLimitSeconds);
        const formattedSections = paper?.sections ?? [];
        const totalQuestionsCount = paper?.totalQuestions ?? 0;

        if (formattedSections.length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'Không đủ câu hỏi để tạo đề kiểm tra theo cấu hình mentor.',
            });
        }

        const configuredSkills = studentTestPaperService.getConfiguredSkillTypes(config);

        res.json({
            ok: true,
            meta: {
                timeLimitMinutes: config.timeLimitMinutes || 15,
                skills: configuredSkills,
                totalQuestions: totalQuestionsCount,
                recommendation: config.recommendationMeta ?? null,
            },
            attempt: attempt,
            paper: {
                paperId: `paper_${testId}`,
                title: scope === 'final'
                    ? (config.title || "Bài kiểm tra toàn khóa")
                    : (config.title || "Bài kiểm tra cuối chương"),
                totalQuestions: totalQuestionsCount,
                sections: formattedSections
            }
        });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};
const submitTestAttempt = async (req, res) => {
    try {
        const { courseId, attemptId } = req.params;
        const { answers, timeSpentSeconds, totalQuestions, chapterId, paperSections } = req.body;

        const questionIds = Object.keys(answers || {}).map(id => Number(id)).filter(id => !isNaN(id));
        let correctCount = 0;
        const questionResults = [];

        if (questionIds.length > 0) {
            const { sql } = require('../config/db');
            const request = new sql.Request();
            const result = await request.query(`
                SELECT QuestionId, ChoiceId 
                FROM dbo.Question_Choices 
                WHERE IsTrue = 1 AND QuestionId IN (${questionIds.join(',')})
            `);

            const correctAnswersMap = {};
            result.recordset.forEach(row => {
                if (!correctAnswersMap[row.QuestionId]) correctAnswersMap[row.QuestionId] = [];
                correctAnswersMap[row.QuestionId].push(row.ChoiceId);
            });

            for (const qId of questionIds) {
                // Ép kiểu về String để tránh lỗi '1' !== 1
                const userChoiceIds = Array.isArray(answers[qId]) ? answers[qId].map(String) : [String(answers[qId])];
                const correctChoiceIds = (correctAnswersMap[qId] || []).map(String);

                let isCorrect = false;
                let isBlank = false;

                // Kiểm tra xem có bị bỏ trống không (null, undefined, mảng rỗng)
                if (userChoiceIds.length === 0 || (userChoiceIds.length === 1 && (userChoiceIds[0] === 'null' || userChoiceIds[0] === 'undefined' || !userChoiceIds[0]))) {
                    isBlank = true;
                } else if (correctChoiceIds.length > 0 && userChoiceIds.length === correctChoiceIds.length) {
                    isCorrect = correctChoiceIds.every(id => userChoiceIds.includes(id));
                    if (isCorrect) correctCount++;
                }

                // Thêm kết quả chi tiết từng câu
                questionResults.push({
                    questionId: Number(qId),
                    isCorrect,
                    isBlank,
                    userChoiceIds: isBlank ? [] : userChoiceIds,
                    correctChoiceIds: isBlank ? [] : correctChoiceIds // Giấu đáp án nếu bỏ trống
                });
            }
        }

        const totalQ = totalQuestions || questionIds.length || 1;
        const wrongCount = totalQ - correctCount;
        const percentage = Math.round((correctCount / totalQ) * 100);

        // Lấy điểm đạt từ config Mentor
        let passingScore = 70;
        const testInfo = await studentTestModel.getTestInfoByAttempt(attemptId);
        if (testInfo?.IsCourseTest) {
            const configResult = await chapterQuizConfigService.getCourseQuizConfig(courseId);
            if (configResult.ok && configResult.config) {
                passingScore = configResult.config.passingScore || 70;
            }
        } else if (chapterId && courseId) {
            const configResult = await chapterQuizConfigService.getChapterQuizConfig(courseId, chapterId);
            if (configResult.ok && configResult.config) {
                passingScore = configResult.config.passingScore || 70;
            }
        }
        const passed = percentage >= passingScore;
        const isPassBit = passed ? 1 : 0;

        await studentTestModel.submitTestAttemptModel(attemptId, percentage, 'submitted', isPassBit);
        await studentTestModel.saveTestAttemptAnswers(attemptId, questionResults);

        let sectionStats = null;
        if (Array.isArray(paperSections) && paperSections.length > 0) {
            try {
                const statRows = testAttemptSectionStatsService.buildSectionStatsRows(
                    paperSections,
                    questionResults,
                );
                if (statRows.length > 0) {
                    await studentTestModel.saveAttemptSectionStats(
                        attemptId,
                        Number(courseId),
                        statRows,
                    );
                    sectionStats = testAttemptSectionStatsService.buildAttemptSectionStatsSummary(statRows);
                }
            } catch (statsError) {
                console.error('saveAttemptSectionStats error:', statsError);
            }
        }

        res.json({
            ok: true,
            result: {
                score: percentage,
                passed: passed,
                percentage: percentage,
                correctCount: correctCount,
                wrongCount: wrongCount >= 0 ? wrongCount : 0,
                totalQuestions: totalQ,
                timeSpentSeconds: timeSpentSeconds || 0,
                passingScore: passingScore,
                questionResults: questionResults,
                sectionStats,
            }
        });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

//tính toán câu sai
const getWrongAnswersStats = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const allAnswers = await studentTestModel.getWrongAnswersDetail(attemptId);
        
        // Trải nghiệm người dùng: Nếu làm đúng 100%, trả về thông báo khen ngợi
        if (!allAnswers || allAnswers.length === 0) {
            return res.json({ ok: false, message: "Không tìm thấy dữ liệu lượt thi!" });
        }
        
        // 1. Đếm tổng số câu hỏi (Dùng Set để không bị đếm trùng)
        const uniqueQuestions = new Set(allAnswers.map(a => a.QuestionId));
        const totalQuestionsCount = uniqueQuestions.size;
        
        // 2. Lọc ra CHỈ NHỮNG DÒNG BỊ ĐÁNH DẤU SAI (Dòng code này sẽ loại bỏ câu Futsal ĐÚNG của bạn)
        const wrongAnswersRows = allAnswers.filter(a => a.IsCorrect === 0 || a.IsCorrect === false);

        // 3. Gộp các đáp án của câu bị lặp (Ví dụ câu 53 có 2 đáp án sai)
        const wrongQuestionsMap = new Map();
        for (const row of wrongAnswersRows) {
            if (!wrongQuestionsMap.has(row.QuestionId)) {
                wrongQuestionsMap.set(row.QuestionId, { ...row, userChoices: [] });
            }
            wrongQuestionsMap.get(row.QuestionId).userChoices.push(row.UserChoiceText || 'Bỏ trống');
        }
        
        // Chuyển lại thành mảng (Lúc này mỗi câu chỉ còn 1 dòng duy nhất)
        const wrongAnswers = Array.from(wrongQuestionsMap.values());

        // 4. Tạo khung sườn JSON chuẩn bị trả về cho Frontend
        const stats = {
            chapterId: allAnswers[0].ChapterId,
            chapterName: allAnswers[0].ChapterName,
            totalQuestions: totalQuestionsCount,
            totalWrong: wrongAnswers.length, // Đã đếm chuẩn xác số lượng câu sai
            sections: []
        };
        const sectionMap = new Map();

        // 5. Chạy vòng lặp để nhét từng câu sai vào đúng cái Section của nó
        for (const row of wrongAnswers) {
            // Nếu Section này chưa có trong Map, thì tạo mới 1 cụm
            if (!sectionMap.has(row.SectionId)) {
                sectionMap.set(row.SectionId, {
                    sectionId: row.SectionId,
                    sectionTitle: row.SectionTitle,
                    wrongCount: 0,
                    wrongQuestions: []
                });
            }

            // Tìm đúng cụm Section đó và nhét câu hỏi sai này vào
            const sec = sectionMap.get(row.SectionId);
            sec.wrongCount++; // Đếm số câu sai +1
            sec.wrongQuestions.push({
                questionId: row.QuestionId,
                questionTitle: row.QuestionTitle,
                // Gộp các đáp án thành 1 chuỗi với câu nhiều đáp án
                userChoiceText: row.userChoices.join(', ') 
            });
        }

        // Chuyển Map thành Array để Frontend dễ đọc hơn
        stats.sections = Array.from(sectionMap.values());

        res.json({ ok: true, data: stats });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};
const getAttemptSectionStats = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const rows = await studentTestModel.getAttemptSectionStats(attemptId);
        if (!rows.length) {
            return res.json({ ok: true, data: testAttemptSectionStatsService.buildAttemptSectionStatsSummary([]) });
        }

        const mappedRows = rows.map((row) => ({
            pathId: row.PathId,
            typeId: row.TypeId,
            skillType: row.SkillType,
            sectionId: row.SectionId,
            sectionTitle: row.SectionTitle,
            correctCount: row.CorrectCount,
            wrongCount: row.WrongCount,
            totalCount: row.TotalCount,
        }));

        res.json({
            ok: true,
            data: testAttemptSectionStatsService.buildAttemptSectionStatsSummary(mappedRows),
        });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

const getFinalTestRecommendationPreview = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.headers['x-user-id'] || req.user?.userId || 1;

        const configResult = await chapterQuizConfigService.getCourseQuizConfig(courseId);
        if (!configResult.ok || !configResult.config?.enabled) {
            return res.status(400).json({
                ok: false,
                message: configResult.message ?? 'Bài kiểm tra toàn khóa chưa được bật.',
            });
        }

        const testId = configResult.config.id
            ?? await studentTestModel.getTestIdByCourseForFinal(courseId);
        if (!testId) {
            return res.status(404).json({
                ok: false,
                message: 'Giảng viên chưa tạo bài kiểm tra toàn khóa!',
            });
        }

        const preview = await courseTestRecommendationService.getCourseTestRecommendationPreview({
            userId,
            courseId,
            baseConfig: configResult.config,
            testId,
        });

        return res.json({ ok: true, data: preview });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

module.exports = {
    getTestMeta,
    startTestAttempt,
    submitTestAttempt,
    getWrongAnswersStats,
    getAttemptSectionStats,
    getFinalTestRecommendationPreview,
};