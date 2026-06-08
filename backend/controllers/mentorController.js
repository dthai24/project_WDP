
const studentsModel = require('../Models/studentsModel.js')

const getStudentsInCourse = async (req, res) => {
    try {
        // Lấy courseId từ params trước
        // Route nên là: /courses/:courseId/students
        const courseId = Number(req.params.courseId);

        if (!Number.isInteger(courseId) || courseId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'courseId không hợp lệ',
            });
        }

        const students = await studentsModel.getStudentsInCourseModel(courseId);

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách học viên trong khóa học thành công',
            data: students,
        });
    } catch (error) {
        console.error('getStudentsInCourse error:', error);

        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách học viên trong khóa học',
        });
    }
};

module.exports = {
    getStudentsInCourse
};