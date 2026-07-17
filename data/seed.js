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
  // ─── DỮ LIỆU TÍCH HỢP 20 KHÓA HỌC CHI TIẾT ───
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
  
  const MENTOR_ID = new mongoose.Types.ObjectId("6a42b0c8e3c24fb9bdb8d05d");
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
      thumbnail: `/assets/avatars/courses/course_avt_${(idx % 4) + 1}.jpg`,
      rating: c.rating || 0,
      totalLessons,
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
          description: "",
          isFree: li === 0,
          __v: 0
        });

        let matType = "VIDEO";
        if (lesson.type === "reading") matType = "DOC";
        else if (lesson.type === "quiz") matType = "DOC";

        if (lesson.url && lesson.type === "video") {
          DATA_nodematerials.push({
            _id: new mongoose.Types.ObjectId(),
            nodeId: nodeId,
            materialType: matType,
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
            materialType: "DOC",
            title: lesson.title,
            materialUrl: null,
            materialOrder: 1,
            sourceType: "UPLOAD",
            fileName: "Reading text.pdf",
            fileSize: 12450,
            embedUrl: null,
            __v: 0
          });
        }
      });
    });
  });
  
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
