const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Course = require('./MongoDB/Course');
const Path = require('./MongoDB/Path');
const PathNode = require('./MongoDB/PathNode');
const NodeMaterial = require('./MongoDB/NodeMaterial');
const UserCourse = require('./MongoDB/UserCourse');
const UserNode = require('./MongoDB/UserNode');
const { saveCourseThumbnailFromDataUrl } = require('../middlewares/courseThumbnailMiddleware');

// ==========================================
// HELPERS
// ==========================================

/** Ghép nối cấu trúc: Course -> Paths -> Nodes -> Materials */
const buildCourse = async (courses) => {
  return await Promise.all(
    courses.map(async (course) => {
      const coursePaths = await getCoursePaths(course._id);
      const pathsWithNodes = await Promise.all(
        coursePaths.map(async (path) => {
          const nodes = await getPathNodes(path._id);
          const nodesWithMaterials = await Promise.all(
            nodes.map(async (node) => {
              const materials = await getMaterials(node._id);
              return { ...node, Materials: materials };
            }),
          );
          return { ...path, Nodes: nodesWithMaterials };
        }),
      );
      return { ...course, Paths: pathsWithNodes };
    }),
  );
};

const getCoursePaths = async (courseId) => {
  return await Path.find({ courseId }).sort({ order: 1 }).lean();
};

const getPathNodes = async (pathId) => {
  return await PathNode.find({ pathId }).sort({ nodeOrder: 1 }).lean();
};

const getMaterials = async (nodeId) => {
  return await NodeMaterial.find({ nodeId }).sort({ materialOrder: 1 }).lean();
};

// ==========================================
// 1. CÁC HÀM LẤY DANH SÁCH KHÓA HỌC CHUNG
// ==========================================

const getCoursesByUserRole = async (userId, userRole) => {
  if (userRole.toLowerCase() === 'mentor') {
    return getMentorCourses(userId);
  }
  if (userRole.toLowerCase() === 'student') {
    return getStudentCourses(userId);
  }
  return null;
};

