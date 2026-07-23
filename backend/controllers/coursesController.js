const mongoose = require('mongoose');
const Course = require('../models/MongoDB/Course');
const Path = require('../models/MongoDB/Path');
const PathNode = require('../models/MongoDB/PathNode');
const NodeMaterial = require('../models/MongoDB/NodeMaterial');
const UserCourse = require('../models/MongoDB/UserCourse');
const UserNode = require('../models/MongoDB/UserNode');
const Payment = require('../models/MongoDB/Payment');
const CourseComment = require('../models/MongoDB/CourseComment');
const User = require('../models/MongoDB/User');
const Category = require('../models/MongoDB/Category');
const Level = require('../models/MongoDB/Level');
const Certificate = require('../models/MongoDB/Certificate');
const streakService = require("../services/streakService");
const { validateCourseThumbnailDataUrl, saveCourseThumbnailFromDataUrl } = require('../middlewares/courseThumbnailMiddleware');
const { notifyAdminsAndMentor } = require('../services/notificationService');
async function userHasCourseAccess(userId, courseId) {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return false;
  }

  const course = await Course.findById(courseId).lean();
  if (!course) {
    return false;
  }

  // 1. Nếu là Giảng viên tạo khóa học
  if (course.instructorId && course.instructorId.toString() === userId.toString()) {
    return true;
  }

  // 2. Nếu là Admin
  try {
    const Role = require('../models/MongoDB/Role');
    const UserRole = require('../models/MongoDB/UserRole');
    const adminRole = await Role.findOne({ roleName: { $regex: /^admin$/i } }).lean();
    if (adminRole) {
      const userRole = await UserRole.findOne({ userId, roleId: adminRole._id }).lean();
      if (userRole) {
        return true;
      }
    }
  } catch (err) {
    console.error('Check admin access error:', err);
  }

  // 3. Kiểm tra đăng ký học
  const enrollment = await UserCourse.findOne({ userId, courseId });
  if (enrollment) {
    return true;
  }

  if (!course.isPaid || course.price === 0) {
    return false;
  }

  const payment = await Payment.findOne({ userId, courseId, status: 'success' });
  if (!payment) {
    return false;
  }

  if (payment.paymentType === 'subscription' && payment.subscriptionEndDate) {
    return new Date() <= payment.subscriptionEndDate;
  }

  return true;
}

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
    else if (filters.sort === 'rating' || filters.sort === 'popular') sortOption = { rating: -1, createdAt: -1 };
    else if (filters.sort === 'name' || filters.sort === 'name_asc') sortOption = { courseName: 1 };
    else if (filters.sort === 'name_desc') sortOption = { courseName: -1 };

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

      // Gắn cây Paths -> Nodes -> Materials để trang "Khóa học của tôi" (mentor)
      // tính đúng số Chương/Bài/Học liệu (trước đây luôn trả 0 vì thiếu bước này).
      const courseIds = courses.map(c => c._id);
      const paths = await Path.find({ courseId: { $in: courseIds } }).sort({ order: 1 }).lean();
      const pathIds = paths.map(p => p._id);
      const nodes = await PathNode.find({ pathId: { $in: pathIds } }).sort({ nodeOrder: 1 }).lean();
      const nodeIds = nodes.map(n => n._id);
      const materials = await NodeMaterial.find({ nodeId: { $in: nodeIds } }).sort({ materialOrder: 1 }).lean();

      const materialsByNode = new Map();
      for (const m of materials) {
        const key = m.nodeId.toString();
        if (!materialsByNode.has(key)) materialsByNode.set(key, []);
        materialsByNode.get(key).push(m);
      }
      const nodesByPath = new Map();
      for (const n of nodes) {
        const key = n.pathId.toString();
        if (!nodesByPath.has(key)) nodesByPath.set(key, []);
        nodesByPath.get(key).push({ ...n, materials: materialsByNode.get(n._id.toString()) ?? [] });
      }
      const pathsByCourse = new Map();
      for (const p of paths) {
        const key = p.courseId.toString();
        if (!pathsByCourse.has(key)) pathsByCourse.set(key, []);
        pathsByCourse.get(key).push({ ...p, nodes: nodesByPath.get(p._id.toString()) ?? [] });
      }

      courses = courses.map(c => ({
        ...c,
        courseId: c._id.toString(),
        CourseId: c._id.toString(),
        CategoryDisplayName: c.categoryId?.displayName ?? '',
        LevelDisplayName: c.levelId?.displayName ?? '',
        paths: pathsByCourse.get(c._id.toString()) ?? [],
      }));
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
      IsPaid,
      Price,
      DiscountPercentage,
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

    const isPaid = Boolean(IsPaid);
    const price = isPaid ? Math.max(0, Number(Price) || 0) : 0;
    const discountPercentage = isPaid
      ? Math.min(100, Math.max(0, Number(DiscountPercentage) || 0))
      : 0;

    if (isPaid && price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Step 1: Khóa trả phí cần có giá lớn hơn 0.',
      });
    }

    const courseData = {
      courseName: String(CourseName).trim(),
      description: String(Description).trim(),
      thumbnail: null,
      categoryId: CategoryId,
      levelId: LevelId,
      instructorId: InstructorId,
      isPublished: Boolean(IsPublished),
      isPaid,
      price,
      discountPercentage,
      rating: 0,
      totalLessons: 0,
    };

    if (Thumbnail) {
      validateCourseThumbnailDataUrl(Thumbnail);
    }

    const newCourse = await Course.create(courseData);

    if (Thumbnail) {
      const thumbnailPath = saveCourseThumbnailFromDataUrl(Thumbnail, newCourse._id);
      if (thumbnailPath) {
        newCourse.thumbnail = thumbnailPath;
        await newCourse.save();
      }
    }

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
    const userId = req.user?.userId || req.user?._id?.toString() || req.headers['x-user-id'];

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'courseId không hợp lệ' });
    }

    const hasAccess = await userHasCourseAccess(userId, courseId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Bạn cần đăng ký hoặc thanh toán khóa học này trước khi học.',
        code: 'COURSE_ACCESS_DENIED',
      });
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

