-- ============================================================
-- S.T.A.R Learning Path — Full Database Setup Script
-- Version 3.0  |  RBAC (Roles + User_Roles) + Forgot Password OTP
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
IF OBJECT_ID('dbo.User_Roles',       'U') IS NOT NULL DROP TABLE User_Roles;
IF OBJECT_ID('dbo.OTP_Verification', 'U') IS NOT NULL DROP TABLE OTP_Verification;
IF OBJECT_ID('dbo.Users',            'U') IS NOT NULL DROP TABLE Users;
IF OBJECT_ID('dbo.Roles',            'U') IS NOT NULL DROP TABLE Roles;
IF OBJECT_ID('dbo.Courses',          'U') IS NOT NULL DROP TABLE Courses;
IF OBJECT_ID('dbo.Tags',             'U') IS NOT NULL DROP TABLE Tags;
GO

-- ============================================================
-- 1. Bảng Roles
-- ============================================================
CREATE TABLE Roles (
    RoleId      INT IDENTITY(1,1) PRIMARY KEY,
    RoleName    NVARCHAR(50)  NOT NULL UNIQUE,  -- 'Admin' | 'Student' | 'Mentor'
    Description NVARCHAR(255) NULL
);
GO

-- ============================================================
-- 2. Bảng Users
-- ============================================================
CREATE TABLE Users (
    UserId          INT IDENTITY(1,1) PRIMARY KEY,
    FullName        NVARCHAR(100) NOT NULL,
    Email           NVARCHAR(150) NULL UNIQUE,
    Phone           NVARCHAR(20)  NULL UNIQUE,
    Password        NVARCHAR(255) NULL,
    DateOfBirth     DATE          NULL,
    IsFirstLogin    BIT           NOT NULL DEFAULT 1,   -- 1 = chưa khảo sát, 0 = đã khảo sát
    ResetOtpCode    NVARCHAR(6)   NULL,                 -- OTP đặt lại mật khẩu (tạm thời)
    ResetOtpExpires DATETIME      NULL,                 -- Thời hạn OTP đặt lại mật khẩu
    CreatedAt       DATETIME      DEFAULT GETDATE()
);
GO

-- ============================================================
-- 3. Bảng User_Roles (junction table)
-- ============================================================
CREATE TABLE User_Roles (
    UserId INT NOT NULL,
    RoleId INT NOT NULL,
    PRIMARY KEY (UserId, RoleId),
    CONSTRAINT FK_UR_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    CONSTRAINT FK_UR_Roles FOREIGN KEY (RoleId) REFERENCES Roles(RoleId) ON DELETE CASCADE
);
GO

-- ============================================================
-- 4. Bảng Courses
-- ============================================================
CREATE TABLE Courses (
    CourseId    INT IDENTITY(1,1) PRIMARY KEY,
    CourseName  NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    CreatedAt   DATETIME      DEFAULT GETDATE()
);
GO

-- ============================================================
-- 5. Bảng OTP_Verification (lưu tạm trước khi xác thực đăng ký)
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
-- 6. Bảng Tags (12 chủ đề sở thích)
-- ============================================================
CREATE TABLE Tags (
    TagId       INT IDENTITY(1,1) PRIMARY KEY,
    TagName     NVARCHAR(100) NOT NULL,   -- slug dùng nội bộ / emoji map
    DisplayName NVARCHAR(100) NOT NULL    -- tên hiển thị trên UI
);
GO

-- ============================================================
-- 7. Bảng trung gian User_Preferences
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
-- SEED DATA — 3 Roles
-- ============================================================
INSERT INTO Roles (RoleName, Description) VALUES
(N'Admin',   N'Quản trị viên hệ thống — toàn quyền quản lý'),
(N'Student', N'Học viên — truy cập khóa học và lộ trình học tập'),
(N'Mentor',  N'Người hướng dẫn — tạo nội dung và theo dõi học viên');
GO

-- ============================================================
-- SEED DATA — 3 tài khoản mẫu (Admin / Student / Mentor)
-- ============================================================
INSERT INTO Users (FullName, Email, Phone, Password, DateOfBirth, IsFirstLogin) VALUES
(N'Administrator',   N'ngtandung1906@gmail.com',   N'0900000001', N'123456', '1990-01-01', 0),
(N'Student Demo',    N'vuonghongphuoc291@gmail.com', N'0900000002', N'123456', '2000-06-15', 0),
(N'Mentor Demo',     N'hunghoang042310a5@gmail.com',  N'0900000003', N'123456', '1985-03-20', 0);
GO

-- ============================================================
-- SEED DATA — Gắn role cho 3 tài khoản mẫu
-- (Admin=RoleId 1, Student=RoleId 2, Mentor=RoleId 3)
-- ============================================================
INSERT INTO User_Roles (UserId, RoleId)
SELECT u.UserId, r.RoleId
FROM   Users u
JOIN   Roles r ON (u.Email = N'ngtandung1906@gmail.com'   AND r.RoleName = N'Admin')
UNION ALL
SELECT u.UserId, r.RoleId
FROM   Users u
JOIN   Roles r ON (u.Email = N'vuonghongphuoc291@gmail.com' AND r.RoleName = N'Student')
UNION ALL
SELECT u.UserId, r.RoleId
FROM   Users u
JOIN   Roles r ON (u.Email = N'hunghoang042310a5@gmail.com'  AND r.RoleName = N'Mentor');
GO



-- ============================================================
-- SEED DATA — Courses mẫu
-- ============================================================
INSERT INTO Courses (CourseName, Description) VALUES
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
SELECT 'Users'            AS [Bảng], COUNT(*) AS [Số bản ghi] FROM Users
UNION ALL
SELECT 'Roles',                      COUNT(*)                  FROM Roles
UNION ALL
SELECT 'User_Roles',                 COUNT(*)                  FROM User_Roles
UNION ALL
SELECT 'Courses',                    COUNT(*)                  FROM Courses
UNION ALL
SELECT 'Tags',                       COUNT(*)                  FROM Tags
UNION ALL
SELECT 'OTP_Verification',           COUNT(*)                  FROM OTP_Verification
UNION ALL
SELECT 'User_Preferences',           COUNT(*)                  FROM User_Preferences;
GO

-- Xem role của từng tài khoản mẫu
SELECT u.UserId, u.FullName, u.Email, r.RoleName, r.Description
FROM   Users      u
JOIN   User_Roles ur ON u.UserId = ur.UserId
JOIN   Roles      r  ON r.RoleId = ur.RoleId
ORDER  BY u.UserId;
GO

SELECT * FROM Tags ORDER BY TagId;
GO