/** Lấy khóa học nổi bật theo số lượng người tham gia */
const getFeaturedCourses = async () => {
  const courses = await Course.aggregate([
    { $match: { isPublished: true } },
    {
      $lookup: {
        from: 'usercourses',
        localField: '_id',
        foreignField: 'courseId',
        as: 'enrollments',
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $lookup: {
        from: 'levels',
        localField: 'levelId',
        foreignField: '_id',
        as: 'level',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'instructorId',
        foreignField: '_id',
        as: 'instructor',
      },
    },
    {
      $addFields: {
        totalStudents: { $size: '$enrollments' },
        categoryName: { $arrayElemAt: ['$category.displayName', 0] },
        levelName: { $arrayElemAt: ['$level.displayName', 0] },
        instructorName: { $arrayElemAt: ['$instructor.fullName', 0] },
      },
    },
    { $sort: { totalStudents: -1 } },
    { $limit: 4 },
    {
      $project: {
        _id: 1,
        courseName: 1,
        description: 1,
        thumbnail: 1,
        rating: 1,
        totalLessons: 1,
        categoryName: 1,
        levelName: 1,
        instructorName: 1,
        totalStudents: 1,
      },
    },
  ]);
  return courses;
};

/** Lấy top 4 khóa học có đánh giá (Rating) cao nhất */
const getFeaturedPaths = async () => {
  const courses = await Course.aggregate([
    { $match: { isPublished: true } },
    {
      $lookup: {
        from: 'usercourses',
        localField: '_id',
        foreignField: 'courseId',
        as: 'enrollments',
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $lookup: {
        from: 'levels',
        localField: 'levelId',
        foreignField: '_id',
        as: 'level',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'instructorId',
        foreignField: '_id',
        as: 'instructor',
      },
    },
    {
      $addFields: {
        totalStudents: { $size: '$enrollments' },
        categoryName: { $arrayElemAt: ['$category.displayName', 0] },
        levelName: { $arrayElemAt: ['$level.displayName', 0] },
        instructorName: { $arrayElemAt: ['$instructor.fullName', 0] },
      },
    },
    { $sort: { rating: -1 } },
    { $limit: 4 },
    {
      $project: {
        _id: 1,
        courseName: 1,
        description: 1,
        thumbnail: 1,
        rating: 1,
        totalLessons: 1,
        categoryName: 1,
        levelName: 1,
        instructorName: 1,
        totalStudents: 1,
      },
    },
  ]);
  return courses;
};

/** Lấy tất cả khóa học cho màn hình Catalog (Có phân trang, bộ lọc) */
const getStudentCoursesList = async (filters, userId) => {
  const { search, category, level, status, sort } = filters;

  const matchStage = { isPublished: true };

  if (search) {
    matchStage.courseName = { $regex: search, $options: 'i' };
  }
  if (category) {
    const catIds = Array.isArray(category) ? category : [category];
    matchStage.categoryId = { $in: catIds.map(id => new ObjectId(id)) };
  }
  if (level) {
    const levIds = Array.isArray(level) ? level : [level];
    matchStage.levelId = { $in: levIds.map(id => new ObjectId(id)) };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $lookup: {
        from: 'levels',
        localField: 'levelId',
        foreignField: '_id',
        as: 'level',
      },
    },
    {
      $lookup: {
        from: 'usercourses',
        let: { courseId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: (() => {
                  const conditions = [{ $eq: ['$courseId', '$$courseId'] }];
                  if (userId) conditions.push({ $eq: ['$userId', new ObjectId(userId)] });
                  return conditions;
                })(),
              },
            },
          },
        ],
        as: 'userCourse',
      },
    },
    {
      $addFields: {
        categoryDisplayName: { $arrayElemAt: ['$category.displayName', 0] },
        categoryName: { $arrayElemAt: ['$category.categoryName', 0] },
        levelName: { $arrayElemAt: ['$level.levelName', 0] },
        levelDisplayName: { $arrayElemAt: ['$level.displayName', 0] },
        isEnrolled: { $cond: [{ $gt: [{ $size: '$userCourse' }, 0] }, 1, 0] },
      },
    },
  ];

  // Lọc theo trạng thái đã đăng ký
  if (status === 'enrolled' && userId) {
    pipeline.push({ $match: { isEnrolled: 1 } });
  } else if (status === 'not_enrolled' && userId) {
    pipeline.push({ $match: { isEnrolled: 0 } });
  }

  // Sắp xếp
  if (sort === 'newest') {
    pipeline.push({ $sort: { createdAt: -1 } });
  } else {
    pipeline.push({ $sort: { _id: -1 } });
  }

  // Count total
  const countPipeline = [...pipeline, { $count: 'totalCount' }];
  const countResult = await Course.aggregate(countPipeline);
  const totalCount = countResult[0]?.totalCount || 0;

  // Get data
  pipeline.push({
    $project: {
      _id: 1,
      courseName: 1,
      description: 1,
      categoryId: 1,
      levelId: 1,
      levelName: 1,
      levelDisplayName: 1,
      thumbnail: 1,
      createdAt: 1,
      updatedAt: 1,
      categoryDisplayName: 1,
      categoryName: 1,
      isEnrolled: 1,
    },
  });

  const courses = await Course.aggregate(pipeline);
  const coursesWithPaths = await buildCourse(courses);
  return { courses: coursesWithPaths, totalCount };
};

// ==========================================
// 2. CHI TIẾT KHÓA HỌC & MENTOR
// ==========================================

