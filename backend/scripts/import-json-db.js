const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

// Đọc cấu hình môi trường
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/LearningPath_Base';
const DB_DIR = 'D:\\dao loat\\database\\database';

function parseEJSON(val) {
  if (val && typeof val === 'object') {
    if ('$oid' in val) {
      return new ObjectId(val.$oid);
    }
    if ('$date' in val) {
      // Xử lý cả định dạng chuỗi và định dạng $numberLong nếu có
      if (typeof val.$date === 'object' && '$numberLong' in val.$date) {
        return new Date(parseInt(val.$date.$numberLong, 10));
      }
      return new Date(val.$date);
    }
    if ('$numberInt' in val) {
      return parseInt(val.$numberInt, 10);
    }
    if ('$numberLong' in val) {
      return parseInt(val.$numberLong, 10);
    }
    if (Array.isArray(val)) {
      return val.map(item => parseEJSON(item));
    }
    for (const key in val) {
      val[key] = parseEJSON(val[key]);
    }
  }
  return val;
}

async function importDatabase() {
  try {
    console.log(`Đang kết nối tới MongoDB: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    console.log(`✅ Kết nối thành công! Đang tiến hành nạp dữ liệu từ: ${DB_DIR}`);

    if (!fs.existsSync(DB_DIR)) {
      throw new Error(`Thư mục chứa database không tồn tại: ${DB_DIR}`);
    }

    const files = fs.readdirSync(DB_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json') && f.startsWith('LearningPath_Base.'));

    if (jsonFiles.length === 0) {
      console.log('⚠️ Không tìm thấy file JSON database nào để nạp.');
      process.exit(0);
    }

    for (const file of jsonFiles) {
      // Lấy tên collection từ tên file (Ví dụ: LearningPath_Base.users.json -> users)
      const collectionName = file.replace('LearningPath_Base.', '').replace('.json', '');
      const filePath = path.join(DB_DIR, file);

      console.log(`Đang xử lý: ${file} -> Collection: ${collectionName}`);
      const rawData = fs.readFileSync(filePath, 'utf8');
      
      let docs;
      try {
        docs = JSON.parse(rawData);
      } catch (err) {
        console.error(`❌ Lỗi phân tích cú pháp file JSON ${file}:`, err.message);
        continue;
      }

      if (!Array.isArray(docs)) {
        console.warn(`⚠️ File ${file} không chứa một mảng JSON. Bỏ qua.`);
        continue;
      }

      // Đưa EJSON về định dạng MongoDB BSON thực tế
      const processedDocs = docs.map(doc => parseEJSON(doc));

      // Xóa các tài liệu cũ trong collection trước khi import mới
      await db.collection(collectionName).deleteMany({});

      if (processedDocs.length > 0) {
        await db.collection(collectionName).insertMany(processedDocs);
        console.log(`   ➡️ Đã nạp thành công ${processedDocs.length} tài liệu vào ${collectionName}.`);
      } else {
        console.log(`   ➡️ Collection ${collectionName} trống.`);
      }
    }

    console.log('\n🎉 Quá trình nạp database hoàn tất thành công!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Đã xảy ra lỗi trong quá trình import database:', error);
    process.exit(1);
  }
}

importDatabase();
