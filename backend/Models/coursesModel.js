const { sql } = require('../config/db');

const getCoursesByUserRole = (userId, userRole) => {
    if (userRole.toLowerCase() === 'mentor') {
        return getMentorCourses(userId);
    }
    if (userRole.toLowerCase() === 'student') {
        return getStudentCourses(userId);
    }
    return null;
}

const getStudentCoursesList = async (filters, userId) => {
    const request = new sql.Request();
    const { search, category, level, status, sort } = filters;

    let baseQuery = `
        FROM Courses crs
        LEFT JOIN Categories cate ON crs.CategoryId = cate.CategoryId
        LEFT JOIN Levels lv ON crs.LevelId = lv.LevelId
        WHERE crs.IsPublished = 1
    `;

    if (search) {
        baseQuery += ` AND crs.CourseName LIKE @Search`;
        request.input('Search', sql.NVarChar(200), `%${search}%`);
    }

    if (category) {
        // Nếu là mảng thì ép thành chuỗi , nếu là chuỗi đơn lẻ thì giữ nguyên
        const catIds = Array.isArray(category) ? category.join(',') : category;

        // Nếu chuỗi có dữ liệu thì mới nối vào câu SQL
        if (catIds && String(catIds).trim() !== '') {
            baseQuery += ` AND crs.CategoryId IN (${catIds})`;
        }
    }

    if (level) {
        const levIds = Array.isArray(level) ? level.join(',') : level;

        if (levIds && String(levIds).trim() !== '') {
            baseQuery += ` AND crs.LevelId IN (${levIds})`;
        }
    }

    if (status && userId) {
        if (status === 'enrolled') {
            baseQuery += ` AND EXISTS (SELECT 1 FROM User_Courses uc WHERE uc.CourseId = crs.CourseId AND uc.UserId = @UserId)`;
        } else if (status === 'not_enrolled') {
            baseQuery += ` AND NOT EXISTS (SELECT 1 FROM User_Courses uc WHERE uc.CourseId = crs.CourseId AND uc.UserId = @UserId)`;
        }
        // we might need UserId input if it hasn't been added
        if (!request.parameters.UserId) {
            request.input('UserId', sql.Int, userId);
        }
    }

    // Total count query
    const countQuery = `SELECT COUNT(*) AS totalCount ${baseQuery}`;
    const countResult = await request.query(countQuery);
    const totalCount = countResult.recordset[0].totalCount;

    // Main select query
    let selectQuery = `
        SELECT crs.CourseId, crs.CourseName, crs.Description, crs.CategoryId, crs.LevelId,
               lv.LevelName as levelName, lv.DisplayName as LevelDisplayName, lv.SortOrder as LevelSortOrder,
               crs.Thumbnail, crs.CreatedAt, crs.UpdatedAt,
               cate.DisplayName as CategoryDisplayName, cate.CategoryName as CategoryName
        ${baseQuery}
    `;

    // Sort
    if (sort === 'newest') {
        selectQuery += ` ORDER BY crs.CreatedAt DESC`;
    } else {
        selectQuery += ` ORDER BY crs.CourseId DESC`; // Default
    }

    const coursesResult = await request.query(selectQuery);

    const coursesWithPaths = await buildCourse(coursesResult.recordset);
    return { courses: coursesWithPaths, totalCount };
};

//  courseId, courseName, description, category, level,
//  *         thumbnail, isPublished, createdAt, updatedAt,
//  *         chapterCount, lessonCount, materialCount,
//  *         studentCount, rating


//Courses : courseId, courseName, description, category, createAt, updateAt, isPublished
// Category: categoryName (courseId)
//Paths : chapterCount (courseId)
//Path_Nodes: lessonCount (pathId)
//Node_Materials: materialCount (nodeId)
//User_Courses: studentCount (userId)
//Rating: rating


// Get Information Course Base 





// Get Mentor's courses
const getMentorCourses = async (userId) => {
    const request = new sql.Request();
    request.input('InstructorId', sql.Int, userId);

    const result = await request.query(
        `Select crs.CourseId,
   crs.CourseName,
   crs.Description, crs.CategoryId,
   crs.LevelId,
   Levels.LevelName as levelName,
   Levels.Displayname as LevelDisplayName,
   Levels.SortOrder as LevelSortOrder,
   crs.Thumbnail,
   crs.IsPublished,
   crs.CreatedAt,
   crs.UpdatedAt,
    cate.DisplayName as CategoryDisplayName,
    cate.CategoryName as CategoryName
   from courses crs
join Categories cate
on crs.CategoryId = cate.CategoryId
join Levels
on Levels.LevelId = crs.LevelId
  Where InstructorId = @InstructorId`
    );
    return await buildCourse(result.recordset);
}

