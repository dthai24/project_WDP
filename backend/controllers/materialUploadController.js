const { uploadAudioFile, uploadDocumentFile, uploadTextHtml } = require('../services/cloudinaryService');
const fs = require('fs');
const path = require('path');

function mapUploadErrorMessage(error) {
  if (error?.statusCode === 400) return error.message;

  const message = String(error?.message ?? '');
  if (message.includes('File size too large')) {
    return 'File quá lớn. Dung lượng tối đa là 10 MB.';
  }

  return 'Lỗi khi tải học liệu lên.';
}

async function uploadMaterial(req, res) {  try {
    const type = String(req.body?.type ?? '').trim().toUpperCase();

    if (type === 'DOC') {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Không nhận được file tài liệu.',
        });
      }

      const data = await uploadDocumentFile(req.file);
      return res.status(200).json({
        success: true,
        message: 'Tải tài liệu lên thành công.',
        data: { ...data, materialType: 'DOC' },
      });
    }

    if (type === 'AUDIO') {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Không nhận được file audio.' });
      }
      const data = await uploadAudioFile(req.file);
      return res.json({ success: true, data: { ...data, materialType: 'AUDIO' } });
    }

    if (type === 'TEXT') {
      const html = req.body?.html ?? req.body?.content;
      const title = req.body?.title;

      const data = await uploadTextHtml(html, title);
      return res.status(200).json({
        success: true,
        message: 'Tải nội dung văn bản lên thành công.',
        data: { ...data, materialType: 'TEXT' },
      });
    }

    return res.status(400).json({
      success: false,
      message: 'type phải là TEXT, DOC hoặc AUDIO.',
    });
  } catch (error) {
    console.error('[uploadMaterial]', error.message);
    const statusCode = error.statusCode === 400 ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: mapUploadErrorMessage(error),
    });
  }
}
function isAllowedTextMaterialUrl(rawUrl) {
  try {
    const urlStr = String(rawUrl ?? '').trim();
    if (urlStr.startsWith('/uploads/')) return true;

    const parsed = new URL(urlStr);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    return (
      parsed.hostname.endsWith('cloudinary.com') ||
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1'
    );
  } catch {
    return false;
  }
}

async function fetchTextMaterialContent(req, res) {
  try {
    const rawUrl = String(req.query?.url ?? '').trim();
    if (!rawUrl) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu url.',
      });
    }

    if (!isAllowedTextMaterialUrl(rawUrl)) {
      return res.status(400).json({
        success: false,
        message: 'URL nội dung văn bản không hợp lệ.',
      });
    }

    // Check if it's a local file in the uploads directory
    let localPath = null;
    if (rawUrl.startsWith('/uploads/')) {
      localPath = path.join(__dirname, '..', rawUrl);
    } else {
      try {
        const parsed = new URL(rawUrl);
        if (
          (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
          parsed.pathname.startsWith('/uploads/')
        ) {
          localPath = path.join(__dirname, '..', parsed.pathname);
        }
      } catch (e) {}
    }

    if (localPath) {
      if (!fs.existsSync(localPath)) {
        return res.status(404).json({
          success: false,
          message: 'File không tồn tại trên local server.',
        });
      }
      const html = fs.readFileSync(localPath, 'utf8');
      return res.status(200).json({
        success: true,
        message: 'Lấy nội dung văn bản thành công.',
        data: { html },
      });
    }

    const response = await fetch(rawUrl);
    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: 'Không thể tải nội dung văn bản.',
      });
    }

    const html = await response.text();
    return res.status(200).json({
      success: true,
      message: 'Lấy nội dung văn bản thành công.',
      data: { html },
    });
  } catch (error) {
    console.error('[fetchTextMaterialContent]', error.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy nội dung văn bản.',
    });
  }
}

module.exports = {
  uploadMaterial,
  fetchTextMaterialContent,
};
