-- Create database
CREATE DATABASE LearningPath_Base;
GO

USE LearningPath_Base;
GO

-- Create Users table
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    StudentId NVARCHAR(50) NOT NULL UNIQUE,
    FullName NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Create Courses table
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Insert sample user
INSERT INTO Users (StudentId, FullName)
VALUES ('HE194923', 'Nguyen Tan Dung');
GO
INSERT INTO Courses (Title, Description, Hashtag)
VALUES 
(N'L? trình React Th?c chi?n', N'Làm ch? Frontend v?i React và Vite', '#React'),
(N'Node.js & Express API', N'Xây d?ng Backend t?c ?? cao', '#NodeJS');
GO