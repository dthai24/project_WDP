const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const MATERIALS_FOLDER = 'learning-path/materials';
const TEXT_FOLDER = `${MATERIALS_FOLDER}/text`;
const AUDIO_FOLDER = `${MATERIALS_FOLDER}/audio`;
const AUDIO_EXTENSIONS = new Set(['mp3', 'mp4']);

/** Giới hạn Cloudinary free tier — 10 MB. */
const MATERIAL_MAX_BYTES = 10 * 1024 * 1024;

const DOC_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx']);
const DOC_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });
}

function sanitizeFileName(name) {
  return String(name ?? 'document')
    .replace(/[^\w.\-()]+/g, '_')
    .slice(0, 120);
}

function getExtensionFromFileName(fileName) {
  const match = String(fileName ?? '').toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? null;
}

function assertMaterialSize(byteSize) {
  const size = Number(byteSize ?? 0);
  if (size > MATERIAL_MAX_BYTES) {
    const error = new Error('File quá lớn. Dung lượng tối đa là 10 MB.');
    error.statusCode = 400;
    throw error;
  }
}

function assertAllowedDoc(file) {
  assertMaterialSize(file.size);

  const ext = getExtensionFromFileName(file.originalname);  if (!ext || !DOC_EXTENSIONS.has(ext)) {
    const error = new Error('Chỉ hỗ trợ PDF, DOC, DOCX, PPT, PPTX.');
    error.statusCode = 400;
    throw error;
  }

  if (file.mimetype && !DOC_MIME_TYPES.has(file.mimetype)) {
    const isGenericBinary = file.mimetype === 'application/octet-stream';
    if (!isGenericBinary) {
      const error = new Error('Định dạng file không hợp lệ.');
      error.statusCode = 400;
      throw error;
    }
  }
}

async function uploadDocumentFile(file) {
  assertAllowedDoc(file);

  const ext = getExtensionFromFileName(file.originalname);
  const safeName = sanitizeFileName(file.originalname).replace(/\.[^.]+$/, '');

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    const uploadsDir = path.join(__dirname, '../uploads/materials');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const localFileName = `${safeName}_${Date.now()}.${ext}`;
    const localFilePath = path.join(uploadsDir, localFileName);
    fs.writeFileSync(localFilePath, file.buffer);
    return {
      url: `/uploads/materials/${localFileName}`,
      publicId: `local_${Date.now()}`,
      fileName: file.originalname,
      fileSize: file.size,
      format: ext,
    };
  }

  const result = await uploadBuffer(file.buffer, {
    resource_type: 'raw',
    folder: MATERIALS_FOLDER,
    public_id: `${safeName}_${Date.now()}`,
    format: ext,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    fileName: file.originalname,
    fileSize: file.size,
    format: result.format ?? ext,
  };
}

async function uploadAudioFile(file) {
  assertMaterialSize(file.size);
  const ext = getExtensionFromFileName(file.originalname);
  if (!ext || !AUDIO_EXTENSIONS.has(ext)) {
    const error = new Error('Chỉ hỗ trợ file đuôi .mp3 hoặc .mp4.');
    error.statusCode = 400;
    throw error;
  }
  const safeName = sanitizeFileName(file.originalname).replace(/\.[^.]+$/, '');

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    const uploadsDir = path.join(__dirname, '../uploads/audio');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const localFileName = `${safeName}_${Date.now()}.${ext}`;
    const localFilePath = path.join(uploadsDir, localFileName);
    fs.writeFileSync(localFilePath, file.buffer);
    return {
      url: `/uploads/audio/${localFileName}`,
      fileName: file.originalname,
      fileSize: file.size,
    };
  }

  const result = await uploadBuffer(file.buffer, {
    resource_type: 'video',
    folder: AUDIO_FOLDER,
    public_id: `${safeName}_${Date.now()}`,
  });
  return {
    url: result.secure_url,
    fileName: file.originalname,
    fileSize: file.size,
  };
}

async function uploadTextHtml(html, title = 'text-material') {
  const trimmed = String(html ?? '').trim();
  if (!trimmed) {
    const error = new Error('Nội dung văn bản trống.');
    error.statusCode = 400;
    throw error;
  }

  const buffer = Buffer.from(trimmed, 'utf8');
  assertMaterialSize(buffer.byteLength);
  const safeName = sanitizeFileName(title).replace(/\.[^.]+$/, '') || 'text-material';

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    const uploadsDir = path.join(__dirname, '../uploads/text');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const localFileName = `${safeName}_${Date.now()}.html`;
    const localFilePath = path.join(uploadsDir, localFileName);
    fs.writeFileSync(localFilePath, buffer);
    return {
      url: `/uploads/text/${localFileName}`,
      publicId: `local_${Date.now()}`,
      fileName: `${safeName}.html`,
      fileSize: buffer.byteLength,
      format: 'html',
    };
  }

  const result = await uploadBuffer(buffer, {
    resource_type: 'raw',
    folder: TEXT_FOLDER,
    public_id: `${safeName}_${Date.now()}`,
    format: 'html',
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    fileName: `${safeName}.html`,
    fileSize: buffer.byteLength,
    format: 'html',
  };
}

module.exports = {
  AUDIO_EXTENSIONS,
  DOC_EXTENSIONS,
  MATERIAL_MAX_BYTES,
  uploadAudioFile,
  uploadDocumentFile,
  uploadTextHtml,
};
