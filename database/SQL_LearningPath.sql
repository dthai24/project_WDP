-- ============================================================
-- S.T.A.R Learning Path — Full Database Setup Script
-- File chính thức: SQL_LearningPath.sql
-- Version 4.0  |  Course schema + RBAC + Forgot Password OTP
-- Chạy toàn bộ file này từ đầu là xong (SSMS hoặc: node backend/scripts/applySchema.js)
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'LearningPath_Base')
BEGIN
    CREATE DATABASE LearningPath_Base;
    PRINT 'Database LearningPath_Base đã được tạo.';
END
GO

USE LearningPath_Base;
GO

-- ============================================================
-- DROP các bảng theo đúng thứ tự (BẢNG CON XÓA TRƯỚC, BẢNG CHA XÓA SAU)
-- ============================================================
IF OBJECT_ID('dbo.Node_Materials',   'U') IS NOT NULL DROP TABLE Node_Materials;
IF OBJECT_ID('dbo.Course_Nodes',     'U') IS NOT NULL DROP TABLE Course_Nodes;
IF OBJECT_ID('dbo.User_Courses',     'U') IS NOT NULL DROP TABLE User_Courses;
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
    IsFirstLogin    BIT           NOT NULL DEFAULT 1,
    ResetOtpCode    NVARCHAR(6)   NULL,
    ResetOtpExpires DATETIME      NULL,
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
-- 5. Bảng OTP_Verification (lưu tạm trước khi xác thực)
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
    TagName     NVARCHAR(100) NOT NULL,
    DisplayName NVARCHAR(100) NOT NULL
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
-- 8. Bảng User_Courses (Lưu tiến trình học tập của User)
-- ============================================================
CREATE TABLE User_Courses (
    UserId             INT NOT NULL,
    CourseId           INT NOT NULL,
    ProgressPercentage INT           DEFAULT 0,
    EnrollmentDate     DATETIME      DEFAULT GETDATE(),
    PRIMARY KEY (UserId, CourseId),
    CONSTRAINT FK_UC_Users   FOREIGN KEY (UserId)   REFERENCES Users(UserId)     ON DELETE CASCADE,
    CONSTRAINT FK_UC_Courses FOREIGN KEY (CourseId) REFERENCES Courses(CourseId) ON DELETE CASCADE
);
GO

-- ============================================================
-- 9. Bảng Course_Nodes (Các chặng học của từng khóa)
-- ============================================================
CREATE TABLE Course_Nodes (
    NodeId      INT IDENTITY(1,1) PRIMARY KEY,
    CourseId    INT NOT NULL,
    NodeName    NVARCHAR(255) NOT NULL,
    NodeOrder   INT NOT NULL,
    Description NVARCHAR(MAX) NULL,
    CONSTRAINT FK_Node_Course FOREIGN KEY (CourseId) REFERENCES Courses(CourseId) ON DELETE CASCADE
);
GO

-- ============================================================
-- 10. Bảng Node_Materials (Học liệu bên trong Node: Video, Docs, Test)
-- ============================================================
CREATE TABLE Node_Materials (
    MaterialId    INT IDENTITY(1,1) PRIMARY KEY,
    NodeId        INT NOT NULL,
    MaterialType  VARCHAR(20) NOT NULL,
    Title         NVARCHAR(255) NOT NULL,
    MaterialUrl   NVARCHAR(MAX) NULL,
    MaterialOrder INT NOT NULL,
    CONSTRAINT FK_Material_Node FOREIGN KEY (NodeId) REFERENCES Course_Nodes(NodeId) ON DELETE CASCADE
);
GO

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO Roles (RoleName, Description) VALUES
(N'Admin',   N'Quản trị viên hệ thống — toàn quyền quản lý'),
(N'Student', N'Học viên — truy cập khóa học và lộ trình học tập'),
(N'Mentor',  N'Người hướng dẫn — tạo nội dung và theo dõi học viên');
GO

INSERT INTO Users (FullName, Email, Phone, Password, DateOfBirth, IsFirstLogin) VALUES
(N'Administrator', N'ngtandung1906@gmail.com',    N'0900000001', N'123456', '1990-01-01', 0),
(N'Student Demo',  N'vuonghongphuoc291@gmail.com', N'0900000002', N'123456', '2000-06-15', 0),
(N'Mentor Demo',   N'hunghoang042310a5@gmail.com', N'0900000003', N'123456', '1985-03-20', 0);
GO

INSERT INTO User_Roles (UserId, RoleId)
SELECT u.UserId, r.RoleId
FROM   Users u
JOIN   Roles r ON (u.Email = N'ngtandung1906@gmail.com'    AND r.RoleName = N'Admin')
UNION ALL
SELECT u.UserId, r.RoleId
FROM   Users u
JOIN   Roles r ON (u.Email = N'vuonghongphuoc291@gmail.com' AND r.RoleName = N'Student')
UNION ALL
SELECT u.UserId, r.RoleId
FROM   Users u
JOIN   Roles r ON (u.Email = N'hunghoang042310a5@gmail.com' AND r.RoleName = N'Mentor');
GO

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

