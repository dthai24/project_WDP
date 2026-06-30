/**
 * Seed script: Migrate data from SQL Server to MongoDB
 * 
 * Run: node scripts/seed-mongodb.js
 * 
 * This script reads data from SQL Server and inserts it into MongoDB.
 * It translates the Vietnamese content to English for the course data.
 */

require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const sql = require('mssql');

// MongoDB Models
const User = require('../models/MongoDB/User');
const Role = require('../models/MongoDB/Role');
const UserRole = require('../models/MongoDB/UserRole');
const Category = require('../models/MongoDB/Category');
const Level = require('../models/MongoDB/Level');
const Course = require('../models/MongoDB/Course');
const Path = require('../models/MongoDB/Path');
const PathNode = require('../models/MongoDB/PathNode');
const NodeMaterial = require('../models/MongoDB/NodeMaterial');
const UserCourse = require('../models/MongoDB/UserCourse');
const UserNode = require('../models/MongoDB/UserNode');
const UserCategory = require('../models/MongoDB/UserCategory');
const CourseComment = require('../models/MongoDB/CourseComment');
const OtpVerification = require('../models/MongoDB/OtpVerification');
const QuestionBank = require('../models/MongoDB/QuestionBank');
const QuestionsPath = require('../models/MongoDB/QuestionsPath');
const QuestionType = require('../models/MongoDB/QuestionType');
const Question = require('../models/MongoDB/Question');
const QuestionChoice = require('../models/MongoDB/QuestionChoice');
const Test = require('../models/MongoDB/Test');
const TestAttempt = require('../models/MongoDB/TestAttempt');
const TestQuestionCollection = require('../models/MongoDB/TestQuestionCollection');
const TestQuestion = require('../models/MongoDB/TestQuestion');
const TestQuestionChoice = require('../models/MongoDB/TestQuestionChoice');

// ==========================================
// ENGLISH TRANSLATION MAPS
// ==========================================

const categoryTranslations = {
  'Kinh doanh & Quản lý': 'Business & Management',
  'Tài chính & Kế toán': 'Finance & Accounting',
  'Giao tiếp & Kỹ năng mềm': 'Communication & Soft Skills',
  'Công nghệ thông tin': 'Information Technology',
  'Đời sống & Sở thích': 'Lifestyle & Hobbies',
  'Giao tiep': 'Communication',
  'Ngu phap': 'Grammar',
  'Phat am': 'Pronunciation',
};

const levelTranslations = {
  'Người mới bắt đầu': 'Beginner',
  'Cơ bản': 'Elementary',
  'Trung cấp': 'Intermediate',
  'Cao cấp': 'Advanced',
};

const courseTranslations = {
  'Khóa Demo 1': 'English Foundation A1',
  'Khóa Demo 2': 'English Communication A2',
  'Chiến đấu 300 hiệp với Mắt một mí': 'IELTS Speaking Mastery',
  'Chiến đấu 300 hiệp': 'TOEIC Listening & Reading',
};

const courseDescTranslations = {
  'Khóa học công nghệ thông tin ReactJs': 'Build a strong foundation in English grammar, vocabulary, and pronunciation for absolute beginners.',
  'Des khóa demo 2': 'Develop practical communication skills for everyday situations: travel, work, and social interactions.',
  'adsfasdf': 'Master IELTS Speaking with real exam simulations, expert feedback, and proven strategies.',
  'sadfasdf': 'Prepare for the TOEIC exam with comprehensive listening and reading practice materials.',
};

const pathTranslations = {
  'Chương 1': 'Getting Started',
  'Luyện Tập ReactJS': 'Speaking Practice',
  'chương 1 demo': 'Grammar Basics',
  'ádf': 'Vocabulary Building',
  'adsfasdf': 'Listening Comprehension',
};

const pathDescTranslations = {
  'Tổng quan về Reactjs': 'Learn essential greetings, introductions, and basic sentence structures.',
  'Bài tập': 'Practice real-world conversations with interactive speaking exercises.',
  'dfads': 'Master the fundamental grammar rules for clear and accurate English.',
  'ádf': 'Expand your vocabulary with common words and phrases for daily use.',
  'adsfasdf': 'Improve your listening skills with native speaker audio and comprehension quizzes.',
};

