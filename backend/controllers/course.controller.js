const { sql } = require('../config/db');

const normalizeRole = (roleName) => {
    if (Array.isArray(roleName)) {
        return String(roleName[0] || "").toLowerCase();
    }

    return String(roleName || "").toLowerCase();
};

const getAllCourses = async (req, res) => {
    try {
        const userId = Number(req.body.userId);
        const role = normalizeRole(req.body.roleName);

        const request = new sql.Request();

        if (userId) {
            request.input("userId", sql.Int, userId);
        }

        let query = "";

        if (role === "student" && userId) {
            query = `
        SELECT
          c.[CourseId] AS courseId,
          c.[CourseName] AS courseName,
          c.[Description] AS description,
          c.[CreatedAt] AS createdAt,
          CASE 
            WHEN uc.[UserId] IS NULL THEN CAST(0 AS bit)
            ELSE CAST(1 AS bit)
          END AS isEnrolled
        FROM [LearningPath_Base].[dbo].[Courses] c
        LEFT JOIN [LearningPath_Base].[dbo].[User_Courses] uc
          ON c.[CourseId] = uc.[CourseId]
          AND uc.[UserId] = @userId
        ORDER BY c.[CreatedAt] DESC
      `;
        } else {
            query = `
        SELECT
          [CourseId] AS courseId,
          [CourseName] AS courseName,
          [Description] AS description,
          [CreatedAt] AS createdAt,
          CAST(0 AS bit) AS isEnrolled
        FROM [LearningPath_Base].[dbo].[Courses]
        ORDER BY [CreatedAt] DESC
      `;
        }

        const result = await request.query(query);

        return res.status(200).json({
            success: true,
            data: result.recordset,
        });
    } catch (error) {
        console.error("Get all courses error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách course",
        });
    }
};

const getMyCourses = async (req, res) => {
    try {
        const userId = Number(req.body.userId);
        const role = normalizeRole(req.body.roleName);

        if (!userId || !role) {
            return res.status(400).json({
                success: false,
                message: "Missing userId or roleName",
            });
        }

        const request = new sql.Request();
        request.input("userId", sql.Int, userId);

        let query = "";

        if (role === "mentor") {
            query = `
        SELECT
          [CourseId] AS courseId,
          [CourseName] AS courseName,
          [Description] AS description,
          [CreatedAt] AS createdAt,
          [CreateBy] AS createBy,
          'learning' AS enrollmentStatus
        FROM [LearningPath_Base].[dbo].[Courses]
        WHERE [CreateBy] = @userId
        ORDER BY [CreatedAt] DESC
      `;
        } else if (role === "student") {
            query = `
        SELECT
          c.[CourseId] AS courseId,
          c.[CourseName] AS courseName,
          c.[Description] AS description,
          c.[CreatedAt] AS createdAt,
          uc.[UserId] AS userId,
          'learning' AS enrollmentStatus
        FROM [LearningPath_Base].[dbo].[User_Courses] uc
        INNER JOIN [LearningPath_Base].[dbo].[Courses] c
          ON uc.[CourseId] = c.[CourseId]
        WHERE uc.[UserId] = @userId
        ORDER BY c.[CreatedAt] DESC
      `;
        } else if (role === "admin") {
            query = `
        SELECT
          [CourseId] AS courseId,
          [CourseName] AS courseName,
          [Description] AS description,
          [CreatedAt] AS createdAt,
          [CreateBy] AS createBy,
          'admin-view' AS enrollmentStatus
        FROM [LearningPath_Base].[dbo].[Courses]
        ORDER BY [CreatedAt] DESC
      `;
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid roleName",
            });
        }

        const result = await request.query(query);

        return res.status(200).json({
            success: true,
            roleName: role,
            data: result.recordset,
        });
    } catch (error) {
        console.error("Get my courses error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy khóa học của user",
        });
    }
};

module.exports = {
    getAllCourses,
    getMyCourses,
};