// Helper to check and generate certificate
const checkAndGenerateCertificate = async (userId, courseId) => {
  try {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const courseObjId = new mongoose.Types.ObjectId(courseId);

    // Check if certificate already exists
    let cert = await Certificate.findOne({ userId: userObjId, courseId: courseObjId });
    if (!cert) {
      // Generate a unique certificate code (e.g. CERT-U8A91B)
      const certificateCode = 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      cert = await Certificate.create({
        userId: userObjId,
        courseId: courseObjId,
        certificateCode,
        issuedAt: new Date(),
        grade: 95 + Math.floor(Math.random() * 6) // random realistic grade 95-100%
      });
      console.log(`Certificate auto-generated for user ${userId} on course ${courseId}: ${certificateCode}`);
    }
    return cert;
  } catch (error) {
    console.error('Error generating certificate:', error);
    return null;
  }
};

const updateProgress = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user?.userId || req.user?._id?.toString() || req.headers['x-user-id'];
    const { nodeId } = req.body;

    if (!userId || !nodeId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId hoặc nodeId' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(nodeId)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }

    const hasAccess = await userHasCourseAccess(userId, courseId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Bạn cần đăng ký hoặc thanh toán khóa học này trước khi cập nhật tiến độ.',
        code: 'COURSE_ACCESS_DENIED',
      });
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

    // Auto generate certificate if progress reaches 100%
    if (newProgress === 100) {
      await checkAndGenerateCertificate(userId, courseId);
    }

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

    const isPaid = Boolean(newCourse.IsPaid);
    const price = isPaid ? Math.max(0, Number(newCourse.Price) || 0) : 0;
    const discountPercentage = isPaid
      ? Math.min(100, Math.max(0, Number(newCourse.DiscountPercentage) || 0))
      : 0;

    if (isPaid && price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Khóa trả phí cần có giá lớn hơn 0.',
      });
    }

    // Create or update course
    const courseData = {
      courseName: String(newCourse.CourseName).trim(),
      description: String(newCourse.Description).trim(),
      thumbnail: null,
      categoryId: newCourse.CategoryId,
      levelId: newCourse.LevelId,
      instructorId: newCourse.InstructorId,
      isPublished: Boolean(newCourse.IsPublished),
      isPaid,
      price,
      discountPercentage,
      rating: 0,
      totalLessons: 0,
    };

    const existingId = newCourse.courseId || newCourse._id || newCourse.CourseId;
    let course = null;

    if (existingId && mongoose.Types.ObjectId.isValid(existingId)) {
      course = await Course.findById(existingId);
    }

    if (course) {
      // Update existing course metadata
      const updateData = { ...courseData };
      if (!newCourse.Thumbnail) {
        delete updateData.thumbnail;
      }
      await Course.findByIdAndUpdate(course._id, updateData);
      
      // Clean up old paths, nodes, materials to prevent duplication
      const existingPaths = await Path.find({ courseId: course._id }).select('_id').lean();
      const pathIds = existingPaths.map(p => p._id);
      const existingNodes = await PathNode.find({ pathId: { $in: pathIds } }).select('_id').lean();
      const nodeIds = existingNodes.map(n => n._id);

      await NodeMaterial.deleteMany({ nodeId: { $in: nodeIds } });
      await PathNode.deleteMany({ pathId: { $in: pathIds } });
      await Path.deleteMany({ courseId: course._id });
    } else {
      // Create new course
      course = await Course.create(courseData);
    }

    if (newCourse?.Thumbnail) {
      if (String(newCourse.Thumbnail).startsWith('data:')) {
        const thumbnailPath = saveCourseThumbnailFromDataUrl(newCourse.Thumbnail, course._id);
        if (thumbnailPath) {
          course.thumbnail = thumbnailPath;
          await course.save();
        }
      } else {
        course.thumbnail = newCourse.Thumbnail;
        await course.save();
      }
    }

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
                title: String(matData.Title || matData.title || '').trim() || 'Học liệu',
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
    const userId = req.user?.userId || req.user?._id?.toString();
    const { courseId } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Thiếu courseId' });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'courseId không hợp lệ' });
    }

    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    if (course.isPaid && course.price > 0) {
      return res.status(402).json({
        success: false,
        message: 'Khóa học trả phí. Vui lòng thanh toán trước khi đăng ký.',
        code: 'PAYMENT_REQUIRED',
      });
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

    // Notify admins and course mentor
    try {
      const studentUser = await User.findById(userId).lean();
      const studentName = studentUser?.fullName || 'Học viên';
      await notifyAdminsAndMentor({
        courseId,
        studentId: userId,
        type: 'course',
        title: 'Học viên tham gia khóa học',
        message: `Học viên ${studentName} đã đăng ký tham gia khóa học "${course.courseName}"`,
        link: `/mentor/courses/${courseId}`,
        metadata: { action: 'enroll' }
      });
    } catch (err) {
      console.error('Failed to send enrollment notification:', err);
    }

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

const deleteCourseMentor = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.headers['x-user-id'] || req.body.userId;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Thiếu courseId' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    // Verify ownership
    if (userId && course.instructorId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa khóa học này' });
    }

    // Comprehensive cleanup: paths, pathNodes, materials
    const paths = await Path.find({ courseId });
    const pathIds = paths.map(p => p._id);
    const nodes = await PathNode.find({ pathId: { $in: pathIds } });
    const nodeIds = nodes.map(n => n._id);

    await NodeMaterial.deleteMany({ nodeId: { $in: nodeIds } });
    await PathNode.deleteMany({ pathId: { $in: pathIds } });
    await Path.deleteMany({ courseId });
    await Course.findByIdAndDelete(courseId);

    return res.json({ success: true, message: 'Xóa khóa học thành công' });
  } catch (error) {
    console.error('deleteCourseMentor error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xóa khóa học' });
  }
};

