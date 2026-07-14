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
function buildCourses() {
  return [
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

  const CHAPTER_TITLES = [
    ["Chương 1: Nhập môn & Định hướng", "Chương 2: Thực hành & Kỹ năng nâng cao"],
  ];

  for (const course of courses) {
    const courseKey = course._id.toString();
    nodesByCourse[courseKey] = [];

    for (let ci = 0; ci < 2; ci++) {
      const pathId = id();
      paths.push({
        _id: pathId,
        courseId: course._id,
        pathName: CHAPTER_TITLES[0][ci],
        description: `Nội dung ${CHAPTER_TITLES[0][ci].toLowerCase()} của khóa "${course.courseName}"`,
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
          description: `Bài học số ${nodeOrder} thuộc "${CHAPTER_TITLES[0][ci]}"`,
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
