const courseModel = require('../models/coursesModel');
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
    const userId = req.user?.userId || null;

    const { courses, totalCount } = await courseModel.getStudentCoursesList(filters, userId);

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
      courses = await courseModel.getMyEnrolledCourses(userId, filterStatus);
    } else {
      courses = await courseModel.getCoursesByUserRole(userId, roleName);
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

//Get course's by Id
const getInformationCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const tab = req.query.tab;
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu courseId',
        data: {},
      })
    } else if (!tab) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu hoặc sai query tab trên url',
        data: {}
      })
    }
    // Tab=course
    if (tab.toLowerCase() === 'course') {
      const userId = req.headers['x-user-id'] || null;
      const courses = await courseModel.getCourseById(courseId, userId);
      //404
      if (courses.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khóa học này trong Databse',
          data: {}
        })
      }
      //200
      return res.status(200).json({
        success: true,
        message: 'Lấy thông tin khóa học thành công',
        data: courses
      })
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

//Save Course Draft at Step 1
const saveCourseDraftStepOne = async (req, res) => {
  try {
    const body = req.body;

    // req.body có thể là {} nên không được chỉ check !req.body
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
    if (!CategoryId || Number.isNaN(Number(CategoryId))) {
      return res.status(400).json({
        success: false,
        message: 'Step 1: Thiếu hoặc sai CategoryId.',
      });
    }

    // Validate LevelId
    if (!LevelId || Number.isNaN(Number(LevelId))) {
      return res.status(400).json({
        success: false,
        message: 'Step 1: Thiếu hoặc sai LevelId.',
      });
    }

    // Validate InstructorId
    if (!InstructorId || Number.isNaN(Number(InstructorId))) {
      return res.status(400).json({
        success: false,
        message: 'Step 1: Thiếu hoặc sai InstructorId.',
      });
    }

    const courseData = {
      CourseName: String(CourseName).trim(),
      Description: String(Description).trim(),
      Thumbnail: Thumbnail || null,
      CategoryId: Number(CategoryId),
      LevelId: Number(LevelId),
      InstructorId: Number(InstructorId),
      IsPublished: Boolean(IsPublished),
      Rating: 0,
      TotalLessons: 0,
    };

    if (courseData.Thumbnail) {
      validateCourseThumbnailDataUrl(courseData.Thumbnail);
    }

    const newCourse = await courseModel.createCourseStepOne(courseData);

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
// Hứng request lấy danh sách bài học
const getLearningPath = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.headers['x-user-id']; // Lấy ID người dùng từ Header
        
        // Lấy thêm tên khóa học và tên giảng viên
        const coursesInfo = await courseModel.getCourseById(courseId, userId);
        const courseDetails = coursesInfo.length > 0 ? coursesInfo[0] : null;

        const data = await courseModel.getCourseLearningPath(courseId, userId);
        res.json({ 
            success: true, 
            courseTitle: courseDetails ? courseDetails.CourseName : "Khóa học",
            instructor: courseDetails ? courseDetails.InStructorName : "Giảng viên",
            data: data 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

// Hứng request lưu bài học
const updateProgress = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.headers['x-user-id'];
        const { nodeId } = req.body; // Frontend gửi lên nodeId
        
        const newProgress = await courseModel.markNodeAsCompleted(courseId, userId, nodeId);
        res.json({ success: true, newProgress: newProgress });
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

//create node

//Save Course (Final step in create course process)
// at this step => course must be have full information about course
// req.body : {
//   course: {
//     CourseName: 'adsf',
//     Description: 'adsfadsf',
//     Thumbnail:
//     CategoryId: 4,
//     LevelId: 1,
//     InstructorId: 2,
//     IsPublished: true
//   },
//   paths: [
//     {
//       PathName: 'adsf',
//       Description: 'adf',
//       PathOrder: 1,
//       nodes: [{}]
//     }
//   ]
// }


const createFinalCourse = async (req, res) => {
  try {
    const newCourse = req.body.course;
    const newCoursePaths = req.body.paths;

    if (newCourse?.Thumbnail) {
      validateCourseThumbnailDataUrl(newCourse.Thumbnail);
    }

    const newCourseId = await courseModel.createFinalCourse(newCourse, newCoursePaths);

    return res.status(201).json({
      success: true,
      message: 'Tạo khóa học hoàn chỉnh thành công!',
      data: { courseId: newCourseId }
    });
  } catch (error) {
    console.error(error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: statusCode === 400
        ? error.message
        : 'Lỗi server khi tạo khóa học',
    });
  }
}
const enrollCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId hoặc courseId' });
    }
    // Gọi xuống hàm ở file Model mà anh em mình đã viết lúc nãy
    const result = await courseModel.enrollCourse(userId, courseId);
    return res.status(200).json({ success: true, message: 'Đăng ký khóa học thành công!', data: result });
  } catch (error) {
    console.error('Lỗi tại enrollCourse Controller:', error.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi đăng ký khóa học' });
  }
};

const getFeaturedCourses = async (req, res) => {
  try {
    const courses = await courseModel.getFeaturedCourses();
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
    const paths = await courseModel.getFeaturedPaths();
    return res.status(200).json({
      success: true,
      message: 'Lấy lộ trình nổi bật thành công',
      data: paths
    });
  } catch (error) {
    console.error('getFeaturedPaths error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy lộ trình nổi bật'
    });
  }
};

// hien thi khoa hoc dang hoc theo date
const getContinueCourse = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId || Number.isNaN(Number(userId))) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu hoặc sai userId.',
      });
    }

    const continueCourse = await courseModel.getContinueCourse(userId);

    if (!continueCourse) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học đang học.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy khóa học đang học thành công.',
      data: continueCourse
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
  saveCourseDraftStepOne,
  createFinalCourse,
  getStudentCourses,
  enrollCourse,
  getLearningPath,
  updateProgress,
  getFeaturedCourses,
  getFeaturedPaths,
  getContinueCourse
};