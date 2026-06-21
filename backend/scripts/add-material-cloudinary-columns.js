const { sql } = require('../config/db');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), override: true });

const COLUMNS = [
  { name: 'SourceType', definition: 'NVARCHAR(20) NULL' },
  { name: 'FileName', definition: 'NVARCHAR(255) NULL' },
  { name: 'FileSize', definition: 'BIGINT NULL' },
  { name: 'EmbedUrl', definition: 'NVARCHAR(MAX) NULL' },
];

async function ensureColumn(columnName, definition) {
  const check = await new sql.Request().query(`
    SELECT 1 AS ok FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Node_Materials' AND COLUMN_NAME = '${columnName}'
  `);

  if (check.recordset.length) {
    console.log(`Column ${columnName} already exists`);
    return;
  }

  await new sql.Request().query(`ALTER TABLE Node_Materials ADD ${columnName} ${definition}`);
  console.log(`Added column ${columnName} to Node_Materials`);
}

(async () => {
  const { connectDB } = require('../config/db');
  await connectDB();

  for (const column of COLUMNS) {
    await ensureColumn(column.name, column.definition);
  }

  process.exit(0);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
