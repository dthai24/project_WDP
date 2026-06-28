// ============================================================
// MOCK DATA LAYER - Thay thế bằng API calls khi có backend
// ============================================================

// ---------- USERS ----------
export const mockUsers = {
  learner: {
    id: "u1",
    name: "Nguyen Van A",
    email: "hocvien@gmail.com",
    role: "Learner",
    avatar: null,
    school: "Dai hoc Bach Khoa",
    major: "Cong nghe thong tin",
    year: "Nam 3",
    phone: "0123456789",
    bio: "Hoc vien cham chi, yeu thich tieng Anh",
    memberSince: "10/2023",
    preferredStudyTime: "Buoi sang (6h - 12h)",
    dailyGoal: "3 Gio",
    quizDifficulty: "Thich ung",
    notifications: true,
    stats: { courses: 3, streak: 15, xp: 2450, quizzes: "12/18", hours: 42 },
  },
  mentor: {
    id: "u2",
    name: "Ms. Nguyen Thuy Anh",
    email: "giangvien@gmail.com",
    role: "Mentor",
    avatar: null,
    bio: "Giang vien tieng Anh voi 10 nam kinh nghiem",
  },
  admin: {
    id: "u3",
    name: "Admin",
    email: "admin@gmail.com",
    role: "Admin",
    avatar: null,
  },
};

// ---------- CATEGORIES ----------
export const categories = [
  { id: 1, name: "TOEIC", slug: "toeic", count: 12, color: "bg-blue-50 text-blue-600" },
  { id: 2, name: "IELTS", slug: "ielts", count: 8, color: "bg-purple-50 text-purple-600" },
  { id: 3, name: "Giao tiep", slug: "giao-tiep", count: 15, color: "bg-green-50 text-green-600" },
  { id: 4, name: "Ngu phap", slug: "ngu-phap", count: 6, color: "bg-amber-50 text-amber-600" },
  { id: 5, name: "Tu vung", slug: "tu-vung", count: 10, color: "bg-rose-50 text-rose-600" },
  { id: 6, name: "Phat am", slug: "phat-am", count: 4, color: "bg-cyan-50 text-cyan-600" },
  { id: 7, name: "THPT", slug: "thpt", count: 7, color: "bg-orange-50 text-orange-600" },
];

