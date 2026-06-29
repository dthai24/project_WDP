const User = require('../models/MongoDB/User');
const Level = require('../models/MongoDB/Level');
const UserCategory = require('../models/MongoDB/UserCategory');
const Category = require('../models/MongoDB/Category');
const UserCourse = require('../models/MongoDB/UserCourse');

// ============================================================
// GET /api/users/profile
// ============================================================
const getProfile = async (req, res) => {
  const userId = req.user.userId;
  try {
    // 1. Lấy thông tin cơ bản + Mục tiêu + Level ID
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });

    let levelName = '';
    if (user.currentLevelId) {
      const level = await Level.findById(user.currentLevelId).lean();
      if (level) levelName = level.displayName;
    }

    // 2. Lấy mảng các Lĩnh vực quan tâm từ bảng trung gian User_Categories
    const userCats = await UserCategory.find({ userId }).populate('categoryId', 'displayName').lean();
    const interestedCategories = userCats.map(uc => ({
      categoryId: uc.categoryId?._id?.toString(),
      displayName: uc.categoryId?.displayName || '',
    }));

    // 3. Lấy số liệu học tập
    const allCourses = await UserCourse.find({ userId }).lean();
    const learning = allCourses.filter(uc => uc.progressPercentage < 100).length;
    const completed = allCourses.filter(uc => uc.progressPercentage === 100).length;

    return res.json({
      success: true,
      profile: {
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        joinedAt: user.createdAt,
        currentLevel: levelName,
        learningGoal: user.learningGoal,
        avatarUrl: user.avatarUrl || null,
        categories: interestedCategories,
        stats: { learning, completed },
      },
    });
  } catch (err) {
    console.error('[GetProfile Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ============================================================
// PUT /api/users/profile
// ============================================================
const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const { name, phone, dateOfBirth } = req.body;

  if (!name || !phone || !dateOfBirth) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ tên, số điện thoại và ngày sinh.' });
  }

  try {
    await User.findByIdAndUpdate(userId, {
      fullName: name,
      phone,
      dateOfBirth: new Date(dateOfBirth),
    });

    return res.json({
      success: true,
      message: 'Cập nhật hồ sơ thành công.',
    });
  } catch (err) {
    console.error('[UpdateProfile Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ============================================================
// PUT /api/users/change-password
// ============================================================
const changePassword = async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin.' });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ success: false, message: 'Mật khẩu mới không được trùng với mật khẩu cũ.' });
  }

  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
    }

    if (user.password !== currentPassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    }

    await User.findByIdAndUpdate(userId, { password: newPassword });

    return res.json({ success: true, message: 'Đổi mật khẩu thành công.' });
  } catch (err) {
    console.error('[ChangePassword Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ============================================================
// PUT /api/users/goals
// Tác dụng: Cập nhật Mục tiêu học tập và Danh mục lĩnh vực
// ============================================================
const updateGoals = async (req, res) => {
  const userId = req.user.userId;
  const { learningGoal, categoryIds } = req.body;
  try {
    // 1. Cập nhật LearningGoal
    await User.findByIdAndUpdate(userId, { learningGoal });

    // 2. Xóa các danh mục cũ của người dùng này
    await UserCategory.deleteMany({ userId });

    // 3. Insert các danh mục mới được tick
    for (let catId of categoryIds) {
      await UserCategory.create({ userId, categoryId: catId });
    }

    res.json({ success: true, message: 'Cập nhật thành công!' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile, changePassword, updateGoals };
