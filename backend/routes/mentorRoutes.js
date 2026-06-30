const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const MentorApplication = require('../models/MongoDB/MentorApplication');
const User = require('../models/MongoDB/User');

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer lưu chứng chỉ
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận các định dạng file ảnh: JPEG, JPG, PNG, WEBP.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

const {
    getStudentsInCourse,
    setPublishCourse,
    setDraftCourse,
    updateCourse,
    updateCourseContent,
    getCourseCommentsForMentor,
    replyCourseComment,
    createCourseCommentForMentor,
} = require('../controllers/mentorController');


const optionalAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'] || req.query.userId;

    if (userId) {
        req.user = {
            userId: String(userId),
        };
    }

    next();
};
router.get('/courses/:courseId/students', getStudentsInCourse);
router.get('/courses/:courseId/comments', optionalAuth, getCourseCommentsForMentor);
router.post('/courses/:courseId/comments', optionalAuth, createCourseCommentForMentor);
router.patch('/courses/:courseId/comments/:commentId/reply', optionalAuth, replyCourseComment);
router.patch('/courses/:courseId', optionalAuth, updateCourse);
router.put('/courses/:courseId/content', optionalAuth, updateCourseContent);
router.get('/courses/:courseId/setPublic', setPublishCourse);
router.get('/courses/:courseId/setDraft', setDraftCourse);

// POST /api/mentor/become-mentor
router.post('/become-mentor', upload.single('certificate'), async (req, res) => {
  try {
    const { fullName, email, portfolioUrl, bio } = req.body;

    if (!fullName || !email || !bio) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng tải lên ảnh chứng chỉ chuyên môn.' });
    }

    const certificatePath = `/uploads/${req.file.filename}`;

    // Tìm userId để map với hệ thống mới
    const user = await User.findOne({ email: email.toLowerCase() });
    const userId = user ? user._id : null;

    const newApplication = new MentorApplication({
      userId,
      fullName,
      email,
      portfolioUrl: portfolioUrl || '',
      bio,
      certificatePath,
      name: fullName,
      age: 25, // Giá trị mặc định cho trường age bắt buộc trong schema mới
      evidence: certificatePath,
      status: 'pending'
    });

    await newApplication.save();

    // Gửi email xác nhận
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER.trim(),
            pass: process.env.EMAIL_PASS.replace(/\s/g, ''),
          },
        });

        await transporter.sendMail({
          from: `"English Master" <${process.env.EMAIL_USER.trim()}>`,
          to: email,
          subject: '[English Master] Hồ sơ đăng ký Mentor của bạn đang được xét duyệt',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #e11d48;">Chào ${fullName},</h2>
              <p>Cảm ơn bạn đã nộp đơn đăng ký trở thành Mentor trên hệ thống <strong>English Master</strong>.</p>
              <p>Chúng tôi đã nhận được hồ sơ của bạn cùng chứng chỉ đính kèm. Hiện tại hồ sơ đang ở trạng thái <strong>Chờ phê duyệt</strong> từ phía Ban quản trị (Admin).</p>
              <p style="font-weight: bold;">Thông tin hồ sơ đăng ký:</p>
              <ul>
                <li><strong>Họ và tên:</strong> ${fullName}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Giới thiệu/Kinh nghiệm:</strong> ${bio}</li>
              </ul>
              <p>Quy trình xem xét hồ sơ thường mất từ 24 đến 48 giờ làm việc. Ngay khi có kết quả duyệt, chúng tôi sẽ thông báo trực tiếp qua email này cho bạn.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">Đây là email tự động từ hệ thống English Master. Vui lòng không trả lời thư này.</p>
            </div>
          `,
        });
        console.log(`Email successfully logged/sent to ${email}`);
      } catch (err) {
        console.error('[Become Mentor Email Error]', err.message);
      }
    }

    return res.status(201).json({
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để cập nhật trạng thái.',
      application: newApplication
    });

  } catch (error) {
    console.error('Lỗi đăng ký Mentor:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống khi xử lý hồ sơ.' });
  }
});

module.exports = router;