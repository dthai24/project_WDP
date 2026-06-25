const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  applyMentor,
  getApplications,
  getUnreadCount,
  markAllRead,
  reviewApplication
} = require("../controllers/mentorController");

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer lưu trữ ảnh chứng chỉ
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
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
      cb(new Error("Chỉ chấp nhận các định dạng file ảnh: JPEG, JPG, PNG, WEBP."));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // Giới hạn 10MB
});

// Các endpoint API
router.post("/become-mentor", upload.single("certificate"), applyMentor);
router.get("/applications", getApplications);
router.get("/applications/unread-count", getUnreadCount);
router.post("/applications/mark-read", markAllRead);
router.post("/applications/:id/review", reviewApplication);

module.exports = router;
