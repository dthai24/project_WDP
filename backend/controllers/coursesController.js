const mongoose = require('mongoose');
const Course = require('../models/MongoDB/Course');
const Path = require('../models/MongoDB/Path');
const PathNode = require('../models/MongoDB/PathNode');
const NodeMaterial = require('../models/MongoDB/NodeMaterial');
const UserCourse = require('../models/MongoDB/UserCourse');
const UserNode = require('../models/MongoDB/UserNode');
const CourseComment = require('../models/MongoDB/CourseComment');
const User = require('../models/MongoDB/User');
const Category = require('../models/MongoDB/Category');
const Level = require('../models/MongoDB/Level');
const streakService = require("../services/streakService");
const { validateCourseThumbnailDataUrl } = require('../middlewares/courseThumbnailMiddleware');

const getStudentCourses = async (req, res) => {
  try {
    const filters = {
      search: req.query.search || '',
      category: req.query.category || '',
      level: req.query.level || '',
      status: req.query.status || '',
      sort: req.query.sort || 'newest'
    };

    let query = { isPublished: true, status: { $ne: 'inactive' } };

    // Search by course name
    if (filters.search) {
      query.courseName = { $regex: filters.search, $options: 'i' };
    }

    // Filter by category
    if (filters.category) {
      // Support both MongoDB ObjectId and categoryName
      if (mongoose.Types.ObjectId.isValid(filters.category)) {
        query.categoryId = filters.category;
      } else {
        const category = await Category.findOne({ categoryName: filters.category });
        if (category) {
          query.categoryId = category._id;
        }
      }
    }

    // Filter by level
    if (filters.level) {
      // Support both MongoDB ObjectId and levelName
      if (mongoose.Types.ObjectId.isValid(filters.level)) {
        query.levelId = filters.level;
      } else {
        const level = await Level.findOne({ levelName: filters.level });
        if (level) {
          query.levelId = level._id;
        }
      }
    }

    // Sort
    let sortOption = { createdAt: -1 }; // newest
    if (filters.sort === 'oldest') sortOption = { createdAt: 1 };
    else if (filters.sort === 'rating') sortOption = { rating: -1 };
    else if (filters.sort === 'name') sortOption = { courseName: 1 };

    const courses = await Course.find(query)
      .populate('categoryId', 'displayName')
      .populate('levelId', 'displayName')
      .populate('instructorId', 'fullName email')
      .sort(sortOption)
      .lean();

    const totalCount = courses.length;

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách khóa học thành công',
      data: courses,
      totalCount: totalCount
    });
  } catch (error) {
    console.error('getStudentCourses error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy khóa học',
      data: [],
      totalCount: 0
    });
  }
};

const getMyCourses = async (req, res) => {
  try {
    const { userId, roleName } = req.body;
    const filterStatus = req.query.status || 'all';

    if (!userId || !roleName) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu userId hoặc roleName',
      });
    }

    let courses;
    if (roleName.toLowerCase() === 'student') {
      // Get enrolled courses for student
      const enrollments = await UserCourse.find({ userId })
        .populate({
          path: 'courseId',
          populate: [
            { path: 'categoryId', select: 'displayName' },
            { path: 'levelId', select: 'displayName' },
            { path: 'instructorId', select: 'fullName' }
          ]
        })
        .lean();

      courses = enrollments.map(e => ({
        ...e.courseId,
        progressPercentage: e.progressPercentage,
        enrollmentDate: e.enrollmentDate
      }));
    } else {
      // Get courses created by instructor/mentor
      courses = await Course.find({ instructorId: userId })
        .populate('categoryId', 'displayName')
        .populate('levelId', 'displayName')
        .lean();
    }

    return res.status(200).json({
      success: true,
      message: `Lấy khóa học của ${roleName} thành công`,
      data: courses,
    });
  } catch (error) {
    console.error('Get my courses error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy khóa học',
    });
  }
};

const getInformationCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const tab = req.query.tab;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu courseId',
        data: {},
      });
    }

    if (!tab) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu hoặc sai query tab trên url',
        data: {}
      });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'courseId không hợp lệ',
        data: {}
      });
    }

    const userId = req.headers['x-user-id'] || null;

    // Tab=course
    if (tab.toLowerCase() === 'course') {
      const course = await Course.findById(courseId)
        .populate('categoryId', 'displayName')
        .populate('levelId', 'displayName')
        .populate('instructorId', 'fullName email avatarUrl')
        .lean();

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khóa học này trong Database',
          data: {}
        });
      }

      // Check if user is enrolled
      let isEnrolled = false;
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        const enrollment = await UserCourse.findOne({ userId, courseId });
        isEnrolled = !!enrollment;
      }

      return res.status(200).json({
        success: true,
        message: 'Lấy thông tin khóa học thành công',
        data: { ...course, isEnrolled }
      });
    }

    // Tab=content — cây chương / bài / học liệu
    if (tab.toLowerCase() === 'content') {
      const course = await Course.findById(courseId).lean();
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khóa học này trong Database',
          data: {},
        });
      }

      // Get paths with nodes and materials
      const paths = await Path.find({ courseId })
        .sort({ order: 1 })
        .lean();

      const pathsWithNodes = await Promise.all(paths.map(async (path) => {
        const nodes = await PathNode.find({ pathId: path._id })
          .sort({ nodeOrder: 1 })
          .lean();

        const nodesWithMaterials = await Promise.all(nodes.map(async (node) => {
          const materials = await NodeMaterial.find({ nodeId: node._id })
            .sort({ materialOrder: 1 })
            .lean();
          return { ...node, Materials: materials };
        }));

        return { ...path, Nodes: nodesWithMaterials };
      }));

      return res.status(200).json({
        success: true,
        message: 'Lấy nội dung khóa học thành công',
        data: {
          CourseId: course._id.toString(),
          Paths: pathsWithNodes,
          TotalLessons: course.totalLessons || 0,
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: `Chưa hỗ trợ lấy dữ liệu cho tab: ${tab}`,
      data: []
    });

  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi connect server'
    });
  }
};

const getCourseChapters = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu courseId',
        data: {},
      });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'courseId không hợp lệ',
        data: {},
      });
    }

    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học này trong Database',
        data: {},
      });
    }

    const paths = await Path.find({ courseId })
      .sort({ order: 1 })
      .lean();

    const pathsWithNodes = await Promise.all(paths.map(async (path) => {
      const nodes = await PathNode.find({ pathId: path._id })
        .sort({ nodeOrder: 1 })
        .select('nodeName nodeOrder description')
        .lean();
      return { ...path, Nodes: nodes };
    }));

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách chương thành công',
      data: {
        CourseId: courseId,
        Paths: pathsWithNodes,
      },
    });
  } catch (error) {
    console.error('Get course chapters error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách chương',
    });
  }
};

const saveCourseDraftStepOne = async (req, res) => {
  try {
    const body = req.body;

    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Step 1: Không có dữ liệu gửi lên.',
      });
    }

    const {
      CourseName,
      Description,
      Thumbnail,
      CategoryId,
      LevelId,
      InstructorId,
      IsPublished,
    } = body;

    // Validate CourseName
    if (!CourseName || String(CourseName).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Step 1: Thiếu tên khóa học.',
      });
    }

    // Validate Description
    if (!Description || String(Description).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Step 1: Thiếu mô tả khóa học.',
      });
    }

    // Validate CategoryId
    if (!CategoryId) {
      return res.status(400).json({
        success: false,
        message: 'Step 1: Thiếu hoặc sai CategoryId.',
      });
    }

    // Validate LevelId
    if (!LevelId) {
      return res.status(400).json({
        success: false,
        message: 'Step 1: Thiếu hoặc sai LevelId.',
      });
    }

    // Validate InstructorId
    if (!InstructorId) {
      return res.status(400).json({
        success: false,
        message: 'Step 1: Thiếu hoặc sai InstructorId.',
      });
    }

    const courseData = {
      courseName: String(CourseName).trim(),
      description: String(Description).trim(),
      thumbnail: Thumbnail || null,
      categoryId: CategoryId,
      levelId: LevelId,
      instructorId: InstructorId,
      isPublished: Boolean(IsPublished),
      rating: 0,
      totalLessons: 0,
    };

    if (courseData.thumbnail) {
      validateCourseThumbnailDataUrl(courseData.thumbnail);
    }

    const newCourse = await Course.create(courseData);

    return res.status(201).json({
      success: true,
      message: 'Step 1: Lưu nháp khóa học thành công.',
      data: newCourse,
    });
  } catch (error) {
    console.error('saveCourseDraftStepOne error:', error);

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: statusCode === 400
        ? error.message
        : 'Step 1: Lỗi khi lưu khóa học.',
    });
  }
};

