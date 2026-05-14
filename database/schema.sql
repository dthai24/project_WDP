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

USE LearningPath_Base;
GO

-- 1. Xóa dữ liệu cũ của ông đi để nạp lại cho sạch (nếu muốn thay đổi)
DELETE FROM Users WHERE StudentId = 'HE194923';

-- 2. Chèn lại User với tiền tố N để không lỗi font
INSERT INTO Users (StudentId, FullName)
VALUES ('HE194923', N'Nguyễn Tấn Dũng'); 
GO

-- 3. Chèn lại Courses (Lưu ý: Bảng của ông ở trên khai báo là CourseName, Description)
-- Nếu ông muốn dùng Title và Hashtag thì phải ALTER TABLE, còn không thì dùng đúng cột cũ:
INSERT INTO Courses (CourseName, Description)
VALUES 
(N'Lộ trình React Thực chiến', N'Làm chủ Frontend với React và Vite'),
(N'Node.js & Express API', N'Xây dựng Backend tốc độ cao');
GO

SELECT * FROM Users;
SELECT * FROM Courses;