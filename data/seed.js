/**
 * WDP English Learning Platform - MongoDB Seed Script
 * Contains all database records inlined directly.
 */

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wdp_english";
const daysAgo = (n) => new Date(Date.now() - n * 86400000);

const DATA_categories = [
  {
    _id: new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d057"),
    categoryName: "toeic",
    displayName: "TOEIC",
    name: "TOEIC",
    slug: "toeic",
    code: "TOEIC",
    description: "Luyện thi TOEIC Listening & Reading chuẩn ETS",
    color: "bg-blue-50 text-blue-600",
    count: 12,
    isActive: true,
    createdAt: daysAgo(360),
    updatedAt: daysAgo(10)
  },
  {
    _id: new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d058"),
    categoryName: "ielts",
    displayName: "IELTS",
    name: "IELTS",
    slug: "ielts",
    code: "IELTS",
    description: "Luyện thi IELTS Academic & General Training",
    color: "bg-green-50 text-green-600",
    count: 8,
    isActive: true,
    createdAt: daysAgo(360),
    updatedAt: daysAgo(15)
  },
  {
    _id: new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d059"),
    categoryName: "giao-tiep",
    displayName: "Giao tiếp",
    name: "Giao tiếp",
    slug: "giao-tiep",
    code: "COMMUNICATION",
    description: "Tiếng Anh giao tiếp hàng ngày, tự tin nói chuyện",
    color: "bg-yellow-50 text-yellow-600",
    count: 10,
    isActive: true,
    createdAt: daysAgo(350),
    updatedAt: daysAgo(20)
  },
  {
    _id: new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05a"),
    categoryName: "ngu-phap",
    displayName: "Ngữ pháp",
    name: "Ngữ pháp",
    slug: "ngu-phap",
    code: "GRAMMAR",
    description: "Hệ thống ngữ pháp tiếng Anh từ cơ bản đến nâng cao",
    color: "bg-purple-50 text-purple-600",
    count: 6,
    isActive: true,
    createdAt: daysAgo(350),
    updatedAt: daysAgo(25)
  },
  {
    _id: new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05b"),
    categoryName: "tu-vung",
    displayName: "Từ vựng",
    name: "Từ vựng",
    slug: "tu-vung",
    code: "VOCABULARY",
    description: "Học từ vựng theo chủ đề với flashcard và spaced repetition",
    color: "bg-pink-50 text-pink-600",
    count: 9,
    isActive: true,
    createdAt: daysAgo(340),
    updatedAt: daysAgo(30)
  },
  {
    _id: new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05c"),
    categoryName: "business-english",
    displayName: "Business English",
    name: "Business English",
    slug: "business-english",
    code: "BUSINESS",
    description: "Tiếng Anh thương mại, email, thuyết trình chuyên nghiệp",
    color: "bg-orange-50 text-orange-600",
    count: 5,
    isActive: true,
    createdAt: daysAgo(320),
    updatedAt: daysAgo(12)
  }
];

const DATA_coursecomments = [
];

const DATA_courses = [
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d072"), "courseName": "Demo Course 1", "description": "Information Technology course on ReactJS", "categoryId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05a"), "levelId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d056"), "instructorId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05d"), "thumbnail": "/assets/avatars/courses/course_avt_1.jpg", "rating": 0, "totalLessons": 2, "isPublished": true, "createdAt": new Date("2026-06-25T00:50:17.190Z"), "updatedAt": new Date("2026-06-25T00:50:17.190Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d073"), "courseName": "Demo Course 2", "description": "Description for Demo Course 2", "categoryId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05a"), "levelId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d055"), "instructorId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05d"), "thumbnail": "/assets/avatars/courses/course_avt_2.jpg", "rating": 0, "totalLessons": 1, "isPublished": true, "createdAt": new Date("2026-06-25T02:01:51.347Z"), "updatedAt": new Date("2026-06-25T02:01:51.347Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d074"), "courseName": "300 Rounds with One-Eyed Monster", "description": "Sample description", "categoryId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d058"), "levelId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d054"), "instructorId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05d"), "thumbnail": "/assets/avatars/courses/course_avt_3.jpg", "rating": 0, "totalLessons": 1, "isPublished": false, "createdAt": new Date("2026-06-25T05:51:46.730Z"), "updatedAt": new Date("2026-06-25T05:51:46.730Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d075"), "courseName": "300 Rounds Battle", "description": "Sample description", "categoryId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05b"), "levelId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d056"), "instructorId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05d"), "thumbnail": "/assets/avatars/courses/course_avt_4.jpg", "rating": 0, "totalLessons": 1, "isPublished": false, "createdAt": new Date("2026-06-25T06:04:05.840Z"), "updatedAt": new Date("2026-06-25T06:04:05.840Z"), "__v": 0},
];