const getCourseById = async (courseId, userId = null) => {
  const pipeline = [
    { $match: { _id: new ObjectId(courseId) } },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $lookup: {
        from: 'levels',
        localField: 'levelId',
        foreignField: '_id',
        as: 'level',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'instructorId',
        foreignField: '_id',
        as: 'instructor',
      },
    },
    {
      $lookup: {
        from: 'usercourses',
        let: { courseId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: (() => {
                  const conditions = [{ $eq: ['$courseId', '$$courseId'] }];
                  if (userId) conditions.push({ $eq: ['$userId', new ObjectId(userId)] });
                  return conditions;
                })(),
              },
            },
          },
        ],
        as: 'userCourse',
      },
    },
    {
      $lookup: {
        from: 'usercourses',
        localField: '_id',
        foreignField: 'courseId',
        as: 'allEnrollments',
      },
    },
    {
      $addFields: {
        categoryDisplayName: { $arrayElemAt: ['$category.displayName', 0] },
        categoryName: { $arrayElemAt: ['$category.categoryName', 0] },
        categoryId: { $arrayElemAt: ['$category._id', 0] },
        levelDisplayName: { $arrayElemAt: ['$level.displayName', 0] },
        levelName: { $arrayElemAt: ['$level.levelName', 0] },
        levelId: { $arrayElemAt: ['$level._id', 0] },
        instructorName: { $arrayElemAt: ['$instructor.fullName', 0] },
        instructorId: { $arrayElemAt: ['$instructor._id', 0] },
        studentCount: { $size: '$allEnrollments' },
        isEnrolled: { $cond: [{ $gt: [{ $size: '$userCourse' }, 0] }, 1, 0] },
        progress: {
          $ifNull: [{ $arrayElemAt: ['$userCourse.progressPercentage', 0] }, 0],
        },
      },
    },
    {
      $project: {
        _id: 1,
        courseName: 1,
        description: 1,
        rating: 1,
        studentCount: 1,
        createdAt: 1,
        updatedAt: 1,
        thumbnail: 1,
        totalLessons: 1,
        instructorName: 1,
        instructorId: 1,
        isPublished: 1,
        levelId: 1,
        levelName: 1,
        levelDisplayName: 1,
        categoryId: 1,
        categoryName: 1,
        categoryDisplayName: 1,
        isEnrolled: 1,
        progress: 1,
      },
    },
  ];

  const courses = await Course.aggregate(pipeline);
  return await buildCourse(courses);
};

/** Lấy khóa học đang học hiển thị ở homepage */
const getContinueCourse = async (userId) => {
  const userCourses = await UserCourse.find({ userId })
    .sort({ progressPercentage: -1 })
    .limit(1)
    .populate('courseId')
    .lean();

  if (!userCourses.length) return null;

  const uc = userCourses[0];
  const course = uc.courseId;
  if (!course) return null;

  return [{
    _id: course._id,
    courseName: course.courseName,
    thumbnail: course.thumbnail,
    progressPercentage: uc.progressPercentage,
  }];
};

const getMentorCourses = async (userId) => {
  const courses = await Course.find({ instructorId: new ObjectId(userId) })
    .populate('categoryId', 'displayName categoryName')
    .populate('levelId', 'levelName displayName sortOrder')
    .lean();

  const enriched = await Promise.all(
    courses.map(async (course) => {
      const studentCount = await UserCourse.countDocuments({ courseId: course._id });
      return {
        ...course,
        studentCount,
        categoryDisplayName: course.categoryId?.displayName || '',
        categoryName: course.categoryId?.categoryName || '',
        levelName: course.levelId?.levelName || '',
        levelDisplayName: course.levelId?.displayName || '',
        levelSortOrder: course.levelId?.sortOrder || 0,
      };
    }),
  );

  return await buildCourse(enriched);
};

// ==========================================
// 3. API DÀNH CHO HỌC VIÊN (STUDENT) & ĐĂNG KÝ
// ==========================================