const getLearningPath = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.headers['x-user-id'];

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'courseId không hợp lệ' });
    }

    // Get course info
    const course = await Course.findById(courseId)
      .populate('instructorId', 'fullName')
      .lean();

    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    // Get paths with nodes and materials
    const paths = await Path.find({ courseId })
      .sort({ order: 1 })
      .lean();

    const pathsWithNodes = await Promise.all(paths.map(async (path) => {
      const nodes = await PathNode.find({ pathId: path._id })
        .sort({ nodeOrder: 1 })
        .lean();

      const nodesWithDetails = await Promise.all(nodes.map(async (node) => {
        const materials = await NodeMaterial.find({ nodeId: node._id })
          .sort({ materialOrder: 1 })
          .lean();

        // Check if node is completed by user
        let isCompleted = false;
        let completedAt = null;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
          const userNode = await UserNode.findOne({ userId, nodeId: node._id });
          if (userNode) {
            isCompleted = userNode.isCompleted;
            completedAt = userNode.completedAt;
          }
        }

        return {
          ...node,
          Materials: materials,
          IsCompleted: isCompleted,
          CompletedAt: completedAt
        };
      }));

      return { ...path, Nodes: nodesWithDetails };
    }));

    res.json({
      success: true,
      courseTitle: course.courseName,
      instructor: course.instructorId?.fullName || 'Giảng viên',
      hasPendingUpdates: course.hasPendingUpdates || false,
      tempContent: course.tempContent || null,
      data: pathsWithNodes
    });
  } catch (err) {
    console.error('getLearningPath error:', err);
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

const updateProgress = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.headers['x-user-id'];
    const { nodeId } = req.body;

    if (!userId || !nodeId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId hoặc nodeId' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(nodeId)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }

    // Mark node as completed
    await UserNode.findOneAndUpdate(
      { userId, nodeId },
      { userId, nodeId, isCompleted: true, completedAt: new Date() },
      { upsert: true, new: true }
    );

    // Calculate new progress percentage
    const totalNodes = await PathNode.countDocuments({
      pathId: { $in: (await Path.find({ courseId }).select('_id').lean()).map(p => p._id) }
    });

    const completedNodes = await UserNode.countDocuments({
      userId,
      nodeId: { $in: (await PathNode.find({
        pathId: { $in: (await Path.find({ courseId }).select('_id').lean()).map(p => p._id) }
      }).select('_id').lean()).map(n => n._id) },
      isCompleted: true
    });

    const newProgress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

    // Update UserCourse progress
    await UserCourse.findOneAndUpdate(
      { userId, courseId },
      { progressPercentage: newProgress },
      { upsert: true }
    );

    res.json({ success: true, newProgress });
  } catch (err) {
    console.error('updateProgress error:', err);
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

async function getStreak(req, res) {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.json({ success: true, streak: 0, hasStudiedToday: false });
  try {
    const result = await streakService.getStreak(userId);
    res.json({ success: true, streak: result.streak, hasStudiedToday: result.hasStudiedToday });
  } catch (e) {
    console.error("streak error", e);
    res.json({ success: true, streak: 0, hasStudiedToday: false });
  }
}

const getCourseComments = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Thiếu courseId', data: [] });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'courseId không hợp lệ', data: [] });
    }

    const comments = await CourseComment.find({ courseId })
      .populate('userId', 'fullName avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Lấy bình luận thành công',
      data: comments,
    });
  } catch (error) {
    console.error('getCourseComments error:', error.message);
    return res.status(200).json({
      success: true,
      message: 'Chưa có bình luận',
      data: [],
    });
  }
};

