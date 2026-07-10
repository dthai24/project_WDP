-- DO NOT RUN until backend API saves quiz config to DB.
--
-- Current app state (2026-07):
--   MentorChapterQuizSetupDialog -> chapterQuizConfigService -> localStorage only
--   Key: mentor_chapter_quiz_configs_v1 / {courseId}_{chapterId}
--   Course quiz uses chapterId = "__course__"
--
-- dbcd.sql Tests* tables are NOT wired to the UI yet.
-- Running constraints here broke DB without changing app behavior.
--
-- When implementing API, map UI config like this:
--   Tests              : 1 row per chapter quiz OR 1 course quiz per course
--   Test_Config        : DurationMinutes, MaxAttempts, PickMode=RANDOM
--   Test_Pass_Config   : MinPassScore (= passingScore)
--   Test_Config_Section : per Question_Sections.SectionId + QuestionQuantity
--       - WRITING: one row per selected sectionGroup (sectionTempId -> SectionId)
--       - LISTENING/READING: split questionCount across bank sections of that skill
--
-- Until then use rollback-tests-ui-migration.sql to undo partial runs.

PRINT 'migrate-tests-one-per-chapter.sql is disabled. See file header.';
GO
