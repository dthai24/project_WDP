const { sql } = require('../config/db');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), override: true });

const CONSTRAINT_NAME = 'CK__Node_Mate__Mater__70DDC3D8';

(async () => {
  const { connectDB } = require('../config/db');
  await connectDB();

  const check = await new sql.Request().query(`
    SELECT cc.name, cc.definition
    FROM sys.check_constraints cc
    JOIN sys.columns c
      ON cc.parent_object_id = c.object_id
     AND cc.parent_column_id = c.column_id
    WHERE OBJECT_NAME(cc.parent_object_id) = 'Node_Materials'
      AND c.name = 'MaterialType'
  `);

  const current = check.recordset[0];
  if (!current) {
    console.log('No MaterialType CHECK constraint found — skipping.');
    process.exit(0);
  }

  if (String(current.definition).includes("'TEXT'")) {
    console.log('MaterialType constraint already includes TEXT.');
    process.exit(0);
  }

  await new sql.Request().query(`
    ALTER TABLE dbo.Node_Materials
    DROP CONSTRAINT ${CONSTRAINT_NAME};
  `);

  await new sql.Request().query(`
    ALTER TABLE dbo.Node_Materials
    ADD CONSTRAINT CK_Node_Materials_MaterialType
    CHECK (MaterialType IN ('VIDEO', 'DOC', 'TEXT', 'TEST'));
  `);

  console.log('Updated Node_Materials.MaterialType CHECK constraint to allow TEXT.');
  process.exit(0);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