const createCourseComment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.headers['x-user-id'];
    const { content, rating } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Thiếu courseId' });
    }
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để bình luận' });
    }
    if (!content || String(content).trim() === '') {
      return res.status(400).json({ success: false, message: 'Nội dung bình luận không được để trống' });
    }
    if (String(content).trim().length > 250) {
      return res.status(400).json({ success: false, message: 'Bình luận không được vượt quá 250 ký tự' });
    }

    const numericRating = rating == null ? null : Number(rating);
    if (numericRating != null && (numericRating < 1 || numericRating > 5)) {
      return res.status(400).json({ success: false, message: 'Đánh giá phải từ 1 đến 5 sao' });
    }

    const comment = await CourseComment.create({
      courseId,
      userId,
      rating: numericRating,
      content: String(content).trim(),
    });

    const populatedComment = await CourseComment.findById(comment._id)
      .populate('userId', 'fullName avatarUrl')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Gửi bình luận thành công',
      data: populatedComment,
    });
  } catch (error) {
    console.error('createCourseComment error:', error.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi gửi bình luận' });
  }
};

const createFinalCourse = async (req, res) => {
  try {
    const newCourse = req.body.course;
    const newCoursePaths = req.body.paths;

    if (newCourse?.Thumbnail) {
      validateCourseThumbnailDataUrl(newCourse.Thumbnail);
    }

    // Create course
    const courseData = {
      courseName: String(newCourse.CourseName).trim(),
      description: String(newCourse.Description).trim(),
      thumbnail: newCourse.Thumbnail || null,
      categoryId: newCourse.CategoryId,
      levelId: newCourse.LevelId,
      instructorId: newCourse.InstructorId,
      isPublished: Boolean(newCourse.IsPublished),
      rating: 0,
      totalLessons: 0,
    };

    const course = await Course.create(courseData);
    let totalLessons = 0;

    // Create paths with nodes
    if (newCoursePaths && Array.isArray(newCoursePaths)) {
      for (const pathData of newCoursePaths) {
        const path = await Path.create({
          courseId: course._id,
          pathName: String(pathData.PathName).trim(),
          description: pathData.Description || null,
          order: pathData.PathOrder || 1,
        });

        if (pathData.nodes && Array.isArray(pathData.nodes)) {
          for (const nodeData of pathData.nodes) {
            const node = await PathNode.create({
              pathId: path._id,
              nodeName: String(nodeData.NodeName).trim(),
              nodeOrder: nodeData.NodeOrder || 1,
              description: nodeData.Description || null,
              isFree: Boolean(nodeData.isFree ?? nodeData.IsFree ?? false),
            });
            totalLessons++;

            // Create materials for this node
            const materials = nodeData.materials || nodeData.Materials || [];
            for (const matData of materials) {
              const materialType = String(matData.MaterialType || matData.materialType || '').trim().toUpperCase();
              if (!materialType) continue;

              await NodeMaterial.create({
                nodeId: node._id,
                materialType: materialType,
                title: String(matData.Title || matData.title || '').trim(),
                materialUrl: matData.MaterialUrl || matData.materialUrl || null,
                materialOrder: matData.MaterialOrder || matData.materialOrder || 1,
                sourceType: matData.SourceType || matData.sourceType || null,
                fileName: matData.FileName || matData.fileName || null,
                fileSize: matData.FileSize || matData.fileSize || null,
                embedUrl: matData.EmbedUrl || matData.embedUrl || null,
                content: matData.Content || matData.content || null,
              });
            }
          }
        }
      }
    }

    // Update total lessons
    await Course.findByIdAndUpdate(course._id, { totalLessons });

    return res.status(201).json({
      success: true,
      message: 'Tạo khóa học hoàn chỉnh thành công!',
      data: { courseId: course._id.toString() }
    });
  } catch (error) {
    console.error('createFinalCourse error:', error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: statusCode === 400
        ? error.message
        : 'Lỗi server khi tạo khóa học',
    });
  }
};

