/**
 * WDP English Learning Platform - MongoDB Seed Script
 * Chạy: node seed.js  (từ thư mục data/, hoặc từ bất kỳ đâu trong repo)
 *
 * Dùng đúng các Mongoose model thật của backend (backend/Models/MongoDB/*)
 * nên dữ liệu tạo ra sẽ hiển thị đúng trong app — không như bản cũ (schema tự chế,
 * DB/collection khác với backend thật).
 *
 * Kết nối theo MONGO_URI khai báo trong backend/.env (mặc định mongodb://127.0.0.1:27017/wdp_english
 * nếu không có .env), đảm bảo luôn seed đúng database mà backend đang đọc.
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

const Role = require("../backend/Models/MongoDB/Role");
const UserRole = require("../backend/Models/MongoDB/UserRole");
const User = require("../backend/Models/MongoDB/User");
const Category = require("../backend/Models/MongoDB/Category");
const Level = require("../backend/Models/MongoDB/Level");
const Course = require("../backend/Models/MongoDB/Course");
const Path_ = require("../backend/Models/MongoDB/Path");
const PathNode = require("../backend/Models/MongoDB/PathNode");
const NodeMaterial = require("../backend/Models/MongoDB/NodeMaterial");
const UserCourse = require("../backend/Models/MongoDB/UserCourse");
const UserNode = require("../backend/Models/MongoDB/UserNode");
const Payment = require("../backend/Models/MongoDB/Payment");
const MentorApplication = require("../backend/Models/MongoDB/MentorApplication");
const Notification = require("../backend/Models/MongoDB/Notification");
const CourseComment = require("../backend/Models/MongoDB/CourseComment");
const Certificate = require("../backend/Models/MongoDB/Certificate");

// Dùng đúng instance mongoose mà các model backend đã dùng để compile (backend/node_modules) —
// nếu require("mongoose") riêng ở đây, root node_modules có thể có bản mongoose khác,
// khiến connect() vào 1 instance còn model chờ instance kia -> buffering timeout.
const mongoose = User.base;

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wdp_english";

// ─── Helpers ──────────────────────────────────────────────────────────────
const id = () => new mongoose.Types.ObjectId();
const now = new Date();
const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const daysFromNow = (n) => new Date(Date.now() + n * 86400000);

// ─── IDs (pre-generated để cross-reference) ──────────────────────────────
const IDS = {
  // Roles
  roleAdmin: id(),
  roleMentor: id(),
  roleStudent: id(),

  // Users
  adminUser: id(),
  mentorAnh: id(),
  mentorTuan: id(),
  mentorLan: id(),
  learnerMinh: id(),
  learnerHoa: id(),
  learnerDuc: id(),
  learnerThu: id(),
  learnerKhoa: id(),

  // Categories
  catToeic: id(),
  catIelts: id(),
  catGiaoTiep: id(),
  catNguPhap: id(),
  catTuVung: id(),
  catBusiness: id(),

  // Levels
  levelBeginner: id(),
  levelElementary: id(),
  levelIntermediate: id(),
  levelAdvanced: id(),

  // Courses
  courseToeicBasic: id(),
  courseToeicAdvanced: id(),
  courseIelts75: id(),
  courseGiaoTiepHangNgay: id(),
  courseBusinessEnglish: id(),
  courseMentorOrigami: id(),

  // Payments
  payMinhToeic: id(),
  payHoaToeic: id(),
  payDucBiz: id(),
  payKhoaIelts: id(),
};

// ═══════════════════════════════════════════════════════════════════════
// 1. ROLES
// ═══════════════════════════════════════════════════════════════════════
function buildRoles() {
  return [
    { _id: IDS.roleAdmin, roleName: "Admin", description: "Quản trị hệ thống" },
    { _id: IDS.roleMentor, roleName: "Mentor", description: "Giảng viên / người tạo khóa học" },
    { _id: IDS.roleStudent, roleName: "Student", description: "Học viên" },
  ];
}

// ═══════════════════════════════════════════════════════════════════════
// 2. USERS + USER_ROLES
// ═══════════════════════════════════════════════════════════════════════
function buildUsers() {
  return [
    {
      _id: IDS.adminUser,
      fullName: "Admin WDP",
      email: "admin@wdp.edu.vn",
      password: "Admin@123",
      phone: "0900000001",
      isFirstLogin: false,
      isActive: true,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      createdAt: daysAgo(365),
    },
    {
      _id: IDS.mentorAnh,
      fullName: "Nguyen Thuy Anh",
      email: "mentor.anh@wdp.edu.vn",
      password: "Mentor@123",
      phone: "0912345601",
      isFirstLogin: false,
      isActive: true,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=anh",
      createdAt: daysAgo(300),
    },
    {
      _id: IDS.mentorTuan,
      fullName: "Le Minh Tuan",
      email: "mentor.tuan@wdp.edu.vn",
      password: "Mentor@123",
      phone: "0912345602",
      isFirstLogin: false,
      isActive: true,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=tuan",
      createdAt: daysAgo(280),
    },
    {
      _id: IDS.mentorLan,
      fullName: "Pham Thi Lan",
      email: "mentor.lan@wdp.edu.vn",
      password: "Mentor@123",
      phone: "0912345603",
      isFirstLogin: false,
      isActive: true,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=lan",
      createdAt: daysAgo(200),
    },
    {
      _id: IDS.learnerMinh,
      fullName: "Tran Van Minh",
      email: "minh.tv@gmail.com",
      password: "Learner@123",
      phone: "0987654321",
      isFirstLogin: false,
      isActive: true,
      currentLevelId: IDS.levelElementary,
      learningGoal: "Đạt TOEIC 700+ để tốt nghiệp",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=minh",
      createdAt: daysAgo(120),
    },
    {
      _id: IDS.learnerHoa,
      fullName: "Nguyen Thi Hoa",
      email: "hoa.nt@gmail.com",
      password: "Learner@123",
      phone: "0976543210",
      isFirstLogin: false,
      isActive: true,
      currentLevelId: IDS.levelIntermediate,
      learningGoal: "Cải thiện tiếng Anh để thăng tiến",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=hoa",
      createdAt: daysAgo(180),
    },
    {
      _id: IDS.learnerDuc,
      fullName: "Hoang Van Duc",
      email: "duc.hv@gmail.com",
      password: "Learner@123",
      phone: "0965432109",
      isFirstLogin: false,
      isActive: true,
      currentLevelId: IDS.levelIntermediate,
      learningGoal: "Business English cho công việc",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=duc",
      createdAt: daysAgo(60),
    },
    {
      _id: IDS.learnerThu,
      fullName: "Le Thi Thu",
      email: "thu.lt@gmail.com",
      password: "Learner@123",
      phone: "0954321098",
      isFirstLogin: false,
      isActive: true,
      currentLevelId: IDS.levelBeginner,
      learningGoal: "Ôn thi tiếng Anh đại học",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=thu",
      createdAt: daysAgo(30),
    },
    {
      _id: IDS.learnerKhoa,
      fullName: "Pham Minh Khoa",
      email: "khoa.pm@gmail.com",
      password: "Learner@123",
      phone: "0943210987",
      isFirstLogin: false,
      isActive: true,
      currentLevelId: IDS.levelIntermediate,
      learningGoal: "IELTS 6.5 để du học",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=khoa",
      createdAt: daysAgo(20),
    },
  ];
}

function buildUserRoles() {
  return [
    { userId: IDS.adminUser, roleId: IDS.roleAdmin },
    { userId: IDS.mentorAnh, roleId: IDS.roleMentor },
    { userId: IDS.mentorTuan, roleId: IDS.roleMentor },
    { userId: IDS.mentorLan, roleId: IDS.roleMentor },
    { userId: IDS.learnerMinh, roleId: IDS.roleStudent },
    { userId: IDS.learnerHoa, roleId: IDS.roleStudent },
    { userId: IDS.learnerDuc, roleId: IDS.roleStudent },
    { userId: IDS.learnerThu, roleId: IDS.roleStudent },
    { userId: IDS.learnerKhoa, roleId: IDS.roleStudent },
  ];
}

// ═══════════════════════════════════════════════════════════════════════
// 3. CATEGORIES & LEVELS
// ═══════════════════════════════════════════════════════════════════════
function buildCategories() {
  return [
    { _id: IDS.catToeic, categoryName: "TOEIC", displayName: "TOEIC", isActive: true },
    { _id: IDS.catIelts, categoryName: "IELTS", displayName: "IELTS", isActive: true },
    { _id: IDS.catGiaoTiep, categoryName: "Giao tiếp", displayName: "Giao tiếp", isActive: true },
    { _id: IDS.catNguPhap, categoryName: "Ngữ pháp", displayName: "Ngữ pháp", isActive: true },
    { _id: IDS.catTuVung, categoryName: "Từ vựng", displayName: "Từ vựng", isActive: true },
    { _id: IDS.catBusiness, categoryName: "Business English", displayName: "Business English", isActive: true },
  ];
}

function buildLevels() {
  return [
    { _id: IDS.levelBeginner, levelName: "Beginner", displayName: "Người mới bắt đầu", sortOrder: 1, isActive: true },
    { _id: IDS.levelElementary, levelName: "Elementary", displayName: "Cơ bản", sortOrder: 2, isActive: true },
    { _id: IDS.levelIntermediate, levelName: "Intermediate", displayName: "Trung cấp", sortOrder: 3, isActive: true },
    { _id: IDS.levelAdvanced, levelName: "Advanced", displayName: "Cao cấp", sortOrder: 4, isActive: true },
  ];
}

// ═══════════════════════════════════════════════════════════════════════
// 4. COURSES
// ═══════════════════════════════════════════════════════════════════════
// ─── CUSTOM 20 COURSES DATA ───
const COURSES_DATA = [

  // ════════════════════════════════════════
  // CẤP 1 — Beginner / Elementary
  // ════════════════════════════════════════
  {
    courseName: 'English for Kids: Alphabet & Phonics',
    description: 'Khoá học dành cho học sinh cấp 1, giúp các em nhận biết 26 chữ cái, phát âm chuẩn từng âm vị (phonics) và đánh vần các từ đơn giản hàng ngày.',
    levelKey: 'Beginner',
    categoryKey: 'Pronunciation',
    rating: 4.8,
    chapters: [
      {
        title: 'Week 1: Alphabet A–M',
        description: 'Làm quen với 13 chữ cái đầu và âm tương ứng.',
        lessons: [
          { title: 'Letters A, B, C – Sounds & Writing', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Letters D, E, F – Practice Song', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Letters G, H, I, J, K – Quiz', type: 'quiz', url: '' },
          { title: 'Reading: The ABC Book (A–M)', type: 'reading', url: '' },
        ]
      },
      {
        title: 'Week 2: Alphabet N–Z',
        description: 'Học 13 chữ cái còn lại và luyện đọc từ đơn.',
        lessons: [
          { title: 'Letters N, O, P, Q, R – Sounds', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Letters S, T, U, V – Practice', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Letters W, X, Y, Z – Final Quiz', type: 'quiz', url: '' },
          { title: 'Full Alphabet Song & Review', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
        ]
      },
      {
        title: 'Week 3: Phonics – Short Vowels',
        description: 'Phát âm 5 nguyên âm ngắn: a, e, i, o, u trong từ đơn giản.',
        lessons: [
          { title: 'Short /a/ – cat, bat, hat', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Short /e/ & /i/ – pen, bin', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Short /o/ & /u/ – dog, cup', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Phonics Final Test', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  {
    courseName: 'Basic English Vocabulary – Grade 1',
    description: 'Xây dựng vốn từ vựng 300 từ thiết yếu cho học sinh lớp 1–2: màu sắc, con số, thức ăn, đồ vật gia đình, và các từ liên quan đến trường học.',
    levelKey: 'Beginner',
    categoryKey: 'Vocabulary',
    rating: 4.7,
    chapters: [
      {
        title: 'Week 1: Colors & Numbers',
        description: '10 màu sắc cơ bản và số từ 1–20.',
        lessons: [
          { title: '10 Basic Colors – Red, Blue, Green...', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Numbers 1–10', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Numbers 11–20', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Colors & Numbers Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: Food & Animals',
        description: 'Từ vựng về thức ăn và động vật quen thuộc.',
        lessons: [
          { title: 'Fruits & Vegetables', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'My Favourite Food', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Farm Animals & Pets', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Food & Animals Test', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: School & Home',
        description: 'Đồ dùng học tập và đồ vật trong nhà.',
        lessons: [
          { title: 'Classroom Objects – Pencil, Book, Ruler...', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Parts of the House – Kitchen, Bedroom...', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Reading: My School Day', type: 'reading', url: '' },
          { title: 'School & Home Final Quiz', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  {
    courseName: 'Simple Sentences – Speaking for Kids',
    description: 'Học sinh cấp 1 luyện nói các câu đơn giản theo chủ đề hàng ngày: tự giới thiệu, hỏi thăm, và nói về gia đình.',
    levelKey: 'Beginner',
    categoryKey: 'Speaking',
    rating: 4.6,
    chapters: [
      {
        title: 'Week 1: Greetings & Introductions',
        description: 'Luyện câu chào hỏi và tự giới thiệu bản thân.',
        lessons: [
          { title: 'Hello, My Name Is...', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'How Are You? – Dialogues', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Practice: Introduce Yourself', type: 'reading', url: '' },
          { title: 'Greetings Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: My Family',
        description: 'Nói về các thành viên trong gia đình.',
        lessons: [
          { title: 'Family Members – Mom, Dad, Sister...', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'This is my family – Mini Dialogue', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Reading: My Family (Short Story)', type: 'reading', url: '' },
          { title: 'Family Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: Daily Routines',
        description: 'Câu mô tả hoạt động hàng ngày.',
        lessons: [
          { title: 'I wake up at 6 AM – Daily Schedule', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'What do you do every day?', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Daily Routine Final Test', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  {
    courseName: 'English Listening – Level 1 (A1)',
    description: 'Rèn kỹ năng nghe cho học sinh cấp 1 với audio tốc độ chậm, phát âm rõ ràng. Chủ đề: thời tiết, màu sắc, số đếm, và câu lệnh trong lớp học.',
    levelKey: 'Beginner',
    categoryKey: 'Listening',
    rating: 4.5,
    chapters: [
      {
        title: 'Week 1: Listening to Commands',
        description: 'Nghe và làm theo câu lệnh cơ bản.',
        lessons: [
          { title: 'Stand up! Sit down! – Classroom Commands', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Listen & Point – Colors & Shapes', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Commands Listening Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: Weather & Seasons',
        description: 'Nghe mô tả thời tiết và 4 mùa.',
        lessons: [
          { title: 'What is the Weather Like Today?', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'The Four Seasons Song', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Weather & Seasons Quiz', type: 'quiz', url: '' },
          { title: 'Reading: Sunny Days', type: 'reading', url: '' },
        ]
      },
      {
        title: 'Week 3: Listening to Short Stories',
        description: 'Nghe truyện ngắn dành cho trẻ em.',
        lessons: [
          { title: 'The Three Little Pigs (A1 version)', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Goldilocks and the Three Bears', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Story Comprehension Test', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  {
    courseName: 'English Reading – Grade 1 (A1)',
    description: 'Khoá học đọc hiểu cấp độ A1 giúp học sinh nhận biết từ, đọc câu ngắn và hiểu nội dung đoạn văn đơn giản có hình minh hoạ.',
    levelKey: 'Beginner',
    categoryKey: 'Reading',
    rating: 4.6,
    chapters: [
      {
        title: 'Week 1: Word Recognition',
        description: 'Nhận biết và đọc các từ thông dụng (sight words).',
        lessons: [
          { title: 'Sight Words: the, a, is, I, am...', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Reading Simple Words', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Word Recognition Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: Reading Short Sentences',
        description: 'Đọc câu ngắn 3–5 từ.',
        lessons: [
          { title: 'I see a cat. The cat is big.', type: 'reading', url: '' },
          { title: 'She has a red ball.', type: 'reading', url: '' },
          { title: 'Sentences Reading Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: Reading Mini Stories',
        description: 'Đọc truyện ngắn 50–80 từ và trả lời câu hỏi.',
        lessons: [
          { title: 'My Dog Rex – Mini Story', type: 'reading', url: '' },
          { title: 'A Day at the Park', type: 'reading', url: '' },
          { title: 'Final Reading Comprehension Test', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  // ════════════════════════════════════════
  // CẤP 2 — Elementary (A2)
  // ════════════════════════════════════════
  {
    courseName: 'English Grammar – Grade 4 (A2)',
    description: 'Củng cố ngữ pháp tiếng Anh cấp 2: thì hiện tại đơn, hiện tại tiếp diễn, quá khứ đơn, câu hỏi Yes/No và câu phủ định.',
    levelKey: 'Elementary',
    categoryKey: 'Grammar',
    rating: 4.7,
    chapters: [
      {
        title: 'Week 1: Present Simple',
        description: 'Thì hiện tại đơn – cấu trúc và cách dùng.',
        lessons: [
          { title: 'Present Simple – Affirmative & Negative', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Yes/No Questions in Present Simple', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'He/She/It – Adding -s or -es', type: 'reading', url: '' },
          { title: 'Present Simple Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: Present Continuous',
        description: 'Thì hiện tại tiếp diễn – diễn tả hành động đang xảy ra.',
        lessons: [
          { title: 'am/is/are + V-ing – Structure', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Present Continuous vs Present Simple', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Practice Exercises', type: 'reading', url: '' },
          { title: 'Present Continuous Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: Past Simple',
        description: 'Thì quá khứ đơn – động từ có quy tắc và bất quy tắc.',
        lessons: [
          { title: 'Regular Verbs: worked, played, visited', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Irregular Verbs: went, saw, ate...', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Past Simple Negative & Questions', type: 'reading', url: '' },
          { title: 'Past Simple Final Test', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  {
    courseName: 'Everyday English Conversations – A2',
    description: 'Luyện giao tiếp tiếng Anh hàng ngày cho học sinh cấp 2: mua sắm, hỏi đường, đặt món ăn, gọi điện thoại và nói về sở thích.',
    levelKey: 'Elementary',
    categoryKey: 'Communication',
    rating: 4.8,
    chapters: [
      {
        title: 'Week 1: Shopping & Ordering Food',
        description: 'Đối thoại khi mua hàng và gọi đồ ăn.',
        lessons: [
          { title: 'At the Shop – Can I have...?', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'At the Restaurant – I would like...', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Role Play: Shopping Dialogue', type: 'reading', url: '' },
          { title: 'Shopping & Food Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: Asking for Directions',
        description: 'Hỏi và chỉ đường bằng tiếng Anh.',
        lessons: [
          { title: 'Prepositions of Place – next to, opposite...', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Excuse me, where is the bank?', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Directions Dialogue Practice', type: 'reading', url: '' },
          { title: 'Directions Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: Hobbies & Free Time',
        description: 'Nói về sở thích và hoạt động giải trí.',
        lessons: [
          { title: 'What do you like doing? – I enjoy...', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Talking About Sports & Hobbies', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Hobbies Final Test', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  {
    courseName: 'English Writing – Grade 5 (A2)',
    description: 'Rèn kỹ năng viết cho học sinh cấp 2: viết câu hoàn chỉnh, đoạn văn mô tả, và thư thân mật ngắn theo đúng bố cục.',
    levelKey: 'Elementary',
    categoryKey: 'Writing',
    rating: 4.6,
    chapters: [
      {
        title: 'Week 1: Writing Complete Sentences',
        description: 'Cấu trúc câu hoàn chỉnh: Subject + Verb + Object.',
        lessons: [
          { title: 'What Makes a Complete Sentence?', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Punctuation – Capital Letters & Full Stops', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Sentence Writing Practice', type: 'reading', url: '' },
          { title: 'Sentences Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: Descriptive Paragraphs',
        description: 'Viết đoạn văn mô tả người, vật, hoặc nơi chốn.',
        lessons: [
          { title: 'Topic Sentence & Supporting Details', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Describing My Best Friend', type: 'reading', url: '' },
          { title: 'Descriptive Writing Exercise', type: 'reading', url: '' },
          { title: 'Paragraph Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: Writing a Friendly Letter',
        description: 'Viết thư thân mật đúng bố cục: date, greeting, body, closing.',
        lessons: [
          { title: 'Parts of a Friendly Letter', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Sample Letter: Dear Tom...', type: 'reading', url: '' },
          { title: 'Write Your Own Letter – Practice', type: 'reading', url: '' },
          { title: 'Letter Writing Final Test', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  {
    courseName: 'A2 Reading Comprehension',
    description: 'Đọc hiểu cấp độ A2: bài đọc 100–150 từ về các chủ đề quen thuộc như du lịch, thiên nhiên, lịch sử và lối sống.',
    levelKey: 'Elementary',
    categoryKey: 'Reading',
    rating: 4.5,
    chapters: [
      {
        title: 'Week 1: Everyday Life Topics',
        description: 'Đọc về cuộc sống hàng ngày.',
        lessons: [
          { title: 'My Morning Routine (Reading + Comprehension)', type: 'reading', url: '' },
          { title: 'A Trip to the Market', type: 'reading', url: '' },
          { title: 'Everyday Life Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: Nature & Animals',
        description: 'Đọc về thiên nhiên và các loài vật.',
        lessons: [
          { title: 'The Amazon Rainforest (A2 version)', type: 'reading', url: '' },
          { title: 'Endangered Animals – Short Article', type: 'reading', url: '' },
          { title: 'Nature Reading Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: Travel & Places',
        description: 'Đọc về du lịch và các địa danh nổi tiếng.',
        lessons: [
          { title: 'A Weekend in London (A2 Reading)', type: 'reading', url: '' },
          { title: 'My Favourite Holiday Destination', type: 'reading', url: '' },
          { title: 'Travel Reading Final Test', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  {
    courseName: 'A2 Listening Skills – Elementary',
    description: 'Luyện nghe tiếng Anh cấp độ A2: hội thoại ngắn trong cuộc sống thực tế như tại nhà hàng, bến xe, trường học và cửa hàng.',
    levelKey: 'Elementary',
    categoryKey: 'Listening',
    rating: 4.7,
    chapters: [
      {
        title: 'Week 1: At School & Home',
        description: 'Nghe hội thoại trong môi trường học tập và gia đình.',
        lessons: [
          { title: 'Listening: A Day at School', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Listening: Helping at Home', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'School & Home Listening Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: Out & About',
        description: 'Nghe hội thoại ngoài đường phố và cửa hàng.',
        lessons: [
          { title: 'At the Supermarket – Listening Dialogue', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Taking the Bus – Listening Practice', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Out & About Listening Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: Phone Conversations',
        description: 'Nghe và luyện nói qua điện thoại.',
        lessons: [
          { title: 'Making a Phone Call – Hello, can I speak to...?', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Leaving a Message', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Phone Calls Final Quiz', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  // ════════════════════════════════════════
  // CẤP 3 — Intermediate (B1)
  // ════════════════════════════════════════
  {
    courseName: 'B1 Grammar: Intermediate English',
    description: 'Ngữ pháp tiếng Anh trung cấp toàn diện: thì hoàn thành, câu bị động, câu điều kiện loại 1 & 2, reported speech và modal verbs nâng cao.',
    levelKey: 'Intermediate',
    categoryKey: 'Grammar',
    rating: 4.9,
    chapters: [
      {
        title: 'Week 1: Perfect Tenses',
        description: 'Thì hiện tại hoàn thành và quá khứ hoàn thành.',
        lessons: [
          { title: 'Present Perfect – have/has + V3', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Past Perfect – had + V3', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Perfect Tense Practice Exercises', type: 'reading', url: '' },
          { title: 'Perfect Tenses Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: Passive Voice & Conditionals',
        description: 'Câu bị động và câu điều kiện.',
        lessons: [
          { title: 'Passive Voice – Present & Past', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Conditional Type 1 – Real Situations', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Conditional Type 2 – Hypothetical', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Passive & Conditionals Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: Reported Speech & Modal Verbs',
        description: 'Lời nói gián tiếp và modal verbs nâng cao.',
        lessons: [
          { title: 'Reported Speech – Statements & Questions', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Modal Verbs: should, must, might, could', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Grammar B1 Final Test', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  {
    courseName: 'IELTS Preparation – Band 5.0 to 6.0',
    description: 'Khóa học chuẩn bị IELTS tổng hợp 4 kỹ năng: Listening, Reading, Writing Task 1 & 2, Speaking Part 1 & 2. Mục tiêu đạt band 5.5–6.0.',
    levelKey: 'Intermediate',
    categoryKey: 'IELTS',
    rating: 4.9,
    chapters: [
      {
        title: 'Week 1: IELTS Listening Section 1 & 2',
        description: 'Chiến lược nghe và làm bài Section 1, 2.',
        lessons: [
          { title: 'Understanding IELTS Listening Format', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Section 1 Practice – Form Filling', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Section 2 Practice – Map & Diagram', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Listening S1 & S2 Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: IELTS Reading Strategies',
        description: 'Kỹ thuật đọc nhanh, skimming & scanning.',
        lessons: [
          { title: 'Skimming & Scanning Techniques', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'True/False/Not Given – How to Answer', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'IELTS Reading Practice Test 1', type: 'reading', url: '' },
          { title: 'Reading Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: IELTS Writing & Speaking',
        description: 'Writing Task 1, Task 2 và Speaking Part 1 & 2.',
        lessons: [
          { title: 'Writing Task 1 – Describing Charts & Graphs', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Writing Task 2 – Opinion Essay Structure', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Speaking Part 1 – Common Questions', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'IELTS Writing & Speaking Quiz', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  {
    courseName: 'Business English – Intermediate',
    description: 'Tiếng Anh thương mại cho môi trường văn phòng: email chuyên nghiệp, họp hành, thuyết trình, đàm phán và giao tiếp với đối tác nước ngoài.',
    levelKey: 'Intermediate',
    categoryKey: 'Business',
    rating: 4.8,
    chapters: [
      {
        title: 'Week 1: Professional Emails',
        description: 'Viết email văn phòng chuyên nghiệp.',
        lessons: [
          { title: 'Email Structure – Subject, Opening, Body, Closing', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Formal vs Informal Emails', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Email Vocabulary & Phrases', type: 'reading', url: '' },
          { title: 'Email Writing Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: Meetings & Presentations',
        description: 'Ngôn ngữ dùng trong họp và thuyết trình.',
        lessons: [
          { title: 'Chairing a Meeting – Key Phrases', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Presentation Language – Signposting', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Sample Presentation: New Product Launch', type: 'reading', url: '' },
          { title: 'Meetings & Presentations Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: Negotiation & Small Talk',
        description: 'Đàm phán và tạo mối quan hệ.',
        lessons: [
          { title: 'Negotiation Language – Making Offers', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Small Talk – How\'s business?', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Business English Final Test', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  {
    courseName: 'English Writing Skills – B1',
    description: 'Viết tiếng Anh trung cấp: essay nghị luận, báo cáo ngắn, email trang trọng, và review – rèn tư duy lập luận và kỹ năng diễn đạt mạch lạc.',
    levelKey: 'Intermediate',
    categoryKey: 'Writing',
    rating: 4.7,
    chapters: [
      {
        title: 'Week 1: Opinion & Argumentative Essays',
        description: 'Viết bài luận trình bày quan điểm.',
        lessons: [
          { title: 'Essay Structure – Introduction, Body, Conclusion', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Linking Words – However, Moreover, Therefore...', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Sample Opinion Essay + Analysis', type: 'reading', url: '' },
          { title: 'Essay Writing Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: Formal Reports',
        description: 'Viết báo cáo ngắn theo yêu cầu.',
        lessons: [
          { title: 'Report Format – Purpose, Findings, Recommendations', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Language for Reports – It is recommended that...', type: 'reading', url: '' },
          { title: 'Report Writing Practice', type: 'reading', url: '' },
          { title: 'Report Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: Reviews & Informal Letters',
        description: 'Viết review sản phẩm và thư không trang trọng.',
        lessons: [
          { title: 'How to Write a Review – Stars & Comments', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Informal Letter to a Friend', type: 'reading', url: '' },
          { title: 'B1 Writing Final Test', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  {
    courseName: 'TOEIC 600+ – Listening & Reading',
    description: 'Khóa luyện thi TOEIC đạt 600+ điểm với đầy đủ chiến lược làm bài Part 1–7: nhận dạng âm thanh, đọc hiểu nhanh và phân tích câu hỏi.',
    levelKey: 'Intermediate',
    categoryKey: 'TOEIC',
    rating: 4.9,
    chapters: [
      {
        title: 'Week 1: TOEIC Listening Parts 1–3',
        description: 'Photograph, Question-Response và Conversation.',
        lessons: [
          { title: 'Part 1 – Photographs: Spotting Action & Location', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Part 2 – Question-Response Strategy', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Part 3 – Short Conversations', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Listening Parts 1–3 Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: TOEIC Listening Part 4 & Reading Parts 5–6',
        description: 'Talks và Incomplete Sentences.',
        lessons: [
          { title: 'Part 4 – Short Talks: Announcements & Reports', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Part 5 – Grammar for TOEIC', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Part 6 – Text Completion Strategy', type: 'reading', url: '' },
          { title: 'Parts 4–6 Practice Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: TOEIC Reading Part 7',
        description: 'Single & Multiple Passages – đọc nhanh và chính xác.',
        lessons: [
          { title: 'Part 7 – Single Passage Reading', type: 'reading', url: '' },
          { title: 'Part 7 – Double/Triple Passage', type: 'reading', url: '' },
          { title: 'Full TOEIC Mock Test (Abridged)', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  // ════════════════════════════════════════
  // ĐẠI HỌC & CAO HỌC — Advanced (B2–C2)
  // ════════════════════════════════════════
  {
    courseName: 'Academic English Writing – University Level',
    description: 'Viết học thuật tiếng Anh cấp đại học: cách trích dẫn (APA/MLA), argumentative essay, research paper và abstract. Phù hợp sinh viên và nghiên cứu sinh.',
    levelKey: 'Advanced',
    categoryKey: 'Academic Writing',
    rating: 4.9,
    chapters: [
      {
        title: 'Week 1: Academic Style & Referencing',
        description: 'Phong cách học thuật và cách trích dẫn nguồn.',
        lessons: [
          { title: 'Formal Academic Tone – Dos and Don\'ts', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'APA vs MLA Citation – Quick Guide', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'In-text Citations & Reference List', type: 'reading', url: '' },
          { title: 'Academic Style Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: Argumentative & Research Essays',
        description: 'Lập luận logic và viết bài nghiên cứu.',
        lessons: [
          { title: 'Building a Thesis Statement', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Using Evidence – Quotes, Paraphrase, Summarize', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Counter-Arguments & Refutation', type: 'reading', url: '' },
          { title: 'Essay Structure Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: Research Paper & Abstract',
        description: 'Viết abstract và research paper hoàn chỉnh.',
        lessons: [
          { title: 'Research Paper Structure – IMRaD Format', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'How to Write an Abstract (250 words)', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Academic Writing Final Assessment', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  {
    courseName: 'IELTS Academic – Band 7.0 & Above',
    description: 'Khoá IELTS nâng cao nhắm mục tiêu band 7.0–8.0: phân tích đề thi thực tế, chiến lược làm bài Writing Task 2 nâng cao, Speaking Part 3 và Reading section 3.',
    levelKey: 'Advanced',
    categoryKey: 'IELTS',
    rating: 5.0,
    chapters: [
      {
        title: 'Week 1: Advanced Reading Strategies',
        description: 'Xử lý đoạn văn phức tạp trong Section 3.',
        lessons: [
          { title: 'Complex Academic Texts – How to Decode', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Matching Headings & Sentence Completion', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'IELTS Academic Reading Practice Test', type: 'reading', url: '' },
          { title: 'Advanced Reading Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: Writing Task 2 – Band 7 Strategies',
        description: 'Viết Task 2 đạt band 7 về coherence và lexical resource.',
        lessons: [
          { title: 'Lexical Resource – Synonyms & Collocations', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Coherence & Cohesion – Paragraphing', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Band 7 Sample Essays – Analysis', type: 'reading', url: '' },
          { title: 'Writing Task 2 Practice Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: Speaking Part 3 – Abstract Topics',
        description: 'Trả lời câu hỏi trừu tượng phức tạp trong Part 3.',
        lessons: [
          { title: 'Expressing Complex Opinions Fluently', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Speculating & Hedging Language', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'IELTS Speaking Mock Test – Band 7', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  {
    courseName: 'Advanced English Grammar – C1 Level',
    description: 'Ngữ pháp tiếng Anh trình độ C1: inversion, ellipsis, cleft sentences, subjunctive, advanced conditionals và văn phong học thuật. Phù hợp sinh viên đại học và người đi làm.',
    levelKey: 'Advanced',
    categoryKey: 'Grammar',
    rating: 4.8,
    chapters: [
      {
        title: 'Week 1: Advanced Conditionals & Subjunctive',
        description: 'Câu điều kiện hỗn hợp và subjunctive mood.',
        lessons: [
          { title: 'Mixed Conditionals – Type 2+3 Combined', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Subjunctive – I wish, If only, It\'s time...', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Conditional Exercises B2–C1', type: 'reading', url: '' },
          { title: 'Advanced Conditionals Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: Inversion & Ellipsis',
        description: 'Đảo ngữ và tỉnh lược trong văn viết.',
        lessons: [
          { title: 'Negative Inversion – Never have I...', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Ellipsis – Leaving Words Out Naturally', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Cleft Sentences – It is... who/that...', type: 'reading', url: '' },
          { title: 'Inversion & Ellipsis Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: Discourse & Academic Grammar',
        description: 'Ngữ pháp diễn ngôn và văn phong học thuật.',
        lessons: [
          { title: 'Discourse Markers – Cohesion in Writing', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Nominalization – Using Nouns in Academic Texts', type: 'reading', url: '' },
          { title: 'C1 Grammar Final Assessment', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  {
    courseName: 'English for Research & Academia',
    description: 'Tiếng Anh dành cho nghiên cứu sinh và học thuật: đọc journal articles, viết literature review, phát biểu tại hội thảo và phản biện khoa học bằng tiếng Anh.',
    levelKey: 'Advanced',
    categoryKey: 'Academic Writing',
    rating: 4.9,
    chapters: [
      {
        title: 'Week 1: Reading Journal Articles',
        description: 'Kỹ thuật đọc và phân tích bài báo khoa học.',
        lessons: [
          { title: 'Structure of a Journal Article – IMRaD', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Critical Reading – Evaluating Evidence', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Academic Vocabulary for Research', type: 'reading', url: '' },
          { title: 'Journal Reading Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: Literature Review & Citations',
        description: 'Viết literature review và trích dẫn đúng chuẩn.',
        lessons: [
          { title: 'What is a Literature Review?', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Synthesizing Sources – Moving Beyond Summary', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Citation Styles – APA 7th Edition Deep Dive', type: 'reading', url: '' },
          { title: 'Literature Review Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: Conference Presentations & Peer Review',
        description: 'Thuyết trình tại hội thảo và phản biện khoa học.',
        lessons: [
          { title: 'Conference Presentation Language – Signposting', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Responding to Q&A in Academic Conferences', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Writing a Peer Review', type: 'reading', url: '' },
          { title: 'Academic Research Final Assessment', type: 'quiz', url: '' },
        ]
      },
    ]
  },

  {
    courseName: 'C2 Mastery English – Proficiency Level',
    description: 'Trình độ C2 – Thành thạo hoàn toàn: phân tích văn học, tranh luận học thuật, dịch thuật chuyên ngành và sử dụng tiếng Anh như người bản ngữ trong mọi tình huống.',
    levelKey: 'Advanced',
    categoryKey: 'Communication',
    rating: 5.0,
    chapters: [
      {
        title: 'Week 1: Literary Analysis & Critical Thinking',
        description: 'Phân tích tác phẩm văn học và tư duy phê bình.',
        lessons: [
          { title: 'Analysing Literary Devices – Metaphor, Irony, Symbol', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Critical Essay on a Literary Work', type: 'reading', url: '' },
          { title: 'Discussing Complex Themes – Society & Identity', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Literary Analysis Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 2: Advanced Debate & Rhetoric',
        description: 'Tranh luận và hùng biện bằng tiếng Anh.',
        lessons: [
          { title: 'The Art of Persuasion – Ethos, Pathos, Logos', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Formal Debate – Structure & Strategies', type: 'video', url: 'https://www.youtube.com/watch?v=36IBDpTRVNE' },
          { title: 'Practice: Oxford-Style Debate', type: 'reading', url: '' },
          { title: 'Debate & Rhetoric Quiz', type: 'quiz', url: '' },
        ]
      },
      {
        title: 'Week 3: Professional Translation & Interpretation',
        description: 'Dịch thuật chuyên ngành và kỹ năng phiên dịch.',
        lessons: [
          { title: 'Translation Strategies – Equivalence & Adaptation', type: 'video', url: 'https://www.youtube.com/watch?v=75p-N9YKqNo' },
          { title: 'Legal & Medical Translation Basics', type: 'reading', url: '' },
          { title: 'C2 Mastery Final Assessment', type: 'quiz', url: '' },
        ]
      },
    ]
  },
];

function buildCourses() {
  const MENTORS = [IDS.mentorAnh, IDS.mentorTuan, IDS.mentorLan];
  
  function resolveCategory(key) {
    const normalized = String(key || "").trim().toLowerCase();
    if (normalized.includes("toeic")) return IDS.catToeic;
    if (normalized.includes("ielts")) return IDS.catIelts;
    if (normalized.includes("business") || normalized.includes("academic")) return IDS.catBusiness;
    if (normalized.includes("ngu phap") || normalized.includes("grammar")) return IDS.catNguPhap;
    if (normalized.includes("tu vung") || normalized.includes("vocabulary")) return IDS.catTuVung;
    return IDS.catGiaoTiep;
  }
  
  function resolveLevel(key) {
    const normalized = String(key || "").trim().toLowerCase();
    if (normalized.includes("beginner")) return IDS.levelBeginner;
    if (normalized.includes("elementary")) return IDS.levelElementary;
    if (normalized.includes("intermediate")) return IDS.levelIntermediate;
    if (normalized.includes("advanced")) return IDS.levelAdvanced;
    return IDS.levelElementary;
  }

  const defaultCourses = [
    {
      _id: IDS.courseToeicBasic,
      courseName: "Ôn thi TOEIC 2026 - Từ cơ bản đến 700+",
      description: "Khóa học TOEIC toàn diện theo chuẩn ETS 2026. Bao gồm 7 dạng bài Listening và 4 dạng bài Reading. Cam kết đạt 700+ sau 3 tháng học.",
      categoryId: IDS.catToeic,
      levelId: IDS.levelElementary,
      instructorId: IDS.mentorAnh,
      thumbnail: null,
      rating: 4.8,
      totalLessons: 4,
      isPublished: true,
      status: "active",
      price: 499000,
      isPaid: true,
      discountPercentage: 50,
      createdAt: daysAgo(300),
    },
    {
      _id: IDS.courseToeicAdvanced,
      courseName: "TOEIC Nâng Cao - Chinh phục 900+",
      description: "Dành cho học viên đã có nền tảng TOEIC 600+. Tập trung vào Part 7 (đọc hiểu đoạn dài) và Part 3, 4 (nghe hội thoại phức tạp).",
      categoryId: IDS.catToeic,
      levelId: IDS.levelAdvanced,
      instructorId: IDS.mentorAnh,
      thumbnail: null,
      rating: 4.9,
      totalLessons: 4,
      isPublished: true,
      status: "active",
      price: 649000,
      isPaid: true,
      discountPercentage: 50,
      createdAt: daysAgo(250),
    },
    {
      _id: IDS.courseIelts75,
      courseName: "IELTS 7.5+ - Học thuật toàn diện",
      description: "Khóa học IELTS đầy đủ 4 kỹ năng Listening, Reading, Writing, Speaking. Phương pháp học tập dựa trên thực hành và phân tích lỗi sai.",
      categoryId: IDS.catIelts,
      levelId: IDS.levelIntermediate,
      instructorId: IDS.mentorAnh,
      thumbnail: null,
      rating: 4.7,
      totalLessons: 4,
      isPublished: true,
      status: "active",
      price: 799000,
      isPaid: true,
      discountPercentage: 47,
      createdAt: daysAgo(200),
    },
    {
      _id: IDS.courseGiaoTiepHangNgay,
      courseName: "Tiếng Anh giao tiếp hàng ngày - A1 đến B2",
      description: "Học tiếng Anh giao tiếp qua các tình huống thực tế: mua sắm, đi du lịch, làm việc, kết bạn. Phát âm chuẩn từ đầu.",
      categoryId: IDS.catGiaoTiep,
      levelId: IDS.levelElementary,
      instructorId: IDS.mentorLan,
      thumbnail: null,
      rating: 4.6,
      totalLessons: 4,
      isPublished: true,
      status: "active",
      price: 0,
      isPaid: false,
      discountPercentage: 0,
      createdAt: daysAgo(180),
    },
    {
      _id: IDS.courseBusinessEnglish,
      courseName: "Business English Chuyên nghiệp",
      description: "Email, thuyết trình, đàm phán, họp hành bằng tiếng Anh. Dành cho nhân viên văn phòng và quản lý muốn nâng cấp kỹ năng chuyên môn.",
      categoryId: IDS.catBusiness,
      levelId: IDS.levelIntermediate,
      instructorId: IDS.mentorTuan,
      thumbnail: null,
      rating: 4.8,
      totalLessons: 4,
      isPublished: true,
      status: "active",
      price: 599000,
      isPaid: true,
      discountPercentage: 50,
      createdAt: daysAgo(150),
    },
    {
      _id: IDS.courseMentorOrigami,
      courseName: "Từ vựng qua nghệ thuật Origami",
      description: "Khóa học đặc biệt: học từ vựng tiếng Anh qua các hướng dẫn gấp giấy Origami bằng tiếng Anh. Vừa học ngôn ngữ, vừa thư giãn.",
      categoryId: IDS.catTuVung,
      levelId: IDS.levelElementary,
      instructorId: IDS.mentorLan,
      thumbnail: null,
      rating: 4.5,
      totalLessons: 4,
      isPublished: true,
      status: "active",
      price: 0,
      isPaid: false,
      discountPercentage: 0,
      createdAt: daysAgo(60),
    },
  ];

  const mapped20 = COURSES_DATA.map((c, idx) => {
    return {
      _id: id(),
      courseName: c.courseName,
      description: c.description,
      categoryId: resolveCategory(c.categoryKey),
      levelId: resolveLevel(c.levelKey),
      instructorId: MENTORS[idx % MENTORS.length],
      thumbnail: null,
      rating: c.rating || 0,
      totalLessons: c.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0),
      isPublished: true,
      status: "active",
      price: c.price || 0,
      isPaid: (c.price || 0) > 0,
      discountPercentage: c.price ? 20 : 0,
      createdAt: daysAgo(100 - idx * 3),
      chapters: c.chapters
    };
  });

  return [...defaultCourses, ...mapped20];
}

// ═══════════════════════════════════════════════════════════════════════
// 5. PATHS (chương) + PATH_NODES (bài học) + NODE_MATERIALS (nội dung)
// ═══════════════════════════════════════════════════════════════════════
// Mỗi khóa học: 2 chương x 2 bài học = 4 node, mỗi node có 1 material.
function buildCourseStructure(courses) {
  const paths = [];
  const nodes = [];
  const materials = [];
  const nodesByCourse = {}; // courseId(string) -> [nodeId,...] theo thứ tự

  const DEFAULT_CHAPTER_TITLES = [
    "Chương 1: Nhập môn & Định hướng",
    "Chương 2: Thực hành & Kỹ năng nâng cao"
  ];

  for (const course of courses) {
    const courseKey = course._id.toString();
    nodesByCourse[courseKey] = [];

    if (course.chapters && course.chapters.length > 0) {
      for (let ci = 0; ci < course.chapters.length; ci++) {
        const chapterData = course.chapters[ci];
        const pathId = id();
        
        paths.push({
          _id: pathId,
          courseId: course._id,
          pathName: chapterData.title,
          description: chapterData.description || '',
          order: ci + 1,
          createdAt: course.createdAt,
        });

        for (let ni = 0; ni < chapterData.lessons.length; ni++) {
          const lessonData = chapterData.lessons[ni];
          const nodeId = id();
          const nodeOrder = ni + 1;
          
          nodes.push({
            _id: nodeId,
            pathId,
            nodeName: lessonData.title,
            nodeOrder,
            description: '',
            isFree: ni === 0,
          });
          
          nodesByCourse[courseKey].push(nodeId);

          let matType = "VIDEO";
          if (lessonData.type === "reading") matType = "TEXT";
          else if (lessonData.type === "quiz") matType = "TEXT";
          else if (lessonData.type === "audio") matType = "AUDIO";

          materials.push({
            _id: id(),
            nodeId,
            materialType: matType,
            title: lessonData.title,
            materialUrl: lessonData.url || "",
            materialOrder: 1,
            sourceType: lessonData.url ? "LINK" : "UPLOAD",
            content: lessonData.type === "reading" ? `<p><strong>${lessonData.title}</strong></p><p>Nội dung bài đọc sẽ được cập nhật bởi giảng viên.</p>` : null
          });
        }
      }
    } else {
      for (let ci = 0; ci < 2; ci++) {
        const pathId = id();
        paths.push({
          _id: pathId,
          courseId: course._id,
          pathName: DEFAULT_CHAPTER_TITLES[ci],
          description: `Nội dung ${DEFAULT_CHAPTER_TITLES[ci].toLowerCase()} của khóa "${course.courseName}"`,
          order: ci + 1,
          createdAt: course.createdAt,
        });

        for (let ni = 0; ni < 2; ni++) {
          const nodeId = id();
          const nodeOrder = ci * 2 + ni + 1;
          nodes.push({
            _id: nodeId,
            pathId,
            nodeName: `Bài ${nodeOrder}: ${ni === 0 ? "Video bài giảng" : "Tài liệu & bài tập"}`,
            nodeOrder,
            description: `Bài học số ${nodeOrder} thuộc "${DEFAULT_CHAPTER_TITLES[ci]}"`,
            isFree: nodeOrder === 1,
          });
          nodesByCourse[courseKey].push(nodeId);

          materials.push({
            _id: id(),
            nodeId,
            materialType: ni === 0 ? "VIDEO" : "TEXT",
            title: ni === 0 ? `Video bài ${nodeOrder}` : `Tài liệu bài ${nodeOrder}`,
            materialUrl: ni === 0 ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : null,
            materialOrder: 1,
            sourceType: ni === 0 ? "LINK" : "UPLOAD",
            content: ni === 0 ? null : `Nội dung tóm tắt bài ${nodeOrder} của khóa "${course.courseName}".`,
          });
        }
      }
    }
  }

  return { paths, nodes, materials, nodesByCourse };
}

// ═══════════════════════════════════════════════════════════════════════
// 6. USER_COURSES (đăng ký học) + PAYMENTS
// ═══════════════════════════════════════════════════════════════════════
function buildPayments() {
  return [
    {
      _id: IDS.payMinhToeic,
      userId: IDS.learnerMinh,
      courseId: IDS.courseToeicBasic,
      paymentType: "one-time",
      amount: 499000,
      discountAmount: 0,
      finalAmount: 499000,
      status: "success",
      paymentMethod: "MoMo",
      paymentDescription: "Thanh toan khoa hoc Ôn thi TOEIC 2026",
      paidAt: daysAgo(100),
      createdAt: daysAgo(100),
    },
    {
      _id: IDS.payHoaToeic,
      userId: IDS.learnerHoa,
      courseId: IDS.courseToeicBasic,
      paymentType: "one-time",
      amount: 499000,
      discountAmount: 0,
      finalAmount: 499000,
      status: "success",
      paymentMethod: "VNPay",
      paymentDescription: "Thanh toan khoa hoc Ôn thi TOEIC 2026",
      paidAt: daysAgo(150),
      createdAt: daysAgo(150),
    },
    {
      _id: IDS.payDucBiz,
      userId: IDS.learnerDuc,
      courseId: IDS.courseBusinessEnglish,
      paymentType: "one-time",
      amount: 599000,
      discountAmount: 0,
      finalAmount: 599000,
      status: "success",
      paymentMethod: "ZaloPay",
      paymentDescription: "Thanh toan khoa hoc Business English Chuyên nghiệp",
      paidAt: daysAgo(50),
      createdAt: daysAgo(50),
    },
    {
      _id: IDS.payKhoaIelts,
      userId: IDS.learnerKhoa,
      courseId: IDS.courseIelts75,
      paymentType: "one-time",
      amount: 799000,
      discountAmount: 0,
      finalAmount: 799000,
      status: "success",
      paymentMethod: "Bank Transfer",
      paymentDescription: "Thanh toan khoa hoc IELTS 7.5+",
      paidAt: daysAgo(18),
      createdAt: daysAgo(18),
    },
    // Ví dụ thanh toán thất bại
    {
      _id: id(),
      userId: IDS.learnerMinh,
      courseId: IDS.courseIelts75,
      paymentType: "one-time",
      amount: 799000,
      discountAmount: 0,
      finalAmount: 799000,
      status: "failed",
      paymentMethod: "Card",
      paymentDescription: "Thanh toan khoa hoc IELTS 7.5+",
      errorMessage: "Payment failed",
      errorCode: "15",
      createdAt: daysAgo(15),
    },
  ];
}

function buildUserCourses() {
  return [
    { userId: IDS.learnerMinh, courseId: IDS.courseToeicBasic, progressPercentage: 65, enrollmentDate: daysAgo(100), paymentId: IDS.payMinhToeic },
    { userId: IDS.learnerMinh, courseId: IDS.courseGiaoTiepHangNgay, progressPercentage: 30, enrollmentDate: daysAgo(80), paymentId: null },
    { userId: IDS.learnerHoa, courseId: IDS.courseToeicBasic, progressPercentage: 85, enrollmentDate: daysAgo(150), paymentId: IDS.payHoaToeic },
    { userId: IDS.learnerHoa, courseId: IDS.courseGiaoTiepHangNgay, progressPercentage: 100, enrollmentDate: daysAgo(90), paymentId: null },
    { userId: IDS.learnerDuc, courseId: IDS.courseBusinessEnglish, progressPercentage: 20, enrollmentDate: daysAgo(50), paymentId: IDS.payDucBiz },
    { userId: IDS.learnerThu, courseId: IDS.courseGiaoTiepHangNgay, progressPercentage: 45, enrollmentDate: daysAgo(28), paymentId: null },
    { userId: IDS.learnerKhoa, courseId: IDS.courseIelts75, progressPercentage: 10, enrollmentDate: daysAgo(18), paymentId: IDS.payKhoaIelts },
  ];
}

// ═══════════════════════════════════════════════════════════════════════
// 7. USER_NODES (tiến độ bài học + streak) + CERTIFICATES
// ═══════════════════════════════════════════════════════════════════════
function buildUserNodes(nodesByCourse) {
  const userNodes = [];

  // Minh: hoàn thành bài 1 khóa TOEIC vào các ngày gần đây -> streak 5 ngày (kể cả hôm nay)
  const toeicNodes = nodesByCourse[IDS.courseToeicBasic.toString()];
  [0, 1, 2].forEach((i) => {
    userNodes.push({ userId: IDS.learnerMinh, nodeId: toeicNodes[i], isCompleted: true, completedAt: daysAgo(i) });
  });

  // Hoa: hoàn thành toàn bộ khóa Giao tiếp (100% -> có certificate)
  const gtNodes = nodesByCourse[IDS.courseGiaoTiepHangNgay.toString()];
  gtNodes.forEach((nodeId, i) => {
    userNodes.push({ userId: IDS.learnerHoa, nodeId, isCompleted: true, completedAt: daysAgo(10 + i) });
  });

  // Thu: hoàn thành 2 bài đầu khóa Giao tiếp, streak hôm nay
  [0, 1].forEach((i) => {
    userNodes.push({ userId: IDS.learnerThu, nodeId: gtNodes[i], isCompleted: true, completedAt: daysAgo(0) });
  });

  // Duc: hoàn thành bài 1 khóa Business
  const bizNodes = nodesByCourse[IDS.courseBusinessEnglish.toString()];
  userNodes.push({ userId: IDS.learnerDuc, nodeId: bizNodes[0], isCompleted: true, completedAt: daysAgo(1) });

  return userNodes;
}

function buildCertificates() {
  return [
    {
      userId: IDS.learnerHoa,
      courseId: IDS.courseGiaoTiepHangNgay,
      certificateCode: `CERT-${IDS.learnerHoa.toString().slice(-6)}-${IDS.courseGiaoTiepHangNgay.toString().slice(-6)}`,
      issuedAt: daysAgo(10),
      grade: 100,
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════
// 8. MENTOR APPLICATIONS
// ═══════════════════════════════════════════════════════════════════════
function buildMentorApplications() {
  return [
    {
      userId: IDS.mentorAnh,
      fullName: "Nguyen Thuy Anh",
      name: "Nguyen Thuy Anh",
      email: "mentor.anh@wdp.edu.vn",
      bio: "Giảng viên TOEIC & IELTS với 10 năm kinh nghiệm. IELTS 8.5, TOEIC 990.",
      portfolioUrl: "https://thuyanhteaches.com",
      levels: [IDS.levelIntermediate, IDS.levelAdvanced],
      status: "approved",
      isReadByAdmin: true,
      createdAt: daysAgo(310),
    },
    {
      userId: IDS.mentorTuan,
      fullName: "Le Minh Tuan",
      name: "Le Minh Tuan",
      email: "mentor.tuan@wdp.edu.vn",
      bio: "Chuyên gia Business English. MBA tại RMIT. 7 năm đào tạo doanh nghiệp.",
      levels: [IDS.levelIntermediate],
      status: "approved",
      isReadByAdmin: true,
      createdAt: daysAgo(290),
    },
    // Đơn đang chờ duyệt, dùng để test luồng admin approval
    {
      userId: IDS.learnerMinh,
      fullName: "Tran Van Minh",
      name: "Tran Van Minh",
      email: "minh.tv@gmail.com",
      bio: "Sinh viên CNTT có khả năng dạy lập trình bằng tiếng Anh. TOEIC 750.",
      portfolioUrl: "https://github.com/minhtvdev",
      levels: [IDS.levelElementary],
      status: "pending",
      isReadByAdmin: false,
      createdAt: daysAgo(5),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════
// 9. NOTIFICATIONS & COMMENTS
// ═══════════════════════════════════════════════════════════════════════
function buildNotifications() {
  return [
    {
      userId: IDS.learnerMinh,
      type: "payment",
      title: "Thanh toán thành công",
      message: "Bạn đã đăng ký thành công khóa học 'Ôn thi TOEIC 2026'. Chúc bạn học tốt!",
      metadata: { paymentId: IDS.payMinhToeic, courseId: IDS.courseToeicBasic },
      isRead: true,
      createdAt: daysAgo(100),
    },
    {
      userId: IDS.learnerMinh,
      type: "streak",
      title: "Streak 3 ngày!",
      message: "Bạn đã duy trì streak học tập 3 ngày liên tiếp.",
      isRead: false,
      createdAt: now,
    },
    {
      userId: IDS.learnerHoa,
      type: "course",
      title: "Hoàn thành khóa học!",
      message: "Bạn đã hoàn thành khóa học 'Tiếng Anh giao tiếp hàng ngày'. Chứng chỉ đã sẵn sàng.",
      metadata: { courseId: IDS.courseGiaoTiepHangNgay },
      isRead: true,
      createdAt: daysAgo(10),
    },
    {
      userId: IDS.adminUser,
      type: "system",
      title: "Đơn đăng ký mentor mới",
      message: "Tran Van Minh đã gửi đơn đăng ký trở thành mentor. Vui lòng xem xét.",
      isRead: false,
      createdAt: daysAgo(5),
    },
  ];
}

function buildCourseComments() {
  return [
    {
      courseId: IDS.courseToeicBasic,
      userId: IDS.learnerMinh,
      rating: 5,
      content: "Khóa học rất chi tiết và dễ hiểu! Mình đã cải thiện điểm từ 450 lên 680 sau 2 tháng!",
      createdAt: daysAgo(30),
    },
    {
      courseId: IDS.courseToeicBasic,
      userId: IDS.learnerHoa,
      rating: 5,
      content: "Tuyệt vời! Phương pháp giảng dạy khoa học, phù hợp cho người đi làm bận rộn.",
      createdAt: daysAgo(40),
    },
    {
      courseId: IDS.courseGiaoTiepHangNgay,
      userId: IDS.learnerHoa,
      rating: 4,
      content: "Khóa học hay, phát âm chuẩn. Chỉ tiếc là chưa có nhiều bài tập thực hành nói trực tiếp.",
      createdAt: daysAgo(8),
    },
    {
      courseId: IDS.courseBusinessEnglish,
      userId: IDS.learnerDuc,
      rating: 5,
      content: "Thầy Tuấn dạy rất thực tế! Sau 1 tháng mình viết email tiếng Anh tự tin hơn hẳn.",
      createdAt: daysAgo(10),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════
async function main() {
  console.log(`Đang kết nối tới MongoDB: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log("✅ Kết nối MongoDB thành công!\n");

  // Xoá dữ liệu cũ (seed lại từ đầu) — chỉ xoá các collection script này quản lý
  console.log("Xoá dữ liệu cũ...");
  await Promise.all([
    Role.deleteMany({}),
    UserRole.deleteMany({}),
    User.deleteMany({}),
    Category.deleteMany({}),
    Level.deleteMany({}),
    Course.deleteMany({}),
    Path_.deleteMany({}),
    PathNode.deleteMany({}),
    NodeMaterial.deleteMany({}),
    UserCourse.deleteMany({}),
    UserNode.deleteMany({}),
    Payment.deleteMany({}),
    MentorApplication.deleteMany({}),
    Notification.deleteMany({}),
    CourseComment.deleteMany({}),
    Certificate.deleteMany({}),
  ]);

  console.log("Seeding...\n");

  await Role.insertMany(buildRoles());
  console.log(`  ✅ roles`);

  await User.insertMany(buildUsers());
  console.log(`  ✅ users`);

  await UserRole.insertMany(buildUserRoles());
  console.log(`  ✅ userroles`);

  await Category.insertMany(buildCategories());
  console.log(`  ✅ categories`);

  await Level.insertMany(buildLevels());
  console.log(`  ✅ levels`);

  const courses = buildCourses();
  await Course.insertMany(courses);
  console.log(`  ✅ courses`);

  const { paths, nodes, materials, nodesByCourse } = buildCourseStructure(courses);
  await Path_.insertMany(paths);
  console.log(`  ✅ paths`);
  await PathNode.insertMany(nodes);
  console.log(`  ✅ pathnodes`);
  await NodeMaterial.insertMany(materials);
  console.log(`  ✅ nodematerials`);

  await Payment.insertMany(buildPayments());
  console.log(`  ✅ payments`);

  await UserCourse.insertMany(buildUserCourses());
  console.log(`  ✅ usercourses`);

  await UserNode.insertMany(buildUserNodes(nodesByCourse));
  console.log(`  ✅ usernodes`);

  await Certificate.insertMany(buildCertificates());
  console.log(`  ✅ certificates`);

  await MentorApplication.insertMany(buildMentorApplications());
  console.log(`  ✅ mentorapplications`);

  await Notification.insertMany(buildNotifications());
  console.log(`  ✅ notifications`);

  await CourseComment.insertMany(buildCourseComments());
  console.log(`  ✅ coursecomments`);

  console.log("\n═══════════════════════════════════════════");
  console.log("  🎉 Seed hoàn tất! WDP English Platform");
  console.log("═══════════════════════════════════════════");
  console.log("\n  📋 Tài khoản test (mật khẩu dạng text thường, khớp cách BE so sánh):");
  console.log("  ┌─────────────────────────────────────────────────┐");
  console.log("  │ ADMIN   admin@wdp.edu.vn        Admin@123        │");
  console.log("  │ MENTOR  mentor.anh@wdp.edu.vn    Mentor@123       │");
  console.log("  │ MENTOR  mentor.tuan@wdp.edu.vn   Mentor@123       │");
  console.log("  │ MENTOR  mentor.lan@wdp.edu.vn    Mentor@123       │");
  console.log("  │ STUDENT minh.tv@gmail.com        Learner@123      │");
  console.log("  │ STUDENT hoa.nt@gmail.com         Learner@123      │");
  console.log("  │ STUDENT duc.hv@gmail.com         Learner@123      │");
  console.log("  │ STUDENT thu.lt@gmail.com         Learner@123      │");
  console.log("  │ STUDENT khoa.pm@gmail.com        Learner@123      │");
  console.log("  └─────────────────────────────────────────────────┘");
  console.log(`\n  🔗 MongoDB URI: ${MONGO_URI}\n`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("\n❌ Lỗi:", err.message);
  process.exit(1);
});
