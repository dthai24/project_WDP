const { connectDB, sql } = require('../config/db');

(async () => {
  await connectDB();
  const check = await new sql.Request().query(`
    SELECT 1 AS ok FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Node_Materials' AND COLUMN_NAME = 'Content'
  `);
  if (check.recordset.length) {
    console.log('Content column already exists');
  } else {
    await new sql.Request().query('ALTER TABLE Node_Materials ADD Content NVARCHAR(MAX) NULL');
    console.log('Added Content column to Node_Materials');
  }
  process.exit(0);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