// Function nhận một mảng courses rồi gọi tới getCourseBase để format courses
const buildCourse = async (courses) => {
    return await Promise.all(
        courses.map(async (course) => {
            return {
                ...course,
                Paths: await getCoursePaths(course.CourseId)
            };
        })
    );
};


// Get Total course's paths
// Get Total course's lessons (node)
// Get Total course's materials
// Get Course's rating

const getCoursePaths = async (courseId) => {
    const request = new sql.Request();
    request.input('courseId', sql.Int, courseId);

    const result = await request.query`
         Select * From Paths
         Where CourseId = @courseId
    `
    return result.recordset
}
// Get Student's courses

const getStudentCourses = async (userId) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    let query = `
        SELECT crs.CourseId, crs.CourseName, crs.Description, crs.Thumbnail,
               uc.ProgressPercentage, uc.EnrolledAt
        FROM User_Courses uc
        JOIN Courses crs ON uc.CourseId = crs.CourseId
        WHERE uc.UserId = @UserId
    `;

    if (filterStatus === 'learning') {
        // Đang học: Tiến độ lớn hơn 0 và nhỏ hơn 100%
        query += ` AND uc.ProgressPercentage > 0 AND uc.ProgressPercentage < 100`;
    } else if (filterStatus === 'completed') {
        // Đã hoàn thành: Tiến độ đạt đúng 100%
        query += ` AND uc.ProgressPercentage = 100`;
    } else if (filterStatus === 'not_started') {
        // Chưa học: Mới bấm đăng ký chứ chưa bấm vào học (0%)
        query += ` AND uc.ProgressPercentage = 0`;
    }

    // Sắp xếp theo ngày đăng ký mới nhất lên đầu
    query += ` ORDER BY uc.EnrolledAt DESC`;

    const result = await request.query(query);
    return result.recordset;
}


// GET Course's Information by it's Id
const getCourseById = async (courseId) => {
    const request = new sql.Request();
    request.input('courseId', sql.Int, courseId);

    const result = await request.query(`Select crs.CourseId,
   crs.CourseName,
   crs.Description, crs.CategoryId,
   crs.LevelId,
   Levels.LevelName as levelName,
   Levels.Displayname as LevelDisplayName,
   Levels.SortOrder as LevelSortOrder,
   crs.Thumbnail,
   crs.IsPublished,
   crs.CreatedAt,
   crs.UpdatedAt,
    cate.DisplayName as CategoryDisplayName,
    cate.CategoryName as CategoryName
   from courses crs
join Categories cate
on crs.CategoryId = cate.CategoryId
join Levels
on Levels.LevelId = crs.LevelId
  Where crs.CourseId = @courseId`);
    return await buildCourse(result.recordset);
}

//create course step 1 (draft)
const createCourseStepOne = async (course) => {
    const request = new sql.Request();

    request.input('CourseName', sql.NVarChar(200), course.CourseName);
    request.input('Description', sql.NVarChar(sql.MAX), course.Description);
    request.input('CategoryId', sql.Int, Number(course.CategoryId));
    request.input('LevelId', sql.Int, Number(course.LevelId));
    request.input('InstructorId', sql.Int, Number(course.InstructorId));
    request.input('Thumbnail', sql.NVarChar(500), 'Chưa Fix Lỗi ẢNh'); //course.Thumbnail || null

    request.input('Rating', sql.Decimal(3, 1), course.Rating ?? 0.0);
    request.input('TotalLessons', sql.Int, course.TotalLessons ?? 0);
    request.input('IsPublished', sql.Bit, course.IsPublished ?? false);

    const result = await request.query(`
    INSERT INTO Courses (
      CourseName,
      Description,
      CategoryId,
      LevelId,
      InstructorId,
      Thumbnail,
      Rating,
      TotalLessons,
      CreatedAt,
      UpdatedAt,
      IsPublished
    )
    OUTPUT INSERTED.*
    VALUES (
      @CourseName,
      @Description,
      @CategoryId,
      @LevelId,
      @InstructorId,
      @Thumbnail,
      @Rating,
      @TotalLessons,
      GETDATE(),
      GETDATE(),
      @IsPublished
    )
  `);

    return result.recordset[0].CourseId;
};



