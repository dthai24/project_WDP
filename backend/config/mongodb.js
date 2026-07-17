const mongoose = require('mongoose');
const { syncPaidCourses } = require('../scripts/syncPaidCourses');

const connectMongoDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/wdp_english';
    console.log(`Đang kết nối tới MongoDB...`);
    await mongoose.connect(uri);
    console.log('✅ Kết nối MongoDB thành công!');

    if (process.env.AUTO_SYNC_PAID_COURSES !== 'false') {
      try {
        const result = await syncPaidCourses();
        if (result.skipped) {
          console.log(`ℹ️  Paid courses already exist (${result.paidCount}), skip sync.`);
        } else if (result.updated > 0) {
          console.log(`✅ Sync paid courses: updated ${result.updated}/${result.total} course(s).`);
        }
      } catch (syncErr) {
        console.warn('⚠️  syncPaidCourses failed:', syncErr.message);
      }
    }
  } catch (err) {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
  }
};

module.exports = { connectMongoDB };