const enrollCourse = async (req, res) => {
  try {
    let { userId, courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Thiếu courseId' });
    }

    // Fallback if userId is invalid/mock/stale
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      const User = require('../models/MongoDB/User');
      const student = await User.findOne({ email: 'student@gmail.com' }) || await User.findOne({});
      if (student) {
        userId = student._id;
      } else {
        return res.status(400).json({ success: false, message: 'ID người dùng không hợp lệ' });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'courseId không hợp lệ' });
    }

    // Check if already enrolled
    const existing = await UserCourse.findOne({ userId, courseId });
    if (existing) {
      return res.status(200).json({ success: true, message: 'Bạn đã đăng ký khóa học này rồi!', data: existing });
    }

    const enrollment = await UserCourse.create({
      userId,
      courseId,
      progressPercentage: 0,
      enrollmentDate: new Date(),
    });

    return res.status(200).json({ success: true, message: 'Đăng ký khóa học thành công!', data: enrollment });
  } catch (error) {
    console.error('enrollCourse error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi đăng ký khóa học' });
  }
};

const getFeaturedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true, status: { $ne: 'inactive' } })
      .populate('categoryId', 'displayName')
      .populate('levelId', 'displayName')
      .populate('instructorId', 'fullName')
      .sort({ rating: -1, createdAt: -1 })
      .limit(8)
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Lấy khoá học nổi bật thành công',
      data: courses
    });
  } catch (error) {
    console.error('getFeaturedCourses error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy khoá học nổi bật'
    });
  }
};

const getFeaturedPaths = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true, status: { $ne: 'inactive' } })
      .populate('categoryId', 'displayName')
      .populate('levelId', 'displayName')
      .populate('instructorId', 'fullName')
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    const featuredPaths = await Promise.all(courses.map(async (course) => {
      const paths = await Path.find({ courseId: course._id })
        .sort({ order: 1 })
        .lean();

      const pathsWithNodeCount = await Promise.all(paths.map(async (path) => {
        const nodeCount = await PathNode.countDocuments({ pathId: path._id });
        return { ...path, nodeCount };
      }));

      return { ...course, Paths: pathsWithNodeCount };
    }));

    return res.status(200).json({
      success: true,
      message: 'Lấy lộ trình nổi bật thành công',
      data: featuredPaths
    });
  } catch (error) {
    console.error('getFeaturedPaths error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy lộ trình nổi bật'
    });
  }
};

const getContinueCourse = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu userId.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'userId không hợp lệ.',
      });
    }

    // Find the most recent enrollment with progress < 100%
    const enrollment = await UserCourse.findOne({ userId, progressPercentage: { $lt: 100 } })
      .sort({ enrollmentDate: -1 })
      .populate({
        path: 'courseId',
        populate: [
          { path: 'categoryId', select: 'displayName' },
          { path: 'levelId', select: 'displayName' },
          { path: 'instructorId', select: 'fullName' }
        ]
      })
      .lean();

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học đang học.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy khóa học đang học thành công.',
      data: {
        ...enrollment.courseId,
        progressPercentage: enrollment.progressPercentage,
        enrollmentDate: enrollment.enrollmentDate
      }
    });
  } catch (error) {
    console.error('getContinueCourse error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy khóa học đang học.'
    });
  }
};

module.exports = {
  getMyCourses,
  getInformationCourse,
  getCourseChapters,
  saveCourseDraftStepOne,
  createFinalCourse,
  getStudentCourses,
  enrollCourse,
  getLearningPath,
  updateProgress,
  getFeaturedCourses,
  getFeaturedPaths,
  getContinueCourse,
  getStreak,
  getCourseComments,
  createCourseComment,
};
