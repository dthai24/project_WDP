const { sql } = require('../config/db');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), override: true });

(async () => {
  const { connectDB } = require('../config/db');
  await connectDB();

  const hasContent = await new sql.Request().query(`
    SELECT 1 AS ok FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Node_Materials' AND COLUMN_NAME = 'Content'
  `);

  if (!hasContent.recordset.length) {
    console.log('Content column not found — nothing to merge.');
    process.exit(0);
  }

  const merged = await new sql.Request().query(`
    UPDATE dbo.Node_Materials
    SET MaterialUrl = Content
    WHERE Content IS NOT NULL
      AND LTRIM(RTRIM(Content)) <> ''
      AND (MaterialUrl IS NULL OR LTRIM(RTRIM(MaterialUrl)) = '')
  `);

  console.log(`Merged Content → MaterialUrl for ${merged.rowsAffected[0]} row(s).`);
  process.exit(0);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
