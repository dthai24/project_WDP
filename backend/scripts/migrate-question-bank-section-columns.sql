-- Migration: Question Bank section metadata + question flags
-- NOTE: After this script, run migrate-question-section-source-url.sql to simplify to SourceUrl only.
-- Database: LearningPath_Base (SQL Server)
-- Chay toan bo file trong SSMS (F5). Khong chay lenh sqlcmd trong cua so query.

USE [LearningPath_Base];
GO

-- 1) Question_Sections: metadata section
IF COL_LENGTH('dbo.Question_Sections', 'DisplayName') IS NULL
BEGIN
  ALTER TABLE dbo.Question_Sections ADD DisplayName NVARCHAR(200) NULL;
END
GO

IF COL_LENGTH('dbo.Question_Sections', 'AudioUrl') IS NULL
BEGIN
  ALTER TABLE dbo.Question_Sections ADD AudioUrl NVARCHAR(MAX) NULL;
END
GO

IF COL_LENGTH('dbo.Question_Sections', 'AudioSourceType') IS NULL
BEGIN
  ALTER TABLE dbo.Question_Sections ADD AudioSourceType NVARCHAR(20) NULL;
END
GO

IF COL_LENGTH('dbo.Question_Sections', 'FileName') IS NULL
BEGIN
  ALTER TABLE dbo.Question_Sections ADD FileName NVARCHAR(255) NULL;
END
GO

IF COL_LENGTH('dbo.Question_Sections', 'FileSize') IS NULL
BEGIN
  ALTER TABLE dbo.Question_Sections ADD FileSize BIGINT NULL;
END
GO

IF COL_LENGTH('dbo.Question_Sections', 'ReadingContent') IS NULL
BEGIN
  ALTER TABLE dbo.Question_Sections ADD ReadingContent NVARCHAR(MAX) NULL;
END
GO

IF COL_LENGTH('dbo.Question_Sections', 'ReadingSourceType') IS NULL
BEGIN
  ALTER TABLE dbo.Question_Sections ADD ReadingSourceType NVARCHAR(30) NULL;
END
GO

IF COL_LENGTH('dbo.Question_Sections', 'MaterialUrl') IS NULL
BEGIN
  ALTER TABLE dbo.Question_Sections ADD MaterialUrl NVARCHAR(MAX) NULL;
END
GO

IF COL_LENGTH('dbo.Question_Sections', 'SectionName') IS NOT NULL
BEGIN
  ALTER TABLE dbo.Question_Sections ALTER COLUMN SectionName NVARCHAR(200) NOT NULL;
END
GO

IF COL_LENGTH('dbo.Question_Sections', 'Title') IS NOT NULL
BEGIN
  ALTER TABLE dbo.Question_Sections ALTER COLUMN Title NVARCHAR(200) NULL;
END
GO

-- 3) Migrate audio Listening: Questions.URL -> Question_Sections.AudioUrl (legacy)
IF COL_LENGTH('dbo.Question_Sections', 'AudioUrl') IS NOT NULL
   AND COL_LENGTH('dbo.Questions', 'URL') IS NOT NULL
BEGIN
  ;WITH FirstAudio AS (
    SELECT
      q.SectionId,
      MIN(q.[Order]) AS MinOrder
    FROM dbo.Questions q
    INNER JOIN dbo.Question_Sections qs ON qs.SectionId = q.SectionId
    INNER JOIN dbo.QuestionType qt ON qt.TypeId = qs.TypeId
    WHERE RTRIM(qt.Name) = 'Listening'
      AND q.URL IS NOT NULL
      AND LTRIM(RTRIM(q.URL)) <> ''
    GROUP BY q.SectionId
  ),
  AudioPick AS (
    SELECT
      q.SectionId,
      q.URL AS AudioUrl
    FROM dbo.Questions q
    INNER JOIN FirstAudio fa
      ON fa.SectionId = q.SectionId
     AND fa.MinOrder = q.[Order]
  )
  UPDATE qs
  SET
    qs.AudioUrl = ap.AudioUrl,
    qs.AudioSourceType = COALESCE(qs.AudioSourceType, 'LINK')
  FROM dbo.Question_Sections qs
  INNER JOIN AudioPick ap ON ap.SectionId = qs.SectionId
  WHERE qs.AudioUrl IS NULL;
END
GO

PRINT 'Migration question bank section columns completed.';
GO