const DATA_levels = [
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d053"), "levelName": "người-mới-bắt-đầu", "displayName": "Beginner", "sortOrder": 1, "isActive": true, "createdAt": new Date("2026-06-25T00:47:02.923Z"), "updatedAt": new Date("2026-06-25T00:47:02.923Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d054"), "levelName": "elementary", "displayName": "Elementary", "sortOrder": 2, "isActive": true, "createdAt": new Date("2026-06-25T00:47:02.923Z"), "updatedAt": new Date("2026-06-25T00:47:02.923Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d055"), "levelName": "intermediate", "displayName": "Intermediate", "sortOrder": 3, "isActive": true, "createdAt": new Date("2026-06-25T00:47:02.923Z"), "updatedAt": new Date("2026-06-25T00:47:02.923Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d056"), "levelName": "advanced", "displayName": "Advanced", "sortOrder": 4, "isActive": true, "createdAt": new Date("2026-06-25T00:47:02.923Z"), "updatedAt": new Date("2026-06-25T00:47:02.923Z"), "__v": 0},
];

const DATA_nodematerials = [
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d080"), "nodeId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d07b"), "materialType": "VIDEO", "title": "What is ReactJS?", "materialUrl": "https://www.youtube.com/watch?v=eTCx2FyE9jc&list=RDeTCx2FyE9jc&start_radio=1", "materialOrder": 1, "sourceType": "LINK", "fileName": null, "fileSize": null, "embedUrl": "https://www.youtube.com/embed/eTCx2FyE9jc", "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d081"), "nodeId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d07c"), "materialType": "DOC", "title": "Reference Materials", "materialUrl": "https://res.cloudinary.com/diyjnwfsy/raw/upload/v1782323413/learning-path/materials/Slot8_Props_State_and_Context_1782070938584_%281%29_1782323411322.pptx", "materialOrder": 1, "sourceType": "UPLOAD", "fileName": "Slot8_Props_State_and_Context_1782070938584 (1).pptx", "fileSize": 1450851, "embedUrl": null, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d082"), "nodeId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d07d"), "materialType": "VIDEO", "title": "Video 1", "materialUrl": "https://www.youtube.com/watch?v=AE3eD-XV4vg&list=RDeTCx2FyE9jc&index=16", "materialOrder": 1, "sourceType": "LINK", "fileName": null, "fileSize": null, "embedUrl": "https://www.youtube.com/embed/AE3eD-XV4vg", "__v": 0},
];

const DATA_otpverifications = [
];

const DATA_pathnodes = [
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d07b"), "pathId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d076"), "nodeName": "Introduction to ReactJS", "nodeOrder": 1, "description": "Learn related concepts", "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d07c"), "pathId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d077"), "nodeName": "Getting Familiar with Syntax", "nodeOrder": 1, "description": null, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d07d"), "pathId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d078"), "nodeName": "Sample Node", "nodeOrder": 1, "description": "Sample Node", "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d07e"), "pathId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d079"), "nodeName": "Sample Node", "nodeOrder": 1, "description": "Sample Node", "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d07f"), "pathId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d07a"), "nodeName": "Sample Node", "nodeOrder": 1, "description": "adsfasdf", "__v": 0},
];

const DATA_paths = [
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d076"), "courseId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d072"), "pathName": "Chapter 1", "description": "Overview of ReactJS", "order": 1, "createdAt": new Date("2026-06-25T00:50:17.270Z"), "updatedAt": new Date("2026-06-25T00:50:17.270Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d077"), "courseId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d072"), "pathName": "ReactJS Practice", "description": "Exercises", "order": 2, "createdAt": new Date("2026-06-25T00:50:17.327Z"), "updatedAt": new Date("2026-06-25T00:50:17.327Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d078"), "courseId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d073"), "pathName": "Chapter 1 Demo", "description": "Sample description", "order": 1, "createdAt": new Date("2026-06-25T02:01:53.107Z"), "updatedAt": new Date("2026-06-25T02:01:53.107Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d079"), "courseId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d074"), "pathName": "Sample Path", "description": "Sample description", "order": 1, "createdAt": new Date("2026-06-25T05:51:46.767Z"), "updatedAt": new Date("2026-06-25T05:51:46.767Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d07a"), "courseId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d075"), "pathName": "Sample Path", "description": "Sample description", "order": 1, "createdAt": new Date("2026-06-25T06:04:05.870Z"), "updatedAt": new Date("2026-06-25T06:04:05.870Z"), "__v": 0},
];