// ---------- COURSES ----------
// price: null = free, number = VND
export const allCourses = [
  { id: 1, title: "On thi TOEIC 2026", instructor: "Ms. Nguyen Thuy Anh", rating: 4.8, students: 12450, level: "Co ban - Nang cao", lessons: 48, hours: 36, badge: "ETS 2026", category: "TOEIC", image: "https://picsum.photos/seed/toeic/400/225", desc: "Tu vung TOEIC phan chia theo level 450+, 650+, 850+. Giao trinh Hackers TOEIC, ETS moi nhat.", tag: "Pho bien", price: null, originalPrice: null },
  { id: 2, title: "IELTS Academic Vocabulary", instructor: "Mr. David Tran", rating: 4.9, students: 8720, level: "Trung cap - Nang cao", lessons: 62, hours: 48, badge: "IELTS 7.5+", category: "IELTS", image: "https://picsum.photos/seed/ielts/400/225", desc: "Kho tu vung IELTS Academic va General theo chu de thong dung.", tag: "Ban chay", price: 499000, originalPrice: 999000 },
  { id: 3, title: "English for Communication B2", instructor: "Ms. Le Hoang Yen", rating: 4.7, students: 15300, level: "Trung cap", lessons: 36, hours: 24, badge: "Oxford 3000", category: "Giao tiep", image: "https://picsum.photos/seed/communication/400/225", desc: "Lo trinh chuan tu A1, A2 den B2, C1 theo khung tham chieu chau Au.", tag: "Moi nhat", price: null, originalPrice: null },
  { id: 4, title: "Ngu phap Tieng Anh Co ban", instructor: "Mr. Pham Minh Duc", rating: 4.6, students: 21000, level: "Co ban", lessons: 28, hours: 18, badge: "Pho thong", category: "Ngu phap", image: "https://picsum.photos/seed/grammar/400/225", desc: "Ngu phap tieng Anh tu co ban den nang cao, phu hop cho nguoi moi bat dau.", tag: "Pho bien", price: null, originalPrice: null },
  { id: 5, title: "Luyen thi THPT Quoc Gia", instructor: "Ms. Tran Thu Ha", rating: 4.8, students: 28400, level: "Lop 10-12", lessons: 72, hours: 54, badge: "Global Success", category: "THPT", image: "https://picsum.photos/seed/thpt/400/225", desc: "Day du tu vung theo sach giao khoa Global Success lop 10, 11, 12.", tag: "Pho bien", price: 299000, originalPrice: 599000 },
  { id: 6, title: "Pronunciation Mastery", instructor: "Mr. John Smith", rating: 4.9, students: 9800, level: "Tat ca cap do", lessons: 24, hours: 16, badge: "Phat am", category: "Phat am", image: "https://picsum.photos/seed/pronunciation/400/225", desc: "Luyen phat am chuan Anh - My voi IPA, trong am va ngu dieu.", tag: "Ban chay", price: 199000, originalPrice: 399000 },
  { id: 7, title: "Business English Essentials", instructor: "Ms. Pham Quynh Trang", rating: 4.7, students: 6200, level: "Trung cap", lessons: 40, hours: 30, badge: "Business", category: "Giao tiep", image: "https://picsum.photos/seed/business/400/225", desc: "Tieng Anh thuong mai cho moi truong cong so va kinh doanh.", tag: "Moi nhat", price: 399000, originalPrice: 799000 },
  { id: 8, title: "Tu vung theo chu de", instructor: "Ms. Nguyen Kim Ngan", rating: 4.8, students: 19500, level: "Co ban - Trung cap", lessons: 56, hours: 42, badge: "Oxford 3000", category: "Tu vung", image: "https://picsum.photos/seed/thematic/400/225", desc: "Tu vung theo 50+ chu de thong dung trong cuoc song hang ngay.", tag: "Pho bien", price: null, originalPrice: null },
];

// ---------- CURRICULUM ----------
export const curriculumData = [
  { id: "m1", title: "Module 1: Gioi thieu & Dinh huong", lessons: [
    { id: "l1", title: "Gioi thieu khoa hoc", type: "video", duration: "5:30", free: true },
    { id: "l2", title: "Phuong phap hoc SRS", type: "video", duration: "12:15", free: true },
    { id: "l3", title: "Bai tap lam quen", type: "quiz", duration: "10 cau", free: true },
  ]},
  { id: "m2", title: "Module 2: Tu vung chu de Cong viec", lessons: [
    { id: "l4", title: "Tu vung ve van phong", type: "video", duration: "15:00" },
    { id: "l5", title: "Tu vung ve cuoc hop", type: "video", duration: "12:30" },
    { id: "l6", title: "Luyen tap ghep tu", type: "quiz", duration: "15 cau" },
    { id: "l7", title: "Bai tap on Module 2", type: "quiz", duration: "20 cau" },
  ]},
  { id: "m3", title: "Module 3: Tu vung chu De Hoc tap", lessons: [
    { id: "l8", title: "Tu vung dai hoc", type: "video", duration: "14:00" },
    { id: "l9", title: "Tu vung nghien cuu", type: "video", duration: "11:45" },
    { id: "l10", title: "Luyen tap Word Scramble", type: "quiz", duration: "15 cau" },
    { id: "l11", title: "Bai tap on Module 3", type: "quiz", duration: "20 cau" },
  ]},
  { id: "m4", title: "Module 4: On tap & Kiem tra cuoi ky", lessons: [
    { id: "l12", title: "On tap tong hop", type: "video", duration: "20:00" },
    { id: "l13", title: "Bai kiem tra cuoi khoa", type: "quiz", duration: "50 cau" },
  ]},
];

