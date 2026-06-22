const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { sql } = require('../config/db');

/* ─── Multer storage: saves avatars to backend/uploads/avatars/ ──────────── */
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, _file, cb) => {
    const userId = req.user?.userId || 'unknown';
    const ext = '.png';
    cb(null, `avatar_${userId}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
});

/* ─── Export multer middleware for use in routes ─────────────────────────── */
module.exports.avatarUploadMiddleware = upload.single('avatar');

/* ─── POST /api/users/avatar ─────────────────────────────────────────────── */
module.exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không nhận được file ảnh.' });
    }

    const userId = req.user.userId;

    // Build the public URL that the frontend can use to display the avatar.
    // The static /uploads route is registered in server.js (see instructions).
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Persist the avatar URL into the Users table
    const updateReq = new sql.Request();
    updateReq.input('userId', sql.Int, userId);
    updateReq.input('avatarUrl', sql.NVarChar(500), avatarUrl);

    await updateReq.query(`
      UPDATE Users
      SET AvatarUrl = @avatarUrl, UpdatedAt = GETDATE()
      WHERE UserId = @userId
    `);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật ảnh đại diện thành công.',
      avatarUrl: avatarUrl,
    });
  } catch (err) {
    console.error('[UploadAvatar Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tải ảnh.' });
  }
};
