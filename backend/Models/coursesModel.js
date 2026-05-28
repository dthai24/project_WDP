const { sql } = require('../config/db');

// ======================================================
// Helper: check role
// ======================================================
const checkUserRole = async (userId, roleName) => {
    const request = new sql.Request();

    request.input('userId', sql.Int, Number(userId));
    request.input('roleName', sql.NVarChar(50), String(roleName).trim().toLowerCase());

    const result = await request.query(`
        SELECT TOP 1
            r.RoleName
        FROM User_Roles ur
        INNER JOIN Roles r
            ON r.RoleId = ur.RoleId
        WHERE ur.UserId = @userId
          AND LOWER(LTRIM(RTRIM(r.RoleName))) = @roleName
    `);

    return result.recordset.length > 0;
};

// ======================================================
// Helper: date
// ======================================================
const toRelativeDate = (dateValue) => {
    if (!dateValue) return null;

    const date = new Date(dateValue);
    const now = new Date();

    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Hôm nay';
    if (diffDays === 1) return '1 ngày trước';

    return `${diffDays} ngày trước`;
};

const toActivityOrder = (dateValue) => {
    if (!dateValue) return 0;
    return new Date(dateValue).getTime();
};

// ======================================================
// Query: student courses
// ======================================================
const getStudentCourseBase = async (userId) => {
    const request = new sql.Request();

    request.input('userId', sql.Int, Number(userId));

    const result = await request.query(`
        SELECT
            c.CourseId AS courseId,
            c.CourseName AS courseName,

            ca.DisplayName AS category,
            lv.DisplayName AS level,

            instructorUser.FullName AS instructor,

            ISNULL(c.TotalLessons, 0) AS totalLessons,
            c.Thumbnail AS thumbnail,

            ISNULL(uc.ProgressPercentage, 0) AS progressPercentage,

            CASE
                WHEN uc.ProgressPercentage >= 100 THEN 'completed'
                WHEN uc.ProgressPercentage > 0 THEN 'learning'
                ELSE 'enrolled'
            END AS enrollmentStatus,

            uc.EnrollmentDate AS activityDate,

            c.CreatedAt,
            c.UpdatedAt
        FROM User_Courses uc
        INNER JOIN Courses c
            ON c.CourseId = uc.CourseId
        LEFT JOIN Categories ca
            ON ca.CategoryId = c.CategoryId
        LEFT JOIN Levels lv
            ON lv.LevelId = c.LevelId
        LEFT JOIN Users instructorUser
            ON instructorUser.UserId = c.InstructorId
        WHERE uc.UserId = @userId
        ORDER BY uc.EnrollmentDate DESC
    `);

    return result.recordset;
};
// ======================================================
// Query: mentor courses
// ======================================================
const getMentorCourseBase = async (userId) => {
    const request = new sql.Request();

    request.input('userId', sql.Int, Number(userId));

    const result = await request.query(`
        SELECT
    c.CourseId AS courseId,
    c.CourseName AS courseName,

    ca.DisplayName AS category,
    lv.DisplayName AS level,

    mentorUser.FullName AS instructor,

    ISNULL(c.TotalLessons, 0) AS totalLessons,
    c.Thumbnail AS thumbnail,

    100 AS progressPercentage,
    'teaching' AS enrollmentStatus,

    ISNULL(c.UpdatedAt, c.CreatedAt) AS activityDate,

    c.CreatedAt,
    c.UpdatedAt
FROM Courses c

LEFT JOIN Users mentorUser
    ON mentorUser.UserId = c.InstructorId

LEFT JOIN Categories ca
    ON ca.CategoryId = c.CategoryId

LEFT JOIN Levels lv
    ON lv.LevelId = c.LevelId

WHERE c.InstructorId = @userId

ORDER BY ISNULL(c.UpdatedAt, c.CreatedAt) DESC;
    `);

    return result.recordset;
};

