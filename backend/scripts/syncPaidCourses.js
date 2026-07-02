const Course = require('../models/MongoDB/Course');

const FREE_NAME_PATTERNS = [
  /communication/i,
  /giao tiếp cơ bản/i,
  /miễn phí/i,
  /\bfree\b/i,
  /^basic english/i,
];

const PAID_NAME_PATTERNS = [
  /ielts/i,
  /toeic/i,
  /preparation/i,
  /band\s*\d/i,
  /luyện thi/i,
  /nâng cao/i,
  /900\+/i,
  /700\+/i,
];

function resolvePaidPrice(courseName = '') {
  if (/toeic/i.test(courseName)) return 599000;
  if (/ielts/i.test(courseName)) return 499000;
  return 449000;
}

/**
 * Gán giá cho khóa học đã tồn tại khi chưa có khóa trả phí nào trong DB.
 * Chạy tự động lúc server khởi động (có thể tắt bằng AUTO_SYNC_PAID_COURSES=false).
 */
async function syncPaidCourses() {
  const paidCount = await Course.countDocuments({ isPaid: true, price: { $gt: 0 } });
  if (paidCount > 0) {
    return { skipped: true, paidCount };
  }

  const courses = await Course.find({ isPublished: true }).select('courseName isPaid price discountPercentage').lean();
  let updated = 0;

  for (const course of courses) {
    const name = course.courseName || '';

    if (FREE_NAME_PATTERNS.some((pattern) => pattern.test(name))) {
      await Course.updateOne(
        { _id: course._id },
        { $set: { isPaid: false, price: 0, discountPercentage: 0 } }
      );
      continue;
    }

    const shouldBePaid = PAID_NAME_PATTERNS.some((pattern) => pattern.test(name));
    if (!shouldBePaid) {
      continue;
    }

    await Course.updateOne(
      { _id: course._id },
      {
        $set: {
          isPaid: true,
          price: course.price > 0 ? course.price : resolvePaidPrice(name),
          discountPercentage: course.discountPercentage || 10,
        },
      }
    );
    updated += 1;
  }

  return { skipped: false, updated, total: courses.length };
}

module.exports = { syncPaidCourses };