const DATA_questionbanks = [
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d086"), "instructorId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05d"), "courseId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d072"), "courseName": "Demo Course 1", "courseDescription": "Information Technology course on ReactJS", "bankDescription": "React ch", "isPublished": false, "createdAt": new Date("2026-06-25T01:46:13.106Z"), "updatedAt": new Date("2026-06-25T01:46:13.106Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d087"), "instructorId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05d"), "courseId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d073"), "courseName": "Demo Course 2", "courseDescription": "Description for Demo Course 2", "bankDescription": "test ch", "isPublished": false, "createdAt": new Date("2026-06-25T05:44:34.461Z"), "updatedAt": new Date("2026-06-25T05:44:34.461Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d088"), "instructorId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05d"), "courseId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d074"), "courseName": "300 Rounds with One-Eyed Monster", "courseDescription": "Sample description", "bankDescription": "ádf", "isPublished": false, "createdAt": new Date("2026-06-25T06:02:01.288Z"), "updatedAt": new Date("2026-06-25T06:02:01.288Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d089"), "instructorId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05d"), "courseId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d075"), "courseName": "300 Rounds Battle", "courseDescription": "Sample description", "bankDescription": "adsfasdf", "isPublished": false, "createdAt": new Date("2026-06-25T06:12:46.520Z"), "updatedAt": new Date("2026-06-25T06:12:46.520Z"), "__v": 0},
];

const DATA_questionchoices = [
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d095"), "questionId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d091"), "title": "A", "order": 1, "isTrue": true, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d096"), "questionId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d091"), "title": "B", "order": 2, "isTrue": false, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d097"), "questionId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d092"), "title": "A", "order": 1, "isTrue": true, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d098"), "questionId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d092"), "title": "B", "order": 2, "isTrue": false, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d099"), "questionId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d093"), "title": "bbccc", "order": 1, "isTrue": true, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d09a"), "questionId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d093"), "title": "ads", "order": 2, "isTrue": false, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d09b"), "questionId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d093"), "title": "bcc", "order": 3, "isTrue": true, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d09c"), "questionId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d093"), "title": "ads", "order": 4, "isTrue": false, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d09d"), "questionId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d094"), "title": "Dạ em chào đại ca", "order": 1, "isTrue": true, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d09e"), "questionId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d094"), "title": "Hoàng Hưng và 4 chú chó đốm", "order": 2, "isTrue": true, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d09f"), "questionId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d094"), "title": "Hẹ hẹ hẹ hẹ", "order": 3, "isTrue": false, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d0a0"), "questionId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d094"), "title": "ki mồ chíiiii", "order": 4, "isTrue": true, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d0a1"), "questionId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d094"), "title": "ngon thíiiiiiiiiiiiiiiiiiiiiiiiiii", "order": 5, "isTrue": true, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d0a2"), "questionId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d094"), "title": "mlemmm mlemmmm", "order": 6, "isTrue": true, "__v": 0},
];

const DATA_questions = [
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d091"), "title": "Test reading Q1", "questionPathId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d08a"), "isActive": true, "typeId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d08f"), "url": null, "order": 1, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d092"), "title": "React hook la gi?", "questionPathId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d08b"), "isActive": true, "typeId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d08f"), "url": null, "order": 1, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d093"), "title": "adasdds", "questionPathId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d08c"), "isActive": true, "typeId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d08e"), "url": "https://www.tiktok.com/@_sulyuu_0/video/7533043632379579666?is_from_webapp=1&sender_device=pc", "order": 1, "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d094"), "title": "Mày biết bố mày là ai không?", "questionPathId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d08d"), "isActive": true, "typeId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d08e"), "url": "https://res.cloudinary.com/diyjnwfsy/video/upload/v1782342765/learning-path/materials/audio/snaptik.vn_7633463586270039316_1782342762209.mp4", "order": 1, "__v": 0},
];

const DATA_questionspaths = [
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d08a"), "bankId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d087"), "pathId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d078"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d08b"), "bankId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d086"), "pathId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d077"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d08c"), "bankId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d088"), "pathId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d079"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d08d"), "bankId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d089"), "pathId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d07a"), "__v": 0},
];

const DATA_questiontypes = [
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d08e"), "name": "Listening ", "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d08f"), "name": "Reading   ", "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d090"), "name": "Vocabulary", "__v": 0},
];

const DATA_roles = [
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d050"), "roleName": "Admin", "description": "Quản trị viên hệ thống — toàn quyền quản lý", "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d051"), "roleName": "Student", "description": "Học viên — truy cập khóa học và lộ trình học tập", "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d052"), "roleName": "Mentor", "description": "Người hướng dẫn — tạo nội dung và theo dõi học viên", "__v": 0},
];

