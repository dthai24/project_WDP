const courseModel = require('../models/coursesModel');

const getMyCourses = async (req, res) => {
  try {
    const { userId, roleName } = req.body;

    if (!userId || !roleName) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu userId hoặc roleName',
      });
    }

    const courses = await courseModel.getCoursesByUserRole(userId, roleName);

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
    //valid courseId (req.params.courseId) and tab (req.query.tab)
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu courseId',
        data: [],
      })
    } else if (!tab) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu hoặc sai query tab trên url',
        data: []
      })
    }
    // Tab=course
    if (tab.toLowerCase() === 'course') {
      const courses = await courseModel.getCourseById(courseId);
      //404
      if (courses.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khóa học này trong Databse',
          data: []
        })
      }
      //200
      return res.status(200).json({
        success: true,
        message: 'Lấy thông tin khóa học thành công',
        data: courses
      })
    }

    // tab = content
    // if (tab.toLowerCase() === 'content') {
    //   const content
    // }
    // tab = students
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

    const newCourse = await courseModel.createCourseStepOne(courseData);

    return res.status(201).json({
      success: true,
      message: 'Step 1: Lưu nháp khóa học thành công.',
      data: newCourse,
    });
  } catch (error) {
    console.error('saveCourseDraftStepOne error:', error);

    return res.status(500).json({
      success: false,
      message: 'Step 1: Lỗi khi lưu khóa học.',
    });
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
    const newCoursePaths = req.body.paths ?? [];

    if (!newCourse?.CourseName) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin khóa học.',
      });
    }

    const newCourseId = await courseModel.createFinalCourse(newCourse, newCoursePaths);

    return res.status(201).json({
      success: true,
      message: 'Khóa học đã được tạo.',
      courseId: newCourseId,
      data: { courseId: newCourseId },
    });
  } catch (error) {
    console.error('createFinalCourse error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo khóa học.',
    });
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
  getFeaturedCourses,
  getFeaturedPaths,
  getContinueCourse
};