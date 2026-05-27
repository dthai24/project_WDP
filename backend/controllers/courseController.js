<<<<<<< HEAD
// courseController.js
const { sql } = require("../config/db");

const getCourses = async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query(`
      SELECT
        c.CourseId,
        c.CourseName,
        c.Description,
        c.CreatedAt,
        c.Thumbnail,
        c.Rating,
        c.TotalLessons,
        cat.DisplayName  AS Category,
        lv.DisplayName   AS Level,
        ins.FullName     AS Instructor,
        COUNT(DISTINCT uc.UserId) AS StudentCount
      FROM Courses c
      LEFT JOIN Categories  cat ON cat.CategoryId   = c.CategoryId
      LEFT JOIN Levels      lv  ON lv.LevelId       = c.LevelId
      LEFT JOIN Instructors ins ON ins.InstructorId = c.InstructorId
      LEFT JOIN User_Courses uc  ON uc.CourseId      = c.CourseId
      GROUP BY
        c.CourseId, c.CourseName, c.Description, c.CreatedAt,
        c.Thumbnail, c.Rating, c.TotalLessons,
        cat.DisplayName, lv.DisplayName, ins.FullName
      ORDER BY c.CreatedAt DESC
    `);
    return res.json({ success: true, courses: result.recordset });
  } catch (err) {
    console.error("[GetCourses Error]", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Không thể lấy danh sách khóa học." });
  }
};

const getTopCourses = async (req, res) => {
  const limit = parseInt(req.query.limit) || 4;
  try {
    const request = new sql.Request();
    request.input("limit", sql.Int, limit);
    const result = await request.query(`
      SELECT TOP 4
  c.CourseId,
  c.CourseName,
  c.Description,
  c.Thumbnail,
  c.Rating,
  c.TotalLessons,
  cat.DisplayName AS Category,
  lv.DisplayName  AS Level,
  ins.FullName    AS Instructor,
  COUNT(DISTINCT uc.UserId) AS StudentCount
FROM Courses c
LEFT JOIN Categories  cat ON cat.CategoryId   = c.CategoryId
LEFT JOIN Levels      lv  ON lv.LevelId       = c.LevelId
LEFT JOIN Instructors ins ON ins.InstructorId = c.InstructorId
LEFT JOIN User_Courses uc  ON uc.CourseId      = c.CourseId
GROUP BY
  c.CourseId, c.CourseName, c.Description,
  c.Thumbnail, c.Rating, c.TotalLessons,
  cat.DisplayName, lv.DisplayName, ins.FullName
ORDER BY StudentCount DESC;
    `);
    return res.json({ success: true, courses: result.recordset });
  } catch (err) {
    console.error("[GetTopCourses Error]", err.message);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách khóa học nổi bật.",
    });
  }
};

module.exports = { getCourses, getTopCourses };

