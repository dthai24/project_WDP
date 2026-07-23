const mongoose = require('mongoose');
const { syncPaidCourses } = require('../scripts/syncPaidCourses');

const autoUpdateOldPasswords = async () => {
  try {
    const User = require('../models/MongoDB/User');
    // Kiểm tra xem có bất kỳ tài khoản nào còn để mật khẩu là plain-text "123456" không
    const hasOldPassword = await User.exists({
      email: { $in: ['admin@wdp.edu.vn', 'mentor.anh@wdp.edu.vn', 'minh.tv@gmail.com', 'admin@gmail.com'] },
      password: '123456'
    });

    if (hasOldPassword) {
      console.log('🔄 Phát hiện mật khẩu cũ "123456". Đang tự động cập nhật mật khẩu gốc cho các tài khoản...');
      const updates = [
        { email: 'admin@wdp.edu.vn', password: '$2b$10$hiD.NAoAHtB6RR4ZUY8eaOuOQHKt2eBodPmuPKLJ9aGSHEX2MY9Y6' },
        { email: 'mentor.anh@wdp.edu.vn', password: '$2b$10$4B7g4UieGNjIM32InKMBxOZFa3x3gan/9N.vAyqYNPTSDPgRFtGf.' },
        { email: 'minh.tv@gmail.com', password: '$2b$10$vZGsbGdcmXuDesPTUkZYDOYNQKvQOmVklWen8WNSzXZIHd.5gFoV2' },
        { email: 'hoa.nt@gmail.com', password: '$2b$10$vZGsbGdcmXuDesPTUkZYDOYNQKvQOmVklWen8WNSzXZIHd.5gFoV2' },
        { email: 'duc.hv@gmail.com', password: '$2b$10$vZGsbGdcmXuDesPTUkZYDOYNQKvQOmVklWen8WNSzXZIHd.5gFoV2' },
        { email: 'thu.lt@gmail.com', password: '$2b$10$vZGsbGdcmXuDesPTUkZYDOYNQKvQOmVklWen8WNSzXZIHd.5gFoV2' },
        { email: 'khoa.pm@gmail.com', password: '$2b$10$vZGsbGdcmXuDesPTUkZYDOYNQKvQOmVklWen8WNSzXZIHd.5gFoV2' },
        { email: 'admin@gmail.com', password: '$2a$10$OC3hc6XDhBjZFSPpJ3Q.POBA0YaF3b5hoz40yco5I9ftuh4Xj2II6' },
        { email: 'mentor@gmail.com', password: '$2a$10$OC3hc6XDhBjZFSPpJ3Q.POBA0YaF3b5hoz40yco5I9ftuh4Xj2II6' },
        { email: 'student@gmail.com', password: '$2a$10$OC3hc6XDhBjZFSPpJ3Q.POBA0YaF3b5hoz40yco5I9ftuh4Xj2II6' },
        { email: 'student2@gmail.com', password: '$2a$10$OC3hc6XDhBjZFSPpJ3Q.POBA0YaF3b5hoz40yco5I9ftuh4Xj2II6' }
      ];

      for (const item of updates) {
        await User.updateOne({ email: item.email, password: '123456' }, { $set: { password: item.password } });
      }
      console.log('✅ Tự động cập nhật mật khẩu sang mã hóa bcrypt hoàn tất!');
    }
  } catch (err) {
    console.warn('⚠️ Không thể tự động cập nhật mật khẩu:', err.message);
  }
};

const connectMongoDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/wdp_english';
    console.log(`Đang kết nối tới MongoDB...`);
    await mongoose.connect(uri);
    console.log('✅ Kết nối MongoDB thành công!');

    // Tự động kiểm tra và cập nhật mật khẩu cũ
    await autoUpdateOldPasswords();

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