INSERT INTO Courses (CourseName, Description)
VALUES
(N'Tiếng Anh Thương Mại & Giao Tiếp Công Sở', N'Nắm vững các thuật ngữ cốt lõi trong môi trường kinh doanh, cách viết email chuyên nghiệp và văn hóa giao tiếp doanh nghiệp.'),
(N'Tiếng Anh Chuyên Ngành Tài Chính - Ngân Hàng', N'Làm quen với hệ thống từ vựng về thị trường tiền tệ, tín dụng, báo cáo tài chính và các nghiệp vụ ngân hàng quốc tế.'),
(N'Tiếng Anh Chuyên Ngành Kế Toán - Kiểm Toán', N'Đọc hiểu chuẩn xác các thuật ngữ về bảng cân đối kế toán, báo cáo lưu chuyển tiền tệ và chuẩn mực kiểm toán quốc tế (IFRS/GAAP).'),
(N'Tiếng Anh Đàm Phán & Hợp Đồng Thương Mại', N'Trang bị ngôn từ sắc bén để thương lượng giá cả, chốt sale và đọc hiểu các điều khoản pháp lý phức tạp trong hợp đồng kinh tế.'),
(N'Tiếng Anh Đầu Tư & Quản Trị Rủi Ro', N'Từ vựng chuyên môn về thị trường chứng khoán, phân tích danh mục đầu tư, sáp nhập doanh nghiệp (M&A) và các chiến lược phòng ngừa rủi ro.'),
(N'Tiếng Anh Giao Tiếp Đời Sống Hàng Ngày', N'Luyện tập các tình huống giao tiếp thường nhật: chào hỏi, giới thiệu bản thân, hỏi đường, thời tiết và duy trì cuộc hội thoại tự nhiên.'),
(N'Tiếng Anh Du Lịch & Khám Phá', N'Bộ từ vựng và mẫu câu "sinh tồn" khi đi nước ngoài: thủ tục sân bay, check-in khách sạn, gọi món tại nhà hàng và xử lý sự cố.'),
(N'Tiếng Anh Sức Khỏe & Y Tế Cơ Bản', N'Cách diễn đạt các triệu chứng bệnh lý, mua thuốc tại quầy, giao tiếp với bác sĩ và tìm hiểu các thông tin về chăm sóc sức khỏe.'),
(N'Tiếng Anh Mua Sắm & Tiêu Dùng', N'Trang bị ngôn từ hữu ích khi đi siêu thị, mua sắm quần áo, hỏi về size số, trả giá và các tình huống đổi trả hàng hóa.'),
(N'Tiếng Anh Giải Trí & Sở Thích Cá Nhân', N'Từ vựng giúp bạn tự tin chia sẻ và bàn luận sôi nổi về các chủ đề phim ảnh, âm nhạc, thể thao và các xu hướng mạng xã hội.');
GO

INSERT INTO Course_Nodes (CourseId, NodeName, NodeOrder, Description)
VALUES
(1, N'Node 1: Khởi động & Làm quen thuật ngữ', 1, N'Nắm vững những từ vựng nền tảng nhất.'),
(1, N'Node 2: Kỹ năng Viết Email', 2, N'Ứng dụng từ vựng vào văn bản thực tế.');
GO

INSERT INTO Node_Materials (NodeId, MaterialType, Title, MaterialOrder)
VALUES
(1, 'VIDEO', N'Video bài giảng: Chào hỏi công sở', 1),
(1, 'DOC',   N'Tài liệu PDF: 50 từ vựng cốt lõi', 2),
(1, 'TEST',  N'Mini-Test: Trắc nghiệm từ vựng Node 1', 3),
(2, 'VIDEO', N'Video: Cấu trúc Email chuẩn', 1),
(2, 'TEST',  N'Bài tập thực hành: Soạn Email báo cáo', 2);
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
SELECT 'User_Preferences',           COUNT(*)                  FROM User_Preferences
UNION ALL
SELECT 'User_Courses',               COUNT(*)                  FROM User_Courses
UNION ALL
SELECT 'Course_Nodes',               COUNT(*)                  FROM Course_Nodes
UNION ALL
SELECT 'Node_Materials',             COUNT(*)                  FROM Node_Materials;
GO

SELECT u.UserId, u.FullName, u.Email, r.RoleName
FROM   Users u
JOIN   User_Roles ur ON u.UserId = ur.UserId
JOIN   Roles r ON r.RoleId = ur.RoleId
ORDER  BY u.UserId;
GO