// ──────────────────────────────────────────────────────────────
// POST /api/courses/:id/complete  — Xác nhận hoàn thành khoá học
// ──────────────────────────────────────────────────────────────
const completeCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.headers['x-user-id'];

    if (!userId || !courseId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId hoặc courseId' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }

    const userObjId = new mongoose.Types.ObjectId(userId);
    const courseObjId = new mongoose.Types.ObjectId(courseId);

    // Đánh dấu tất cả node của khoá học này là hoàn thành cho user
    const paths = await Path.find({ courseId: courseObjId }).select('_id').lean();
    const pathIds = paths.map(p => p._id);
    const nodes = await PathNode.find({ pathId: { $in: pathIds } }).select('_id').lean();

    const bulkOps = nodes.map(node => ({
      updateOne: {
        filter: { userId: userObjId, nodeId: node._id },
        update: { $set: { userId: userObjId, nodeId: node._id, isCompleted: true, completedAt: new Date() } },
        upsert: true,
      },
    }));
    if (bulkOps.length > 0) await UserNode.bulkWrite(bulkOps);

    // Set progressPercentage = 100 trong UserCourse
    await UserCourse.findOneAndUpdate(
      { userId: userObjId, courseId: courseObjId },
      { progressPercentage: 100 },
      { upsert: true }
    );

    // Auto generate certificate
    await checkAndGenerateCertificate(userId, courseId);

    return res.json({ success: true, message: 'Hoàn thành khoá học thành công', newProgress: 100 });
  } catch (err) {
    console.error('completeCourse error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

// GET /api/courses/certificates/user/:userId
const getUserCertificates = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'userId không hợp lệ' });
    }

    const certs = await Certificate.find({ userId })
      .populate('courseId', 'courseName thumbnail rating totalLessons')
      .lean();

    return res.status(200).json({ success: true, certificates: certs });
  } catch (error) {
    console.error('getUserCertificates error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy chứng chỉ' });
  }
};

// GET /api/courses/certificates/verify/:code
const verifyCertificate = async (req, res) => {
  try {
    const code = req.params.code;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Thiếu mã chứng chỉ' });
    }

    const cert = await Certificate.findOne({ certificateCode: code })
      .populate('userId', 'fullName')
      .populate('courseId', 'courseName description thumbnail instructorId totalLessons')
      .lean();

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Chứng chỉ không tồn tại hoặc mã xác minh không hợp lệ' });
    }

    // Populate instructor details manually
    if (cert.courseId && cert.courseId.instructorId) {
      const instructor = await User.findById(cert.courseId.instructorId).select('fullName').lean();
      cert.courseId.instructorName = instructor ? instructor.fullName : 'Giảng viên';
    } else {
      if (cert.courseId) {
        cert.courseId.instructorName = 'Giảng viên';
      }
    }

    return res.status(200).json({ success: true, certificate: cert });
  } catch (error) {
    console.error('verifyCertificate error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xác minh chứng chỉ' });
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
  deleteCourseMentor,
  completeCourse,
  getUserCertificates,
  verifyCertificate,
};
