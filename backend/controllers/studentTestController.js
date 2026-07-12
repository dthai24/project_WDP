const studentTestModel = require('../Models/studentTestModel');
const questionBankModel = require('../Models/questionBankModel'); 
const chapterQuizConfigService = require('../services/chapterQuizConfigService'); 
const getTestMeta = async (req, res) => {
    try {
        const { courseId, scope } = req.params;
        const chapterId = req.query.chapterId;
        const userId = req.headers['x-user-id'] || req.user?.userId || 1; // Lấy ID Học viên
        
        let meta = {
            title: "Bài kiểm tra", courseId: Number(courseId),
            timeLimitMinutes: 15, passingScore: 70, maxAttempts: 3,
            attemptsUsed: 0, remainingAttempts: 3, enabled: true,
            skills: [] 
        };
        if (scope === 'chapter' && chapterId) {
            // 1. ĐẾM SỐ LƯỢT ĐÃ LÀM CỦA HỌC VIÊN DƯỚI DB
            const testId = await studentTestModel.getTestIdByCourseAndPath(courseId, chapterId);
            if (testId) {
                meta.attemptsUsed = await studentTestModel.getAttemptCountByUserAndTest(userId, testId);
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
                
                if (correctChoiceIds.length > 0 && userChoiceIds.length === correctChoiceIds.length) {
                    const isCorrect = correctChoiceIds.every(id => userChoiceIds.includes(id));
                    if (isCorrect) correctCount++;
                }
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
                passingScore: passingScore
            }
        });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};
module.exports = { getTestMeta, startTestAttempt, submitTestAttempt };