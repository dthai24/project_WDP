const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/LearningPath_Base';
    console.log(`Đang kết nối tới MongoDB...`);
    await mongoose.connect(uri);
    console.log('✅ Kết nối MongoDB thành công!');
  } catch (err) {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
  }
};

module.exports = { connectMongoDB };