// insert nodes into path
// insert nodes into path
const insertNode = async (node, pathId) => {

    const nodeIds = [];

    const request = new sql.Request();

    request.input('PathId', sql.Int, pathId);
    request.input('NodeName', sql.NVarChar(255), node.NodeName);
    request.input('NodeOrder', sql.Int, node.NodeOrder);
    request.input('Description', sql.NVarChar(sql.MAX), node.Description ?? null);

    const result = await request.query(`
            INSERT INTO [dbo].[Path_Nodes]
                ([PathId], [NodeName], [NodeOrder], [Description])
            OUTPUT INSERTED.NodeId
            VALUES
                (@PathId, @NodeName, @NodeOrder, @Description)
        `);

    const nodeId = result.recordset[0].NodeId;

    nodeIds.push(nodeId);

    return nodeIds;
};
a
// insert path into course
const insertPath = async (path, courseId) => {
    const insertedPathIds = [];

    const request = new sql.Request();

    request.input('CourseId', sql.Int, Number(courseId));
    request.input('PathName', sql.NVarChar(100), path.PathName);
    request.input('Description', sql.NVarChar(sql.MAX), path.Description || null);
    request.input('Order', sql.Int, Number(path.PathOrder ?? i + 1));

    const result = await request.query(`
      INSERT INTO [dbo].[Paths] (
        [CourseId],
        [PathName],
        [Description],
        [CreatedAt],
        [Order]
      )
      OUTPUT INSERTED.PathId AS pathId
      VALUES (
        @CourseId,
        @PathName,
        @Description,
        GETDATE(),
        @Order
      )
    `);
    insertedPathIds.push(result.recordset[0].pathId);
    return insertedPathIds;
}

// insert material into node
// insert 1 material into node
const insertMaterial = async (material, nodeId) => {
    const request = new sql.Request();

    request.input('NodeId', sql.Int, Number(nodeId));
    request.input('MaterialType', sql.NVarChar(20), material.MaterialType);
    request.input('Title', sql.NVarChar(255), material.Title);
    request.input('MaterialUrl', sql.NVarChar(sql.MAX), material.MaterialUrl ?? null);
    request.input('MaterialOrder', sql.Int, Number(material.MaterialOrder));

    const result = await request.query(`
        INSERT INTO [dbo].[Node_Materials]
            ([NodeId], [MaterialType], [Title], [MaterialUrl], [MaterialOrder])
        OUTPUT INSERTED.MaterialId AS MaterialId
        VALUES
            (@NodeId, @MaterialType, @Title, @MaterialUrl, @MaterialOrder)
    `);

    return result.recordset[0].MaterialId;
};

// insert paths into course
const buildPathsNodes = async (paths, courseId) => {
    paths.map(async (p) => {
        // insert path into course
        const pathId = await insertPath(p, courseId);
        // insert node into path
        const nodes = p.nodes;
        nodes.map(async (node) => {
            const nodeId = await insertNode(node, pathId);
            // insert materials into node
            const materials = node.materials;
            materials.map(async (m) => {
                await insertMaterial(m, nodeId)
            })
        })
    })

};

// create new course (final step in create course process)
const createFinalCourse = async (course, paths) => {
    //create course (step one in create course process)
    const newCourseId = await createCourseStepOne(course);
    await buildPathsNodes(paths, newCourseId);
}

const getMyEnrolledCourses = async (userId, filterStatus = 'all') => {
    const request = new sql.Request();
    request.input('UserId', sql.Int, userId); // Biến truyền vào là @UserId (chữ U viết hoa)

    // 1. Khởi tạo câu lệnh gốc (Chưa có ORDER BY ở đây để tí nữa nối chuỗi lọc cho chuẩn)
    let query = `
        SELECT 
            crs.CourseId, 
            crs.CourseName, 
            crs.Description, 
            crs.Thumbnail, 
            uc.ProgressPercentage, 
            uc.EnrolledAt
        FROM User_Courses uc
        INNER JOIN Courses crs ON uc.CourseId = crs.CourseId
        WHERE uc.UserId = @UserId
    `;

    // 2. Nối các điều kiện lọc AND (Phải nằm trước ORDER BY)
    if (filterStatus === 'learning') {
        query += ` AND uc.ProgressPercentage > 0 AND uc.ProgressPercentage < 100`;
    } else if (filterStatus === 'completed') {
        query += ` AND uc.ProgressPercentage = 100`;
    } else if (filterStatus === 'not_started') {
        query += ` AND uc.ProgressPercentage = 0`;
    }

    // 3. Đút ORDER BY xuống cuối cùng của toàn bộ câu lệnh
    query += ` ORDER BY uc.EnrolledAt DESC`;

    const result = await request.query(query);
    return result.recordset;
}

// Hàm đăng ký khóa học (Thêm vào Model để Controller gọi)
const enrollCourse = async (userId, courseId) => {
    const request = new sql.Request();
    request.input('UserId', sql.Int, userId);
    request.input('CourseId', sql.Int, courseId);

    const result = await request.query(`
        INSERT INTO User_Courses (UserId, CourseId, ProgressPercentage, EnrolledAt)
        VALUES (@UserId, @CourseId, 0, GETDATE())
    `);
    return result.rowsAffected;
};
module.exports = {
    getCoursesByUserRole,
    getCourseById,
    createCourseStepOne,
    createFinalCourse,
    getStudentCoursesList,
    getMyEnrolledCourses,
    enrollCourse
}