// ======================================================
// Query: all courses
// Nếu có userId thì lấy ProgressPercentage của user đó.
// Nếu không có userId thì progress = 0.
// ======================================================
const getAllCourseBase = async (userId = null) => {
    const request = new sql.Request();

    request.input(
        'userId',
        sql.Int,
        userId ? Number(userId) : null
    );

    const result = await request.query(`
        SELECT
            c.CourseId AS courseId,
            c.CourseName AS courseName,

            ca.DisplayName AS category,
            lv.DisplayName AS level,

            instructorUser.FullName AS instructor,

            ISNULL(c.TotalLessons, 0) AS totalLessons,
            c.Thumbnail AS thumbnail,

            ISNULL(uc.ProgressPercentage, 0) AS progressPercentage,

            CASE
                WHEN uc.CourseId IS NULL THEN 'available'
                WHEN uc.ProgressPercentage >= 100 THEN 'completed'
                WHEN uc.ProgressPercentage > 0 THEN 'learning'
                ELSE 'enrolled'
            END AS enrollmentStatus,

            ISNULL(c.UpdatedAt, c.CreatedAt) AS activityDate,

            c.CreatedAt,
            c.UpdatedAt
        FROM Courses c
        LEFT JOIN User_Courses uc
            ON uc.CourseId = c.CourseId
           AND uc.UserId = @userId
        LEFT JOIN Categories ca
            ON ca.CategoryId = c.CategoryId
        LEFT JOIN Levels lv
            ON lv.LevelId = c.LevelId
        LEFT JOIN Users instructorUser
            ON instructorUser.UserId = c.InstructorId
        ORDER BY ISNULL(c.UpdatedAt, c.CreatedAt) DESC
    `);

    return result.recordset;
};

// ======================================================
// Query: course stats
// totalNodes = số chặng/path
// totalLessons = số bài/node
// totalMaterials = số material
// ======================================================
const getCourseStats = async (courseId) => {
    const request = new sql.Request();

    request.input('courseId', sql.Int, Number(courseId));

    const result = await request.query(`
        SELECT
            COUNT(DISTINCT p.PathId) AS totalNodes,
            COUNT(DISTINCT pn.NodeId) AS totalLessons,
            COUNT(DISTINCT nm.MaterialId) AS totalMaterials
        FROM Courses c
        LEFT JOIN Paths p
            ON p.CourseId = c.CourseId
        LEFT JOIN Path_Nodes pn
            ON pn.PathId = p.PathId
        LEFT JOIN Node_Materials nm
            ON nm.NodeId = pn.NodeId
        WHERE c.CourseId = @courseId
    `);

    return result.recordset[0] || {
        totalNodes: 0,
        totalLessons: 0,
        totalMaterials: 0,
    };
};

// ======================================================
// Query: modules/path
// ======================================================
const getCourseModulesRaw = async (courseId) => {
    const request = new sql.Request();

    request.input('courseId', sql.Int, Number(courseId));

    const result = await request.query(`
        SELECT
            p.PathId AS id,
            p.PathName AS title,
            COUNT(pn.NodeId) AS totalLessons
        FROM Paths p
        LEFT JOIN Path_Nodes pn
            ON pn.PathId = p.PathId
        WHERE p.CourseId = @courseId
        GROUP BY p.PathId, p.PathName
        ORDER BY p.PathId ASC
    `);

    return result.recordset;
};

// ======================================================
// Query: lessons/node
// ======================================================
const getCourseLessonsRaw = async (courseId) => {
    const request = new sql.Request();

    request.input('courseId', sql.Int, Number(courseId));

    const result = await request.query(`
        SELECT
            p.PathId,
            p.PathName,

            pn.NodeId,
            pn.NodeName,
            pn.NodeOrder,

            DENSE_RANK() OVER (
                ORDER BY p.PathId ASC
            ) AS stageOrder,

            ROW_NUMBER() OVER (
                ORDER BY p.PathId ASC, pn.NodeOrder ASC
            ) AS lessonIndex
        FROM Paths p
        INNER JOIN Path_Nodes pn
            ON pn.PathId = p.PathId
        WHERE p.CourseId = @courseId
        ORDER BY p.PathId ASC, pn.NodeOrder ASC
    `);

    return result.recordset;
};
//=======================================================
// Enroll khoa hoc
//=======================================================
const enrollCourse = async (userId, courseId) => {
    const request = new sql.Request();

    request.input('userId', sql.Int, Number(userId));
    request.input('courseId', sql.Int, Number(courseId));

  
    const existed = await request.query(`
        SELECT *
        FROM User_Courses
        WHERE UserId = @userId
          AND CourseId = @courseId
    `);

    if (existed.recordset.length > 0) {
        throw new Error('COURSE_ALREADY_ENROLLED');
    }

    await request.query(`
        INSERT INTO User_Courses (
            UserId,
            CourseId,
            EnrollmentDate,
            ProgressPercentage
        )
        VALUES (
            @userId,
            @courseId,
            GETDATE(),
            0
        )
    `);

    return true;
};

