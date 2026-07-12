const fs = require('fs');
const path = require('path');

const MAX_THUMBNAIL_FILE_SIZE = 5 * 1024 * 1024;
const DATA_URL_PATTERN = /^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i;

function createThumbnailError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseThumbnailDataUrl(dataUrl) {
  const match = String(dataUrl).trim().match(DATA_URL_PATTERN);
  if (!match) return null;

  const rawExt = match[1].toLowerCase();
  return {
    ext: rawExt === 'jpeg' ? 'jpg' : rawExt,
    base64Data: match[2],
  };
}

/** Validate data URL thumbnail; skip nếu đã là URL hoặc path. */
function validateNewsThumbnailDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return null;
  }

  const trimmed = dataUrl.trim();
  if (!trimmed) return null;

  // Nếu đã là URL đầy đủ (http, https, cloudinary) thì skip
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { existingUrl: trimmed };
  }

  // Nếu đã là path trên server
  if (trimmed.startsWith('/uploads/news/')) {
    return { existingPath: trimmed };
  }

  const parsed = parseThumbnailDataUrl(trimmed);
  if (!parsed) {
    throw createThumbnailError('Thumbnail không đúng định dạng ảnh base64.');
  }

  const buffer = Buffer.from(parsed.base64Data, 'base64');

  if (buffer.length > MAX_THUMBNAIL_FILE_SIZE) {
    throw createThumbnailError('Ảnh đại diện không được vượt quá 5MB.');
  }

  return { buffer, ext: parsed.ext };
}

function deleteOldNewsThumbnails(uploadDir, newsId) {
  if (!fs.existsSync(uploadDir)) return;
  const prefix = `news_thumb_${newsId}`;
  for (const file of fs.readdirSync(uploadDir)) {
    if (file === prefix || file.startsWith(`${prefix}.`) || file.startsWith(`${prefix}_`)) {
      fs.unlinkSync(path.join(uploadDir, file));
    }
  }
}

const saveNewsThumbnailFromDataUrl = (dataUrl, newsId, options = {}) => {
  const { replaceExisting = false } = options;
  const validated = validateNewsThumbnailDataUrl(dataUrl);
  if (!validated) return null;
  if (validated.existingUrl) return validated.existingUrl;
  if (validated.existingPath && !replaceExisting) {
    return validated.existingPath;
  }

  const { buffer, ext } = validated;
  const uploadDir = path.join(__dirname, '../uploads/news');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  if (replaceExisting) {
    deleteOldNewsThumbnails(uploadDir, newsId);
  }

  const fileName = replaceExisting
    ? `news_thumb_${newsId}_${Date.now()}.${ext}`
    : `news_thumb_${newsId}.${ext}`;

  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/news/${fileName}`;
};

module.exports = {
  MAX_THUMBNAIL_FILE_SIZE,
  validateNewsThumbnailDataUrl,
  saveNewsThumbnailFromDataUrl,
};
