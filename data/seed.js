/**
 * WDP English Learning Platform - MongoDB Seed Script v2
 * Contains all database records inlined directly.
 */

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wdp_english";
const daysAgo = (n) => new Date(Date.now() - n * 86400000);

const DATA_categories = [
  {
    "_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d057"),
    "categoryName": "toeic",
    "displayName": "TOEIC",
    "name": "TOEIC",
    "slug": "toeic",
    "code": "TOEIC",
    "description": "Luyện thi TOEIC Listening & Reading chuẩn ETS",
    "color": "bg-blue-50 text-blue-600",
    "isActive": true
  },
  {
    "_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d058"),
    "categoryName": "ielts",
    "displayName": "IELTS",
    "name": "IELTS",
    "slug": "ielts",
    "code": "IELTS",
    "description": "Luyện thi IELTS Academic & General Training",
    "color": "bg-green-50 text-green-600",
    "isActive": true
  },
  {
    "_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d059"),
    "categoryName": "giao-tiep",
    "displayName": "Giao tiếp",
    "name": "Giao tiếp",
    "slug": "giao-tiep",
    "code": "COMMUNICATION",
    "description": "Tiếng Anh giao tiếp hàng ngày, tự tin nói chuyện",
    "color": "bg-yellow-50 text-yellow-600",
    "isActive": true
  },
  {
    "_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05a"),
    "categoryName": "ngu-phap",
    "displayName": "Ngữ pháp",
    "name": "Ngữ pháp",
    "slug": "ngu-phap",
    "code": "GRAMMAR",
    "description": "Hệ thống ngữ pháp tiếng Anh từ cơ bản đến nâng cao",
    "color": "bg-purple-50 text-purple-600",
    "isActive": true
  },
  {
    "_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05b"),
    "categoryName": "tu-vung",
    "displayName": "Từ vựng",
    "name": "Từ vựng",
    "slug": "tu-vung",
    "code": "VOCABULARY",
    "description": "Học từ vựng theo chủ đề với flashcard và spaced repetition",
    "color": "bg-pink-50 text-pink-600",
    "isActive": true
  },
  {
    "_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05c"),
    "categoryName": "business-english",
    "displayName": "Business English",
    "name": "Business English",
    "slug": "business-english",
    "code": "BUSINESS",
    "description": "Tiếng Anh thương mại, email, thuyết trình chuyên nghiệp",
    "color": "bg-orange-50 text-orange-600",
    "isActive": true
  }
];

const DATA_levels = [
  {
    "_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d053"),
    "levelName": "beginner",
    "displayName": "Beginner",
    "description": "Mới bắt đầu học, phát âm và từ vựng cơ bản",
    "code": "BEGINNER",
    "isActive": true
  },
  {
    "_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d054"),
    "levelName": "elementary",
    "displayName": "Elementary",
    "description": "Giao tiếp cơ bản và ngữ pháp nền tảng",
    "code": "ELEMENTARY",
    "isActive": true
  },
  {
    "_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d055"),
    "levelName": "intermediate",
    "displayName": "Intermediate",
    "description": "Giao tiếp thành thạo, viết và nói trôi chảy",
    "code": "INTERMEDIATE",
    "isActive": true
  },
  {
    "_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d056"),
    "levelName": "advanced",
    "displayName": "Advanced",
    "description": "Học thuật và nghiên cứu chuyên sâu, ielts cao",
    "code": "ADVANCED",
    "isActive": true
  }
];

const DATA_roles = [
  {
    "_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d050"),
    "roleName": "Admin",
    "description": "Quản trị viên hệ thống — toàn quyền quản lý"
  },
  {
    "_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d051"),
    "roleName": "Student",
    "description": "Học viên — truy cập khóa học và lộ trình học tập"
  },
  {
    "_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d052"),
    "roleName": "Mentor",
    "description": "Người hướng dẫn — tạo nội dung và theo dõi học viên"
  }
];

