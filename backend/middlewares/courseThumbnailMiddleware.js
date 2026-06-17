const fs = require('fs');
const path = require('path');

const saveCourseThumbnailFromDataUrl = (dataUrl, courseId) => {
    if (!dataUrl || typeof dataUrl !== 'string') {
        return null;
    }

    const match = dataUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/);

    if (!match) {
        throw new Error('Thumbnail không đúng định dạng ảnh base64.');
    }

    const rawExt = match[1];
    const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
    const base64Data = match[2];

    const buffer = Buffer.from(base64Data, 'base64');

    const maxSize = 5 * 1024 * 1024;

    if (buffer.length > maxSize) {
        throw new Error('Ảnh đại diện không được vượt quá 5MB.');
    }

    const fileName = `course_avt_${courseId}.${ext}`;

    const uploadDir = path.join(
        __dirname,
        '../public/assets/avatars/courses'
    );

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);

    return `/assets/avatars/courses/${fileName}`;
};

module.exports = {
    saveCourseThumbnailFromDataUrl,
};