// ---------- DOCUMENTS ----------
export const lessonDocuments = [
  { id: 1, title: "Tai lieu bai hoc - Vocabulary List", type: "pdf", pages: 12, size: "2.4 MB" },
  { id: 2, title: "Bai tap thuc hanh - Worksheet", type: "doc", pages: 6, size: "1.1 MB" },
  { id: 3, title: "Flashcard tu vung", type: "flashcard", pages: 24, size: "3.8 MB" },
];

// ---------- QUIZ QUESTIONS ----------
export const lessonQuizQuestions = [
  { id: 1, question: 'Tu "abandon" co nghia la gi?', options: ["Giu lai", "Tu bo, roi bo", "Chap nhan", "Xay dung"], correct: 1 },
  { id: 2, question: 'Chon tu dong nghia voi "happy"', options: ["Sad", "Angry", "Joyful", "Tired"], correct: 2 },
  { id: 3, question: 'Tu "benevolent" co nghia la gi?', options: ["Doc ac", "Tot bung, nhan tu", "Ich ky", "Tho o"], correct: 1 },
  { id: 4, question: 'Chon tu trai nghia voi "expand"', options: ["Grow", "Increase", "Contract", "Enlarge"], correct: 2 },
  { id: 5, question: 'Tu "meticulous" co nghia la gi?', options: ["Cau tha", "Ti mi, can than", "Nhanh chong", "Bat can"], correct: 1 },
];

export const moduleQuizQuestions = [
  { id: 1, question: 'Tu "abandon" co nghia la gi?', options: ["Chap nhan", "Tu bo", "Hoan thanh", "Bat dau"], correct: 1 },
  { id: 2, question: 'Chon tu dong nghia voi "beautiful"', options: ["Ugly", "Pretty", "Angry", "Sad"], correct: 1 },
  { id: 3, question: '"Accommodate" co nghia la:', options: ["Loai bo", "Chua dung", "Tu choi", "Pha huy"], correct: 1 },
  { id: 4, question: 'Tu trai nghia cua "increase" la:', options: ["Decrease", "Expand", "Grow", "Rise"], correct: 0 },
  { id: 5, question: '"Consequently" dong nghia voi tu nao?', options: ["Therefore", "However", "Although", "Because"], correct: 0 },
  { id: 6, question: 'Chon tu dung: "She is ___ in English."', options: ["interesting", "interested", "interest", "interests"], correct: 1 },
  { id: 7, question: '"Implement" co nghia la:', options: ["Thuc hien", "Huy bo", "Tri hoan", "Nghien cuu"], correct: 0 },
  { id: 8, question: 'Tu "significant" co nghia la:', options: ["Nho", "Quan trong", "Nhanh", "De dang"], correct: 1 },
  { id: 9, question: '"Nevertheless" dong nghia voi:', options: ["Therefore", "However", "Moreover", "Thus"], correct: 1 },
  { id: 10, question: 'Chon tu dung: "He has ___ experience."', options: ["much", "many", "a lot", "few"], correct: 0 },
];

// ---------- ENROLLED COURSES (MyLearning) ----------
export const enrolledCourses = [
  { id: 1, title: "On thi TOEIC 2026", instructor: "Ms. Nguyen Thuy Anh", progress: 65, totalLessons: 48, completedLessons: 31, streak: 7, image: "https://picsum.photos/seed/toeic/400/225", lastActivity: "2 gio truoc", nextLesson: "Module 3: Tu vung chu de Hoc tap", documents: 12, quizzes: 8, completedQuizzes: 5 },
  { id: 2, title: "English for Communication B2", instructor: "Ms. Le Hoang Yen", progress: 28, totalLessons: 36, completedLessons: 10, streak: 3, image: "https://picsum.photos/seed/communication/400/225", lastActivity: "1 ngay truoc", nextLesson: "Module 2: Giao tiep cong so", documents: 8, quizzes: 6, completedQuizzes: 2 },
  { id: 3, title: "Pronunciation Mastery", instructor: "Mr. John Smith", progress: 12, totalLessons: 24, completedLessons: 3, streak: 1, image: "https://picsum.photos/seed/pronunciation/400/225", lastActivity: "3 ngay truoc", nextLesson: "Module 1: IPA Basics", documents: 6, quizzes: 4, completedQuizzes: 0 },
];