const DATA_users = [
  {
    "_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05d"),
    "email": "mentor@gmail.com",
    "fullName": "Trần Văn Mentor",
    "isActive": true,
    "password": "$2b$10$zgNbReJNxECTyKfgZnNZKu4lJAa.Zwn8.JkTQHlxKlRqRh70Cqlvq",
    "passwordHash": "$2b$10$zgNbReJNxECTyKfgZnNZKu4lJAa.Zwn8.JkTQHlxKlRqRh70Cqlvq"
  },
  {
    "_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05e"),
    "email": "student@gmail.com",
    "fullName": "Lê Văn Student",
    "isActive": true,
    "password": "$2b$10$zgNbReJNxECTyKfgZnNZKu4lJAa.Zwn8.JkTQHlxKlRqRh70Cqlvq",
    "passwordHash": "$2b$10$zgNbReJNxECTyKfgZnNZKu4lJAa.Zwn8.JkTQHlxKlRqRh70Cqlvq"
  },
  {
    "_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05f"),
    "email": "admin@gmail.com",
    "fullName": "Nguyễn Văn Admin",
    "isActive": true,
    "password": "$2b$10$zgNbReJNxECTyKfgZnNZKu4lJAa.Zwn8.JkTQHlxKlRqRh70Cqlvq",
    "passwordHash": "$2b$10$zgNbReJNxECTyKfgZnNZKu4lJAa.Zwn8.JkTQHlxKlRqRh70Cqlvq"
  }
];

const DATA_userroles = [
  { userId: new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05d"), roleId: new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d052") },
  { userId: new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05e"), roleId: new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d051") },
  { userId: new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05f"), roleId: new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d050") },
];

const DATA_coursecomments = [];
const DATA_otpverifications = [];
const DATA_questionchoices = [];
const DATA_questions = [];
const DATA_questionspaths = [];
const DATA_questiontypes = [
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d08e"), "name": "Listening ", "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d08f"), "name": "Reading   ", "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d090"), "name": "Vocabulary", "__v": 0},
];
const DATA_testattempts = [];
const DATA_testquestionchoices = [];
const DATA_testquestioncollections = [];
const DATA_testquestions = [];
const DATA_tests = [];
const DATA_usercategories = [];
const DATA_usercourses = [];
const DATA_usernodes = [];

const MENTOR_ID = new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05d");

const DATA_courses = [];
const DATA_paths = [];
const DATA_pathnodes = [];
const DATA_nodematerials = [];
const DATA_questionbanks = [];

// Helper functions for mapping
const CAT_MAP = {
  "toeic": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d057"),
  "ielts": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d058"),
  "giao-tiep": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d059"),
  "ngu-phap": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05a"),
  "tu-vung": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05b"),
  "business-english": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05c"),
};
const LEVEL_MAP = {
  "beginner": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d053"),
  "elementary": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d054"),
  "intermediate": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d055"),
  "advanced": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d056"),
};

function resolveCategory(key) {
  const normalized = String(key || "").trim().toLowerCase();
  if (normalized.includes("toeic")) return CAT_MAP["toeic"];
  if (normalized.includes("ielts")) return CAT_MAP["ielts"];
  if (normalized.includes("business") || normalized.includes("academic")) return CAT_MAP["business-english"];
  if (normalized.includes("ngu phap") || normalized.includes("grammar")) return CAT_MAP["ngu-phap"];
  if (normalized.includes("tu vung") || normalized.includes("vocabulary")) return CAT_MAP["tu-vung"];
  return CAT_MAP["giao-tiep"];
}

function resolveLevel(key) {
  const normalized = String(key || "").trim().toLowerCase();
  if (normalized.includes("beginner")) return LEVEL_MAP["beginner"];
  if (normalized.includes("elementary")) return LEVEL_MAP["elementary"];
  if (normalized.includes("intermediate")) return LEVEL_MAP["intermediate"];
  if (normalized.includes("advanced")) return LEVEL_MAP["advanced"];
  return LEVEL_MAP["elementary"];
}