// ======================================================
// Build modules theo progress
// Dùng cho student và all courses có userId
// ======================================================
const buildModulesByProgress = ({
    modulesRaw,
    lessonsRaw,
    progressPercentage,
    enrollmentStatus,
}) => {
    const progress = Number(progressPercentage) || 0;
    const completedCount = Math.floor((progress / 100) * lessonsRaw.length);

    return modulesRaw.map((module, index) => {
        const moduleLessons = lessonsRaw.filter(
            lesson => lesson.PathId === module.id
        );

        const completedLessons = moduleLessons.filter(
            lesson => lesson.lessonIndex <= completedCount
        ).length;

        let status = 'locked';

        if (completedLessons >= moduleLessons.length && moduleLessons.length > 0) {
            status = 'completed';
        } else if (completedLessons > 0 || enrollmentStatus === 'learning') {
            status = 'learning';
        } else if (index === 0 && enrollmentStatus !== 'available') {
            status = 'learning';
        } else if (index === 0 && enrollmentStatus === 'available') {
            status = 'available';
        }

        return {
            id: module.id,
            title: module.title,
            completedLessons,
            totalLessons: Number(module.totalLessons) || 0,
            status,
        };
    });
};

// ======================================================
// Build modules cho mentor
// Mentor không có progress học, coi như content đã có
// ======================================================
const buildMentorModules = (modulesRaw) => {
    return modulesRaw.map(module => ({
        id: module.id,
        title: module.title,
        completedLessons: Number(module.totalLessons) || 0,
        totalLessons: Number(module.totalLessons) || 0,
        status: 'completed',
    }));
};

// ======================================================
// Build current lesson theo progress
// ======================================================
const buildCurrentLessonByProgress = (lessonsRaw, progressPercentage) => {
    if (lessonsRaw.length === 0) {
        return {
            currentStage: null,
            currentLesson: null,
            currentLessonDetail: null,
        };
    }

    const progress = Number(progressPercentage) || 0;

    let currentIndex = Math.floor((progress / 100) * lessonsRaw.length);

    if (currentIndex >= lessonsRaw.length) {
        currentIndex = lessonsRaw.length - 1;
    }

    const lesson = lessonsRaw[currentIndex];

    return {
        currentStage: lesson.stageOrder,
        currentLesson: lesson.NodeOrder,
        currentLessonDetail: {
            stage: lesson.PathName,
            lesson: `Bài ${lesson.NodeOrder}`,
            title: lesson.NodeName,
        },
    };
};

// ======================================================
// Build current lesson cho mentor
// Lấy bài đầu tiên làm fallback
// ======================================================
const buildMentorCurrentLesson = (lessonsRaw) => {
    if (lessonsRaw.length === 0) {
        return {
            currentStage: null,
            currentLesson: null,
            currentLessonDetail: null,
        };
    }

    const lesson = lessonsRaw[0];

    return {
        currentStage: lesson.stageOrder,
        currentLesson: lesson.NodeOrder,
        currentLessonDetail: {
            stage: lesson.PathName,
            lesson: `Bài ${lesson.NodeOrder}`,
            title: lesson.NodeName,
        },
    };
};

// ======================================================
// Build recent lessons theo progress
// ======================================================
const buildRecentLessonsByProgress = (lessonsRaw, progressPercentage) => {
    const progress = Number(progressPercentage) || 0;
    const completedCount = Math.floor((progress / 100) * lessonsRaw.length);

    return lessonsRaw.slice(0, 3).map(lesson => ({
        id: lesson.NodeId,
        label: `Bài ${lesson.NodeOrder} · ${lesson.NodeName}`,
        isCompleted: lesson.lessonIndex <= completedCount,
        isCurrent: lesson.lessonIndex === completedCount + 1,
    }));
};