const DATA_testattempts = [
];

const DATA_testquestionchoices = [
];

const DATA_testquestioncollections = [
];

const DATA_testquestions = [
];

const DATA_tests = [
];

const DATA_usercategories = [
];

const DATA_usercourses = [
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d083"), "userId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05e"), "courseId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d072"), "progressPercentage": 100, "enrollmentDate": new Date("2026-06-25T14:17:21.053Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42be20c108c5a4df79ff47"), "userId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05e"), "courseId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d073"), "progressPercentage": 100, "enrollmentDate": new Date("2026-06-29T18:49:04.333Z"), "__v": 0},
];

const DATA_usernodes = [
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d084"), "userId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05e"), "nodeId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d07b"), "isCompleted": true, "completedAt": new Date("2026-06-25T14:17:29.417Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d085"), "userId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05e"), "nodeId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d07c"), "isCompleted": true, "completedAt": new Date("2026-06-25T14:17:35.930Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42dac14e0ef9452d0bd038"), "nodeId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d07d"), "userId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05e"), "__v": 0, "completedAt": new Date("2026-06-29T20:51:13.803Z"), "isCompleted": true},
];

const DATA_userroles = [
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d06b"), "userId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05c"), "roleId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d050"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d06c"), "userId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05d"), "roleId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d052"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d06d"), "userId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05e"), "roleId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d051"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d06e"), "userId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d064"), "roleId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d052"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d06f"), "userId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d068"), "roleId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d052"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d070"), "userId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d069"), "roleId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d050"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d071"), "userId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d06a"), "roleId": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d051"), "__v": 0},
];