const getMyCourses = async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ success: false, message: 'Thiếu userId' });

  try {
    const request = new sql.Request();
    request.input('userId', sql.Int, parseInt(userId));
    const result = await request.query(`
      SELECT
        c.CourseId, c.CourseName, c.Description,
        c.Thumbnail, c.Rating, c.TotalLessons,
        cat.DisplayName AS Category,
        lv.DisplayName  AS Level,
        ins.FullName    AS Instructor,
        uc.ProgressPercentage,
        uc.EnrollmentDate
      FROM User_Courses uc
      JOIN Courses c      ON c.CourseId      = uc.CourseId
      LEFT JOIN Categories  cat ON cat.CategoryId   = c.CategoryId
      LEFT JOIN Levels      lv  ON lv.LevelId       = c.LevelId
      LEFT JOIN Instructors ins ON ins.InstructorId = c.InstructorId
      WHERE uc.UserId = @userId
      ORDER BY uc.EnrollmentDate DESC
    `);
    return res.json({ success: true, courses: result.recordset });
  } catch (err) {
    console.error('[GetMyCourses Error]', err.message);
=======
const { sql } = require('../config/db');

// ============================================================
// GET /api/courses
// ============================================================
const getCourses = async (req, res) => {
  const userId = req.user ? req.user.userId : null; // user might be optional depending on auth

  try {
    const reqSql = new sql.Request();
    if (userId) {
      reqSql.input('userId', sql.Int, userId);
    } else {
      reqSql.input('userId', sql.Int, 0);
    }

    const result = await reqSql.query(`
      SELECT 
        c.CourseId AS courseId,
        c.CourseName AS courseName,
        c.Description AS description,
        cat.DisplayName AS category,
        lvl.DisplayName AS level,
        u.FullName AS instructor,
        c.TotalLessons AS totalLessons,
        0 AS totalNodes,
        0 AS totalMaterials,
        ISNULL(uc.ProgressPercentage, 0) AS progressPercentage,
        CAST(CASE WHEN uc.UserId IS NOT NULL THEN 1 ELSE 0 END AS BIT) AS isEnrolled,
        600 AS popularity,
        ISNULL(c.Rating, 4.5) AS rating,
        150 AS reviewCount,
        1200 AS studentCount,
        c.CreatedAt AS createdAt,
        c.Thumbnail AS thumbnail
      FROM Courses c
      LEFT JOIN Categories cat ON c.CategoryId = cat.CategoryId
      LEFT JOIN Levels lvl ON c.LevelId = lvl.LevelId
      LEFT JOIN Instructors i ON c.InstructorId = i.InstructorId
      LEFT JOIN Users u ON i.UserId = u.UserId
      LEFT JOIN User_Courses uc ON c.CourseId = uc.CourseId AND uc.UserId = @userId
    `);

    // We can map these exactly to how the frontend expects.
    const courses = result.recordset.map(c => {
      // Map DB categories back to Mock categories so UI filters work without modifying frontend HTML/JSX
      let cat = c.category;
      if (cat === 'Giao tiếp & Kỹ năng mềm') cat = 'Giao tiếp';
      if (cat === 'Công nghệ thông tin') cat = 'IELTS';
      if (cat === 'Kinh doanh & Quản lý') cat = 'TOEIC';
      if (cat === 'Đời sống & Sở thích') cat = 'Ngữ pháp';
      
      let lvl = c.level;
      if (lvl === 'Người mới bắt đầu') lvl = 'Cơ bản';
      if (lvl === 'Cơ bản') lvl = 'Cơ bản';
      if (lvl === 'Trung cấp') lvl = 'Trung cấp';
      if (lvl === 'Cao cấp') lvl = 'Nâng cao';

      return {
        ...c,
        category: cat,
        level: lvl,
        isEnrolled: !!c.isEnrolled
      };
    });

    return res.json({
      success: true,
      courses
    });

  } catch (err) {
    console.error('[GetCourses Error]', err.message);
>>>>>>> origin/Nguyen_Tan_Dung_HE194923
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

<<<<<<< HEAD
module.exports = { getCourses, getTopCourses, getMyCourses };

const enrollCourse = async (req, res) => {
  const { userId, courseId } = req.body;
  if (!userId || !courseId)
    return res.status(400).json({ success: false, message: 'Thiếu userId hoặc courseId' });

  try {
    const request = new sql.Request();
    request.input('userId',   sql.Int, parseInt(userId));
    request.input('courseId', sql.Int, parseInt(courseId));

    // Kiểm tra đã đăng ký chưa
    const check = await request.query(`
      SELECT UserId FROM User_Courses
      WHERE UserId = @userId AND CourseId = @courseId
    `);
    if (check.recordset.length > 0)
      return res.status(409).json({ success: false, message: 'Bạn đã đăng ký khóa học này rồi.' });

    // Insert
    const insertReq = new sql.Request();
    insertReq.input('userId',   sql.Int, parseInt(userId));
    insertReq.input('courseId', sql.Int, parseInt(courseId));
    await insertReq.query(`
      INSERT INTO User_Courses (UserId, CourseId, ProgressPercentage, EnrollmentDate)
      VALUES (@userId, @courseId, 0, GETDATE())
    `);

    return res.json({ success: true, message: 'Đăng ký khóa học thành công!' });
  } catch (err) {
    console.error('[EnrollCourse Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getCourses, getTopCourses, getMyCourses, enrollCourse };

=======
module.exports = { getCourses };
>>>>>>> origin/Nguyen_Tan_Dung_HE194923

