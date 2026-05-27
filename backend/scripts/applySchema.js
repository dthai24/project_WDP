const fs = require('fs');
const path = require('path');
const { sql } = require('../config/db');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
  server: process.env.DB_SERVER || 'localhost',
  database: 'master',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '', // Removed hardcoded 'sa123'
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: { encrypt: false, trustServerCertificate: true },
};

const splitBatches = (content) =>
  content
    .split(/^\s*GO\s*$/gim)
    .map((batch) => batch.trim())
    .filter(Boolean);

async function executeFile(filePath, description) {
  const content = fs.readFileSync(filePath, 'utf8');
  const batches = splitBatches(content);

  console.log(`Đang áp dụng ${description} (${batches.length} batch)...`);

  for (let i = 0; i < batches.length; i += 1) {
    const batch = batches[i];
    try {
      const result = await new sql.Request().query(batch);
      if (result.recordset?.length) {
        console.log(`Batch ${i + 1}:`, result.recordset);
      } else {
        console.log(`Batch ${i + 1}: OK`);
      }
    } catch (err) {
      console.error(`Batch ${i + 1} failed:\n${batch.slice(0, 200)}...`);
      throw err;
    }
  }
}

async function main() {
  const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
  const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');

  console.log('Kết nối tới SQL Server...');
  await sql.connect(dbConfig);

  await executeFile(schemaPath, 'schema.sql');
  await executeFile(seedPath, 'seed.sql');

  console.log('✅ Schema và Seed đã được áp dụng thành công.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Lỗi áp dụng schema:', err.message);
  process.exit(1);
});