// All courses definition
const COURSES_DATA = [
  {
    courseName: "English for Kids: Alphabet & Phonics",
    description: "Khoá học dành cho học sinh cấp 1, giúp các em nhận biết 26 chữ cái, phát âm chuẩn từng âm vị (phonics) và đánh vần các từ đơn giản.",
    levelKey: "Beginner",
    categoryKey: "giao-tiep",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "Basic English Vocabulary – Grade 1",
    description: "Xây dựng vốn từ vựng 300 từ thiết yếu cho học sinh lớp 1–2: màu sắc, con số, thức ăn, đồ vật gia đình.",
    levelKey: "Beginner",
    categoryKey: "tu-vung",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "Premium IELTS Writing Band 8.5 Masterclass",
    description: "Khóa học viết luận IELTS chuyên sâu cùng chuyên gia bản xứ giúp bạn chinh phục Band 8.5+",
    levelKey: "Advanced",
    categoryKey: "ielts",
    rating: 4.9,
    isPaid: true,
    price: 199000,
    chapters: [
      {
        title: "Module 1: Fundamental Concept",
        description: "Nội dung nhập môn và hướng dẫn học tập căn bản.",
        lessons: [
          { title: "Introduction Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "First Writing Task (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 1 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      },
      {
        title: "Module 2: Advanced Mastery",
        description: "Nội dung nâng cao và chuyên sâu đòi hỏi tư duy ngôn ngữ.",
        lessons: [
          { title: "Advanced Methods (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: false },
          { title: "Final Dissertation (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 2 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      }
    ]
  },
  {
    courseName: "Simple Sentences – Speaking for Kids",
    description: "Học sinh cấp 1 luyện nói các câu đơn giản theo chủ đề hàng ngày: tự giới thiệu, hỏi thăm, và nói về gia đình.",
    levelKey: "Beginner",
    categoryKey: "giao-tiep",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "English Listening – Level 1 (A1)",
    description: "Luyện nghe hiểu các đoạn hội thoại cực kỳ đơn giản về cuộc sống hàng ngày, các số đếm, màu sắc và đồ dùng cá nhân.",
    levelKey: "Beginner",
    categoryKey: "giao-tiep",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "Mastering English Pronunciation & Accent Reduction",
    description: "Luyện phát âm chuẩn Mỹ, giảm khẩu âm địa phương và làm chủ ngữ điệu nói tự nhiên.",
    levelKey: "Intermediate",
    categoryKey: "giao-tiep",
    rating: 4.9,
    isPaid: true,
    price: 249000,
    chapters: [
      {
        title: "Module 1: Fundamental Concept",
        description: "Nội dung nhập môn và hướng dẫn học tập căn bản.",
        lessons: [
          { title: "Introduction Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "First Writing Task (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 1 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      },
      {
        title: "Module 2: Advanced Mastery",
        description: "Nội dung nâng cao và chuyên sâu đòi hỏi tư duy ngôn ngữ.",
        lessons: [
          { title: "Advanced Methods (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: false },
          { title: "Final Dissertation (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 2 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      }
    ]
  },
  {
    courseName: "English Reading – Grade 1 (A1)",
    description: "Đọc hiểu các câu đơn giản, mẩu tin ngắn 2-3 câu và truyện tranh ngắn dành cho người mới bắt đầu học tiếng Anh.",
    levelKey: "Beginner",
    categoryKey: "giao-tiep",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "English Grammar – Grade 4 (A2)",
    description: "Tổng hợp ngữ pháp lớp 4: các thì đơn giản (HTĐ, QKĐ, TLĐ), danh từ số ít/nhiều, động từ khuyết thiếu cơ bản.",
    levelKey: "Elementary",
    categoryKey: "ngu-phap",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "Business Negotiation & Presentation Skills",
    description: "Kỹ năng đàm phán hợp đồng, thuyết trình và bảo vệ dự án trước đối tác nước ngoài bằng tiếng Anh.",
    levelKey: "Advanced",
    categoryKey: "business-english",
    rating: 4.9,
    isPaid: true,
    price: 299000,
    chapters: [
      {
        title: "Module 1: Fundamental Concept",
        description: "Nội dung nhập môn và hướng dẫn học tập căn bản.",
        lessons: [
          { title: "Introduction Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "First Writing Task (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 1 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      },
      {
        title: "Module 2: Advanced Mastery",
        description: "Nội dung nâng cao và chuyên sâu đòi hỏi tư duy ngôn ngữ.",
        lessons: [
          { title: "Advanced Methods (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: false },
          { title: "Final Dissertation (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 2 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      }
    ]
  },
  {
    courseName: "Everyday English Conversations – A2",
    description: "Học nói tiếng Anh trong các tình huống thực tế: mua sắm, hỏi đường, đặt bàn ăn, nói chuyện điện thoại.",
    levelKey: "Elementary",
    categoryKey: "giao-tiep",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "English Writing – Grade 5 (A2)",
    description: "Luyện viết đoạn văn ngắn 50-80 từ: mô tả bạn thân, kể về ngày nghỉ cuối tuần, viết email xin phép nghỉ học.",
    levelKey: "Elementary",
    categoryKey: "giao-tiep",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "TOEIC Listening & Reading 990 Practice Hacks",
    description: "Tổng hợp mẹo giải đề TOEIC cực nhanh, bẫy từ vựng Part 5-6 và kỹ thuật skim/scan Part 7 đạt điểm tối đa.",
    levelKey: "Intermediate",
    categoryKey: "toeic",
    rating: 4.9,
    isPaid: true,
    price: 399000,
    chapters: [
      {
        title: "Module 1: Fundamental Concept",
        description: "Nội dung nhập môn và hướng dẫn học tập căn bản.",
        lessons: [
          { title: "Introduction Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "First Writing Task (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 1 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      },
      {
        title: "Module 2: Advanced Mastery",
        description: "Nội dung nâng cao và chuyên sâu đòi hỏi tư duy ngôn ngữ.",
        lessons: [
          { title: "Advanced Methods (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: false },
          { title: "Final Dissertation (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 2 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      }
    ]
  },
  {
    courseName: "A2 Reading Comprehension",
    description: "Rèn luyện kỹ năng đọc hiểu văn bản ngắn 100-150 từ, biển báo công cộng, thực đơn nhà hàng, quảng cáo tuyển dụng.",
    levelKey: "Elementary",
    categoryKey: "giao-tiep",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "A2 Listening Skills – Elementary",
    description: "Luyện nghe hiểu các bài độc thoại ngắn, thông báo tại sân bay/nhà ga, tin tức thời tiết cơ bản.",
    levelKey: "Elementary",
    categoryKey: "giao-tiep",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "Academic Essay Writing for University Students",
    description: "Học cách viết luận văn, tiểu luận học thuật chuẩn mực tại môi trường đại học quốc tế.",
    levelKey: "Advanced",
    categoryKey: "business-english",
    rating: 4.9,
    isPaid: true,
    price: 499000,
    chapters: [
      {
        title: "Module 1: Fundamental Concept",
        description: "Nội dung nhập môn và hướng dẫn học tập căn bản.",
        lessons: [
          { title: "Introduction Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "First Writing Task (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 1 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      },
      {
        title: "Module 2: Advanced Mastery",
        description: "Nội dung nâng cao và chuyên sâu đòi hỏi tư duy ngôn ngữ.",
        lessons: [
          { title: "Advanced Methods (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: false },
          { title: "Final Dissertation (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 2 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      }
    ]
  },
  {
    courseName: "B1 Grammar: Intermediate English",
    description: "Ngữ pháp trung cấp: các thì hoàn thành, câu điều kiện loại 1 & 2, mệnh đề quan hệ, câu bị động.",
    levelKey: "Intermediate",
    categoryKey: "ngu-phap",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "IELTS Preparation – Band 5.0 to 6.0",
    description: "Làm quen cấu trúc đề thi IELTS, chiến thuật làm bài 4 kỹ năng nhắm mục tiêu đạt band 5.5 - 6.0.",
    levelKey: "Intermediate",
    categoryKey: "ielts",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "Advanced Grammar for Professional Writing",
    description: "Làm chủ các cấu trúc ngữ pháp cao cấp, viết báo cáo công việc chuyên nghiệp không sai sót.",
    levelKey: "Intermediate",
    categoryKey: "ngu-phap",
    rating: 4.9,
    isPaid: true,
    price: 599000,
    chapters: [
      {
        title: "Module 1: Fundamental Concept",
        description: "Nội dung nhập môn và hướng dẫn học tập căn bản.",
        lessons: [
          { title: "Introduction Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "First Writing Task (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 1 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      },
      {
        title: "Module 2: Advanced Mastery",
        description: "Nội dung nâng cao và chuyên sâu đòi hỏi tư duy ngôn ngữ.",
        lessons: [
          { title: "Advanced Methods (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: false },
          { title: "Final Dissertation (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 2 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      }
    ]
  },
  {
    courseName: "Business English – Intermediate",
    description: "Tiếng Anh dùng trong văn phòng: viết email công việc lịch sự, họp hành, thuyết trình dự án ngắn.",
    levelKey: "Intermediate",
    categoryKey: "business-english",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "English Writing Skills – B1",
    description: "Viết bài luận ngắn 120-150 từ: thảo luận ưu/nhược điểm, viết thư phàn nàn dịch vụ, viết thư mời.",
    levelKey: "Intermediate",
    categoryKey: "giao-tiep",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "Everyday Conversational English for Globetrotters",
    description: "Tiếng Anh giao tiếp du lịch, đặt phòng, gọi món, giải quyết sự cố tại sân bay dễ dàng.",
    levelKey: "Beginner",
    categoryKey: "giao-tiep",
    rating: 4.9,
    isPaid: true,
    price: 699000,
    chapters: [
      {
        title: "Module 1: Fundamental Concept",
        description: "Nội dung nhập môn và hướng dẫn học tập căn bản.",
        lessons: [
          { title: "Introduction Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "First Writing Task (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 1 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      },
      {
        title: "Module 2: Advanced Mastery",
        description: "Nội dung nâng cao và chuyên sâu đòi hỏi tư duy ngôn ngữ.",
        lessons: [
          { title: "Advanced Methods (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: false },
          { title: "Final Dissertation (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 2 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      }
    ]
  },
  {
    courseName: "TOEIC 600+ – Listening & Reading",
    description: "Luyện thi TOEIC 2 kỹ năng chuyên sâu: từ vựng Part 5, mẹo nghe Part 2-3, phân bổ thời gian đọc Part 7.",
    levelKey: "Intermediate",
    categoryKey: "toeic",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "Academic English Writing – University Level",
    description: "Viết học thuật đại học: cách trích dẫn APA/MLA, viết bài luận tranh biện (argumentative essay).",
    levelKey: "Advanced",
    categoryKey: "business-english",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "IELTS Vocabulary & Collocations Bootcamp",
    description: "Tích lũy 1000+ từ vựng học thuật cao cấp và cụm từ cố định để đạt điểm Lexical Resource tối đa.",
    levelKey: "Advanced",
    categoryKey: "ielts",
    rating: 4.9,
    isPaid: true,
    price: 799000,
    chapters: [
      {
        title: "Module 1: Fundamental Concept",
        description: "Nội dung nhập môn và hướng dẫn học tập căn bản.",
        lessons: [
          { title: "Introduction Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "First Writing Task (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 1 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      },
      {
        title: "Module 2: Advanced Mastery",
        description: "Nội dung nâng cao và chuyên sâu đòi hỏi tư duy ngôn ngữ.",
        lessons: [
          { title: "Advanced Methods (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: false },
          { title: "Final Dissertation (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 2 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      }
    ]
  },
  {
    courseName: "IELTS Academic – Band 7.0 & Above",
    description: "IELTS nâng cao band 7+: phân tích đề thi thực tế, chiến lược làm bài Writing Task 2 và Speaking Part 3.",
    levelKey: "Advanced",
    categoryKey: "ielts",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "Advanced English Grammar – C1 Level",
    description: "Ngữ pháp nâng cao: đảo ngữ, câu điều kiện hỗn hợp, phân từ hoàn thành, cấu trúc song song phức tạp.",
    levelKey: "Advanced",
    categoryKey: "ngu-phap",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "English for Scientific Research & Publications",
    description: "Quy chuẩn viết bài báo khoa học, abstract và trích dẫn chuẩn mực quốc tế đăng tạp chí ISI.",
    levelKey: "Advanced",
    categoryKey: "business-english",
    rating: 4.9,
    isPaid: true,
    price: 899000,
    chapters: [
      {
        title: "Module 1: Fundamental Concept",
        description: "Nội dung nhập môn và hướng dẫn học tập căn bản.",
        lessons: [
          { title: "Introduction Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "First Writing Task (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 1 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      },
      {
        title: "Module 2: Advanced Mastery",
        description: "Nội dung nâng cao và chuyên sâu đòi hỏi tư duy ngôn ngữ.",
        lessons: [
          { title: "Advanced Methods (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: false },
          { title: "Final Dissertation (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 2 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      }
    ]
  },
  {
    courseName: "English for Research & Academia",
    description: "Viết báo cáo khoa học, tóm tắt abstract (250 từ), thuyết trình báo cáo tại hội thảo quốc tế.",
    levelKey: "Advanced",
    categoryKey: "business-english",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "C2 Mastery English – Proficiency Level",
    description: "Cấp độ tiếng Anh cao nhất: từ vựng hiếm, thành ngữ cổ, đọc hiểu các tác phẩm văn học học thuật phức tạp.",
    levelKey: "Advanced",
    categoryKey: "tu-vung",
    rating: 4.8,
    isPaid: false,
    price: 0,
    chapters: [
      {
        title: "Week 1: Core Foundation",
        description: "Làm quen với các kiến thức nền tảng đầu tiên của chủ đề.",
        lessons: [
          { title: "Core Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "Essay Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Knowledge Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      },
      {
        title: "Week 2: Intermediate Expansion",
        description: "Mở rộng và đào sâu kiến thức lý thuyết đã học.",
        lessons: [
          { title: "Expansion Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: true },
          { title: "Application Challenge (Writing Practice)", type: "reading", url: "", isFree: true },
          { title: "Progress Check (Quiz Assessment)", type: "quiz", url: "", isFree: true }
        ]
      }
    ]
  },
  {
    courseName: "C2 English Proficiency Mastery Course",
    description: "Chinh phục đỉnh cao tiếng Anh với giáo trình C2 Proficiency nâng tầm tư duy ngôn ngữ như người bản xứ.",
    levelKey: "Advanced",
    categoryKey: "tu-vung",
    rating: 4.9,
    isPaid: true,
    price: 999000,
    chapters: [
      {
        title: "Module 1: Fundamental Concept",
        description: "Nội dung nhập môn và hướng dẫn học tập căn bản.",
        lessons: [
          { title: "Introduction Lecture (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=75p-N9YKqNo", isFree: true },
          { title: "First Writing Task (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 1 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      },
      {
        title: "Module 2: Advanced Mastery",
        description: "Nội dung nâng cao và chuyên sâu đòi hỏi tư duy ngôn ngữ.",
        lessons: [
          { title: "Advanced Methods (Video Lecture)", type: "video", url: "https://www.youtube.com/watch?v=36IBDpTRVNE", isFree: false },
          { title: "Final Dissertation (Writing Practice)", type: "reading", url: "", isFree: false },
          { title: "Module 2 Exam (Quiz Assessment)", type: "quiz", url: "", isFree: false }
        ]
      }
    ]
  },
];

const UNSPLASH_IMAGES = [
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1484755560695-a4c7302cce29?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80"
];

COURSES_DATA.forEach((c, idx) => {
  const courseId = new mongoose.Types.ObjectId();
  const totalLessons = c.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
  
  DATA_courses.push({
    _id: courseId,
    courseName: c.courseName,
    description: c.description,
    categoryId: resolveCategory(c.categoryKey),
    levelId: resolveLevel(c.levelKey),
    instructorId: MENTOR_ID,
    thumbnail: UNSPLASH_IMAGES[idx % UNSPLASH_IMAGES.length],
    rating: c.rating || 0,
    totalLessons,
    isPublished: true,
    price: c.price || 0,
    isPaid: c.isPaid || false,
    createdAt: daysAgo(100 - idx * 3),
    updatedAt: daysAgo(100 - idx * 3),
    __v: 0
  });

  // Tạo ngân hàng câu hỏi ảo tương ứng cho mỗi khóa học
  DATA_questionbanks.push({
    _id: new mongoose.Types.ObjectId(),
    instructorId: MENTOR_ID,
    courseId: courseId,
    courseName: c.courseName,
    courseDescription: c.description,
    bankDescription: `Ngân hàng câu hỏi của khóa học ${c.courseName}`,
    isPublished: true,
    createdAt: daysAgo(100 - idx * 3),
    updatedAt: daysAgo(100 - idx * 3),
    __v: 0
  });

  c.chapters.forEach((ch, ci) => {
    const pathId = new mongoose.Types.ObjectId();
    DATA_paths.push({
      _id: pathId,
      courseId: courseId,
      pathName: ch.title,
      description: ch.description || "",
      order: ci + 1,
      createdAt: daysAgo(100 - idx * 3),
      updatedAt: daysAgo(100 - idx * 3),
      __v: 0
    });

    ch.lessons.forEach((lesson, li) => {
      const nodeId = new mongoose.Types.ObjectId();
      DATA_pathnodes.push({
        _id: nodeId,
        pathId: pathId,
        nodeName: lesson.title,
        nodeOrder: li + 1,
        description: `Hướng dẫn chi tiết cho bài học ${lesson.title}`,
        isFree: lesson.isFree || false,
        __v: 0
      });

      let matType = "VIDEO";
      if (lesson.type === "reading") matType = "TEXT";
      else if (lesson.type === "quiz") matType = "DOC";

      if (lesson.url && lesson.type === "video") {
        DATA_nodematerials.push({
          _id: new mongoose.Types.ObjectId(),
          nodeId: nodeId,
          materialType: "VIDEO",
          title: lesson.title,
          materialUrl: lesson.url,
          materialOrder: 1,
          sourceType: "LINK",
          fileName: null,
          fileSize: null,
          embedUrl: lesson.url.replace("watch?v=", "embed/"),
          __v: 0
        });
      } else if (lesson.type === "reading") {
        DATA_nodematerials.push({
          _id: new mongoose.Types.ObjectId(),
          nodeId: nodeId,
          materialType: "TEXT",
          title: lesson.title,
          materialUrl: null,
          materialOrder: 1,
          sourceType: "UPLOAD",
          content: `<h3>${lesson.title} - Guide</h3><p>Đây là bài tập rèn luyện kỹ năng viết luận tiếng Anh (AI Writing Practice). Quý học viên hãy tiến hành đọc kỹ yêu cầu đề bài bên dưới, sau đó viết một đoạn văn ngắn (tối thiểu 30 từ, tối đa 300 từ) và bấm nút <strong>Nộp bài & Chấm điểm AI</strong> để Trợ lý AI thực hiện đánh giá, phân tích và sửa lỗi chính tả ngữ pháp trực tiếp.</p>`,
          fileName: "Writing task.pdf",
          fileSize: 12450,
          embedUrl: null,
          __v: 0
        });
      }
    });
  });
});

async function main() {
  console.log(`🔌 Connecting to MongoDB: ${MONGO_URI}...\n`);
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const collectionsToSeed = [
    { name: "categories", data: DATA_categories },
    { name: "coursecomments", data: DATA_coursecomments },
    { name: "courses", data: DATA_courses },
    { name: "levels", data: DATA_levels },
    { name: "nodematerials", data: DATA_nodematerials },
    { name: "otpverifications", data: DATA_otpverifications },
    { name: "pathnodes", data: DATA_pathnodes },
    { name: "paths", data: DATA_paths },
    { name: "questionbanks", data: DATA_questionbanks },
    { name: "questionchoices", data: DATA_questionchoices },
    { name: "questions", data: DATA_questions },
    { name: "questionspaths", data: DATA_questionspaths },
    { name: "questiontypes", data: DATA_questiontypes },
    { name: "roles", data: DATA_roles },
    { name: "testattempts", data: DATA_testattempts },
    { name: "testquestionchoices", data: DATA_testquestionchoices },
    { name: "testquestioncollections", data: DATA_testquestioncollections },
    { name: "testquestions", data: DATA_testquestions },
    { name: "tests", data: DATA_tests },
    { name: "usercategories", data: DATA_usercategories },
    { name: "usercourses", data: DATA_usercourses },
    { name: "usernodes", data: DATA_usernodes },
    { name: "userroles", data: DATA_userroles },
    { name: "users", data: DATA_users },
  ];

  for (const col of collectionsToSeed) {
    console.log(`📦 Seeding collection [${col.name}]...`);
    const collections = await db.listCollections({ name: col.name }).toArray();
    if (collections.length > 0) {
      await db.collection(col.name).drop();
      console.log(`  🗑  Dropped old collection`);
    }

    if (col.data && col.data.length > 0) {
      await db.collection(col.name).insertMany(col.data);
      console.log(`  ✅ Seeded ${col.data.length} records successfully.`);
    } else {
      console.log(`  ℹ️  Collection was empty. Skipped insertion.`);
    }
  }

  console.log("\n═══════════════════════════════════════════");
  console.log("  🎉 All data seeded successfully!");
  console.log("═══════════════════════════════════════════\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("\n❌ Error:", err.message);
  process.exit(1);
});
