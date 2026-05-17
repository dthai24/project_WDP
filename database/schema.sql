-- ============================================================
-- S.T.A.R Learning Path — Full Database Setup Script
-- Version 2.0  |  Chạy toàn bộ file này từ đầu là xong
-- ============================================================

USE master;
GO

-- Tạo database (bỏ qua nếu đã tồn tại)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'LearningPath_Base')
BEGIN
    CREATE DATABASE LearningPath_Base;
    PRINT 'Database LearningPath_Base đã được tạo.';
END
GO

USE LearningPath_Base;
GO

-- ============================================================
-- DROP các bảng theo đúng thứ tự (tránh lỗi FK)
-- ============================================================
IF OBJECT_ID('dbo.User_Preferences', 'U') IS NOT NULL DROP TABLE User_Preferences;
IF OBJECT_ID('dbo.OTP_Verification',  'U') IS NOT NULL DROP TABLE OTP_Verification;
IF OBJECT_ID('dbo.Users',             'U') IS NOT NULL DROP TABLE Users;
IF OBJECT_ID('dbo.Courses',           'U') IS NOT NULL DROP TABLE Courses;
IF OBJECT_ID('dbo.Tags',              'U') IS NOT NULL DROP TABLE Tags;
GO

-- ============================================================
-- 1. Bảng Users
-- ============================================================
CREATE TABLE Users (
    UserId       INT IDENTITY(1,1) PRIMARY KEY,
    FullName     NVARCHAR(100) NOT NULL,
    Email        NVARCHAR(150) NULL UNIQUE,
    Phone        NVARCHAR(20)  NULL UNIQUE,
    Password     NVARCHAR(255) NULL,
    DateOfBirth  DATE          NULL,
    IsFirstLogin BIT           NOT NULL DEFAULT 1,   -- 1 = chưa khảo sát, 0 = đã khảo sát
    CreatedAt    DATETIME      DEFAULT GETDATE()
);
GO

-- ============================================================
-- 2. Bảng Courses
-- ============================================================
CREATE TABLE Courses (
    CourseId    INT IDENTITY(1,1) PRIMARY KEY,
    CourseName  NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    CreatedAt   DATETIME      DEFAULT GETDATE()
);
GO

-- ============================================================
-- 3. Bảng OTP_Verification (lưu tạm trước khi xác thực)
-- ============================================================
CREATE TABLE OTP_Verification (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    Email       NVARCHAR(150) NOT NULL UNIQUE,
    FullName    NVARCHAR(100) NOT NULL,
    Phone       NVARCHAR(20)  NOT NULL,
    Password    NVARCHAR(255) NOT NULL,
    DateOfBirth DATE          NOT NULL,
    OtpCode     NVARCHAR(6)   NOT NULL,
    ExpiresAt   DATETIME      NOT NULL,
    CreatedAt   DATETIME      DEFAULT GETDATE()
);
GO

-- ============================================================
-- 4. Bảng Tags (12 chủ đề sở thích)
-- ============================================================
CREATE TABLE Tags (
    TagId       INT IDENTITY(1,1) PRIMARY KEY,
    TagName     NVARCHAR(100) NOT NULL,   -- slug dùng nội bộ / emoji map
    DisplayName NVARCHAR(100) NOT NULL    -- tên hiển thị trên UI
);
GO

-- ============================================================
-- 5. Bảng trung gian User_Preferences
-- ============================================================
CREATE TABLE User_Preferences (
    UserId INT NOT NULL,
    TagId  INT NOT NULL,
    PRIMARY KEY (UserId, TagId),
    CONSTRAINT FK_UP_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    CONSTRAINT FK_UP_Tags  FOREIGN KEY (TagId)  REFERENCES Tags(TagId)   ON DELETE CASCADE
);
GO

-- ============================================================
-- SEED DATA — Users mẫu
-- ============================================================
INSERT INTO Users (FullName, Email)
VALUES (N'Nguyễn Tấn Dũng', 'admin_dungnt@gmail.com');
GO

-- ============================================================
-- SEED DATA — Courses mẫu
-- ============================================================
INSERT INTO Courses (CourseName, Description)
VALUES
(N'Lộ trình React Thực chiến', N'Làm chủ Frontend với React và Vite'),
(N'Node.js & Express API',     N'Xây dựng Backend tốc độ cao');
GO

-- ============================================================
-- SEED DATA — 12 chủ đề Tags
-- ============================================================
INSERT INTO Tags (TagName, DisplayName) VALUES
(N'the-thao-esports',         N'Thể thao & E-sports'),
(N'lap-trinh-cong-nghe',      N'Lập trình & Công nghệ'),
(N'thoi-trang-phong-cach',    N'Thời trang & Phong cách sống'),
(N'du-lich-kham-pha',         N'Du lịch & Khám phá'),
(N'phim-anh-giai-tri',        N'Phim ảnh & Giải trí'),
(N'am-nhac-nghe-thuat',       N'Âm nhạc & Nghệ thuật'),
(N'am-thuc-nau-an',           N'Ẩm thực & Nấu ăn'),
(N'sach-phat-trien-ban-than', N'Sách & Phát triển bản thân'),
(N'tieng-anh-hoc-thuat',      N'Tiếng Anh học thuật'),
(N'kinh-doanh-khoi-nghiep',   N'Kinh doanh & Khởi nghiệp'),
(N'tro-choi-dien-tu',         N'Trò chơi điện tử & Máy tính'),
(N'anime-manga',              N'Anime & Manga');
GO

-- ============================================================
-- Kiểm tra kết quả
-- ============================================================
SELECT 'Users'           AS [Bảng], COUNT(*) AS [Số bản ghi] FROM Users
UNION ALL
SELECT 'Courses',                   COUNT(*)                 FROM Courses
UNION ALL
SELECT 'Tags',                      COUNT(*)                 FROM Tags
UNION ALL
SELECT 'OTP_Verification',          COUNT(*)                 FROM OTP_Verification
UNION ALL
SELECT 'User_Preferences',          COUNT(*)                 FROM User_Preferences;
GO

SELECT * FROM Tags ORDER BY TagId;
GO