const getStudentCourses = async (userId, filterStatus = 'all') => {
  const match = { userId: new ObjectId(userId) };

  const userCourses = await UserCourse.find(match)
    .populate('courseId', 'courseName description thumbnail')
    .sort({ enrollmentDate: -1 })
    .lean();

  let results = userCourses.map(uc => ({
    ...uc.courseId,
    progressPercentage: uc.progressPercentage,
    enrollmentDate: uc.enrollmentDate,
  }));

  if (filterStatus === 'learning') {
    results = results.filter(r => r.progressPercentage > 0 && r.progressPercentage < 100);
  } else if (filterStatus === 'completed') {
    results = results.filter(r => r.progressPercentage === 100);
  } else if (filterStatus === 'not_started') {
    results = results.filter(r => r.progressPercentage === 0);
  }

  return results;
};

const getMyEnrolledCourses = async (userId, filterStatus = 'all') => {
  const match = { userId: new ObjectId(userId) };

  const userCourses = await UserCourse.find(match)
    .populate({
      path: 'courseId',
      populate: [
        { path: 'categoryId', select: 'categoryName displayName' },
        { path: 'levelId', select: 'levelName displayName' },
      ],
    })
    .sort({ enrollmentDate: -1 })
    .lean();

  let results = userCourses.map(uc => {
    const course = uc.courseId;
    return {
      _id: course?._id,
      courseName: course?.courseName,
      description: course?.description,
      thumbnail: course?.thumbnail,
      progress: uc.progressPercentage,
      enrollmentDate: uc.enrollmentDate,
      categoryName: course?.categoryId?.categoryName || '',
      categoryDisplayName: course?.categoryId?.displayName || '',
      levelName: course?.levelId?.levelName || '',
      levelDisplayName: course?.levelId?.displayName || '',
    };
  });

  if (filterStatus === 'learning') {
    results = results.filter(r => r.progress > 0 && r.progress < 100);
  } else if (filterStatus === 'completed') {
    results = results.filter(r => r.progress === 100);
  } else if (filterStatus === 'not_started') {
    results = results.filter(r => r.progress === 0);
  }

  return results;
};

/** Đăng ký khóa học */
const enrollCourse = async (userId, courseId) => {
  const existing = await UserCourse.findOne({
    userId: new ObjectId(userId),
    courseId: new ObjectId(courseId),
  });

  if (existing) {
    return { success: false, message: 'Bạn đã đăng ký khóa học này rồi!' };
  }

  await UserCourse.create({
    userId: new ObjectId(userId),
    courseId: new ObjectId(courseId),
    progressPercentage: 0,
    enrollmentDate: new Date(),
  });

  return { success: true };
};

// ==========================================
// 4. CÁC HÀM TẠO KHÓA HỌC MỚI (CREATE COURSE)
// ==========================================

