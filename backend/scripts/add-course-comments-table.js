const path = require('path');
const { sql } = require('../config/db');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });

const dbConfig = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'LearningPath_Base',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'sa123',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    options: { encrypt: false, trustServerCertificate: true },
};

async function main() {
    await sql.connect(dbConfig);

    await new sql.Request().query(`
        IF OBJECT_ID('dbo.Course_Comments', 'U') IS NULL
        BEGIN
            CREATE TABLE dbo.Course_Comments (
                CommentId   INT IDENTITY(1,1) PRIMARY KEY,
                CourseId    INT NOT NULL,
                UserId      INT NOT NULL,
                Rating      TINYINT NULL,
                Content     NVARCHAR(MAX) NOT NULL,
                CreatedAt   DATETIME2 NOT NULL DEFAULT GETDATE(),
                CONSTRAINT FK_Course_Comments_Courses FOREIGN KEY (CourseId) REFERENCES Courses(CourseId),
                CONSTRAINT FK_Course_Comments_Users FOREIGN KEY (UserId) REFERENCES Users(UserId)
            );
        END
    `);

    console.log('Course_Comments table is ready.');
    process.exit(0);
}

main().catch((err) => {
    console.error('Failed to create Course_Comments table:', err.message);
    process.exit(1);
});