// ======================================================
// Build recent lessons cho mentor
// ======================================================
const buildMentorRecentLessons = (lessonsRaw) => {
    return lessonsRaw.slice(0, 3).map((lesson, index) => ({
        id: lesson.NodeId,
        label: `Bài ${lesson.NodeOrder} · ${lesson.NodeName}`,
        isCompleted: true,
        isCurrent: index === 0,
    }));
};

// ======================================================
// Build DTO chung
// ======================================================
const buildCourseDTO = ({
    course,
    stats,
    modules,
    currentLesson,
    recentLessons,
}) => {
    return {
        courseId: course.courseId,
        courseName: course.courseName,
        category: course.category,
        level: course.level,
        instructor: course.instructor,

        totalLessons:
            Number(stats.totalLessons) ||
            Number(course.totalLessons) ||
            0,

        totalNodes: Number(stats.totalNodes) || 0,
        totalMaterials: Number(stats.totalMaterials) || 0,

        progressPercentage: Number(course.progressPercentage) || 0,
        enrollmentStatus: course.enrollmentStatus,

        currentStage: currentLesson.currentStage,
        currentLesson: currentLesson.currentLesson,

        lastActivity: toRelativeDate(course.activityDate),
        lastActivityOrder: toActivityOrder(course.activityDate),

        thumbnail: course.thumbnail,

        modules,

        currentLessonDetail: currentLesson.currentLessonDetail,

        recentLessons,
    };
};

// ======================================================
// Build full course data
// Dùng chung cho student, mentor, all
// ======================================================
const buildFullCourseData = async (course, mode) => {
    const stats = await getCourseStats(course.courseId);
    const modulesRaw = await getCourseModulesRaw(course.courseId);
    const lessonsRaw = await getCourseLessonsRaw(course.courseId);

    let modules;
    let currentLesson;
    let recentLessons;

    if (mode === 'mentor') {
        modules = buildMentorModules(modulesRaw);
        currentLesson = buildMentorCurrentLesson(lessonsRaw);
        recentLessons = buildMentorRecentLessons(lessonsRaw);
    } else {
        modules = buildModulesByProgress({
            modulesRaw,
            lessonsRaw,
            progressPercentage: course.progressPercentage,
            enrollmentStatus: course.enrollmentStatus,
        });

        currentLesson = buildCurrentLessonByProgress(
            lessonsRaw,
            course.progressPercentage
        );

        recentLessons = buildRecentLessonsByProgress(
            lessonsRaw,
            course.progressPercentage
        );
    }

    return buildCourseDTO({
        course,
        stats,
        modules,
        currentLesson,
        recentLessons,
    });
};

// ======================================================
// Public: lấy courses của student
// ======================================================
const getStudentCourses = async (userId) => {
    const isStudent = await checkUserRole(userId, 'student');

    if (!isStudent) {
        return [];
    }

    const courses = await getStudentCourseBase(userId);

    const mappedCourses = await Promise.all(
        courses.map(course => buildFullCourseData(course, 'student'))
    );

    return mappedCourses;
};

// ======================================================
// Public: lấy courses của mentor
// ======================================================
const getMentorCourses = async (userId) => {
    const courses = await getMentorCourseBase(userId);

    const mappedCourses = await Promise.all(
        courses.map(course => buildFullCourseData(course, 'mentor'))
    );

    return mappedCourses;
};

// ======================================================
// Public: lấy tất cả courses
// Nếu truyền userId thì có progress của user đó.
// Nếu không truyền thì progress = 0.
// ======================================================
const getAllCourses = async (userId = null) => {
    const courses = await getAllCourseBase(userId);

    const mappedCourses = await Promise.all(
        courses.map(course => buildFullCourseData(course, 'all'))
    );

    return mappedCourses;
};

// ======================================================
// Public: lấy courses theo role
// ======================================================
const getCoursesByRole = async (userId, roleName) => {
    if (roleName === 'student') {
        return await getStudentCourses(userId);
    }

    if (roleName === 'mentor') {
        return await getMentorCourses(userId);
    }

    return [];
};

module.exports = {
    getCoursesByRole,
    getStudentCourses,
    getMentorCourses,
    getAllCourses,
    enrollCourse
};