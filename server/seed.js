/**
 * WDP English Learning Platform - MongoDB Seed Script
 * Chạy: node seed.js
 * Yêu cầu: MongoDB đang chạy tại mongodb://localhost:27017
 * Hoặc đổi MONGO_URI bên dưới thành connection string của bạn
 */

require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "wdp_english";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const id = () => new ObjectId();
const now = new Date();
const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const daysFromNow = (n) => new Date(Date.now() + n * 86400000);

function dateStr(date = new Date()) {
  return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

// ─── IDs (pre-generated để cross-reference) ───────────────────────────────────
const IDS = {
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

  // Courses
  courseToeicBasic: id(),
  courseToeicAdvanced: id(),
  courseIelts75: id(),
  courseGiaoTiepHangNgay: id(),
  courseBusinessEnglish: id(),
  courseMentorOrigami: id(),

  // Modules (TOEIC Basic)
  modToeic1: id(),
  modToeic2: id(),
  modToeic3: id(),
  // Modules (IELTS 7.5)
  modIelts1: id(),
  modIelts2: id(),
  // Modules (Giao tiep)
  modGT1: id(),
  modGT2: id(),
  // Modules (Business)
  modBiz1: id(),
  modBiz2: id(),
  // Modules (Mentor course)
  modMentor1: id(),

  // Lessons
  lesT1L1: id(), lesT1L2: id(), lesT1L3: id(), lesT1L4: id(),
  lesT2L1: id(), lesT2L2: id(), lesT2L3: id(),
  lesT3L1: id(), lesT3L2: id(),
  lesI1L1: id(), lesI1L2: id(), lesI1L3: id(),
  lesI2L1: id(), lesI2L2: id(),
  lesG1L1: id(), lesG1L2: id(),
  lesG2L1: id(), lesG2L2: id(),
  lesB1L1: id(), lesB1L2: id(),
  lesB2L1: id(),
  lesM1L1: id(), lesM1L2: id(), lesM1L3: id(),

  // Enrollments
  enrollMinhToeic: id(),
  enrollMinhIelts: id(),
  enrollHoaToeic: id(),
  enrollHoaGT: id(),
  enrollDucBiz: id(),

  // Payments
  payMinhToeic: id(),
  payHoaToeic: id(),
  payDucBiz: id(),

  // Mentor applications
  appMentorAnh: id(),
  appMentorTuan: id(),
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. USERS
// ═══════════════════════════════════════════════════════════════════════════════
async function seedUsers() {
  const passwords = {
    admin: await hashPassword("Admin@123"),
    mentor: await hashPassword("Mentor@123"),
    learner: await hashPassword("Learner@123"),
  };

  return [
    {
      _id: IDS.adminUser,
      name: "Admin WDP",
      fullName: "Admin WDP",
      email: "admin@wdp.edu.vn",
      password: passwords.admin,
      role: "Admin",
      roles: [{ roleId: 1, roleName: "Admin" }],
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      phone: "0900000001",
      bio: "Quản trị viên hệ thống WDP English Learning Platform.",
      xp: 9999,
      streak: 100,
      isBlocked: false,
      isMentorApproved: false,
      createdAt: daysAgo(365),
      updatedAt: daysAgo(1),
    },
    {
      _id: IDS.mentorAnh,
      name: "Nguyen Thuy Anh",
      fullName: "Nguyen Thuy Anh",
      email: "mentor.anh@wdp.edu.vn",
      password: passwords.mentor,
      role: "Mentor",
      roles: [{ roleId: 2, roleName: "Mentor" }],
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anh",
      phone: "0912345601",
      bio: "Giảng viên TOEIC & IELTS với 10 năm kinh nghiệm. Cựu sinh viên Đại học Hà Nội.",
      experience: "10 năm giảng dạy tại các trung tâm lớn. Điểm IELTS 8.5, TOEIC 990.",
      portfolioUrl: "https://thuyanhteaches.com",
      xp: 5200,
      streak: 45,
      isBlocked: false,
      isMentorApproved: true,
      createdAt: daysAgo(300),
      updatedAt: daysAgo(2),
    },
    {
      _id: IDS.mentorTuan,
      name: "Le Minh Tuan",
      fullName: "Le Minh Tuan",
      email: "mentor.tuan@wdp.edu.vn",
      password: passwords.mentor,
      role: "Mentor",
      roles: [{ roleId: 2, roleName: "Mentor" }],
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tuan",
      phone: "0912345602",
      bio: "Chuyên gia Business English. MBA tại ĐH RMIT.",
      experience: "7 năm đào tạo tiếng Anh doanh nghiệp cho các tập đoàn lớn.",
      xp: 3800,
      streak: 30,
      isBlocked: false,
      isMentorApproved: true,
      createdAt: daysAgo(280),
      updatedAt: daysAgo(3),
    },
    {
      _id: IDS.mentorLan,
      name: "Pham Thi Lan",
      fullName: "Pham Thi Lan",
      email: "mentor.lan@wdp.edu.vn",
      password: passwords.mentor,
      role: "Mentor",
      roles: [{ roleId: 2, roleName: "Mentor" }],
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lan",
      phone: "0912345603",
      bio: "Giáo viên giao tiếp tiếng Anh hàng ngày. Tốt nghiệp Đại học Ngoại ngữ.",
      experience: "5 năm dạy giao tiếp và kỹ năng mềm bằng tiếng Anh.",
      xp: 2900,
      streak: 22,
      isBlocked: false,
      isMentorApproved: true,
      createdAt: daysAgo(200),
      updatedAt: daysAgo(5),
    },
    // Learners
    {
      _id: IDS.learnerMinh,
      name: "Tran Van Minh",
      fullName: "Tran Van Minh",
      email: "minh.tv@gmail.com",
      password: passwords.learner,
      role: "Learner",
      roles: [{ roleId: 3, roleName: "Learner" }],
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=minh",
      phone: "0987654321",
      bio: "Sinh viên CNTT năm 3, đang ôn TOEIC để tốt nghiệp.",
      school: "Đại học Bách Khoa Hà Nội",
      major: "Công nghệ thông tin",
      year: "Năm 3",
      memberSince: "03/2025",
      preferredStudyTime: "Buổi tối (18h - 22h)",
      dailyGoal: "2 Giờ",
      quizDifficulty: "Thích ứng",
      notifications: true,
      xp: 2450,
      streak: 15,
      isBlocked: false,
      isMentorApproved: false,
      createdAt: daysAgo(120),
      updatedAt: now,
    },
    {
      _id: IDS.learnerHoa,
      name: "Nguyen Thi Hoa",
      fullName: "Nguyen Thi Hoa",
      email: "hoa.nt@gmail.com",
      password: passwords.learner,
      role: "Learner",
      roles: [{ roleId: 3, roleName: "Learner" }],
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hoa",
      phone: "0976543210",
      bio: "Nhân viên văn phòng, muốn cải thiện tiếng Anh để thăng tiến.",
      school: "Đại học Kinh tế Quốc dân",
      major: "Quản trị kinh doanh",
      year: "Đã tốt nghiệp",
      memberSince: "01/2025",
      preferredStudyTime: "Buổi sáng (6h - 12h)",
      dailyGoal: "1 Giờ",
      quizDifficulty: "Trung bình",
      notifications: true,
      xp: 1820,
      streak: 8,
      isBlocked: false,
      isMentorApproved: false,
      createdAt: daysAgo(180),
      updatedAt: daysAgo(1),
    },
    {
      _id: IDS.learnerDuc,
      name: "Hoang Van Duc",
      fullName: "Hoang Van Duc",
      email: "duc.hv@gmail.com",
      password: passwords.learner,
      role: "Learner",
      roles: [{ roleId: 3, roleName: "Learner" }],
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=duc",
      phone: "0965432109",
      bio: "Kỹ sư phần mềm muốn học Business English cho công việc.",
      school: "Đại học FPT",
      major: "Kỹ thuật phần mềm",
      year: "Đã tốt nghiệp",
      memberSince: "05/2025",
      preferredStudyTime: "Buổi trưa (12h - 14h)",
      dailyGoal: "30 Phút",
      quizDifficulty: "Khó",
      notifications: false,
      xp: 980,
      streak: 3,
      isBlocked: false,
      isMentorApproved: false,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(2),
    },
    {
      _id: IDS.learnerThu,
      name: "Le Thi Thu",
      fullName: "Le Thi Thu",
      email: "thu.lt@gmail.com",
      password: passwords.learner,
      role: "Learner",
      roles: [{ roleId: 3, roleName: "Learner" }],
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=thu",
      phone: "0954321098",
      bio: "Học sinh cấp 3, muốn cải thiện tiếng Anh cho kỳ thi đại học.",
      school: "THPT Chu Văn An",
      major: "Khoa học tự nhiên",
      year: "Lớp 12",
      memberSince: "08/2025",
      preferredStudyTime: "Buổi chiều (14h - 18h)",
      dailyGoal: "1 Giờ",
      quizDifficulty: "Dễ",
      notifications: true,
      xp: 520,
      streak: 21,
      isBlocked: false,
      isMentorApproved: false,
      createdAt: daysAgo(30),
      updatedAt: now,
    },
    {
      _id: IDS.learnerKhoa,
      name: "Pham Minh Khoa",
      fullName: "Pham Minh Khoa",
      email: "khoa.pm@gmail.com",
      password: passwords.learner,
      role: "Learner",
      roles: [{ roleId: 3, roleName: "Learner" }],
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=khoa",
      phone: "0943210987",
      bio: "Nhân viên kinh doanh, cần IELTS 6.5 để du học.",
      school: "Đại học Thương mại",
      major: "Marketing",
      year: "Đã tốt nghiệp",
      memberSince: "09/2025",
      preferredStudyTime: "Buổi tối (18h - 22h)",
      dailyGoal: "2 Giờ",
      quizDifficulty: "Thích ứng",
      notifications: true,
      xp: 310,
      streak: 5,
      isBlocked: false,
      isMentorApproved: false,
      createdAt: daysAgo(20),
      updatedAt: daysAgo(1),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════
function seedCategories() {
  return [
    { _id: IDS.catToeic, name: "TOEIC", slug: "toeic", code: "TOEIC", description: "Luyện thi TOEIC Listening & Reading chuẩn ETS", color: "bg-blue-50 text-blue-600", count: 12, createdAt: daysAgo(360), updatedAt: daysAgo(10) },
    { _id: IDS.catIelts, name: "IELTS", slug: "ielts", code: "IELTS", description: "Luyện thi IELTS Academic & General Training", color: "bg-green-50 text-green-600", count: 8, createdAt: daysAgo(360), updatedAt: daysAgo(15) },
    { _id: IDS.catGiaoTiep, name: "Giao tiếp", slug: "giao-tiep", code: "COMMUNICATION", description: "Tiếng Anh giao tiếp hàng ngày, tự tin nói chuyện", color: "bg-yellow-50 text-yellow-600", count: 10, createdAt: daysAgo(350), updatedAt: daysAgo(20) },
    { _id: IDS.catNguPhap, name: "Ngữ pháp", slug: "ngu-phap", code: "GRAMMAR", description: "Hệ thống ngữ pháp tiếng Anh từ cơ bản đến nâng cao", color: "bg-purple-50 text-purple-600", count: 6, createdAt: daysAgo(350), updatedAt: daysAgo(25) },
    { _id: IDS.catTuVung, name: "Từ vựng", slug: "tu-vung", code: "VOCABULARY", description: "Học từ vựng theo chủ đề với flashcard và spaced repetition", color: "bg-pink-50 text-pink-600", count: 9, createdAt: daysAgo(340), updatedAt: daysAgo(30) },
    { _id: IDS.catBusiness, name: "Business English", slug: "business-english", code: "BUSINESS", description: "Tiếng Anh thương mại, email, thuyết trình chuyên nghiệp", color: "bg-orange-50 text-orange-600", count: 5, createdAt: daysAgo(320), updatedAt: daysAgo(12) },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. COURSES
// ═══════════════════════════════════════════════════════════════════════════════
function seedCourses() {
  return [
    {
      _id: IDS.courseToeicBasic,
      title: "Ôn thi TOEIC 2026 - Từ cơ bản đến 700+",
      courseName: "Ôn thi TOEIC 2026 - Từ cơ bản đến 700+",
      description: "Khóa học TOEIC toàn diện theo chuẩn ETS 2026. Bao gồm 7 dạng bài Listening và 4 dạng bài Reading. Cam kết đạt 700+ sau 3 tháng học.",
      instructor: "Nguyen Thuy Anh",
      instructorId: IDS.mentorAnh,
      mentorId: null,
      mentorName: null,
      category: "TOEIC",
      categoryId: IDS.catToeic,
      level: "Cơ bản - Nâng cao",
      levelId: 1,
      tags: [{ tagId: id(), tagName: "TOEIC" }, { tagId: id(), tagName: "Luyện thi" }],
      tag: "Phổ biến",
      badge: "ETS 2026",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
      thumbnail: null,
      rating: 4.8,
      students: 12450,
      lessons: 48,
      hours: 36,
      freeLessonsCount: 5,
      price: 499000,
      originalPrice: 999000,
      isPaid: true,
      status: "Active",
      isPublished: true,
      isMentorCourse: false,
      rejectReason: null,
      createdAt: daysAgo(300),
      updatedAt: daysAgo(5),
    },
    {
      _id: IDS.courseToeicAdvanced,
      title: "TOEIC Nâng Cao - Chinh phục 900+",
      courseName: "TOEIC Nâng Cao - Chinh phục 900+",
      description: "Dành cho học viên đã có nền tảng TOEIC 600+. Tập trung vào Part 7 (đọc hiểu đoạn dài) và Part 3, 4 (nghe hội thoại phức tạp).",
      instructor: "Nguyen Thuy Anh",
      instructorId: IDS.mentorAnh,
      mentorId: null,
      category: "TOEIC",
      categoryId: IDS.catToeic,
      level: "Nâng cao",
      levelId: 3,
      tags: [{ tagId: id(), tagName: "TOEIC 900" }, { tagId: id(), tagName: "Nâng cao" }],
      tag: "Bán chạy",
      badge: "ETS 2026",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
      rating: 4.9,
      students: 6890,
      lessons: 36,
      hours: 28,
      freeLessonsCount: 3,
      price: 649000,
      originalPrice: 1299000,
      isPaid: true,
      status: "Active",
      isPublished: true,
      isMentorCourse: false,
      createdAt: daysAgo(250),
      updatedAt: daysAgo(3),
    },
    {
      _id: IDS.courseIelts75,
      title: "IELTS 7.5+ - Học thuật toàn diện",
      courseName: "IELTS 7.5+ - Học thuật toàn diện",
      description: "Khóa học IELTS đầy đủ 4 kỹ năng Listening, Reading, Writing, Speaking. Phương pháp học tập dựa trên thực hành và phân tích lỗi sai.",
      instructor: "Nguyen Thuy Anh",
      instructorId: IDS.mentorAnh,
      mentorId: null,
      category: "IELTS",
      categoryId: IDS.catIelts,
      level: "Trung cấp - Nâng cao",
      levelId: 2,
      tags: [{ tagId: id(), tagName: "IELTS" }, { tagId: id(), tagName: "Academic" }],
      tag: "Mới nhất",
      badge: "IELTS 7.5+",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
      rating: 4.7,
      students: 8920,
      lessons: 56,
      hours: 44,
      freeLessonsCount: 4,
      price: 799000,
      originalPrice: 1499000,
      isPaid: true,
      status: "Active",
      isPublished: true,
      isMentorCourse: false,
      createdAt: daysAgo(200),
      updatedAt: daysAgo(7),
    },
    {
      _id: IDS.courseGiaoTiepHangNgay,
      title: "Tiếng Anh giao tiếp hàng ngày - A1 đến B2",
      courseName: "Tiếng Anh giao tiếp hàng ngày - A1 đến B2",
      description: "Học tiếng Anh giao tiếp qua các tình huống thực tế: mua sắm, đi du lịch, làm việc, kết bạn. Phát âm chuẩn từ đầu.",
      instructor: "Pham Thi Lan",
      instructorId: IDS.mentorLan,
      mentorId: null,
      category: "Giao tiếp",
      categoryId: IDS.catGiaoTiep,
      level: "Cơ bản",
      levelId: 1,
      tags: [{ tagId: id(), tagName: "Giao tiếp" }, { tagId: id(), tagName: "Phát âm" }],
      tag: "Phổ biến",
      badge: null,
      image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400",
      rating: 4.6,
      students: 15600,
      lessons: 40,
      hours: 30,
      freeLessonsCount: 6,
      price: null,
      originalPrice: null,
      isPaid: false,
      status: "Active",
      isPublished: true,
      isMentorCourse: false,
      createdAt: daysAgo(180),
      updatedAt: daysAgo(4),
    },
    {
      _id: IDS.courseBusinessEnglish,
      title: "Business English Chuyên nghiệp",
      courseName: "Business English Chuyên nghiệp",
      description: "Email, thuyết trình, đàm phán, họp hành bằng tiếng Anh. Dành cho nhân viên văn phòng và quản lý muốn nâng cấp kỹ năng chuyên môn.",
      instructor: "Le Minh Tuan",
      instructorId: IDS.mentorTuan,
      mentorId: null,
      category: "Business English",
      categoryId: IDS.catBusiness,
      level: "Trung cấp",
      levelId: 2,
      tags: [{ tagId: id(), tagName: "Business" }, { tagId: id(), tagName: "Email" }],
      tag: "Bán chạy",
      badge: null,
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400",
      rating: 4.8,
      students: 4320,
      lessons: 32,
      hours: 24,
      freeLessonsCount: 3,
      price: 599000,
      originalPrice: 1199000,
      isPaid: true,
      status: "Active",
      isPublished: true,
      isMentorCourse: false,
      createdAt: daysAgo(150),
      updatedAt: daysAgo(6),
    },
    {
      _id: IDS.courseMentorOrigami,
      title: "Từ vựng qua nghệ thuật Origami",
      courseName: "Từ vựng qua nghệ thuật Origami",
      description: "Khóa học đặc biệt: học từ vựng tiếng Anh qua các hướng dẫn gấp giấy Origami bằng tiếng Anh. Vừa học ngôn ngữ, vừa thư giãn.",
      instructor: "Pham Thi Lan",
      instructorId: IDS.mentorLan,
      mentorId: IDS.mentorLan,
      mentorName: "Pham Thi Lan",
      mentorEmail: "mentor.lan@wdp.edu.vn",
      category: "Từ vựng",
      categoryId: IDS.catTuVung,
      level: "Cơ bản",
      levelId: 1,
      tags: [{ tagId: id(), tagName: "Từ vựng" }, { tagId: id(), tagName: "Origami" }],
      tag: "Mentor",
      badge: null,
      image: "https://images.unsplash.com/photo-1615473967657-9dc21773bf68?w=400",
      rating: 4.5,
      students: 890,
      lessons: 12,
      hours: 6,
      freeLessonsCount: 3,
      price: null,
      originalPrice: null,
      isPaid: false,
      status: "Active",
      isPublished: true,
      isMentorCourse: true,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(2),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. MODULES
// ═══════════════════════════════════════════════════════════════════════════════
function seedModules() {
  return [
    // TOEIC Basic
    { _id: IDS.modToeic1, courseId: IDS.courseToeicBasic, title: "Module 1: Giới thiệu & Định hướng TOEIC", order: 1, createdAt: daysAgo(300), updatedAt: daysAgo(300) },
    { _id: IDS.modToeic2, courseId: IDS.courseToeicBasic, title: "Module 2: Listening - Part 1 & 2 (Photographs & Q&A)", order: 2, createdAt: daysAgo(300), updatedAt: daysAgo(300) },
    { _id: IDS.modToeic3, courseId: IDS.courseToeicBasic, title: "Module 3: Reading - Part 5 (Incomplete Sentences)", order: 3, createdAt: daysAgo(300), updatedAt: daysAgo(300) },
    // IELTS
    { _id: IDS.modIelts1, courseId: IDS.courseIelts75, title: "Module 1: IELTS Listening - Section 1 & 2", order: 1, createdAt: daysAgo(200), updatedAt: daysAgo(200) },
    { _id: IDS.modIelts2, courseId: IDS.courseIelts75, title: "Module 2: IELTS Writing - Task 1 (Academic)", order: 2, createdAt: daysAgo(200), updatedAt: daysAgo(200) },
    // Giao tiếp
    { _id: IDS.modGT1, courseId: IDS.courseGiaoTiepHangNgay, title: "Module 1: Chào hỏi & Giới thiệu bản thân", order: 1, createdAt: daysAgo(180), updatedAt: daysAgo(180) },
    { _id: IDS.modGT2, courseId: IDS.courseGiaoTiepHangNgay, title: "Module 2: Tại nhà hàng & Mua sắm", order: 2, createdAt: daysAgo(180), updatedAt: daysAgo(180) },
    // Business
    { _id: IDS.modBiz1, courseId: IDS.courseBusinessEnglish, title: "Module 1: Business Email Chuyên nghiệp", order: 1, createdAt: daysAgo(150), updatedAt: daysAgo(150) },
    { _id: IDS.modBiz2, courseId: IDS.courseBusinessEnglish, title: "Module 2: Thuyết trình & Họp hành", order: 2, createdAt: daysAgo(150), updatedAt: daysAgo(150) },
    // Mentor Origami
    { _id: IDS.modMentor1, courseId: IDS.courseMentorOrigami, title: "Module 1: Từ vựng Origami cơ bản", order: 1, createdAt: daysAgo(60), updatedAt: daysAgo(60) },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. LESSONS
// ═══════════════════════════════════════════════════════════════════════════════
function seedLessons() {
  return [
    // TOEIC Module 1
    { _id: IDS.lesT1L1, moduleId: IDS.modToeic1, courseId: IDS.courseToeicBasic, title: "Giới thiệu cấu trúc đề thi TOEIC", type: "video", order: 1, duration: "8:45", free: true, videoUrl: "https://www.youtube.com/watch?v=example1", createdAt: daysAgo(300), updatedAt: daysAgo(300) },
    { _id: IDS.lesT1L2, moduleId: IDS.modToeic1, courseId: IDS.courseToeicBasic, title: "Chiến lược làm bài tổng quát", type: "document", order: 2, duration: "15 phút đọc", free: true, document: { title: "TOEIC Strategy Guide", content: "Chiến lược 1: Làm Part 5 trước (15 phút)...\nChiến lược 2: Không đọc kỹ câu hỏi Part 7..." }, createdAt: daysAgo(300), updatedAt: daysAgo(300) },
    { _id: IDS.lesT1L3, moduleId: IDS.modToeic1, courseId: IDS.courseToeicBasic, title: "Quiz: Kiểm tra kiến thức ban đầu", type: "quiz", order: 3, duration: "10 câu", free: true, questions: [{ text: "TOEIC Listening có bao nhiêu phần?", options: ["3 phần", "4 phần", "5 phần", "6 phần"], correctIndex: 1, explanation: "TOEIC Listening có 4 phần: Part 1, 2, 3, 4." }, { text: "Thời gian làm bài TOEIC Reading là bao lâu?", options: ["60 phút", "75 phút", "90 phút", "120 phút"], correctIndex: 1, explanation: "TOEIC Reading có 75 phút, Listening 45 phút." }], createdAt: daysAgo(300), updatedAt: daysAgo(300) },
    { _id: IDS.lesT1L4, moduleId: IDS.modToeic1, courseId: IDS.courseToeicBasic, title: "Score Range và mục tiêu học tập", type: "video", order: 4, duration: "6:20", free: false, videoUrl: "https://www.youtube.com/watch?v=example2", createdAt: daysAgo(300), updatedAt: daysAgo(300) },
    // TOEIC Module 2
    { _id: IDS.lesT2L1, moduleId: IDS.modToeic2, courseId: IDS.courseToeicBasic, title: "Part 1: Photographs - Kỹ thuật mô tả ảnh", type: "video", order: 1, duration: "12:30", free: false, videoUrl: "https://www.youtube.com/watch?v=example3", createdAt: daysAgo(295), updatedAt: daysAgo(295) },
    { _id: IDS.lesT2L2, moduleId: IDS.modToeic2, courseId: IDS.courseToeicBasic, title: "Part 2: Question-Response - 7 dạng câu hỏi", type: "video", order: 2, duration: "15:10", free: false, videoUrl: "https://www.youtube.com/watch?v=example4", createdAt: daysAgo(295), updatedAt: daysAgo(295) },
    { _id: IDS.lesT2L3, moduleId: IDS.modToeic2, courseId: IDS.courseToeicBasic, title: "Quiz: Part 1 & 2 Practice", type: "quiz", order: 3, duration: "20 câu", free: false, questions: [{ text: "Khi nghe Part 1, điều đầu tiên cần chú ý là gì?", options: ["Màu sắc", "Hành động của người trong ảnh", "Địa điểm", "Thời gian"], correctIndex: 1, explanation: "Chú ý hành động (action verbs) là quan trọng nhất trong Part 1." }], createdAt: daysAgo(295), updatedAt: daysAgo(295) },
    // TOEIC Module 3
    { _id: IDS.lesT3L1, moduleId: IDS.modToeic3, courseId: IDS.courseToeicBasic, title: "Part 5: Nhận biết từ loại (Word Form)", type: "video", order: 1, duration: "18:00", free: false, videoUrl: "https://www.youtube.com/watch?v=example5", createdAt: daysAgo(290), updatedAt: daysAgo(290) },
    { _id: IDS.lesT3L2, moduleId: IDS.modToeic3, courseId: IDS.courseToeicBasic, title: "Từ vựng Part 5: Finance & Accounting", type: "document", order: 2, duration: "20 phút đọc", free: false, document: { title: "Finance Vocabulary List", content: "budget (n) - ngân sách\nrevenue (n) - doanh thu\nexpenditure (n) - chi tiêu\nasset (n) - tài sản\nliability (n) - nợ phải trả" }, createdAt: daysAgo(290), updatedAt: daysAgo(290) },
    // IELTS Module 1
    { _id: IDS.lesI1L1, moduleId: IDS.modIelts1, courseId: IDS.courseIelts75, title: "IELTS Listening Section 1: Form Completion", type: "video", order: 1, duration: "20:15", free: true, videoUrl: "https://www.youtube.com/watch?v=example6", createdAt: daysAgo(200), updatedAt: daysAgo(200) },
    { _id: IDS.lesI1L2, moduleId: IDS.modIelts1, courseId: IDS.courseIelts75, title: "Dự đoán câu trả lời trước khi nghe", type: "video", order: 2, duration: "14:30", free: false, videoUrl: "https://www.youtube.com/watch?v=example7", createdAt: daysAgo(200), updatedAt: daysAgo(200) },
    { _id: IDS.lesI1L3, moduleId: IDS.modIelts1, courseId: IDS.courseIelts75, title: "Quiz: Listening Section 1 Practice", type: "quiz", order: 3, duration: "10 câu", free: false, questions: [{ text: "Trong Listening Section 1, bạn thường nghe về điều gì?", options: ["Diễn thuyết khoa học", "Cuộc trò chuyện đời thường", "Podcast", "Tin tức"], correctIndex: 1, explanation: "Section 1 thường là cuộc trò chuyện giữa 2 người về chủ đề đời thường." }], createdAt: daysAgo(200), updatedAt: daysAgo(200) },
    // IELTS Module 2
    { _id: IDS.lesI2L1, moduleId: IDS.modIelts2, courseId: IDS.courseIelts75, title: "Writing Task 1: Mô tả biểu đồ Line Graph", type: "video", order: 1, duration: "25:00", free: false, videoUrl: "https://www.youtube.com/watch?v=example8", createdAt: daysAgo(195), updatedAt: daysAgo(195) },
    { _id: IDS.lesI2L2, moduleId: IDS.modIelts2, courseId: IDS.courseIelts75, title: "Cấu trúc bài Writing Task 1 Band 7+", type: "document", order: 2, duration: "15 phút đọc", free: false, document: { title: "Writing Task 1 Template", content: "Paragraph 1 - Overview: The graph shows/illustrates...\nParagraph 2 - Main trend: Overall, it is clear that...\nParagraph 3 - Details: Looking at the data in more detail..." }, createdAt: daysAgo(195), updatedAt: daysAgo(195) },
    // Giao tiếp Module 1
    { _id: IDS.lesG1L1, moduleId: IDS.modGT1, courseId: IDS.courseGiaoTiepHangNgay, title: "Chào hỏi cơ bản - Hello, Hi, Hey!", type: "video", order: 1, duration: "10:00", free: true, videoUrl: "https://www.youtube.com/watch?v=example9", createdAt: daysAgo(180), updatedAt: daysAgo(180) },
    { _id: IDS.lesG1L2, moduleId: IDS.modGT1, courseId: IDS.courseGiaoTiepHangNgay, title: "Giới thiệu bản thân - My name is...", type: "video", order: 2, duration: "12:30", free: true, videoUrl: "https://www.youtube.com/watch?v=example10", createdAt: daysAgo(180), updatedAt: daysAgo(180) },
    // Giao tiếp Module 2
    { _id: IDS.lesG2L1, moduleId: IDS.modGT2, courseId: IDS.courseGiaoTiepHangNgay, title: "Gọi món tại nhà hàng - Can I have...?", type: "video", order: 1, duration: "11:15", free: false, videoUrl: "https://www.youtube.com/watch?v=example11", createdAt: daysAgo(175), updatedAt: daysAgo(175) },
    { _id: IDS.lesG2L2, moduleId: IDS.modGT2, courseId: IDS.courseGiaoTiepHangNgay, title: "Mua sắm - How much does it cost?", type: "video", order: 2, duration: "9:45", free: false, videoUrl: "https://www.youtube.com/watch?v=example12", createdAt: daysAgo(175), updatedAt: daysAgo(175) },
    // Business Module 1
    { _id: IDS.lesB1L1, moduleId: IDS.modBiz1, courseId: IDS.courseBusinessEnglish, title: "Cấu trúc email tiếng Anh chuyên nghiệp", type: "video", order: 1, duration: "16:00", free: true, videoUrl: "https://www.youtube.com/watch?v=example13", createdAt: daysAgo(150), updatedAt: daysAgo(150) },
    { _id: IDS.lesB1L2, moduleId: IDS.modBiz1, courseId: IDS.courseBusinessEnglish, title: "50 câu mẫu email văn phòng", type: "document", order: 2, duration: "25 phút đọc", free: false, document: { title: "Business Email Phrases", content: "Opening: I hope this email finds you well.\nRequest: I would like to kindly request...\nFollowing up: I am writing to follow up on...\nClosing: Please do not hesitate to contact me if you have any questions." }, createdAt: daysAgo(150), updatedAt: daysAgo(150) },
    // Business Module 2
    { _id: IDS.lesB2L1, moduleId: IDS.modBiz2, courseId: IDS.courseBusinessEnglish, title: "Mở đầu thuyết trình - Opening phrases", type: "video", order: 1, duration: "14:20", free: false, videoUrl: "https://www.youtube.com/watch?v=example14", createdAt: daysAgo(145), updatedAt: daysAgo(145) },
    // Mentor Origami
    { _id: IDS.lesM1L1, moduleId: IDS.modMentor1, courseId: IDS.courseMentorOrigami, title: "Fold & Learn: Origami Crane - Bird Vocabulary", type: "video", order: 1, duration: "15:00", free: true, videoUrl: "https://www.youtube.com/watch?v=example15", createdAt: daysAgo(60), updatedAt: daysAgo(60) },
    { _id: IDS.lesM1L2, moduleId: IDS.modMentor1, courseId: IDS.courseMentorOrigami, title: "Danh sách từ vựng - Origami Crane", type: "document", order: 2, duration: "10 phút đọc", free: true, document: { title: "Crane Vocabulary", content: "fold (v) - gấp\ncreate (v) - tạo ra\npaper (n) - giấy\ncrease (n) - nếp gấp\nwing (n) - cánh\nbeak (n) - mỏ\ndiagonal (adj) - đường chéo" }, createdAt: daysAgo(60), updatedAt: daysAgo(60) },
    { _id: IDS.lesM1L3, moduleId: IDS.modMentor1, courseId: IDS.courseMentorOrigami, title: "Quiz: Origami Vocabulary Test", type: "quiz", order: 3, duration: "7 câu", free: false, questions: [{ text: "Từ 'fold' có nghĩa là gì?", options: ["Cắt", "Gấp", "Dán", "Vẽ"], correctIndex: 1, explanation: "Fold = gấp (giấy). Ví dụ: Fold the paper in half." }, { text: "Từ nào mô tả đường chéo?", options: ["Vertical", "Horizontal", "Diagonal", "Parallel"], correctIndex: 2, explanation: "Diagonal = đường chéo, góc 45 độ." }], createdAt: daysAgo(60), updatedAt: daysAgo(60) },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. QUIZ_QUESTIONS (collection riêng - system quizzes)
// ═══════════════════════════════════════════════════════════════════════════════
function seedQuizQuestions() {
  const questions = [];
  // TOEIC vocabulary questions
  const toeicVocab = [
    { q: "Từ 'abandon' có nghĩa là gì?", opts: ["Giữ lại", "Từ bỏ, rời bỏ", "Chấp nhận", "Xây dựng"], correct: 1, exp: "Abandon = từ bỏ, rời bỏ (ai/cái gì). VD: He abandoned his car." },
    { q: "Từ 'accommodate' có nghĩa là gì?", opts: ["Từ chối", "Cải tiến", "Đáp ứng, chứa đủ", "Tổ chức"], correct: 2, exp: "Accommodate = đáp ứng nhu cầu, cung cấp chỗ ở. VD: The hotel can accommodate 200 guests." },
    { q: "Từ 'adjacent' có nghĩa là gì?", opts: ["Xa xôi", "Liền kề, gần kề", "Chuyên biệt", "Trung tâm"], correct: 1, exp: "Adjacent = liền kề, tiếp giáp. VD: The office is adjacent to the parking lot." },
    { q: "Từ 'annual' có nghĩa là gì?", opts: ["Hàng tuần", "Hàng tháng", "Hàng năm", "Hàng ngày"], correct: 2, exp: "Annual = hàng năm. VD: Annual salary = lương hàng năm." },
    { q: "Trong câu 'The report was ____ by the manager', điền từ nào?", opts: ["approve", "approving", "approved", "approval"], correct: 2, exp: "Passive voice: was + past participle = approved." },
  ];
  toeicVocab.forEach((item, i) => {
    questions.push({
      _id: id(),
      lessonId: i < 3 ? IDS.lesT2L3 : IDS.lesT3L1,
      moduleId: i < 3 ? IDS.modToeic2 : IDS.modToeic3,
      courseId: IDS.courseToeicBasic,
      question: item.q,
      options: item.opts,
      correct: item.correct,
      explanation: item.exp,
      difficulty: i < 2 ? "easy" : i < 4 ? "medium" : "hard",
      tags: ["TOEIC", "Vocabulary"],
      createdAt: daysAgo(280),
      updatedAt: daysAgo(280),
    });
  });

  // IELTS questions
  const ieltsQ = [
    { q: "Trong IELTS Writing Task 2, số từ tối thiểu là bao nhiêu?", opts: ["150 từ", "200 từ", "250 từ", "300 từ"], correct: 2, exp: "Task 2 yêu cầu tối thiểu 250 từ, Task 1 là 150 từ." },
    { q: "Band score IELTS nào tương đương với trình độ B2 (upper-intermediate)?", opts: ["Band 4.5-5.0", "Band 5.5-6.0", "Band 6.5-7.0", "Band 7.5+"], correct: 1, exp: "B2 tương đương IELTS 5.5-6.0 theo khung CEFR." },
  ];
  ieltsQ.forEach((item) => {
    questions.push({
      _id: id(),
      lessonId: IDS.lesI1L3,
      moduleId: IDS.modIelts1,
      courseId: IDS.courseIelts75,
      question: item.q,
      options: item.opts,
      correct: item.correct,
      explanation: item.exp,
      difficulty: "medium",
      tags: ["IELTS", "General"],
      createdAt: daysAgo(190),
      updatedAt: daysAgo(190),
    });
  });

  return questions;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. DOCUMENTS
// ═══════════════════════════════════════════════════════════════════════════════
function seedDocuments() {
  return [
    {
      _id: id(),
      lessonId: IDS.lesT1L2,
      moduleId: IDS.modToeic1,
      courseId: IDS.courseToeicBasic,
      title: "TOEIC Strategy Guide - Full Version",
      type: "pdf",
      content: null,
      fileUrl: "/uploads/documents/toeic-strategy-guide.pdf",
      fileSize: "3.2 MB",
      pages: 28,
      createdAt: daysAgo(298),
      updatedAt: daysAgo(298),
    },
    {
      _id: id(),
      lessonId: IDS.lesT3L2,
      moduleId: IDS.modToeic3,
      courseId: IDS.courseToeicBasic,
      title: "Finance Vocabulary Flashcards",
      type: "flashcard",
      content: "budget - ngân sách | revenue - doanh thu | expenditure - chi tiêu | asset - tài sản",
      fileUrl: null,
      fileSize: null,
      pages: null,
      createdAt: daysAgo(288),
      updatedAt: daysAgo(288),
    },
    {
      _id: id(),
      lessonId: IDS.lesI2L2,
      moduleId: IDS.modIelts2,
      courseId: IDS.courseIelts75,
      title: "IELTS Writing Task 1 - Band 7 Sample Answers",
      type: "pdf",
      content: null,
      fileUrl: "/uploads/documents/ielts-writing-task1-samples.pdf",
      fileSize: "5.1 MB",
      pages: 42,
      createdAt: daysAgo(193),
      updatedAt: daysAgo(193),
    },
    {
      _id: id(),
      lessonId: IDS.lesB1L2,
      moduleId: IDS.modBiz1,
      courseId: IDS.courseBusinessEnglish,
      title: "100 Business Email Templates",
      type: "doc",
      content: null,
      fileUrl: "/uploads/documents/business-email-templates.docx",
      fileSize: "1.8 MB",
      pages: 35,
      createdAt: daysAgo(148),
      updatedAt: daysAgo(148),
    },
    {
      _id: id(),
      lessonId: IDS.lesM1L2,
      moduleId: IDS.modMentor1,
      courseId: IDS.courseMentorOrigami,
      title: "Origami Vocabulary Flashcards",
      type: "flashcard",
      content: "fold - gấp | crease - nếp gấp | diagonal - đường chéo | wing - cánh | beak - mỏ",
      fileUrl: null,
      fileSize: null,
      pages: null,
      createdAt: daysAgo(58),
      updatedAt: daysAgo(58),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. ENROLLMENTS
// ═══════════════════════════════════════════════════════════════════════════════
function seedEnrollments() {
  return [
    {
      _id: IDS.enrollMinhToeic,
      userId: IDS.learnerMinh,
      courseId: IDS.courseToeicBasic,
      enrolledAt: daysAgo(100),
      expiresAt: daysFromNow(265),
      status: "active",
      progress: 65,
      totalLessons: 48,
      completedLessons: 31,
      streak: 7,
      lastActivity: daysAgo(0),
      nextLesson: "Module 3: Reading - Part 5",
      documents: 8,
      quizzes: 6,
      completedQuizzes: 4,
      createdAt: daysAgo(100),
      updatedAt: now,
    },
    {
      _id: IDS.enrollMinhIelts,
      userId: IDS.learnerMinh,
      courseId: IDS.courseGiaoTiepHangNgay,
      enrolledAt: daysAgo(80),
      expiresAt: null,
      status: "active",
      progress: 30,
      totalLessons: 40,
      completedLessons: 12,
      streak: 3,
      lastActivity: daysAgo(2),
      nextLesson: "Module 2: Tại nhà hàng",
      documents: 4,
      quizzes: 3,
      completedQuizzes: 1,
      createdAt: daysAgo(80),
      updatedAt: daysAgo(2),
    },
    {
      _id: IDS.enrollHoaToeic,
      userId: IDS.learnerHoa,
      courseId: IDS.courseToeicBasic,
      enrolledAt: daysAgo(150),
      expiresAt: daysFromNow(215),
      status: "active",
      progress: 85,
      totalLessons: 48,
      completedLessons: 41,
      streak: 8,
      lastActivity: daysAgo(1),
      nextLesson: "Module 3: Reading - Part 7",
      documents: 8,
      quizzes: 6,
      completedQuizzes: 6,
      createdAt: daysAgo(150),
      updatedAt: daysAgo(1),
    },
    {
      _id: IDS.enrollHoaGT,
      userId: IDS.learnerHoa,
      courseId: IDS.courseGiaoTiepHangNgay,
      enrolledAt: daysAgo(90),
      expiresAt: null,
      status: "completed",
      progress: 100,
      totalLessons: 40,
      completedLessons: 40,
      streak: 0,
      lastActivity: daysAgo(10),
      nextLesson: null,
      documents: 6,
      quizzes: 5,
      completedQuizzes: 5,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
    {
      _id: IDS.enrollDucBiz,
      userId: IDS.learnerDuc,
      courseId: IDS.courseBusinessEnglish,
      enrolledAt: daysAgo(50),
      expiresAt: daysFromNow(315),
      status: "active",
      progress: 20,
      totalLessons: 32,
      completedLessons: 6,
      streak: 3,
      lastActivity: daysAgo(2),
      nextLesson: "Module 1: Business Email - Lesson 3",
      documents: 4,
      quizzes: 3,
      completedQuizzes: 1,
      createdAt: daysAgo(50),
      updatedAt: daysAgo(2),
    },
    // Free enrollments (no payment)
    {
      _id: id(),
      userId: IDS.learnerThu,
      courseId: IDS.courseGiaoTiepHangNgay,
      enrolledAt: daysAgo(28),
      expiresAt: null,
      status: "active",
      progress: 45,
      totalLessons: 40,
      completedLessons: 18,
      streak: 21,
      lastActivity: now,
      nextLesson: "Module 2: Mua sắm",
      documents: 3,
      quizzes: 2,
      completedQuizzes: 2,
      createdAt: daysAgo(28),
      updatedAt: now,
    },
    {
      _id: id(),
      userId: IDS.learnerKhoa,
      courseId: IDS.courseIelts75,
      enrolledAt: daysAgo(18),
      expiresAt: daysFromNow(347),
      status: "active",
      progress: 10,
      totalLessons: 56,
      completedLessons: 6,
      streak: 5,
      lastActivity: daysAgo(1),
      nextLesson: "Module 1: IELTS Listening Section 2",
      documents: 2,
      quizzes: 2,
      completedQuizzes: 1,
      createdAt: daysAgo(18),
      updatedAt: daysAgo(1),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. LEARNING_PROGRESS
// ═══════════════════════════════════════════════════════════════════════════════
function seedLearningProgress() {
  return [
    {
      _id: id(),
      userId: IDS.learnerMinh,
      courseId: IDS.courseToeicBasic,
      enrollmentId: IDS.enrollMinhToeic,
      completedLessons: [IDS.lesT1L1, IDS.lesT1L2, IDS.lesT1L3, IDS.lesT1L4, IDS.lesT2L1, IDS.lesT2L2],
      currentLessonId: IDS.lesT2L3,
      currentModuleId: IDS.modToeic2,
      quizScores: {
        [IDS.lesT1L3.toString()]: { score: 2, total: 2, percentage: 100, passed: true, date: daysAgo(90), attempts: 1 },
        [IDS.lesT2L3.toString()]: { score: 18, total: 20, percentage: 90, passed: true, date: daysAgo(20), attempts: 2 },
      },
      documentsRead: [IDS.lesT1L2],
      videoProgress: {
        [IDS.lesT1L1.toString()]: { watchedSeconds: 525, totalSeconds: 525, completed: true },
        [IDS.lesT2L1.toString()]: { watchedSeconds: 750, totalSeconds: 750, completed: true },
        [IDS.lesT2L2.toString()]: { watchedSeconds: 910, totalSeconds: 910, completed: true },
      },
      lastAccessedAt: now,
      completedAt: null,
      createdAt: daysAgo(100),
      updatedAt: now,
    },
    {
      _id: id(),
      userId: IDS.learnerHoa,
      courseId: IDS.courseGiaoTiepHangNgay,
      enrollmentId: IDS.enrollHoaGT,
      completedLessons: [IDS.lesG1L1, IDS.lesG1L2, IDS.lesG2L1, IDS.lesG2L2],
      currentLessonId: null,
      currentModuleId: null,
      quizScores: {},
      documentsRead: [],
      videoProgress: {
        [IDS.lesG1L1.toString()]: { watchedSeconds: 600, totalSeconds: 600, completed: true },
        [IDS.lesG1L2.toString()]: { watchedSeconds: 750, totalSeconds: 750, completed: true },
        [IDS.lesG2L1.toString()]: { watchedSeconds: 675, totalSeconds: 675, completed: true },
        [IDS.lesG2L2.toString()]: { watchedSeconds: 585, totalSeconds: 585, completed: true },
      },
      lastAccessedAt: daysAgo(10),
      completedAt: daysAgo(10),
      createdAt: daysAgo(90),
      updatedAt: daysAgo(10),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. STREAKS
// ═══════════════════════════════════════════════════════════════════════════════
function seedStreaks() {
  // Build history for Minh (15-day streak)
  const minhHistory = {};
  for (let i = 0; i < 20; i++) {
    const d = daysAgo(i);
    const ds = dateStr(d);
    if (i < 15) {
      minhHistory[ds] = { studied: true, xp: 30 + Math.floor(Math.random() * 40), lessonsCompleted: 1 + Math.floor(Math.random() * 3), quizzesDone: Math.floor(Math.random() * 2), minutesStudied: 30 + Math.floor(Math.random() * 60) };
    } else {
      minhHistory[ds] = { studied: false, xp: 0, lessonsCompleted: 0, quizzesDone: 0, minutesStudied: 0 };
    }
  }

  const thuHistory = {};
  for (let i = 0; i < 25; i++) {
    const ds = dateStr(daysAgo(i));
    thuHistory[ds] = { studied: i < 21, xp: i < 21 ? 20 + Math.floor(Math.random() * 30) : 0, lessonsCompleted: i < 21 ? 1 : 0, quizzesDone: 0, minutesStudied: i < 21 ? 20 + Math.floor(Math.random() * 40) : 0 };
  }

  return [
    {
      _id: id(),
      userId: IDS.learnerMinh,
      currentStreak: 15,
      longestStreak: 23,
      lastStudyDate: dateStr(now),
      totalXp: 2450,
      freezes: 1,
      history: minhHistory,
      milestones: [3, 7, 14],
      createdAt: daysAgo(120),
      updatedAt: now,
    },
    {
      _id: id(),
      userId: IDS.learnerHoa,
      currentStreak: 8,
      longestStreak: 32,
      lastStudyDate: dateStr(daysAgo(1)),
      totalXp: 1820,
      freezes: 2,
      history: {},
      milestones: [3, 7],
      createdAt: daysAgo(180),
      updatedAt: daysAgo(1),
    },
    {
      _id: id(),
      userId: IDS.learnerThu,
      currentStreak: 21,
      longestStreak: 21,
      lastStudyDate: dateStr(now),
      totalXp: 520,
      freezes: 0,
      history: thuHistory,
      milestones: [3, 7, 14, 21],
      createdAt: daysAgo(30),
      updatedAt: now,
    },
    {
      _id: id(),
      userId: IDS.learnerDuc,
      currentStreak: 3,
      longestStreak: 10,
      lastStudyDate: dateStr(daysAgo(1)),
      totalXp: 980,
      freezes: 1,
      history: {},
      milestones: [3],
      createdAt: daysAgo(60),
      updatedAt: daysAgo(1),
    },
    {
      _id: id(),
      userId: IDS.learnerKhoa,
      currentStreak: 5,
      longestStreak: 7,
      lastStudyDate: dateStr(daysAgo(1)),
      totalXp: 310,
      freezes: 0,
      history: {},
      milestones: [3],
      createdAt: daysAgo(20),
      updatedAt: daysAgo(1),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. PAYMENTS
// ═══════════════════════════════════════════════════════════════════════════════
function seedPayments() {
  return [
    {
      _id: IDS.payMinhToeic,
      userId: IDS.learnerMinh,
      courseId: IDS.courseToeicBasic,
      enrollmentId: IDS.enrollMinhToeic,
      amount: 499000,
      originalAmount: 999000,
      discount: 500000,
      discountPercent: 50,
      currency: "VND",
      method: "momo",
      methodName: "Ví MoMo",
      status: "completed",
      transactionId: "MOMO20260527001",
      paidAt: daysAgo(100),
      createdAt: daysAgo(100),
      updatedAt: daysAgo(100),
    },
    {
      _id: IDS.payHoaToeic,
      userId: IDS.learnerHoa,
      courseId: IDS.courseToeicBasic,
      enrollmentId: IDS.enrollHoaToeic,
      amount: 499000,
      originalAmount: 999000,
      discount: 500000,
      discountPercent: 50,
      currency: "VND",
      method: "vnpay",
      methodName: "VNPay",
      status: "completed",
      transactionId: "VNPAY20260327001",
      paidAt: daysAgo(150),
      createdAt: daysAgo(150),
      updatedAt: daysAgo(150),
    },
    {
      _id: IDS.payDucBiz,
      userId: IDS.learnerDuc,
      courseId: IDS.courseBusinessEnglish,
      enrollmentId: IDS.enrollDucBiz,
      amount: 599000,
      originalAmount: 1199000,
      discount: 600000,
      discountPercent: 50,
      currency: "VND",
      method: "zalopay",
      methodName: "ZaloPay",
      status: "completed",
      transactionId: "ZALO20261107001",
      paidAt: daysAgo(50),
      createdAt: daysAgo(50),
      updatedAt: daysAgo(50),
    },
    {
      _id: id(),
      userId: IDS.learnerKhoa,
      courseId: IDS.courseIelts75,
      enrollmentId: null,
      amount: 799000,
      originalAmount: 1499000,
      discount: 700000,
      discountPercent: 47,
      currency: "VND",
      method: "bank",
      methodName: "Chuyển khoản ngân hàng",
      status: "completed",
      transactionId: "BANK20261209001",
      paidAt: daysAgo(18),
      createdAt: daysAgo(18),
      updatedAt: daysAgo(18),
    },
    // Failed payment example
    {
      _id: id(),
      userId: IDS.learnerMinh,
      courseId: IDS.courseIelts75,
      enrollmentId: null,
      amount: 799000,
      originalAmount: 1499000,
      discount: 700000,
      discountPercent: 47,
      currency: "VND",
      method: "card",
      methodName: "Thẻ tín dụng/ghi nợ",
      status: "failed",
      transactionId: null,
      paidAt: null,
      createdAt: daysAgo(15),
      updatedAt: daysAgo(15),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 12. MENTOR_APPLICATIONS
// ═══════════════════════════════════════════════════════════════════════════════
function seedMentorApplications() {
  return [
    {
      _id: IDS.appMentorAnh,
      userId: IDS.mentorAnh,
      fullName: "Nguyen Thuy Anh",
      email: "mentor.anh@wdp.edu.vn",
      phone: "0912345601",
      bio: "Giảng viên TOEIC & IELTS với 10 năm kinh nghiệm.",
      experience: "Đã đạt chứng chỉ IELTS 8.5 và TOEIC 990. Giảng dạy tại nhiều trung tâm lớn.",
      portfolioUrl: "https://thuyanhteaches.com",
      certificate: "/uploads/certificates/anh-ielts-cert.pdf",
      certificatePath: "/uploads/certificates/anh-ielts-cert.pdf",
      cvUrl: "/uploads/cvs/anh-cv.pdf",
      status: "Approved",
      reviewedBy: IDS.adminUser,
      reviewNote: "Hồ sơ đầy đủ, chứng chỉ rõ ràng, kinh nghiệm phong phú.",
      rejectReason: null,
      isReadByAdmin: true,
      submittedAt: daysAgo(310),
      reviewedAt: daysAgo(305),
      createdAt: daysAgo(310),
      updatedAt: daysAgo(305),
    },
    {
      _id: IDS.appMentorTuan,
      userId: IDS.mentorTuan,
      fullName: "Le Minh Tuan",
      email: "mentor.tuan@wdp.edu.vn",
      phone: "0912345602",
      bio: "Chuyên gia Business English với MBA tại RMIT.",
      experience: "7 năm đào tạo cho Samsung, FPT, Vingroup.",
      portfolioUrl: null,
      certificate: "/uploads/certificates/tuan-mba-cert.pdf",
      certificatePath: "/uploads/certificates/tuan-mba-cert.pdf",
      cvUrl: "/uploads/cvs/tuan-cv.pdf",
      status: "Approved",
      reviewedBy: IDS.adminUser,
      reviewNote: "Kinh nghiệm doanh nghiệp xuất sắc.",
      rejectReason: null,
      isReadByAdmin: true,
      submittedAt: daysAgo(290),
      reviewedAt: daysAgo(285),
      createdAt: daysAgo(290),
      updatedAt: daysAgo(285),
    },
    // Pending application
    {
      _id: id(),
      userId: IDS.learnerMinh, // Minh applying to be mentor
      fullName: "Tran Van Minh",
      email: "minh.tv@gmail.com",
      phone: "0987654321",
      bio: "Sinh viên CNTT có khả năng dạy lập trình bằng tiếng Anh.",
      experience: "Thực tập tại FPT 6 tháng, điểm TOEIC 750.",
      portfolioUrl: "https://github.com/minhtvdev",
      certificate: "/uploads/certificates/minh-toeic.pdf",
      certificatePath: "/uploads/certificates/minh-toeic.pdf",
      cvUrl: "/uploads/cvs/minh-cv.pdf",
      status: "Pending",
      reviewedBy: null,
      reviewNote: null,
      rejectReason: null,
      isReadByAdmin: false,
      submittedAt: daysAgo(5),
      reviewedAt: null,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 13. CATEGORY_HISTORY
// ═══════════════════════════════════════════════════════════════════════════════
function seedCategoryHistory() {
  return [
    { _id: id(), action: "CREATED", categoryName: "TOEIC", target: "TOEIC", actorName: "Admin WDP", actor: "admin@wdp.edu.vn", timestamp: daysAgo(360).toLocaleString("vi-VN") },
    { _id: id(), action: "CREATED", categoryName: "IELTS", target: "IELTS", actorName: "Admin WDP", actor: "admin@wdp.edu.vn", timestamp: daysAgo(360).toLocaleString("vi-VN") },
    { _id: id(), action: "CREATED", categoryName: "Giao tiếp", target: "Giao tiếp", actorName: "Admin WDP", actor: "admin@wdp.edu.vn", timestamp: daysAgo(350).toLocaleString("vi-VN") },
    { _id: id(), action: "UPDATED", categoryName: "Business English", target: "Business English", actorName: "Admin WDP", actor: "admin@wdp.edu.vn", timestamp: daysAgo(12).toLocaleString("vi-VN") },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 14. REVIEWS
// ═══════════════════════════════════════════════════════════════════════════════
function seedReviews() {
  return [
    {
      _id: id(),
      userId: IDS.learnerMinh,
      courseId: IDS.courseToeicBasic,
      enrollmentId: IDS.enrollMinhToeic,
      rating: 5,
      comment: "Khóa học rất chi tiết và dễ hiểu! Chị Anh giảng dạy rõ ràng, bài tập phong phú. Mình đã cải thiện điểm từ 450 lên 680 sau 2 tháng!",
      isVerified: true,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(30),
    },
    {
      _id: id(),
      userId: IDS.learnerHoa,
      courseId: IDS.courseToeicBasic,
      enrollmentId: IDS.enrollHoaToeic,
      rating: 5,
      comment: "Tuyệt vời! Phương pháp giảng dạy khoa học, có thể học theo tiến độ của bản thân. Rất phù hợp cho người đi làm bận rộn.",
      isVerified: true,
      createdAt: daysAgo(40),
      updatedAt: daysAgo(40),
    },
    {
      _id: id(),
      userId: IDS.learnerHoa,
      courseId: IDS.courseGiaoTiepHangNgay,
      enrollmentId: IDS.enrollHoaGT,
      rating: 4,
      comment: "Khóa học hay, phát âm chuẩn. Chỉ tiếc là chưa có nhiều bài tập thực hành nói chuyện trực tiếp với native speakers.",
      isVerified: true,
      createdAt: daysAgo(8),
      updatedAt: daysAgo(8),
    },
    {
      _id: id(),
      userId: IDS.learnerDuc,
      courseId: IDS.courseBusinessEnglish,
      enrollmentId: IDS.enrollDucBiz,
      rating: 5,
      comment: "Anh Tuấn dạy rất thực tế! Sau 1 tháng học mình đã viết email tiếng Anh tự tin hơn hẳn, sếp khen nhiều lần.",
      isVerified: true,
      createdAt: daysAgo(10),
      updatedAt: daysAgo(10),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 15. NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════
function seedNotifications() {
  return [
    {
      _id: id(),
      userId: IDS.learnerMinh,
      type: "streak",
      title: "🔥 Streak 15 ngày! Tuyệt vời!",
      message: "Bạn đã duy trì streak học tập 15 ngày liên tiếp. Nhận 100 XP thưởng!",
      data: { streakDays: 15, xpReward: 100 },
      isRead: false,
      readAt: null,
      createdAt: daysAgo(0),
    },
    {
      _id: id(),
      userId: IDS.learnerMinh,
      type: "quiz_result",
      title: "📝 Kết quả Quiz: 90/100",
      message: "Bạn đã hoàn thành Quiz Part 1 & 2 với điểm 18/20. Xuất sắc!",
      data: { lessonId: IDS.lesT2L3, score: 18, total: 20 },
      isRead: true,
      readAt: daysAgo(18),
      createdAt: daysAgo(20),
    },
    {
      _id: id(),
      userId: IDS.learnerHoa,
      type: "course_update",
      title: "📚 Khóa học TOEIC được cập nhật",
      message: "Khóa học 'Ôn thi TOEIC 2026' vừa thêm 3 bài học mới về Part 7.",
      data: { courseId: IDS.courseToeicBasic },
      isRead: false,
      readAt: null,
      createdAt: daysAgo(3),
    },
    {
      _id: id(),
      userId: IDS.learnerHoa,
      type: "achievement",
      title: "🏆 Mở khóa thành tích mới!",
      message: "Bạn đã hoàn thành khóa học 'Tiếng Anh giao tiếp'. Nhận huy hiệu 'Người học chăm chỉ'!",
      data: { achievementType: "course", courseId: IDS.courseGiaoTiepHangNgay },
      isRead: true,
      readAt: daysAgo(9),
      createdAt: daysAgo(10),
    },
    {
      _id: id(),
      userId: IDS.adminUser,
      type: "mentor_approval",
      title: "📋 Đơn đăng ký mentor mới",
      message: "Tran Van Minh đã gửi đơn đăng ký trở thành mentor. Vui lòng xem xét.",
      data: { applicationId: IDS.appMentorAnh, applicantName: "Tran Van Minh" },
      isRead: false,
      readAt: null,
      createdAt: daysAgo(5),
    },
    {
      _id: id(),
      userId: IDS.learnerMinh,
      type: "payment",
      title: "✅ Thanh toán thành công",
      message: "Bạn đã đăng ký thành công khóa học 'Ôn thi TOEIC 2026'. Chúc bạn học tốt!",
      data: { paymentId: IDS.payMinhToeic, courseId: IDS.courseToeicBasic, amount: 499000 },
      isRead: true,
      readAt: daysAgo(98),
      createdAt: daysAgo(100),
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 16. ACHIEVEMENTS
// ═══════════════════════════════════════════════════════════════════════════════
function seedAchievements() {
  const achievements = [];
  const milestones = [
    { days: 3, name: "Khởi đầu tốt đẹp", desc: "Học 3 ngày liên tiếp", icon: "🌱", xp: 50, type: "streak" },
    { days: 7, name: "Người kiên trì", desc: "Học 7 ngày liên tiếp", icon: "🔥", xp: 100, type: "streak" },
    { days: 14, name: "Nửa tháng chinh phục", desc: "Học 14 ngày liên tiếp", icon: "💪", xp: 200, type: "streak" },
    { days: 21, name: "Thói quen bền vững", desc: "Học 21 ngày liên tiếp", icon: "🏆", xp: 350, type: "streak" },
    { days: 30, name: "Chiến binh tháng", desc: "Học 30 ngày liên tiếp", icon: "👑", xp: 500, type: "streak" },
  ];

  // Minh's achievements (streak 15 days → unlocked 3 + 7 + 14)
  [3, 7, 14].forEach((days) => {
    const m = milestones.find((x) => x.days === days);
    achievements.push({ _id: id(), userId: IDS.learnerMinh, type: m.type, name: m.name, description: m.desc, icon: m.icon, xpReward: m.xp, requirement: days, progress: 15, unlockedAt: daysAgo(15 - days + 1), createdAt: daysAgo(120) });
  });

  // Thu's achievements (streak 21 days → unlocked all 4)
  [3, 7, 14, 21].forEach((days) => {
    const m = milestones.find((x) => x.days === days);
    achievements.push({ _id: id(), userId: IDS.learnerThu, type: m.type, name: m.name, description: m.desc, icon: m.icon, xpReward: m.xp, requirement: days, progress: 21, unlockedAt: daysAgo(21 - days + 1), createdAt: daysAgo(30) });
  });

  // Hoa's course completion achievement
  achievements.push({
    _id: id(),
    userId: IDS.learnerHoa,
    type: "course",
    name: "Người học chăm chỉ",
    description: "Hoàn thành khóa học đầu tiên",
    icon: "🎓",
    xpReward: 300,
    requirement: 1,
    progress: 1,
    unlockedAt: daysAgo(10),
    createdAt: daysAgo(180),
  });

  // Duc's streak
  achievements.push({
    _id: id(),
    userId: IDS.learnerDuc,
    type: "streak",
    name: "Khởi đầu tốt đẹp",
    description: "Học 3 ngày liên tiếp",
    icon: "🌱",
    xpReward: 50,
    requirement: 3,
    progress: 3,
    unlockedAt: daysAgo(1),
    createdAt: daysAgo(60),
  });

  return achievements;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — create indexes & insert all data
// ═══════════════════════════════════════════════════════════════════════════════
async function createIndexes(db) {
  console.log("  Creating indexes...");
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("users").createIndex({ role: 1 });

  await db.collection("categories").createIndex({ slug: 1 }, { unique: true });
  await db.collection("categories").createIndex({ code: 1 }, { unique: true });

  await db.collection("courses").createIndex({ category: 1 });
  await db.collection("courses").createIndex({ instructorId: 1 });
  await db.collection("courses").createIndex({ status: 1, isPublished: 1 });
  await db.collection("courses").createIndex({ rating: -1 });
  await db.collection("courses").createIndex({ students: -1 });
  await db.collection("courses").createIndex({ title: "text", description: "text" });

  await db.collection("modules").createIndex({ courseId: 1, order: 1 });
  await db.collection("lessons").createIndex({ moduleId: 1, order: 1 });
  await db.collection("lessons").createIndex({ courseId: 1 });

  await db.collection("quiz_questions").createIndex({ lessonId: 1 });
  await db.collection("quiz_questions").createIndex({ courseId: 1 });

  await db.collection("documents").createIndex({ lessonId: 1 });
  await db.collection("documents").createIndex({ courseId: 1 });

  await db.collection("enrollments").createIndex({ userId: 1, courseId: 1 }, { unique: true });
  await db.collection("enrollments").createIndex({ userId: 1, status: 1 });
  await db.collection("enrollments").createIndex({ courseId: 1 });

  await db.collection("learning_progress").createIndex({ userId: 1, courseId: 1 }, { unique: true });

  await db.collection("streaks").createIndex({ userId: 1 }, { unique: true });

  await db.collection("payments").createIndex({ userId: 1, courseId: 1 });
  await db.collection("payments").createIndex({ status: 1 });
  await db.collection("payments").createIndex({ transactionId: 1 }, { sparse: true });

  await db.collection("mentor_applications").createIndex({ userId: 1 });
  await db.collection("mentor_applications").createIndex({ status: 1 });

  await db.collection("reviews").createIndex({ courseId: 1, rating: -1 });
  await db.collection("reviews").createIndex({ userId: 1, courseId: 1 }, { unique: true });

  await db.collection("notifications").createIndex({ userId: 1, isRead: 1, createdAt: -1 });

  await db.collection("achievements").createIndex({ userId: 1, type: 1 });

  console.log("  ✓ Indexes created");
}

async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log(`\n✅ Connected to MongoDB: ${MONGO_URI}`);

    const db = client.db(DB_NAME);
    console.log(`📦 Database: ${DB_NAME}\n`);

    // Drop existing collections for clean seed
    const existingCollections = (await db.listCollections().toArray()).map((c) => c.name);
    const collections = [
      "users", "categories", "courses", "modules", "lessons",
      "quiz_questions", "documents", "enrollments", "learning_progress",
      "streaks", "payments", "mentor_applications", "category_history",
      "reviews", "notifications", "achievements",
    ];
    for (const col of collections) {
      if (existingCollections.includes(col)) {
        await db.collection(col).drop();
        console.log(`  🗑  Dropped: ${col}`);
      }
    }
    console.log();

    // Seed all collections
    const steps = [
      ["users",               await seedUsers()],
      ["categories",          seedCategories()],
      ["courses",             seedCourses()],
      ["modules",             seedModules()],
      ["lessons",             seedLessons()],
      ["quiz_questions",      seedQuizQuestions()],
      ["documents",           seedDocuments()],
      ["enrollments",         seedEnrollments()],
      ["learning_progress",   seedLearningProgress()],
      ["streaks",             seedStreaks()],
      ["payments",            seedPayments()],
      ["mentor_applications", seedMentorApplications()],
      ["category_history",    seedCategoryHistory()],
      ["reviews",             seedReviews()],
      ["notifications",       seedNotifications()],
      ["achievements",        seedAchievements()],
    ];

    for (const [name, data] of steps) {
      const result = await db.collection(name).insertMany(data);
      console.log(`  ✅ ${name.padEnd(22)} ${result.insertedCount} documents`);
    }

    console.log("\n─────────────────────────────────────────");
    await createIndexes(db);

    // Summary
    console.log("\n═══════════════════════════════════════════");
    console.log("  🎉 Seed hoàn tất! WDP English Platform");
    console.log("═══════════════════════════════════════════");
    console.log("\n  📋 Tài khoản test:");
    console.log("  ┌─────────────────────────────────────────────────┐");
    console.log("  │ ADMIN   admin@wdp.edu.vn        Admin@123       │");
    console.log("  │ MENTOR  mentor.anh@wdp.edu.vn   Mentor@123      │");
    console.log("  │ MENTOR  mentor.tuan@wdp.edu.vn  Mentor@123      │");
    console.log("  │ MENTOR  mentor.lan@wdp.edu.vn   Mentor@123      │");
    console.log("  │ LEARNER minh.tv@gmail.com        Learner@123     │");
    console.log("  │ LEARNER hoa.nt@gmail.com         Learner@123     │");
    console.log("  │ LEARNER duc.hv@gmail.com          Learner@123     │");
    console.log("  │ LEARNER thu.lt@gmail.com          Learner@123     │");
    console.log("  └─────────────────────────────────────────────────┘");
    console.log(`\n  🔗 MongoDB URI: ${MONGO_URI}`);
    console.log(`  🗄  Database:   ${DB_NAME}\n`);

  } catch (err) {
    console.error("\n❌ Lỗi:", err.message);
    if (err.code === "ECONNREFUSED") {
      console.error("   → Kiểm tra MongoDB có đang chạy không (mongod)");
    }
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();