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
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getCourses };
