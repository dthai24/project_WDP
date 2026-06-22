const multer = require('multer');
const { DOC_EXTENSIONS, MATERIAL_MAX_BYTES } = require('../services/cloudinaryService');

const materialUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MATERIAL_MAX_BYTES },  fileFilter: (_req, file, cb) => {
    const lower = String(file.originalname ?? '').toLowerCase();
    const allowed = [...DOC_EXTENSIONS].some((ext) => lower.endsWith(`.${ext}`));
    if (!allowed) {
      cb(new Error('Chỉ hỗ trợ PDF, DOC, DOCX, PPT, PPTX.'));
      return;
    }
    cb(null, true);
  },
});

module.exports = {
  materialUploadMiddleware: materialUpload.single('file'),
  MATERIAL_MAX_BYTES,
};