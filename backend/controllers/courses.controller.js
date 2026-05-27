const courseModel = require('../models/courses.model');

const getMyCourses = async (req, res) => {
  try {
    const { userId, roleName } = req.body;

    if (!userId || !roleName) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu userId hoặc roleName',
      });
    }

    const courses = await courseModel.getCoursesByRole(userId, roleName);

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

const getAllCourses = async (req, res) => {
  try {
    const userId = req.query.userId || null;

    const courses = await courseModel.getAllCourses(userId);

    return res.status(200).json({
      success: true,
      message: 'Lấy tất cả khóa học thành công',
      data: courses,
    });
  } catch (error) {
    console.error('Get all courses error:', error);

    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy tất cả khóa học',
    });
  }
};

module.exports = {
  getMyCourses,
  getAllCourses,
};