// ---------- PAYMENT METHODS ----------
export const paymentMethods = [
  { id: "momo", name: "Vi MoMo", icon: "https://picsum.photos/seed/momo/80/24" },
  { id: "zalopay", name: "ZaloPay", icon: "https://picsum.photos/seed/zalopay/80/24" },
  { id: "vnpay", name: "VNPay", icon: "https://picsum.photos/seed/vnpay/80/24" },
  { id: "bank", name: "Chuyen khoan ngan hang", icon: null },
  { id: "card", name: "The tin dung / The ghi no", icon: null },
];

// ---------- PROGRESS (localStorage-based) ----------
const PROGRESS_KEY = "wdp_learning_progress";
const ENROLLED_KEY = "wdp_enrolled_courses";

export function getLearningProgress() {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : { completedLessons: [], quizScores: {}, documentsRead: [] };
  } catch { return { completedLessons: [], quizScores: {}, documentsRead: [] }; }
}

export function saveLearningProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function markLessonComplete(lessonId) {
  const progress = getLearningProgress();
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
    saveLearningProgress(progress);
  }
  return progress;
}

export function saveQuizScore(quizId, score, total) {
  const progress = getLearningProgress();
  progress.quizScores[quizId] = { score, total, date: new Date().toISOString() };
  saveLearningProgress(progress);
  return progress;
}

