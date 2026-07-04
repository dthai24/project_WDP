-- Simplify Question_Sections: one URL column for section source (de bai)
-- Database: LearningPath_Base (SQL Server)
-- Run entire file in SSMS (F5).

USE [LearningPath_Base];
GO

IF COL_LENGTH('dbo.Question_Sections', 'SourceUrl') IS NULL
BEGIN
  ALTER TABLE dbo.Question_Sections ADD SourceUrl NVARCHAR(MAX) NULL;
END
GO

-- Migrate existing URLs into SourceUrl
UPDATE dbo.Question_Sections
SET SourceUrl = COALESCE(
  NULLIF(LTRIM(RTRIM(AudioUrl)), ''),
  NULLIF(LTRIM(RTRIM(MaterialUrl)), '')
)
WHERE SourceUrl IS NULL
  AND (
    (AudioUrl IS NOT NULL AND LTRIM(RTRIM(AudioUrl)) <> '')
    OR (MaterialUrl IS NOT NULL AND LTRIM(RTRIM(MaterialUrl)) <> '')
  );
GO

IF COL_LENGTH('dbo.Question_Sections', 'DisplayName') IS NOT NULL
BEGIN
  ALTER TABLE dbo.Question_Sections DROP COLUMN DisplayName;
END
GO

IF COL_LENGTH('dbo.Question_Sections', 'AudioUrl') IS NOT NULL
BEGIN
  ALTER TABLE dbo.Question_Sections DROP COLUMN AudioUrl;
END
GO

IF COL_LENGTH('dbo.Question_Sections', 'AudioSourceType') IS NOT NULL
BEGIN
  ALTER TABLE dbo.Question_Sections DROP COLUMN AudioSourceType;
END
GO

IF COL_LENGTH('dbo.Question_Sections', 'FileName') IS NOT NULL
BEGIN
  ALTER TABLE dbo.Question_Sections DROP COLUMN FileName;
END
GO

IF COL_LENGTH('dbo.Question_Sections', 'FileSize') IS NOT NULL
BEGIN
  ALTER TABLE dbo.Question_Sections DROP COLUMN FileSize;
END
GO

IF COL_LENGTH('dbo.Question_Sections', 'ReadingContent') IS NOT NULL
BEGIN
  ALTER TABLE dbo.Question_Sections DROP COLUMN ReadingContent;
END
GO

IF COL_LENGTH('dbo.Question_Sections', 'ReadingSourceType') IS NOT NULL
BEGIN
  ALTER TABLE dbo.Question_Sections DROP COLUMN ReadingSourceType;
END
GO

IF COL_LENGTH('dbo.Question_Sections', 'MaterialUrl') IS NOT NULL
BEGIN
  ALTER TABLE dbo.Question_Sections DROP COLUMN MaterialUrl;
END
GO

PRINT 'Question_Sections simplified to SourceUrl.';
GO
