const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'LearningPath_Base',

  user: 'sa',
  password: 'Tandung1906@',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    // Dòng này cực kỳ quan trọng để lách lỗi Login failed for user ''
    integratedSecurity: true
  },
  port: 1433
};

const connectDB = async () => {
  try {
    console.log(`Đang thử kết nối tới Server: ${dbConfig.server} bằng Windows Auth...`);
    await sql.connect(dbConfig);
    console.log(' Kết nối SQL Server thành công!');
  } catch (err) {
    console.error('Lỗi kết nối Database:', err.message);
    console.log(' Mẹo: Kiểm tra xem SQL Server đã bật TCP/IP ở Port 1433 chưa.');
  }
};

module.exports = { sql, connectDB };