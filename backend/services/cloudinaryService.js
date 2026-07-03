const cloudinary = require('../config/cloudinary');

const MATERIALS_FOLDER = 'learning-path/materials';
const TEXT_FOLDER = `${MATERIALS_FOLDER}/text`;
const AUDIO_FOLDER = `${MATERIALS_FOLDER}/audio`;
const AUDIO_EXTENSIONS = new Set(['mp3', 'mp4']);

/** Giới hạn Cloudinary free tier — 10 MB. */
const MATERIAL_MAX_BYTES = 10 * 1024 * 1024;

const DOC_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx']);
const READING_DOC_EXTENSIONS = new Set(['pdf', 'doc', 'docx']);

/** MIME hợp lệ theo đuôi file — cho phép octet-stream / rỗng (Windows thường gửi vậy). */
const EXTENSION_MIME_ALLOWLIST = {
  pdf: ['application/pdf'],
  doc: ['application/msword', 'application/vnd.ms-word'],
  docx: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed',
  ],
  ppt: ['application/vnd.ms-powerpoint'],
  pptx: [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
  ],
  mp3: ['audio/mpeg', 'audio/mp3', 'audio/x-mpeg', 'audio/x-mpeg-3'],
  mp4: ['video/mp4', 'audio/mp4', 'application/mp4'],
};

const MATERIAL_MAX_SIZE_MESSAGE = 'Chỉ chấp nhận tối đa 10MB';

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
  const lower = String(fileName ?? '').trim().toLowerCase();
  if (lower.endsWith('.docx')) return 'docx';
  if (lower.endsWith('.doc')) return 'doc';
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.mp4')) return 'mp4';
  if (lower.endsWith('.mp3')) return 'mp3';
  if (lower.endsWith('.pptx')) return 'pptx';
  if (lower.endsWith('.ppt')) return 'ppt';
  const match = lower.match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? null;
}

/** Chèn delivery transformation (q_auto) vào URL Cloudinary. */
function buildDeliveryUrl(secureUrl, transformation = 'q_auto') {
  const url = String(secureUrl ?? '').trim();
  if (!url.includes('cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }
  if (url.includes(`/upload/${transformation}/`) || /\/upload\/q_auto/.test(url)) {
    return url;
  }
  if (url.includes('/raw/upload/')) {
    return url;
  }
  return url.replace('/upload/', `/upload/${transformation}/`);
}

function assertMaterialSize(byteSize) {
  const size = Number(byteSize ?? 0);
  if (size > MATERIAL_MAX_BYTES) {
    const error = new Error(MATERIAL_MAX_SIZE_MESSAGE);
    error.statusCode = 400;
    throw error;
  }
}

function assertMimeMatchesExtension(file, ext) {
  const mime = String(file.mimetype ?? '').trim().toLowerCase();
  if (!mime || mime === 'application/octet-stream') return;

  const allowed = EXTENSION_MIME_ALLOWLIST[ext];
  if (!allowed || allowed.includes(mime)) return;

  const error = new Error('Định dạng file không hợp lệ.');
  error.statusCode = 400;
  throw error;
}

function assertAllowedDoc(file) {
  assertMaterialSize(file.size);

  const ext = getExtensionFromFileName(file.originalname);
  if (!ext || !DOC_EXTENSIONS.has(ext)) {
    const error = new Error('Chỉ hỗ trợ PDF, DOC, DOCX, PPT, PPTX.');
    error.statusCode = 400;
    throw error;
  }

  assertMimeMatchesExtension(file, ext);
}

function assertAllowedReadingDoc(file) {
  assertMaterialSize(file.size);

  const ext = getExtensionFromFileName(file.originalname);
  if (!ext || !READING_DOC_EXTENSIONS.has(ext)) {
    const error = new Error('Chỉ chấp nhận PDF, DOC, DOCX.');
    error.statusCode = 400;
    throw error;
  }

  assertMimeMatchesExtension(file, ext);
}

async function uploadDocumentFile(file) {
  assertAllowedDoc(file);

  const ext = getExtensionFromFileName(file.originalname);
  const safeName = sanitizeFileName(file.originalname).replace(/\.[^.]+$/, '');

  const result = await uploadBuffer(file.buffer, {
    resource_type: 'raw',
    folder: MATERIALS_FOLDER,
    public_id: `${safeName}_${Date.now()}`,
    format: ext,
  });

  return {
    url: result.secure_url,
    deliveryUrl: result.secure_url,
    publicId: result.public_id,
    fileName: file.originalname,
    fileSize: file.size,
    format: result.format ?? ext,
  };
}

async function uploadReadingDocumentFile(file) {
  assertAllowedReadingDoc(file);

  const ext = getExtensionFromFileName(file.originalname);
  const safeName = sanitizeFileName(file.originalname).replace(/\.[^.]+$/, '');
  const publicId = `${safeName}_${Date.now()}`;

  if (ext === 'pdf') {
    const result = await uploadBuffer(file.buffer, {
      resource_type: 'image',
      folder: MATERIALS_FOLDER,
      public_id: publicId,
      format: 'pdf',
      transformation: [{ quality: 'auto' }],
      async: true,
    });

    const storageUrl = result.secure_url;
    return {
      url: buildDeliveryUrl(storageUrl),
      deliveryUrl: buildDeliveryUrl(storageUrl),
      storageUrl,
      publicId: result.public_id,
      fileName: file.originalname,
      fileSize: result.bytes ?? file.size,
      format: result.format ?? 'pdf',
    };
  }

  const result = await uploadBuffer(file.buffer, {
    resource_type: 'raw',
    folder: MATERIALS_FOLDER,
    public_id: publicId,
    format: ext,
  });

  const storageUrl = result.secure_url;
  return {
    url: storageUrl,
    deliveryUrl: storageUrl,
    storageUrl,
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
  const result = await uploadBuffer(file.buffer, {
    resource_type: 'video',
    folder: AUDIO_FOLDER,
    public_id: `${safeName}_${Date.now()}`,
    transformation: [{ quality: 'auto' }],
  });

  const storageUrl = result.secure_url;
  return {
    url: buildDeliveryUrl(storageUrl),
    deliveryUrl: buildDeliveryUrl(storageUrl),
    storageUrl,
    fileName: file.originalname,
    fileSize: result.bytes ?? file.size,
    format: result.format ?? ext,
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
  const result = await uploadBuffer(buffer, {
    resource_type: 'raw',
    folder: TEXT_FOLDER,
    public_id: `${safeName}_${Date.now()}`,
    format: 'html',
  });

  return {
    url: result.secure_url,
    deliveryUrl: result.secure_url,
    publicId: result.public_id,
    fileName: `${safeName}.html`,
    fileSize: buffer.byteLength,
    format: 'html',
  };
}

module.exports = {
  AUDIO_EXTENSIONS,
  DOC_EXTENSIONS,
  READING_DOC_EXTENSIONS,
  MATERIAL_MAX_BYTES,
  MATERIAL_MAX_SIZE_MESSAGE,
  buildDeliveryUrl,
  uploadAudioFile,
  uploadDocumentFile,
  uploadReadingDocumentFile,
  uploadTextHtml,
};