const nodeTranslations = {
  'Giới thiệu về Reactjs': 'Alphabet & Pronunciation',
  'Tìm hiểu các khái niệm liên quan': 'Basic Greetings & Introductions',
  'Làm quen với Syntax': 'Present Simple Tense',
  '11111': 'Numbers & Counting',
  'ádf': 'Common Verbs & Phrases',
  'ádfadsf': 'Listening Practice: At the Cafe',
};

const materialTranslations = {
  'Reactjs là gì?': 'English Alphabet Guide',
  'Tài liệu tham khảo': 'Greetings Reference Sheet',
  'vid1': 'Pronunciation Video Lesson',
};

// ==========================================
// SQL Server Config
// ==========================================
const dbConfig = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'LearningPath_Base',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'sa123',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// ==========================================
// Helper: translate Vietnamese to English
// ==========================================
function translate(map, text) {
  return map[text] || text;
}

// ==========================================
// Main Migration
// ==========================================
async function migrate() {
  try {
    // Connect to SQL Server
    console.log('Connecting to SQL Server...');
    await sql.connect(dbConfig);
    console.log('✅ Connected to SQL Server');

    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/LearningPath_Base';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing MongoDB data
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    console.log('✅ Cleared existing MongoDB data');

    // ==========================================
    // 1. Migrate Roles
    // ==========================================
    console.log('\n--- Migrating Roles ---');
    const rolesResult = await sql.query`SELECT * FROM Roles`;
    const roleIdMap = {};
    for (const row of rolesResult.recordset) {
      const doc = await Role.create({
        roleName: row.RoleName,
        description: row.Description,
      });
      roleIdMap[row.RoleId] = doc._id;
      console.log(`  Role: ${row.RoleName} -> ${doc._id}`);
    }

    // ==========================================
    // 2. Migrate Levels
    // ==========================================
    console.log('\n--- Migrating Levels ---');
    const levelsResult = await sql.query`SELECT * FROM Levels`;
    const levelIdMap = {};
    for (const row of levelsResult.recordset) {
      const doc = await Level.create({
        levelName: row.LevelName,
        displayName: translate(levelTranslations, row.DisplayName),
        sortOrder: row.SortOrder,
        isActive: row.IsActive,
        createdAt: row.CreatedAt,
      });
      levelIdMap[row.LevelId] = doc._id;
      console.log(`  Level: ${row.DisplayName} -> ${doc.displayName}`);
    }

    // ==========================================
    // 3. Migrate Categories
    // ==========================================
    console.log('\n--- Migrating Categories ---');
    const categoriesResult = await sql.query`SELECT * FROM Categories`;
    const categoryIdMap = {};
    for (const row of categoriesResult.recordset) {
      const doc = await Category.create({
        categoryName: row.CategoryName,
        displayName: translate(categoryTranslations, row.DisplayName),
        isActive: row.IsActive,
        createdAt: row.CreatedAt,
      });
      categoryIdMap[row.CategoryId] = doc._id;
      console.log(`  Category: ${row.DisplayName} -> ${doc.displayName}`);
    }

    // ==========================================
    // 4. Migrate Users
    // ==========================================
    console.log('\n--- Migrating Users ---');
    const usersResult = await sql.query`SELECT * FROM Users`;
    const userIdMap = {};
    for (const row of usersResult.recordset) {
      const doc = await User.create({
        fullName: row.FullName,
        email: row.Email,
        phone: row.Phone,
        password: row.Password,
        dateOfBirth: row.DateOfBirth,
        isFirstLogin: row.IsFirstLogin,
        resetOtpCode: row.ResetOtpCode,
        resetOtpExpires: row.ResetOtpExpires,
        currentLevelId: row.CurrentLevelId ? levelIdMap[row.CurrentLevelId] : null,
        learningGoal: row.LearningGoal,
        avatarUrl: row.AvatarUrl,
        isActive: row.IsActive,
        createdAt: row.CreatedAt,
        updatedAt: row.UpdatedAt,
      });
      userIdMap[row.UserId] = doc._id;
      console.log(`  User: ${row.FullName} (${row.Email}) -> ${doc._id}`);
    }

    // ==========================================
    // 5. Migrate User_Roles
    // ==========================================
    console.log('\n--- Migrating User_Roles ---');
    const userRolesResult = await sql.query`SELECT * FROM User_Roles`;
    for (const row of userRolesResult.recordset) {
      await UserRole.create({
        userId: userIdMap[row.UserId],
        roleId: roleIdMap[row.RoleId],
      });
    }
    console.log(`  Migrated ${userRolesResult.recordset.length} user-role assignments`);

    // ==========================================
    // 6. Migrate User_Categories
    // ==========================================
    console.log('\n--- Migrating User_Categories ---');
    const userCatsResult = await sql.query`SELECT * FROM User_Categories`;
    for (const row of userCatsResult.recordset) {
      await UserCategory.create({
        userId: userIdMap[row.UserId],
        categoryId: categoryIdMap[row.CategoryId],
      });
    }
    console.log(`  Migrated ${userCatsResult.recordset.length} user-category assignments`);

    // ==========================================
    // 7. Migrate Courses
    // ==========================================
    console.log('\n--- Migrating Courses ---');
    const coursesResult = await sql.query`SELECT * FROM Courses`;
    const courseIdMap = {};
    for (const row of coursesResult.recordset) {
      const doc = await Course.create({
        courseName: translate(courseTranslations, row.CourseName),
        description: translate(courseDescTranslations, row.Description),
        categoryId: row.CategoryId ? categoryIdMap[row.CategoryId] : null,
        levelId: row.LevelId ? levelIdMap[row.LevelId] : null,
        instructorId: row.InstructorId ? userIdMap[row.InstructorId] : null,
        thumbnail: row.Thumbnail,
        rating: row.Rating || 0,
        totalLessons: row.TotalLessons || 0,
        isPublished: row.IsPublished,
        createdAt: row.CreatedAt,
        updatedAt: row.UpdatedAt,
      });
      courseIdMap[row.CourseId] = doc._id;
      console.log(`  Course: ${row.CourseName} -> ${doc.courseName} (${doc._id})`);
    }

    // ==========================================
    // 8. Migrate Paths
    // ==========================================
    console.log('\n--- Migrating Paths ---');
    const pathsResult = await sql.query`SELECT * FROM Paths`;
    const pathIdMap = {};
    for (const row of pathsResult.recordset) {
      const doc = await Path.create({
        courseId: courseIdMap[row.CourseId],
        pathName: translate(pathTranslations, row.PathName),
        description: translate(pathDescTranslations, row.Description),
        order: row.Order,
        createdAt: row.CreatedAt,
      });
      pathIdMap[row.PathId] = doc._id;
      console.log(`  Path: ${row.PathName} -> ${doc.pathName} (${doc._id})`);
    }

    // ==========================================
    // 9. Migrate Path_Nodes
    // ==========================================
    console.log('\n--- Migrating Path_Nodes ---');
    const nodesResult = await sql.query`SELECT * FROM Path_Nodes`;
    const nodeIdMap = {};
    for (const row of nodesResult.recordset) {
      const doc = await PathNode.create({
        pathId: pathIdMap[row.PathId],
        nodeName: translate(nodeTranslations, row.NodeName),
        nodeOrder: row.NodeOrder,
        description: translate(nodeTranslations, row.Description) || null,
      });
      nodeIdMap[row.NodeId] = doc._id;
      console.log(`  Node: ${row.NodeName} -> ${doc.nodeName} (${doc._id})`);
    }

    // ==========================================
    // 10. Migrate Node_Materials
    // ==========================================
    console.log('\n--- Migrating Node_Materials ---');
    const materialsResult = await sql.query`SELECT * FROM Node_Materials`;
    for (const row of materialsResult.recordset) {
      await NodeMaterial.create({
        nodeId: nodeIdMap[row.NodeId],
        materialType: row.MaterialType,
        title: translate(materialTranslations, row.Title),
        materialUrl: row.MaterialUrl,
        materialOrder: row.MaterialOrder,
        sourceType: row.SourceType,
        fileName: row.FileName,
        fileSize: row.FileSize,
        embedUrl: row.EmbedUrl,
        content: row.Content || null,
      });
    }
    console.log(`  Migrated ${materialsResult.recordset.length} materials`);

    // ==========================================
    // 11. Migrate User_Courses
    // ==========================================
    console.log('\n--- Migrating User_Courses ---');
    const userCoursesResult = await sql.query`SELECT * FROM User_Courses`;
    for (const row of userCoursesResult.recordset) {
      await UserCourse.create({
        userId: userIdMap[row.UserId],
        courseId: courseIdMap[row.CourseId],
        progressPercentage: row.ProgressPercentage,
        enrollmentDate: row.EnrollmentDate,
      });
    }
    console.log(`  Migrated ${userCoursesResult.recordset.length} user-course enrollments`);

    // ==========================================
    // 12. Migrate User_Nodes
    // ==========================================
    console.log('\n--- Migrating User_Nodes ---');
    const userNodesResult = await sql.query`SELECT * FROM User_Nodes`;
    for (const row of userNodesResult.recordset) {
      await UserNode.create({
        userId: userIdMap[row.UserId],
        nodeId: nodeIdMap[row.NodeId],
        isCompleted: row.IsCompleted,
        completedAt: row.CompletedAt,
      });
    }
    console.log(`  Migrated ${userNodesResult.recordset.length} user-node completions`);

    // ==========================================
    // 13. Migrate Course_Comments
    // ==========================================
    console.log('\n--- Migrating Course_Comments ---');
    const commentsResult = await sql.query`SELECT * FROM Course_Comments`;
    for (const row of commentsResult.recordset) {
      await CourseComment.create({
        courseId: courseIdMap[row.CourseId],
        userId: userIdMap[row.UserId],
        rating: row.Rating,
        content: row.Content,
        createdAt: row.CreatedAt,
      });
    }
    console.log(`  Migrated ${commentsResult.recordset.length} comments`);

    // ==========================================
    // 14. Migrate OTP_Verification
    // ==========================================
    console.log('\n--- Migrating OTP_Verification ---');
    const otpResult = await sql.query`SELECT * FROM OTP_Verification`;
    for (const row of otpResult.recordset) {
      await OtpVerification.create({
        email: row.Email,
        fullName: row.FullName,
        phone: row.Phone,
        password: row.Password,
        dateOfBirth: row.DateOfBirth,
        otpCode: row.OtpCode,
        expiresAt: row.ExpiresAt,
        createdAt: row.CreatedAt,
      });
    }
    console.log(`  Migrated ${otpResult.recordset.length} OTP records`);

    // ==========================================
    // 15. Migrate Question_Bank
    // ==========================================
    console.log('\n--- Migrating Question_Bank ---');
    const qbResult = await sql.query`SELECT * FROM Question_Bank`;
    const qbIdMap = {};
    for (const row of qbResult.recordset) {
      const doc = await QuestionBank.create({
        instructorId: userIdMap[row.InstructorId],
        courseId: courseIdMap[row.CourseId],
        courseName: translate(courseTranslations, row.CourseName),
        courseDescription: translate(courseDescTranslations, row.CourseDescription),
        bankDescription: row.BankDescription,
        isPublished: row.IsPublished,
        createdAt: row.CreatedAt,
        updatedAt: row.UpdatedAt,
      });
      qbIdMap[row.BankId] = doc._id;
    }
    console.log(`  Migrated ${qbResult.recordset.length} question banks`);

    // ==========================================
    // 16. Migrate Questions_Path
    // ==========================================
    console.log('\n--- Migrating Questions_Path ---');
    const qpResult = await sql.query`SELECT * FROM Questions_Path`;
    const qpIdMap = {};
    for (const row of qpResult.recordset) {
      const doc = await QuestionsPath.create({
        bankId: qbIdMap[row.BankId],
        pathId: pathIdMap[row.PathId],
      });
      qpIdMap[row.Question_Path_Id] = doc._id;
    }
    console.log(`  Migrated ${qpResult.recordset.length} question paths`);

    // ==========================================
    // 17. Migrate QuestionType
    // ==========================================
    console.log('\n--- Migrating QuestionType ---');
    const qtResult = await sql.query`SELECT * FROM QuestionType`;
    const qtIdMap = {};
    for (const row of qtResult.recordset) {
      const doc = await QuestionType.create({
        name: row.Name,
      });
      qtIdMap[row.TypeId] = doc._id;
    }
    console.log(`  Migrated ${qtResult.recordset.length} question types`);

    // ==========================================
    // 18. Migrate Questions
    // ==========================================
    console.log('\n--- Migrating Questions ---');
    const questionsResult = await sql.query`SELECT * FROM Questions`;
    const questionIdMap = {};
    for (const row of questionsResult.recordset) {
      const doc = await Question.create({
        title: row.Title,
        questionPathId: qpIdMap[row.Question_Path_Id],
        isActive: row.IsActive,
        typeId: qtIdMap[row.TypeId],
        url: row.URL,
        order: row.Order,
      });
      questionIdMap[row.QuestionId] = doc._id;
    }
    console.log(`  Migrated ${questionsResult.recordset.length} questions`);

    // ==========================================
    // 19. Migrate Question_Choices
    // ==========================================
    console.log('\n--- Migrating Question_Choices ---');
    const choicesResult = await sql.query`SELECT * FROM Question_Choices`;
    for (const row of choicesResult.recordset) {
      await QuestionChoice.create({
        questionId: questionIdMap[row.QuestionId],
        title: row.Title,
        order: row.Order,
        isTrue: row.IsTrue,
      });
    }
    console.log(`  Migrated ${choicesResult.recordset.length} question choices`);

    // ==========================================
    // 20. Migrate Tests
    // ==========================================
    console.log('\n--- Migrating Tests ---');
    const testsResult = await sql.query`SELECT * FROM Tests`;
    const testIdMap = {};
    for (const row of testsResult.recordset) {
      const doc = await Test.create({
        pathId: pathIdMap[row.PathId],
        courseId: courseIdMap[row.CourseId],
        instructorId: row.InstructorId ? userIdMap[row.InstructorId] : null,
      });
      testIdMap[row.TestId] = doc._id;
    }
    console.log(`  Migrated ${testsResult.recordset.length} tests`);

    // ==========================================
    // 21. Migrate Test_Attemps
    // ==========================================
    console.log('\n--- Migrating Test_Attemps ---');
    const attemptsResult = await sql.query`SELECT * FROM Test_Attemps`;
    for (const row of attemptsResult.recordset) {
      await TestAttempt.create({
        userId: userIdMap[row.UserId],
        testId: testIdMap[row.TestId],
        point: row.Point,
      });
    }
    console.log(`  Migrated ${attemptsResult.recordset.length} test attempts`);

    // ==========================================
    // 22. Migrate Test_Questions_Collections
    // ==========================================
    console.log('\n--- Migrating Test_Questions_Collections ---');
    const tqcResult = await sql.query`SELECT * FROM Test_Questions_Collections`;
    const tqcIdMap = {};
    for (const row of tqcResult.recordset) {
      const doc = await TestQuestionCollection.create({
        testId: row.TestId ? testIdMap[row.TestId] : null,
      });
      tqcIdMap[row.CollectionId] = doc._id;
    }
    console.log(`  Migrated ${tqcResult.recordset.length} test question collections`);

    // ==========================================
    // 23. Migrate Test_Questions
    // ==========================================
    console.log('\n--- Migrating Test_Questions ---');
    const tqResult = await sql.query`SELECT * FROM Test_Questions`;
    const tqIdMap = {};
    for (const row of tqResult.recordset) {
      const doc = await TestQuestion.create({
        collectionId: row.CollectionId ? tqcIdMap[row.CollectionId] : null,
        title: row.Title,
        typeId: qtIdMap[row.TypeId],
        url: row.Url,
      });
      tqIdMap[row.QuestionId] = doc._id;
    }
    console.log(`  Migrated ${tqResult.recordset.length} test questions`);

    // ==========================================
    // 24. Migrate Test_Question_Choices
    // ==========================================
    console.log('\n--- Migrating Test_Question_Choices ---');
    const tqcChoicesResult = await sql.query`SELECT * FROM Test_Question_Choices`;
    for (const row of tqcChoicesResult.recordset) {
      await TestQuestionChoice.create({
        questionId: tqIdMap[row.QuestionId],
        title: row.Title,
        order: row.Order,
        isTrue: row.IsTrue,
      });
    }
    console.log(`  Migrated ${tqcChoicesResult.recordset.length} test question choices`);

    console.log('\n========================================');
    console.log('✅ Migration completed successfully!');
    console.log('========================================');

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await sql.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