// ---------- ENROLLMENT (localStorage-based) ----------
export function getEnrolledCourseIds() {
  try {
    const data = localStorage.getItem(ENROLLED_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function enrollCourse(courseId) {
  const enrolled = getEnrolledCourseIds();
  if (!enrolled.includes(courseId)) {
    enrolled.push(courseId);
    localStorage.setItem(ENROLLED_KEY, JSON.stringify(enrolled));
  }
  return enrolled;
}

export function isCourseEnrolled(courseId) {
  return getEnrolledCourseIds().includes(courseId);
}

// ---------- MENTOR COURSES (localStorage-based) ----------
const MENTOR_COURSES_KEY = "wdp_mentor_courses";
const MENTOR_STATS_KEY = "wdp_mentor_stats";

export function getMentorCourses() {
  try {
    const data = localStorage.getItem(MENTOR_COURSES_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function saveMentorCourse(course) {
  const courses = getMentorCourses();
  courses.unshift(course);
  localStorage.setItem(MENTOR_COURSES_KEY, JSON.stringify(courses));
  return courses;
}

export function getMentorStats() {
  try {
    const data = localStorage.getItem(MENTOR_STATS_KEY);
    return data ? JSON.parse(data) : { students: 1240, courses: 0, revenue: 0, rating: 4.8 };
  } catch { return { students: 1240, courses: 0, revenue: 0, rating: 4.8 }; }
}

export function updateMentorStats(stats) {
  localStorage.setItem(MENTOR_STATS_KEY, JSON.stringify(stats));
}

// ---------- MENTOR CURRICULUM (localStorage-based) ----------
const MENTOR_CURRICULUM_KEY = "wdp_mentor_curriculum";

export function getMentorCurriculum(courseId) {
  try {
    const data = localStorage.getItem(MENTOR_CURRICULUM_KEY);
    const all = data ? JSON.parse(data) : {};
    return all[courseId] || null;
  } catch { return null; }
}

export function saveMentorCurriculum(courseId, curriculum) {
  try {
    const data = localStorage.getItem(MENTOR_CURRICULUM_KEY);
    const all = data ? JSON.parse(data) : {};
    all[courseId] = curriculum;
    localStorage.setItem(MENTOR_CURRICULUM_KEY, JSON.stringify(all));
    return true;
  } catch { return false; }
}

// ---------- FORMAT PRICE ----------
export function formatPrice(price) {
  if (price === null || price === undefined) return "Mien phi";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}


// ---------- STREAK TRACKING (localStorage-based, like Duolingo) ----------
const STREAK_KEY = "wdp_streak_data";

export const STREAK_MILESTONES = [
  { days: 3, title: "Khoi dau tot dep", icon: "🌱", xp: 50, desc: "Hoc 3 ngay lien tiep" },
  { days: 7, title: "Tuan hoc dau tien", icon: "🔥", xp: 150, desc: "Hoc 7 ngay lien tiep" },
  { days: 14, title: "Hai tuan hieu qua", icon: "💪", xp: 300, desc: "Hoc 14 ngay lien tiep" },
  { days: 30, title: "Mot thang kien tri", icon: "⭐", xp: 600, desc: "Hoc 30 ngay lien tiep" },
  { days: 60, title: "Hai thang ben bi", icon: "🏆", xp: 1200, desc: "Hoc 60 ngay lien tiep" },
  { days: 100, title: "Century! 100 ngay", icon: "💎", xp: 2500, desc: "Hoc 100 ngay lien tiep" },
  { days: 200, title: "200 ngay huy hoang", icon: "👑", xp: 5000, desc: "Hoc 200 ngay lien tiep" },
  { days: 365, title: "Mot nam thay doi", icon: "🌟", xp: 10000, desc: "Hoc 365 ngay lien tiep" },
];

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function getStreakData() {
  try {
    const data = localStorage.getItem(STREAK_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  // Default: simulate some history for demo
  const today = getTodayStr();
  const history = {};
  // Generate 14 days of history for demo (with 2 gaps to show freeze)
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    // Skip day 5 and day 9 to show gaps
    if (i === 5 || i === 9) continue;
    history[dateStr] = { studied: true, xp: Math.floor(Math.random() * 80) + 20 };
  }
  return {
    currentStreak: 7,
    longestStreak: 15,
    lastStudyDate: today,
    history,
    milestones: [],
    freezes: 2,
    totalXp: 2450,
  };
}

export function saveStreakData(data) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

export function recordStudySession(xpEarned = 50) {
  const data = getStreakData();
  const today = getTodayStr();
  const yesterday = getYesterdayStr();

  // Update history
  if (!data.history) data.history = {};
  if (!data.history[today]) {
    data.history[today] = { studied: true, xp: xpEarned };
  } else {
    data.history[today].xp += xpEarned;
  }

  // Update streak
  if (data.lastStudyDate === yesterday || data.lastStudyDate === today) {
    // Consecutive day
    if (data.lastStudyDate !== today) {
      data.currentStreak += 1;
    }
  } else if (data.lastStudyDate !== today) {
    // Streak broken - check if freeze available
    if (data.freezes > 0) {
      data.freezes -= 1;
      data.currentStreak += 1;
    } else {
      data.currentStreak = 1;
    }
  }

  data.lastStudyDate = today;
  data.totalXp = (data.totalXp || 0) + xpEarned;

  // Update longest streak
  if (data.currentStreak > (data.longestStreak || 0)) {
    data.longestStreak = data.currentStreak;
  }

  // Check milestones
  if (!data.milestones) data.milestones = [];
  const newMilestones = [];
  for (const milestone of STREAK_MILESTONES) {
    if (data.currentStreak >= milestone.days && !data.milestones.includes(milestone.days)) {
      data.milestones.push(milestone.days);
      newMilestones.push(milestone);
    }
  }

  saveStreakData(data);
  return { data, newMilestones };
}

export function getWeekHistory() {
  const data = getStreakData();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    days.push({
      date: dateStr,
      day: dayNames[d.getDay()],
      studied: data.history?.[dateStr]?.studied || false,
      xp: data.history?.[dateStr]?.xp || 0,
    });
  }
  return days;
}

export function getMonthHistory() {
  const data = getStreakData();
  const days = [];
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  for (let i = 0; i < daysInMonth; i++) {
    const d = new Date(startOfMonth);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      day: d.getDate(),
      studied: data.history?.[dateStr]?.studied || false,
      xp: data.history?.[dateStr]?.xp || 0,
    });
  }
  return days;
}


