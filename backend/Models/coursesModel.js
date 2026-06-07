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
module.exports = {
<<<<<<< HEAD
    getCoursesByRole,
    getStudentCourses,
    getMentorCourses,
    getAllCourses,
    enrollCourse
};
=======
    getCoursesByUserRole,
    getCourseById,
    createCourseStepOne,
    createFinalCourse
}
>>>>>>> 6899305ef9da9713cfeed4287282a46f8cd986b4
