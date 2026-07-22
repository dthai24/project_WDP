const mongoose = require('mongoose');
const User = require('../models/MongoDB/User');
const Role = require('../models/MongoDB/Role');
const UserRole = require('../models/MongoDB/UserRole');
const Category = require('../models/MongoDB/Category');
const Level = require('../models/MongoDB/Level');
const Course = require('../models/MongoDB/Course');
const UserCourse = require('../models/MongoDB/UserCourse');
const UserNode = require('../models/MongoDB/UserNode');
const streakService = require('../services/streakService');
const MentorApplication = require('../models/MongoDB/MentorApplication');
const Path = require('../models/MongoDB/Path');
const PathNode = require('../models/MongoDB/PathNode');
const NodeMaterial = require('../models/MongoDB/NodeMaterial');
const { logAction } = require('../services/auditService');
const AuditLog = require('../models/MongoDB/AuditLog');
const Payment = require('../models/MongoDB/Payment');
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
    const pendingCourses = await Course.countDocuments({ status: 'pending' });
    const pendingApplications = await MentorApplication.countDocuments({ status: 'pending' });

    // Revenue calculation from successful payments
    let totalRevenue = 0;
    try {
      const revenueResult = await Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      if (revenueResult && revenueResult.length > 0) {
        totalRevenue = revenueResult[0].total || 0;
      }
    } catch (e) {
      console.warn('[Revenue Calculation Warning]', e.message);
    }

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        publishedCourses,
        pendingCourses,
        pendingApplications,
        totalRevenue,
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
      const roles = userRoles.map(ur => ur.roleId?.roleName || '');
      const isStudent = roles.includes('Student') || roles.length === 0;

      let streak = 0;
      let xp = 0;

      if (isStudent) {
        try {
          const streakRes = await streakService.getStreak(user._id);
          streak = streakRes ? streakRes.streak : 0;
          const completedNodesCount = await UserNode.countDocuments({ userId: user._id, isCompleted: true });
          xp = completedNodesCount * 50;
        } catch (e) {
          console.error('getUsers streak/xp error', e);
        }
      }

      return {
        ...user,
        roles,
        streak,
        xp,
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
    const roles = userRoles.map(ur => ur.roleId?.roleName || '');
    const isStudent = roles.includes('Student') || roles.length === 0;

    let streak = 0;
    let xp = 0;

    if (isStudent) {
      try {
        const streakRes = await streakService.getStreak(user._id);
        streak = streakRes ? streakRes.streak : 0;
        const completedNodesCount = await UserNode.countDocuments({ userId: user._id, isCompleted: true });
        xp = completedNodesCount * 50;
      } catch (e) {
        console.error('getUserDetail streak/xp error', e);
      }
    }

    return res.json({
      success: true,
      data: {
        ...user,
        roles: userRoles.map(ur => ({
          roleId: ur.roleId?._id,
          roleName: ur.roleId?.roleName,
          description: ur.roleId?.description,
        })),
        streak,
        xp,
      }
    });
  } catch (err) {
    console.error('[Admin GetUser Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'userId không hợp lệ' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
    }

    // Check roles of targetUser
    const userRoles = await UserRole.find({ userId }).populate('roleId').lean();
    const roleNames = userRoles.map(ur => (ur.roleId?.roleName || '').toLowerCase());
    const isAdmin = roleNames.includes('admin') || targetUser.email?.toLowerCase().includes('admin');

    let targetIsActive = req.body.isActive !== undefined 
      ? Boolean(req.body.isActive) 
      : (req.body.IsActive !== undefined ? Boolean(req.body.IsActive) : !targetUser.isActive);

    if (isAdmin && !targetIsActive) {
      return res.status(400).json({ success: false, message: "Cannot deactivate Admin accounts" });
    }

    targetUser.isActive = targetIsActive;
    targetUser.updatedAt = new Date();
    await targetUser.save();

    return res.json({
      success: true,
      message: `Đã ${targetIsActive ? 'kích hoạt' : 'khóa'} tài khoản thành công`,
      data: targetUser
    });
  } catch (err) {
    console.error('[ToggleUserStatus Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'userId không hợp lệ' });
    }

    const { FullName, Email, Phone, DateOfBirth, LearningGoal, CurrentLevelId, IsActive } = req.body;
    if (!FullName || !Email) {
      return res.status(400).json({ success: false, message: 'Thiếu họ tên hoặc email' });
    }

    if (IsActive === false) {
      const userRoles = await UserRole.find({ userId }).populate('roleId').lean();
      const roleNames = userRoles.map(ur => (ur.roleId?.roleName || '').toLowerCase());
      if (roleNames.includes('admin') || Email.toLowerCase().includes('admin')) {
        return res.status(400).json({ success: false, message: "Cannot deactivate Admin accounts" });
      }
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

    if (IsActive !== undefined) {
      updateData.isActive = Boolean(IsActive);
    }

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
    const data = await Category.find().sort({ categoryName: 1, displayName: 1 }).lean();
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

    logAction({
      entityType: 'Category',
      entityId: category._id,
      entityName: category.displayName,
      action: 'CREATE',
      userId: req.user.userId,
      description: `Tạo danh mục "${category.displayName}"`
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

    const oldCategory = await Category.findById(categoryId);
    await Category.findByIdAndUpdate(categoryId, {
      categoryName: CategoryName,
      displayName: DisplayName,
    });

    logAction({
      entityType: 'Category',
      entityId: categoryId,
      entityName: DisplayName,
      action: 'UPDATE',
      userId: req.user.userId,
      changes: {
        categoryName: { old: oldCategory?.categoryName, new: CategoryName },
        displayName: { old: oldCategory?.displayName, new: DisplayName }
      },
      description: `Cập nhật danh mục "${oldCategory?.displayName}" thành "${DisplayName}"`
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

    // Count courses belonging to this category
    const courseCount = await Course.countDocuments({
      $or: [
        { categoryId: categoryId },
        { category: categoryId }
      ]
    });

    if (courseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục này do vẫn còn ${courseCount} khóa học bên trong. Vui lòng di chuyển khóa học trước khi xóa.`,
        courseCount
      });
    }

    const category = await Category.findById(categoryId);
    await Category.findByIdAndDelete(categoryId);

    logAction({
      entityType: 'Category',
      entityId: categoryId,
      entityName: category?.displayName,
      action: 'DELETE',
      userId: req.user?.userId || 'admin',
      description: `Xóa danh mục "${category?.displayName}"`
    });

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
    const data = await Level.find()
      .populate('categoryId', 'displayName')
      .sort({ sortOrder: 1, displayName: 1 })
      .lean();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('[Admin GetLevels Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const createLevel = async (req, res) => {
  try {
    const { LevelName, DisplayName, SortOrder, CategoryId } = req.body;
    if (!LevelName || !DisplayName || SortOrder === undefined) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin trình độ' });
    }

    const level = await Level.create({
      levelName: LevelName,
      displayName: DisplayName,
      sortOrder: Number(SortOrder),
      isActive: true,
      categoryId: CategoryId || null,
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

    const { LevelName, DisplayName, SortOrder, CategoryId } = req.body;
    if (!LevelName || !DisplayName || SortOrder === undefined) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin trình độ' });
    }

    await Level.findByIdAndUpdate(levelId, {
      levelName: LevelName,
      displayName: DisplayName,
      sortOrder: Number(SortOrder),
      categoryId: CategoryId || null,
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

const nodemailer = require('nodemailer');

const sendApplicationResultEmail = async (to, fullName, result, tags = [], comment = '', randomPassword = null) => {
  const isApproved = result === 'approved';
  const subject = isApproved
    ? '🎉 Chúc mừng! Đơn ứng tuyển Mentor của bạn đã được phê duyệt'
    : 'Thông báo kết quả ứng tuyển Mentor';

  let resultHtml = '';
  if (isApproved) {
    if (randomPassword) {
      resultHtml = `
        <p style="color:#c4c3d0;font-size:15px;">Xin chào <strong style="color:#a78bfa;">${fullName}</strong>,</p>
        <p style="color:#c4c3d0;font-size:15px;">Chúng tôi rất vui mừng thông báo rằng đơn ứng tuyển trở thành Mentor của bạn tại <strong>English Master</strong> đã được phê duyệt!</p>
        <p style="color:#c4c3d0;font-size:15px;">Dưới đây là thông tin tài khoản đăng nhập của bạn:</p>
        <ul style="color:#c4c3d0;font-size:15px;line-height:1.6;">
          <li><strong>Email:</strong> ${to}</li>
          <li><strong>Mật khẩu đăng nhập:</strong> <span style="color:#10b981;font-weight:bold;">${randomPassword}</span></li>
        </ul>
        <p style="color:#c4c3d0;font-size:15px;">Vui lòng đăng nhập và tiến hành đổi mật khẩu mới trong trang cá nhân của bạn để bảo mật thông tin.</p>
      `;
    } else {
      resultHtml = `
        <p style="color:#c4c3d0;font-size:15px;">Xin chào <strong style="color:#a78bfa;">${fullName}</strong>,</p>
        <p style="color:#c4c3d0;font-size:15px;">Chúng tôi rất vui mừng thông báo rằng đơn ứng tuyển trở thành Mentor của bạn tại <strong>English Master</strong> đã được phê duyệt!</p>
        <p style="color:#c4c3d0;font-size:15px;">Tài khoản của bạn đã được nâng cấp lên vai trò Mentor. Mật khẩu và thông tin tài khoản đăng nhập cũ được giữ nguyên không thay đổi.</p>
        <p style="color:#c4c3d0;font-size:15px;">Bây giờ bạn có thể đăng nhập vào hệ thống để bắt đầu xây dựng khóa học của mình.</p>
      `;
    }
  } else {
    const reasonTags = tags.length > 0 ? `<p style="color:#c4c3d0;font-size:15px;">Lý do từ chối: <strong style="color:#ff6b6b;">${tags.join(', ')}</strong></p>` : '';
    const additionalComment = comment.trim() ? `<p style="color:#c4c3d0;font-size:15px;">Góp ý bổ sung: <em>"${comment}"</em></p>` : '';
    resultHtml = `
      <p style="color:#c4c3d0;font-size:15px;">Xin chào <strong style="color:#ff6b6b;">${fullName}</strong>,</p>
      <p style="color:#c4c3d0;font-size:15px;">Cảm ơn bạn đã quan tâm và gửi đơn ứng tuyển trở thành Mentor tại <strong>English Master</strong>.</p>
      <p style="color:#c4c3d0;font-size:15px;">Sau khi xem xét kỹ lưỡng các thông tin và tài liệu minh chứng, rất tiếc chúng tôi chưa thể phê duyệt đơn ứng tuyển của bạn lần này.</p>
      ${reasonTags}
      ${additionalComment}
      <p style="color:#c4c3d0;font-size:15px;">Bạn có thể điều chỉnh và gửi lại đơn ứng tuyển mới sau khi đã hoàn thiện hồ sơ.</p>
    `;
  }

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0f0e17;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg, ${isApproved ? '#6c63ff,#a78bfa' : '#f6b93b,#ff6b6b'});padding:32px 24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">⭐ English Master</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Kết quả ứng tuyển Mentor</p>
      </div>
      <div style="padding:32px 24px;background:#1a1830;color:#c4c3d0;">
        ${resultHtml}
        <br/>
        <p style="color:#8885a0;font-size:13px;text-align:center;">Trân trọng,<br/>Đội ngũ English Master</p>
      </div>
      <div style="padding:16px 24px;background:#0f0e17;text-align:center;">
        <p style="color:#555;font-size:12px;margin:0;">© ${new Date().getFullYear()} English Master. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER.trim(),
        pass: process.env.EMAIL_PASS.trim(),
      },
    });

    await transporter.sendMail({
      from: `"English Master" <${process.env.EMAIL_USER.trim()}>`,
      to,
      subject,
      html,
    });
    console.log(`Email result sent to ${to}`);
  } catch (err) {
    console.error('sendApplicationResultEmail error:', err.message);
  }
};

const getApplications = async (req, res) => {
  try {
    const apps = await MentorApplication.find()
      .populate('userId', 'fullName email')
      .populate('levels', 'displayName')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, data: apps });
  } catch (err) {
    console.error('[GetApplications Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const getApplicationDetail = async (req, res) => {
  try {
    const appId = req.params.applicationId;
    if (!mongoose.Types.ObjectId.isValid(appId)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    const app = await MentorApplication.findById(appId)
      .populate('userId', 'fullName email')
      .populate('levels', 'displayName')
      .lean();
    if (!app) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn ứng tuyển' });
    }
    return res.json({ success: true, data: app });
  } catch (err) {
    console.error('[GetApplicationDetail Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const approveApplication = async (req, res) => {
  try {
    const appId = req.params.applicationId;
    if (!mongoose.Types.ObjectId.isValid(appId)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    const app = await MentorApplication.findById(appId);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn ứng tuyển' });
    }

    app.status = 'approved';
    app.updatedAt = new Date();
    await app.save();

    const mentorRole = await Role.findOne({ roleName: { $regex: /^mentor$/i } });
    if (!mentorRole) {
      return res.status(500).json({ success: false, message: 'Lỗi: Vai trò Mentor chưa được cấu hình' });
    }

    // 1. Kiểm tra tài khoản bằng email của hồ sơ
    let user = await User.findOne({ email: app.email.toLowerCase() });
    let randomPassword = null;

    if (!user) {
      // 2. GUEST FLOW: Tạo tài khoản mới, cấp mật khẩu ngẫu nhiên 12 ký tự
      randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4);
      
      user = await User.create({
        fullName: app.fullName || app.name || 'Mentor User',
        email: app.email.toLowerCase(),
        password: randomPassword,
        isActive: true,
      });

      // Lưu lại userId vừa tạo vào hồ sơ
      app.userId = user._id;
      await app.save();
    }

    // 3. Cập nhật phân quyền UserRole thành Mentor (xóa phân quyền cũ nếu có)
    await UserRole.deleteMany({ userId: user._id });
    await UserRole.create({ userId: user._id, roleId: mentorRole._id });

    // 4. Gửi email kết quả phê duyệt
    if (user.email) {
      await sendApplicationResultEmail(
        user.email,
        user.fullName || app.fullName || app.name,
        'approved',
        [],
        '',
        randomPassword
      );
    }

    return res.json({ success: true, message: 'Đã phê duyệt đơn ứng tuyển thành Mentor' });
  } catch (err) {
    console.error('[ApproveApplication Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const appId = req.params.applicationId;
    const { tags, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(appId)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    const app = await MentorApplication.findById(appId);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn ứng tuyển' });
    }

    app.status = 'rejected';
    app.rejectionTags = tags || [];
    app.rejectionComment = comment || '';
    app.updatedAt = new Date();
    await app.save();

    const user = await User.findById(app.userId);
    if (user && user.email) {
      await sendApplicationResultEmail(user.email, user.fullName, 'rejected', tags, comment);
    }

    return res.json({ success: true, message: 'Đã từ chối đơn ứng tuyển' });
  } catch (err) {
    console.error('[RejectApplication Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const sendCourseResultEmail = async (to, fullName, courseName, result, tags = [], comment = '') => {
  const isApproved = result === 'active';
  const subject = isApproved
    ? `🎉 Khóa học "${courseName}" của bạn đã được phê duyệt!`
    : `Thông báo kết quả kiểm duyệt khóa học "${courseName}"`;

  let resultHtml = '';
  if (isApproved) {
    resultHtml = `
      <p style="color:#c4c3d0;font-size:15px;">Xin chào Mentor <strong style="color:#a78bfa;">${fullName}</strong>,</p>
      <p style="color:#c4c3d0;font-size:15px;">Chúng tôi rất vui mừng thông báo rằng khóa học <strong>"${courseName}"</strong> của bạn tại <strong>English Master</strong> đã được phê duyệt và chính thức hiển thị tới các học viên!</p>
      <p style="color:#c4c3d0;font-size:15px;">Cảm ơn những đóng góp giá trị của bạn cho cộng đồng học tập.</p>
    `;
  } else {
    const reasonTags = tags.length > 0 ? `<p style="color:#c4c3d0;font-size:15px;">Lý do từ chối: <strong style="color:#ff6b6b;">${tags.join(', ')}</strong></p>` : '';
    const additionalComment = comment.trim() ? `<p style="color:#c4c3d0;font-size:15px;">Góp ý bổ sung: <em>"${comment}"</em></p>` : '';
    resultHtml = `
      <p style="color:#c4c3d0;font-size:15px;">Xin chào Mentor <strong style="color:#ff6b6b;">${fullName}</strong>,</p>
      <p style="color:#c4c3d0;font-size:15px;">Cảm ơn bạn đã đầu tư xây dựng khóa học <strong>"${courseName}"</strong> tại <strong>English Master</strong>.</p>
      <p style="color:#c4c3d0;font-size:15px;">Sau khi xem xét nội dung chi tiết của khóa học, ban quản trị nhận thấy cần có một số điều chỉnh trước khi có thể phê duyệt khóa học này:</p>
      ${reasonTags}
      ${additionalComment}
      <p style="color:#c4c3d0;font-size:15px;">Bạn vui lòng cập nhật lại các phần nội dung chưa phù hợp và gửi yêu cầu phê duyệt lại.</p>
    `;
  }

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0f0e17;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg, ${isApproved ? '#6c63ff,#a78bfa' : '#f6b93b,#ff6b6b'});padding:32px 24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">⭐ English Master</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Kiểm duyệt khóa học</p>
      </div>
      <div style="padding:32px 24px;background:#1a1830;color:#c4c3d0;">
        ${resultHtml}
        <br/>
        <p style="color:#8885a0;font-size:13px;text-align:center;">Trân trọng,<br/>Đội ngũ English Master</p>
      </div>
      <div style="padding:16px 24px;background:#0f0e17;text-align:center;">
        <p style="color:#555;font-size:12px;margin:0;">© ${new Date().getFullYear()} English Master. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER.trim(),
        pass: process.env.EMAIL_PASS.trim(),
      },
    });

    await transporter.sendMail({
      from: `"English Master" <${process.env.EMAIL_USER.trim()}>`,
      to,
      subject,
      html,
    });
    console.log(`Course review result email sent to mentor ${to}`);
  } catch (err) {
    console.error('sendCourseResultEmail error:', err.message);
  }
};

const approveCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    course.status = 'active';
    course.isPublished = true;
    await course.save();

    logAction({
      entityType: 'Course',
      entityId: courseId,
      entityName: course.courseName,
      action: 'APPROVE',
      userId: req.user.userId,
      description: `Phê duyệt khóa học "${course.courseName}"`
    });

    const mentor = await User.findById(course.instructorId);
    if (mentor && mentor.email) {
      await sendCourseResultEmail(mentor.email, mentor.fullName, course.courseName, 'active');
    }

    return res.json({ success: true, message: 'Đã phê duyệt khóa học thành công' });
  } catch (err) {
    console.error('[ApproveCourse Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const rejectCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { tags, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    course.status = 'inactive';
    course.isPublished = false;
    course.rejectionTags = tags || [];
    course.rejectionComment = comment || '';
    await course.save();

    logAction({
      entityType: 'Course',
      entityId: courseId,
      entityName: course.courseName,
      action: 'REJECT',
      userId: req.user.userId,
      description: `Từ chối khóa học "${course.courseName}" với lý do: ${tags?.join(', ') || 'không đạt yêu cầu'}. Chi tiết: ${comment || ''}`
    });

    const mentor = await User.findById(course.instructorId);
    if (mentor && mentor.email) {
      await sendCourseResultEmail(mentor.email, mentor.fullName, course.courseName, 'inactive', tags, comment);
    }

    return res.json({ success: true, message: 'Đã từ chối khóa học' });
  } catch (err) {
    console.error('[RejectCourse Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const sendCourseUpdateResultEmail = async (to, fullName, courseName, result, tags = [], comment = '') => {
  const isApproved = result === 'approved';
  const subject = isApproved
    ? `🎉 Cập nhật nội dung khóa học "${courseName}" của bạn đã được phê duyệt!`
    : `Thông báo kết quả kiểm duyệt cập nhật khóa học "${courseName}"`;

  let resultHtml = '';
  if (isApproved) {
    resultHtml = `
      <p style="color:#c4c3d0;font-size:15px;">Xin chào Mentor <strong style="color:#a78bfa;">${fullName}</strong>,</p>
      <p style="color:#c4c3d0;font-size:15px;">Chúng tôi rất vui mừng thông báo rằng các cập nhật nội dung cho khóa học <strong>"${courseName}"</strong> của bạn tại <strong>English Master</strong> đã được phê duyệt và chính thức áp dụng!</p>
      <p style="color:#c4c3d0;font-size:15px;">Học viên hiện tại sẽ ngay lập tức được trải nghiệm những nội dung bài học mới này.</p>
    `;
  } else {
    const reasonTags = tags.length > 0 ? `<p style="color:#c4c3d0;font-size:15px;">Lý do từ chối: <strong style="color:#ff6b6b;">${tags.join(', ')}</strong></p>` : '';
    const additionalComment = comment.trim() ? `<p style="color:#c4c3d0;font-size:15px;">Chi tiết góp ý: <em>"${comment}"</em></p>` : '';
    resultHtml = `
      <p style="color:#c4c3d0;font-size:15px;">Xin chào Mentor <strong style="color:#ff6b6b;">${fullName}</strong>,</p>
      <p style="color:#c4c3d0;font-size:15px;">Cảm ơn bạn đã cập nhật nội dung cho khóa học <strong>"${courseName}"</strong> tại <strong>English Master</strong>.</p>
      <p style="color:#c4c3d0;font-size:15px;">Tuy nhiên, ban quản trị nhận thấy các cập nhật đề xuất cần điều chỉnh thêm một số điểm trước khi có thể phê duyệt:</p>
      ${reasonTags}
      ${additionalComment}
      <p style="color:#c4c3d0;font-size:15px;">Bạn vui lòng cập nhật lại các phần bài học/học liệu và gửi yêu cầu kiểm duyệt cập nhật mới.</p>
    `;
  }

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0f0e17;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg, ${isApproved ? '#6c63ff,#a78bfa' : '#f6b93b,#ff6b6b'});padding:32px 24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">⭐ English Master</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Kiểm duyệt cập nhật khóa học</p>
      </div>
      <div style="padding:32px 24px;background:#1a1830;color:#c4c3d0;">
        ${resultHtml}
        <br/>
        <p style="color:#8885a0;font-size:13px;text-align:center;">Trân trọng,<br/>Đội ngũ English Master</p>
      </div>
      <div style="padding:16px 24px;background:#0f0e17;text-align:center;">
        <p style="color:#555;font-size:12px;margin:0;">© ${new Date().getFullYear()} English Master. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER.trim(),
        pass: process.env.EMAIL_PASS.trim(),
      },
    });

    await transporter.sendMail({
      from: `"English Master" <${process.env.EMAIL_USER.trim()}>`,
      to,
      subject,
      html,
    });
    console.log(`Course updates result email sent to mentor ${to}`);
  } catch (err) {
    console.error('sendCourseUpdateResultEmail error:', err.message);
  }
};

const approveCourseUpdates = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    if (!course.hasPendingUpdates || !course.tempContent) {
      return res.status(400).json({ success: false, message: 'Không có cập nhật nào đang chờ duyệt cho khóa học này.' });
    }

    const tempPaths = course.tempContent;

    // Delete existing paths, nodes, and materials for this course
    const existingPaths = await Path.find({ courseId }).select('_id').lean();
    const pathIds = existingPaths.map(p => p._id);
    const existingNodes = await PathNode.find({ pathId: { $in: pathIds } }).select('_id').lean();
    const nodeIds = existingNodes.map(n => n._id);

    await NodeMaterial.deleteMany({ nodeId: { $in: nodeIds } });
    await PathNode.deleteMany({ pathId: { $in: pathIds } });
    await Path.deleteMany({ courseId });

    // Create new paths with nodes
    let totalLessons = 0;
    for (const pathData of tempPaths) {
      const path = await Path.create({
        courseId,
        pathName: pathData.pathName,
        description: pathData.description,
        order: pathData.order || 1,
      });

      const nodes = pathData.nodes || [];
      for (const nodeData of nodes) {
        const node = await PathNode.create({
          pathId: path._id,
          nodeName: nodeData.nodeName,
          nodeOrder: nodeData.nodeOrder || 1,
          description: nodeData.description,
          isFree: Boolean(nodeData.isFree),
        });
        totalLessons++;

        const materials = nodeData.materials || [];
        for (const matData of materials) {
          await NodeMaterial.create({
            nodeId: node._id,
            materialType: matData.materialType,
            title: String(matData.title || '').trim() || 'Học liệu',
            materialUrl: matData.materialUrl,
            materialOrder: matData.materialOrder || 1,
            sourceType: matData.sourceType,
            fileName: matData.fileName,
            fileSize: matData.fileSize,
            embedUrl: matData.embedUrl,
            content: matData.content,
          });
        }
      }
    }

    course.totalLessons = totalLessons;
    course.hasPendingUpdates = false;
    course.tempContent = null;
    await course.save();

    logAction({
      entityType: 'Course',
      entityId: courseId,
      entityName: course.courseName,
      action: 'APPROVE_UPDATES',
      userId: req.user.userId,
      description: `Phê duyệt cập nhật nội dung cho khóa học "${course.courseName}" (Tổng cộng ${totalLessons} bài học)`
    });

    const mentor = await User.findById(course.instructorId);
    if (mentor && mentor.email) {
      await sendCourseUpdateResultEmail(mentor.email, mentor.fullName, course.courseName, 'approved');
    }

    return res.json({ success: true, message: 'Đã phê duyệt các cập nhật nội dung thành công.' });
  } catch (err) {
    console.error('[ApproveCourseUpdates Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const rejectCourseUpdates = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { tags, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    if (!course.hasPendingUpdates) {
      return res.status(400).json({ success: false, message: 'Không có cập nhật nào đang chờ duyệt cho khóa học này.' });
    }

    course.hasPendingUpdates = false;
    course.tempContent = null;
    await course.save();

    logAction({
      entityType: 'Course',
      entityId: courseId,
      entityName: course.courseName,
      action: 'REJECT_UPDATES',
      userId: req.user.userId,
      description: `Từ chối cập nhật nội dung cho khóa học "${course.courseName}" với lý do: ${tags?.join(', ') || 'không đạt yêu cầu'}. Chi tiết: ${comment || ''}`
    });

    const mentor = await User.findById(course.instructorId);
    if (mentor && mentor.email) {
      await sendCourseUpdateResultEmail(mentor.email, mentor.fullName, course.courseName, 'rejected', tags, comment);
    }

    return res.json({ success: true, message: 'Đã từ chối các cập nhật nội dung thành công.' });
  } catch (err) {
    console.error('[RejectCourseUpdates Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, data: logs });
  } catch (err) {
    console.error('[GetAuditLogs Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  createUser,
  getUserDetail,
  updateUser,
  toggleUserStatus,
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
  getApplications,
  getApplicationDetail,
  approveApplication,
  rejectApplication,
  approveCourse,
  rejectCourse,
  approveCourseUpdates,
  rejectCourseUpdates,
  getAuditLogs,
};
