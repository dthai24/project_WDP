const studentTestModel = require('../Models/studentTestModel');
const questionBankModel = require('../Models/questionBankModel');
const chapterQuizConfigService = require('../services/chapterQuizConfigService');
const courseModel = require('../models/coursesModel');

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

                let includedSkills = new Set();
                const qConfigs = configResult.config.questionConfigs || [];
                const hasConfig = qConfigs.some(c => c.sectionCount > 0 || (c.sectionQuestionCounts && c.sectionQuestionCounts.length > 0));

                // NẾU BÀI BỊ TẮT HOẶC CHƯA CẤU HÌNH -> Gom kỹ năng của các câu đang bật
                if (!hasConfig) {
                    const sections = await questionBankModel.getSectionsByPath(courseId, chapterId);
                    for (const s of sections) {
                        const raw = await questionBankModel.getQuestionsBySection(s.SectionId);
                        const unique = new Set(raw.filter(r => r.IsUseForTest !== false && r.IsUseForTest !== 0).map(r => r.QuestionId));
                        if (unique.size > 0) includedSkills.add(s.SkillType);
                    }
                } else {
                    for (const qc of qConfigs) {
                        if (qc.part === 'VOCABULARY') {
                            const count = (qc.sectionQuestionCounts || []).reduce((sum, item) => sum + (item.questionCount || 0), 0);
                            if (count > 0) includedSkills.add('VOCABULARY');
                        } else if (qc.sectionCount > 0) {
                            const sections = await questionBankModel.getSectionsByPath(courseId, chapterId);
                            const skillSecs = sections.filter(s => s.SkillType === qc.part).slice(0, qc.sectionCount);
                            let partHasQuestions = false;
                            for (const s of skillSecs) {
                                const raw = await questionBankModel.getQuestionsBySection(s.SectionId);
                                const unique = new Set(raw.filter(r => r.IsUseForTest !== false && r.IsUseForTest !== 0).map(r => r.QuestionId));
                                if (unique.size > 0) { partHasQuestions = true; break; }
                            }
                            if (partHasQuestions) includedSkills.add(qc.part);
                        }
                    }
                }
                meta.skills = Array.from(includedSkills);
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
        if (scope === 'final') {
            testId = 2;
            config = { timeLimitMinutes: req.body.timeLimitMinutes || 45 };
        } else {
            if (!pathId) return res.status(400).json({ ok: false, message: "Thiếu chapterId" });
            testId = await studentTestModel.getTestIdByCourseAndPath(courseId, pathId);
            if (!testId) return res.status(404).json({ ok: false, message: "Giảng viên chưa tạo bài kiểm tra!" });
            const configResult = await chapterQuizConfigService.getChapterQuizConfig(courseId, pathId);
            config = configResult.config || {};
        }
        const timeLimitSeconds = (config.timeLimitMinutes || 15) * 60;
        const attempt = await studentTestModel.createTestAttempt(userId, testId, timeLimitSeconds);
        const sectionsData = await questionBankModel.getSectionsByPath(courseId, pathId);

        let formattedSections = [];
        let totalQuestionsCount = 0;
        const qConfigs = config.questionConfigs || [];
        const hasConfig = qConfigs.some(c => c.sectionCount > 0 || (c.sectionQuestionCounts && c.sectionQuestionCounts.length > 0));
        const fetchSectionQuestions = async (sec, limitCount = null) => {
            const rawQuestions = await questionBankModel.getQuestionsBySection(sec.SectionId);
            const questionsMap = new Map();
            for (const row of rawQuestions) {
                if (row.IsUseForTest === false || row.IsUseForTest === 0) continue;
                if (!questionsMap.has(row.QuestionId)) {
                    questionsMap.set(row.QuestionId, {
                        tempId: row.QuestionId.toString(),
                        questionText: row.Title,
                        skillType: row.SkillType,
                        options: [], correctCount: 0
                    });
                }
                if (row.ChoiceId) {
                    const q = questionsMap.get(row.QuestionId);
                    q.options.push({ tempId: row.ChoiceId.toString(), optionText: row.ChoiceTitle });
                    if (row.IsTrue) q.correctCount++;
                }
            }
            let questions = Array.from(questionsMap.values()).map(q => {
                q.isMultipleChoice = q.correctCount > 1; delete q.correctCount; return q;
            });

            questions = questions.sort(() => 0.5 - Math.random());
            if (limitCount !== null) questions = questions.slice(0, limitCount);

            if (questions.length > 0) {
                formattedSections.push({
                    sectionId: sec.SectionId.toString(),
                    title: sec.Title,
                    skillType: sec.SkillType,
                    audioUrl: sec.SourceUrl || null, // FIX LỖI AUDIO/VIDEO CHÍNH LÀ CHỖ NÀY!
                    questions: questions
                });
                totalQuestionsCount += questions.length;
            }
        };
        if (!hasConfig) {
            // NẾU BÀI BỊ TẮT HOẶC CHƯA CẤU HÌNH -> Bốc tất cả các câu đang bật
            for (const sec of sectionsData) {
                await fetchSectionQuestions(sec, null);
            }
        } else {
            // 1. NHẶT NGHE & ĐỌC (Lấy nguyên đoạn văn)
            for (const skill of ['LISTENING', 'READING']) {
                const partConfig = qConfigs.find(c => c.part === skill);
                const pickCount = partConfig?.sectionCount || 0;
                if (pickCount <= 0) continue;
                let skillSections = sectionsData.filter(s => s.SkillType === skill);
                skillSections = skillSections.sort(() => 0.5 - Math.random()).slice(0, pickCount);

                for (const sec of skillSections) {
                    await fetchSectionQuestions(sec, null);
                }
            }
            // 2. NHẶT TỪ VỰNG & NGỮ PHÁP (Cắt đúng số câu yêu cầu)
            const vocabConfig = qConfigs.find(c => c.part === 'VOCABULARY');
            const sqCounts = vocabConfig?.sectionQuestionCounts || [];
            const vocabSections = sectionsData.filter(s => s.SkillType === 'VOCABULARY' || !['LISTENING', 'READING'].includes(s.SkillType));
            for (const sec of vocabSections) {
                const sqc = sqCounts.find(sq => String(sq.sectionTempId) === `section_${sec.SectionId}`);
                const limitCount = sqc?.questionCount || 0;
                if (limitCount <= 0) continue;
                await fetchSectionQuestions(sec, limitCount);
            }
        }
        res.json({
            ok: true,
            meta: { timeLimitMinutes: config.timeLimitMinutes || 15 },
            attempt: attempt,
            paper: {
                paperId: `paper_${testId}`,
                title: scope === 'final' ? "Bài kiểm tra toàn khóa" : "Bài kiểm tra cuối chương",
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
        const { answers, timeSpentSeconds, totalQuestions, chapterId } = req.body;

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
        if (chapterId && courseId) {
            const configResult = await chapterQuizConfigService.getChapterQuizConfig(courseId, chapterId);
            if (configResult.ok && configResult.config) {
                passingScore = configResult.config.passingScore || 70;
            }
        }
        const passed = percentage >= passingScore;
        const isPassBit = passed ? 1 : 0;

        await studentTestModel.submitTestAttemptModel(attemptId, percentage, 'submitted', isPassBit);
        await studentTestModel.saveTestAttemptAnswers(attemptId, questionResults);

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
                questionResults: questionResults // Trả về chi tiết các câu hỏi
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
module.exports = { getTestMeta, startTestAttempt, submitTestAttempt, getWrongAnswersStats };