const DATA_users = [
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05c"), "fullName": "Nguyễn Văn Admin", "email": "admin@gmail.com", "phone": "0911111111", "password": "123456", "dateOfBirth": null, "isFirstLogin": false, "resetOtpCode": null, "resetOtpExpires": null, "currentLevelId": null, "learningGoal": null, "avatarUrl": null, "isActive": true, "createdAt": new Date("2026-06-25T00:47:02.960Z"), "updatedAt": new Date("2026-06-25T00:47:02.960Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05d"), "fullName": "Trần Văn Mentor", "email": "mentor@gmail.com", "phone": "0922222222", "password": "123456", "dateOfBirth": null, "isFirstLogin": false, "resetOtpCode": null, "resetOtpExpires": null, "currentLevelId": null, "learningGoal": null, "avatarUrl": null, "isActive": true, "createdAt": new Date("2026-06-25T00:47:02.960Z"), "updatedAt": new Date("2026-06-25T00:47:02.960Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05e"), "fullName": "Lê Văn Student", "email": "student@gmail.com", "phone": "0933333333", "password": "123456", "dateOfBirth": null, "isFirstLogin": false, "resetOtpCode": null, "resetOtpExpires": null, "currentLevelId": null, "learningGoal": null, "avatarUrl": null, "isActive": true, "createdAt": new Date("2026-06-25T00:47:02.960Z"), "updatedAt": new Date("2026-06-25T00:47:02.960Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05f"), "fullName": "Nguyễn Minh An", "email": "inst0@gmail.com", "phone": "0900000000", "password": "123456", "dateOfBirth": null, "isFirstLogin": false, "resetOtpCode": null, "resetOtpExpires": null, "currentLevelId": null, "learningGoal": null, "avatarUrl": null, "isActive": true, "createdAt": new Date("2026-06-25T00:47:03.040Z"), "updatedAt": new Date("2026-06-25T00:47:03.040Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d060"), "fullName": "Hoàng Thùy Linh", "email": "inst1@gmail.com", "phone": "0900000001", "password": "123456", "dateOfBirth": null, "isFirstLogin": false, "resetOtpCode": null, "resetOtpExpires": null, "currentLevelId": null, "learningGoal": null, "avatarUrl": null, "isActive": true, "createdAt": new Date("2026-06-25T00:47:03.047Z"), "updatedAt": new Date("2026-06-25T00:47:03.047Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d061"), "fullName": "Trần Quốc Huy", "email": "inst2@gmail.com", "phone": "0900000002", "password": "123456", "dateOfBirth": null, "isFirstLogin": false, "resetOtpCode": null, "resetOtpExpires": null, "currentLevelId": null, "learningGoal": null, "avatarUrl": null, "isActive": true, "createdAt": new Date("2026-06-25T00:47:03.050Z"), "updatedAt": new Date("2026-06-25T00:47:03.050Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d062"), "fullName": "Nguyễn Bảo Trân", "email": "inst3@gmail.com", "phone": "0900000003", "password": "123456", "dateOfBirth": null, "isFirstLogin": false, "resetOtpCode": null, "resetOtpExpires": null, "currentLevelId": null, "learningGoal": null, "avatarUrl": null, "isActive": true, "createdAt": new Date("2026-06-25T00:47:03.053Z"), "updatedAt": new Date("2026-06-25T00:47:03.053Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d063"), "fullName": "Nguyễn Lan Anh", "email": "inst4@gmail.com", "phone": "0900000004", "password": "123456", "dateOfBirth": null, "isFirstLogin": false, "resetOtpCode": null, "resetOtpExpires": null, "currentLevelId": null, "learningGoal": null, "avatarUrl": null, "isActive": true, "createdAt": new Date("2026-06-25T00:47:03.057Z"), "updatedAt": new Date("2026-06-25T00:47:03.057Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d064"), "fullName": "Đỗ Khánh Vy", "email": "inst5@gmail.com", "phone": "0900000005", "password": "123456", "dateOfBirth": null, "isFirstLogin": false, "resetOtpCode": null, "resetOtpExpires": null, "currentLevelId": null, "learningGoal": null, "avatarUrl": null, "isActive": true, "createdAt": new Date("2026-06-25T00:47:03.060Z"), "updatedAt": new Date("2026-06-25T00:47:03.060Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d065"), "fullName": "Vũ Minh Tuấn", "email": "inst6@gmail.com", "phone": "0900000006", "password": "123456", "dateOfBirth": null, "isFirstLogin": false, "resetOtpCode": null, "resetOtpExpires": null, "currentLevelId": null, "learningGoal": null, "avatarUrl": null, "isActive": true, "createdAt": new Date("2026-06-25T00:47:03.067Z"), "updatedAt": new Date("2026-06-25T00:47:03.067Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d066"), "fullName": "Lê Thu Hà", "email": "inst7@gmail.com", "phone": "0900000007", "password": "123456", "dateOfBirth": null, "isFirstLogin": false, "resetOtpCode": null, "resetOtpExpires": null, "currentLevelId": null, "learningGoal": null, "avatarUrl": null, "isActive": true, "createdAt": new Date("2026-06-25T00:47:03.070Z"), "updatedAt": new Date("2026-06-25T00:47:03.070Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d067"), "fullName": "Trịnh Hoàng Nam", "email": "inst8@gmail.com", "phone": "0900000008", "password": "123456", "dateOfBirth": null, "isFirstLogin": false, "resetOtpCode": null, "resetOtpExpires": null, "currentLevelId": null, "learningGoal": null, "avatarUrl": null, "isActive": true, "createdAt": new Date("2026-06-25T00:47:03.073Z"), "updatedAt": new Date("2026-06-25T00:47:03.073Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d068"), "fullName": "Mai Phương Anh", "email": "inst9@gmail.com", "phone": "0900000009", "password": "123456", "dateOfBirth": null, "isFirstLogin": false, "resetOtpCode": null, "resetOtpExpires": null, "currentLevelId": null, "learningGoal": null, "avatarUrl": null, "isActive": false, "createdAt": new Date("2026-06-25T00:47:03.080Z"), "updatedAt": new Date("2026-06-25T00:47:03.080Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d069"), "fullName": "Phạm Văn Đức", "email": "inst10@gmail.com", "phone": "0900000010", "password": "123456", "dateOfBirth": null, "isFirstLogin": false, "resetOtpCode": null, "resetOtpExpires": null, "currentLevelId": null, "learningGoal": null, "avatarUrl": null, "isActive": true, "createdAt": new Date("2026-06-25T00:47:03.083Z"), "updatedAt": new Date("2026-06-25T00:47:03.083Z"), "__v": 0},
  {"_id": new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d06a"), "fullName": "Lê Quang Huy", "email": "inst11@gmail.com", "phone": "0900000011", "password": "123456", "dateOfBirth": null, "isFirstLogin": false, "resetOtpCode": null, "resetOtpExpires": null, "currentLevelId": null, "learningGoal": null, "avatarUrl": null, "isActive": false, "createdAt": new Date("2026-06-25T00:47:03.087Z"), "updatedAt": new Date("2026-06-25T00:47:03.087Z"), "__v": 0},
];

async function main() {
  console.log(`🔌 Connecting to MongoDB: ${MONGO_URI}...`);
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
    console.log(`\n📦 Seeding collection [${col.name}]...`);

    // Drop collection
    const existing = await db.listCollections({ name: col.name }).toArray();
    if (existing.length > 0) {
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
