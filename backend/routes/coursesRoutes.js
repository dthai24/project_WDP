const express = require('express');
const router = express.Router();

const {
    getMyCourses,
    getInformationCourse,
    saveCourseDraftStepOne,
    createFinalCourse,
    getStudentCourses,
    enrollCourse
} = require('../controllers/coursesController');


const optionalAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'] || req.query.userId;

    if (userId) {
        req.user = {
            userId: Number(userId),
        };
    }

    next();
};

// GET /api/courses
// Lấy tất cả khóa học ngoài trang tổng (Catalog)
router.get('/student', optionalAuth, getStudentCourses);

// Lấy danh sách khóa học của tôi (Trang My Courses)
router.post('/my-courses', getMyCourses);

// Chi tiết khóa học
router.get('/my-courses/:courseId', getInformationCourse);

// Lưu nháp và tạo khóa học (Role Mentor)
router.post('/mentor/courses/save/draft', saveCourseDraftStepOne);
router.post('/mentor/courses/createCourse', createFinalCourse);

// CHỖ THIẾU CHÍ MẠNG: Khai báo đường dẫn cho nút Đăng ký khóa học!
router.post('/enroll', enrollCourse); 

module.exports = router;