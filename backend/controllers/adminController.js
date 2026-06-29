const mongoose = require('mongoose');
const User = require('../models/MongoDB/User');
const Role = require('../models/MongoDB/Role');
const UserRole = require('../models/MongoDB/UserRole');
const Category = require('../models/MongoDB/Category');
const Level = require('../models/MongoDB/Level');
const Course = require('../models/MongoDB/Course');
const UserCourse = require('../models/MongoDB/UserCourse');
const bcrypt = require('bcryptjs');

// ==========================================
// DASHBOARD
// ==========================================
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await UserCourse.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        publishedCourses,
      }
    });
  } catch (err) {
    console.error('[Admin Dashboard Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==========================================
// USERS
// ==========================================
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Get roles for each user
    const usersWithRoles = await Promise.all(users.map(async (user) => {
      const userRoles = await UserRole.find({ userId: user._id })
        .populate('roleId', 'roleName')
        .lean();
      return {
        ...user,
        roles: userRoles.map(ur => ur.roleId?.roleName || ''),
      };
    }));

    return res.json({ success: true, data: usersWithRoles });
  } catch (err) {
    console.error('[Admin GetUsers Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const createUser = async (req, res) => {
  try {
    const { FullName, Email, Phone, DateOfBirth, Password, Role } = req.body;
    if (!FullName || !Email || !Password) {
      return res.status(400).json({ success: false, message: 'Thiếu họ tên, email hoặc mật khẩu' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: Email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email đã tồn tại trong hệ thống' });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const user = await User.create({
      fullName: FullName,
      email: Email,
      phone: Phone || null,
      dateOfBirth: DateOfBirth || null,
      password: hashedPassword,
      isFirstLogin: true,
      isActive: true,
      createdAt: new Date(),
    });

    // Assign role if specified
    if (Role) {
      const role = await Role.findOne({ roleName: { $regex: new RegExp(`^${Role}$`, 'i') } });
      if (role) {
        await UserRole.create({ userId: user._id, roleId: role._id });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Tạo tài khoản thành công',
      data: { userId: user._id, fullName: user.fullName, email: user.email }
    });
  } catch (err) {
    console.error('[Admin CreateUser Error]', err.message);
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email đã tồn tại trong hệ thống' });
    }
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const getUserDetail = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'userId không hợp lệ' });
    }

    const user = await User.findById(userId).select('-password').lean();
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });

    const userRoles = await UserRole.find({ userId })
      .populate('roleId', 'roleName description')
      .lean();

    return res.json({
      success: true,
      data: {
        ...user,
        roles: userRoles.map(ur => ({
          roleId: ur.roleId?._id,
          roleName: ur.roleId?.roleName,
          description: ur.roleId?.description,
        })),
      }
    });
  } catch (err) {
    console.error('[Admin GetUser Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'userId không hợp lệ' });
    }

    const { FullName, Email, Phone, DateOfBirth, LearningGoal, CurrentLevelId } = req.body;
    if (!FullName || !Email) {
      return res.status(400).json({ success: false, message: 'Thiếu họ tên hoặc email' });
    }

    const updateData = {
      fullName: FullName,
      email: Email,
      phone: Phone || null,
      dateOfBirth: DateOfBirth || null,
      learningGoal: LearningGoal || null,
      currentLevelId: CurrentLevelId || null,
      updatedAt: new Date(),
    };

    await User.findByIdAndUpdate(userId, updateData);
    return res.json({ success: true, message: 'Cập nhật user thành công' });
  } catch (err) {
    console.error('[Admin UpdateUser Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'userId không hợp lệ' });
    }

    await User.findByIdAndDelete(userId);
    await UserRole.deleteMany({ userId });
    return res.json({ success: true, message: 'Xoá user thành công' });
  } catch (err) {
    console.error('[Admin DeleteUser Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==========================================
// USER ROLES
// ==========================================
const updateUserRoles = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'userId không hợp lệ' });
    }

    const { roleIds } = req.body;
    if (!Array.isArray(roleIds)) {
      return res.status(400).json({ success: false, message: 'roleIds phải là mảng' });
    }

    // Delete existing roles and set new ones
    await UserRole.deleteMany({ userId });
    const roleDocs = roleIds.map(roleId => ({
      userId,
      roleId,
    }));
    await UserRole.insertMany(roleDocs);

    return res.json({ success: true, message: 'Cập nhật vai trò thành công' });
  } catch (err) {
    console.error('[Admin UpdateRoles Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==========================================
// ROLES
// ==========================================
const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ roleName: 1 }).lean();
    return res.json({ success: true, data: roles });
  } catch (err) {
    console.error('[Admin GetRoles Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==========================================
// CATEGORIES
// ==========================================
const getCategories = async (req, res) => {
  try {
    const data = await Category.find({ isActive: true }).sort({ categoryName: 1 }).lean();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('[Admin GetCategories Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { CategoryName, DisplayName } = req.body;
    if (!CategoryName || !DisplayName) {
      return res.status(400).json({ success: false, message: 'Thiếu CategoryName hoặc DisplayName' });
    }

    const category = await Category.create({
      categoryName: CategoryName,
      displayName: DisplayName,
      isActive: true,
      createdAt: new Date(),
    });

    return res.status(201).json({ success: true, message: 'Tạo danh mục thành công', data: category });
  } catch (err) {
    console.error('[Admin CreateCategory Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ success: false, message: 'categoryId không hợp lệ' });
    }

    const { CategoryName, DisplayName } = req.body;
    if (!CategoryName || !DisplayName) {
      return res.status(400).json({ success: false, message: 'Thiếu CategoryName hoặc DisplayName' });
    }

    await Category.findByIdAndUpdate(categoryId, {
      categoryName: CategoryName,
      displayName: DisplayName,
    });

    return res.json({ success: true, message: 'Cập nhật danh mục thành công' });
  } catch (err) {
    console.error('[Admin UpdateCategory Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ success: false, message: 'categoryId không hợp lệ' });
    }

    await Category.findByIdAndUpdate(categoryId, { isActive: false });
    return res.json({ success: true, message: 'Xoá danh mục thành công' });
  } catch (err) {
    console.error('[Admin DeleteCategory Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==========================================
// LEVELS
// ==========================================
const getLevels = async (req, res) => {
  try {
    const data = await Level.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('[Admin GetLevels Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const createLevel = async (req, res) => {
  try {
    const { LevelName, DisplayName, SortOrder } = req.body;
    if (!LevelName || !DisplayName || SortOrder === undefined) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin trình độ' });
    }

    const level = await Level.create({
      levelName: LevelName,
      displayName: DisplayName,
      sortOrder: Number(SortOrder),
      isActive: true,
      createdAt: new Date(),
    });

    return res.status(201).json({ success: true, message: 'Tạo trình độ thành công', data: level });
  } catch (err) {
    console.error('[Admin CreateLevel Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const updateLevel = async (req, res) => {
  try {
    const levelId = req.params.levelId;
    if (!mongoose.Types.ObjectId.isValid(levelId)) {
      return res.status(400).json({ success: false, message: 'levelId không hợp lệ' });
    }

    const { LevelName, DisplayName, SortOrder } = req.body;
    if (!LevelName || !DisplayName || SortOrder === undefined) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin trình độ' });
    }

    await Level.findByIdAndUpdate(levelId, {
      levelName: LevelName,
      displayName: DisplayName,
      sortOrder: Number(SortOrder),
    });

    return res.json({ success: true, message: 'Cập nhật trình độ thành công' });
  } catch (err) {
    console.error('[Admin UpdateLevel Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteLevel = async (req, res) => {
  try {
    const levelId = req.params.levelId;
    if (!mongoose.Types.ObjectId.isValid(levelId)) {
      return res.status(400).json({ success: false, message: 'levelId không hợp lệ' });
    }

    await Level.findByIdAndUpdate(levelId, { isActive: false });
    return res.json({ success: true, message: 'Xoá trình độ thành công' });
  } catch (err) {
    console.error('[Admin DeleteLevel Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==========================================
// COURSES
// ==========================================
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructorId', 'fullName email')
      .populate('categoryId', 'categoryName displayName')
      .populate('levelId', 'levelName displayName')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: courses });
  } catch (err) {
    console.error('[Admin GetCourses Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'courseId không hợp lệ' });
    }

    const { CourseName, Description, CategoryId, LevelId, IsPublished, InstructorId } = req.body;
    if (!CourseName) {
      return res.status(400).json({ success: false, message: 'Thiếu tên khóa học' });
    }

    await Course.findByIdAndUpdate(courseId, {
      courseName: CourseName,
      description: Description || null,
      categoryId: CategoryId || null,
      levelId: LevelId || null,
      isPublished: IsPublished !== undefined ? Boolean(IsPublished) : undefined,
      instructorId: InstructorId || null,
      updatedAt: new Date(),
    });

    return res.json({ success: true, message: 'Cập nhật khóa học thành công' });
  } catch (err) {
    console.error('[Admin UpdateCourse Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'courseId không hợp lệ' });
    }

    await Course.findByIdAndDelete(courseId);
    return res.json({ success: true, message: 'Xoá khóa học thành công' });
  } catch (err) {
    console.error('[Admin DeleteCourse Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  createUser,
  getUserDetail,
  updateUser,
  deleteUser,
  updateUserRoles,
  getRoles,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getLevels,
  createLevel,
  updateLevel,
  deleteLevel,
  getCourses,
  updateCourse,
  deleteCourse,
};