const createCourseStepOne = async (course) => {
  const newCourse = await Course.create({
    courseName: course.CourseName,
    description: course.Description,
    categoryId: new ObjectId(course.CategoryId),
    levelId: new ObjectId(course.LevelId),
    instructorId: new ObjectId(course.InstructorId),
    thumbnail: course.Thumbnail || null,
    rating: course.Rating ?? 0.0,
    totalLessons: course.TotalLessons ?? 0,
    isPublished: course.IsPublished ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return newCourse._id;
};

const insertPath = async (path, courseId) => {
  const newPath = await Path.create({
    courseId: new ObjectId(courseId),
    pathName: path.PathName,
    description: path.Description || null,
    order: Number(path.PathOrder ?? 1),
    createdAt: new Date(),
  });
  return newPath._id;
};

const insertNode = async (node, pathId) => {
  const newNode = await PathNode.create({
    pathId: new ObjectId(pathId),
    nodeName: node.NodeName,
    nodeOrder: node.NodeOrder,
    description: node.Description ?? null,
  });
  return newNode._id;
};

const insertMaterial = async (material, nodeId) => {
  const materialUrl = material.MaterialUrl ?? null;
  const newMaterial = await NodeMaterial.create({
    nodeId: new ObjectId(nodeId),
    materialType: material.MaterialType,
    title: material.Title,
    materialUrl: materialUrl,
    materialOrder: Number(material.MaterialOrder),
    sourceType: material.SourceType ?? null,
    fileName: material.FileName ?? null,
    fileSize: material.FileSize != null ? Number(material.FileSize) : null,
    embedUrl: material.EmbedUrl ?? null,
    content: material.Content ?? null,
  });
  return newMaterial._id;
};

const increaseCourseTotalLessons = async (courseId) => {
  await Course.findByIdAndUpdate(courseId, {
    $inc: { totalLessons: 1 },
    updatedAt: new Date(),
  });
};

const buildPathsNodes = async (paths, courseId) => {
  for (const p of paths ?? []) {
    const pathId = await insertPath(p, courseId);
    const nodes = p.Nodes ?? p.nodes ?? [];
    for (const node of nodes) {
      const nodeId = await insertNode(node, pathId);
      await increaseCourseTotalLessons(courseId);
      const materials = node.Materials ?? node.materials ?? [];
      for (const m of materials) {
        await insertMaterial(m, nodeId);
      }
    }
  }
};

const createFinalCourse = async (course, paths) => {
  const newCourseId = await createCourseStepOne(course);
  if (course.Thumbnail) {
    const thumbnailPath = saveCourseThumbnailFromDataUrl(course.Thumbnail, newCourseId);
    await updateCourseThumbnail(newCourseId, thumbnailPath);
  }
  await buildPathsNodes(paths, newCourseId);
  return newCourseId;
};

const replaceCourseContent = async (courseId, paths) => {
  await clearCourseContent(courseId);
  await buildPathsNodes(paths, courseId);
};

const getCourseInstructorId = async (courseId) => {
  const course = await Course.findById(courseId).select('instructorId').lean();
  return course?.instructorId ?? null;
};

const clearCourseContent = async (courseId) => {
  const paths = await Path.find({ courseId }).lean();
  const pathIds = paths.map(p => p._id);
  const nodes = await PathNode.find({ pathId: { $in: pathIds } }).lean();
  const nodeIds = nodes.map(n => n._id);

  await UserNode.deleteMany({ nodeId: { $in: nodeIds } });
  await NodeMaterial.deleteMany({ nodeId: { $in: nodeIds } });
  await PathNode.deleteMany({ pathId: { $in: pathIds } });
  await Path.deleteMany({ courseId });
  await Course.findByIdAndUpdate(courseId, { totalLessons: 0, updatedAt: new Date() });
};

const getCourseStudentCount = async (courseId) => {
  return await UserCourse.countDocuments({ courseId: new ObjectId(courseId) });
};

const updateCourseById = async (courseId, course) => {
  const result = await Course.findByIdAndUpdate(
    courseId,
    {
      courseName: course.CourseName,
      description: course.Description,
      categoryId: new ObjectId(course.CategoryId),
      levelId: new ObjectId(course.LevelId),
      isPublished: course.IsPublished ?? false,
      updatedAt: new Date(),
    },
    { new: true },
  );
  return result?._id ?? null;
};

const updateCourseThumbnail = async (courseId, thumbnailPath) => {
  await Course.findByIdAndUpdate(courseId, {
    thumbnail: thumbnailPath,
    updatedAt: new Date(),
  });
};

const setPublishCourse = async (courseId) => {
  const result = await Course.findByIdAndUpdate(
    courseId,
    { isPublished: true, updatedAt: new Date() },
    { new: true },
  );
  return result?._id || null;
};

const setDraftCourse = async (courseId) => {
  const result = await Course.findByIdAndUpdate(
    courseId,
    { isPublished: false, updatedAt: new Date() },
    { new: true },
  );
  return result?._id || null;
};

/** Lấy danh sách bài học (Kèm trạng thái hoàn thành) */
const getCourseLearningPath = async (courseId, userId) => {
  const paths = await Path.find({ courseId: new ObjectId(courseId) })
    .sort({ order: 1 })
    .lean();

  const finalModules = [];

  for (const path of paths) {
    const nodes = await PathNode.find({ pathId: path._id })
      .sort({ nodeOrder: 1 })
      .lean();

    const lessons = [];
    for (const node of nodes) {
      const materials = await NodeMaterial.find({ nodeId: node._id })
        .sort({ materialOrder: 1 })
        .lean();

      const userNode = userId
        ? await UserNode.findOne({
            userId: new ObjectId(userId),
            nodeId: node._id,
          }).lean()
        : null;

      const firstMaterial = materials[0] || {};

      lessons.push({
        NodeId: node._id.toString(),
        NodeName: node.nodeName,
        Description: node.description ?? null,
        NodeOrder: node.nodeOrder,
        MaterialType: firstMaterial.materialType || null,
        MaterialUrl: firstMaterial.materialUrl || null,
        IsCompleted: userNode?.isCompleted || false,
      });
    }

    finalModules.push({
      PathId: path._id.toString(),
      PathName: path.pathName,
      Description: path.description ?? null,
      lessons,
    });
  }

  return finalModules;
};

/** Lưu tiến độ: chạy khi User ấn nút "Đánh dấu hoàn thành" */
const markNodeAsCompleted = async (courseId, userId, nodeId) => {
  // Lưu trạng thái bài học vào User_Nodes
  const existing = await UserNode.findOne({
    userId: new ObjectId(userId),
    nodeId: new ObjectId(nodeId),
  });

  if (!existing) {
    await UserNode.create({
      userId: new ObjectId(userId),
      nodeId: new ObjectId(nodeId),
      isCompleted: true,
      completedAt: new Date(),
    });
  }

  // Tính lại % tiến độ tổng
  const totalNodes = await PathNode.countDocuments({
    pathId: { $in: (await Path.find({ courseId: new ObjectId(courseId) }).select('_id').lean()).map(p => p._id) },
  });

  const completedNodes = await UserNode.countDocuments({
    userId: new ObjectId(userId),
    nodeId: {
      $in: (await PathNode.find({
        pathId: { $in: (await Path.find({ courseId: new ObjectId(courseId) }).select('_id').lean()).map(p => p._id) },
      }).select('_id').lean()).map(n => n._id),
    },
  });

  const newProgress = totalNodes > 0 ? Math.round((completedNodes * 100) / totalNodes) : 0;

  await UserCourse.findOneAndUpdate(
    { userId: new ObjectId(userId), courseId: new ObjectId(courseId) },
    { progressPercentage: newProgress },
  );

  return newProgress;
};

/** Mục lục chương + bài (không kèm học liệu) */
const getCourseChaptersOutline = async (courseId) => {
  const course = await Course.findById(courseId).lean();
  if (!course) return null;

  const paths = await Path.find({ courseId: new ObjectId(courseId) })
    .sort({ order: 1 })
    .lean();

  return Promise.all(
    paths.map(async (path) => {
      const nodes = await PathNode.find({ pathId: path._id })
        .sort({ nodeOrder: 1 })
        .select('nodeName nodeOrder')
        .lean();

      return {
        PathId: path._id.toString(),
        PathName: path.pathName,
        Order: path.order,
        Nodes: nodes.map((node) => ({
          NodeId: node._id.toString(),
          NodeName: node.nodeName,
          NodeOrder: node.nodeOrder,
        })),
      };
    }),
  );
};

module.exports = {
  getCoursesByUserRole,
  getCourseById,
  getCourseChaptersOutline,
  createCourseStepOne,
  createFinalCourse,
  getStudentCoursesList,
  getMyEnrolledCourses,
  enrollCourse,
  setDraftCourse,
  setPublishCourse,
  getCourseLearningPath,
  markNodeAsCompleted,
  getCourseInstructorId,
  getCourseStudentCount,
  updateCourseById,
  replaceCourseContent,
  updateCourseThumbnail,
  getFeaturedCourses,
  getFeaturedPaths,
  getContinueCourse,
};
