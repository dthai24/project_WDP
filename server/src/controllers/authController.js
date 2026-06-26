const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Course = require("../models/courseModel");
const CategoryHistory = require("../models/categoryHistoryModel");
const MentorRegistration = require("../models/mentorRegistrationModel");

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Incorrect email or password." });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: "Your account has been blocked." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect email or password." });
    }

    // Sign JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "english_master_secret_key_123",
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      token,
      email: user.email,
      name: user.name,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roles: user.roles,
        xp: user.xp,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({ success: false, message: "System error during login." });
  }
};

// Seed database function
const seedDatabase = async () => {
  try {
    // Check if old categories (A1, A2, B1, B2, EP) exist in the database.
    // If so, clear collections to ensure clean refactoring of roles & categories.
    const oldCategories = await Category.find({ code: { $in: ["A1", "A2", "B1", "B2", "EP"] } });
    if (oldCategories.length > 0) {
      console.log("Old category codes detected (including legacy EP). Clearing old database tables for reseed...");
      await User.deleteMany({});
      await Category.deleteMany({});
      await CategoryHistory.deleteMany({});
      await Course.deleteMany({});
      await MentorRegistration.deleteMany({});
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("Seeding test accounts to database...");
      
      const users = await User.create([
        {
          name: "Admin Minh",
          email: "admin@gmail.com",
          password: "123456",
          role: "Admin",
          roles: [{ roleId: 3, roleName: "Admin" }]
        },
        {
          name: "Minh",
          email: "minh@gmail.com",
          password: "Minh_1234",
          role: "Admin",
          roles: [{ roleId: 3, roleName: "Admin" }]
        },
        {
          name: "Mentor User",
          email: "mentor@gmail.com",
          password: "123456",
          role: "Mentor",
          roles: [{ roleId: 2, roleName: "Mentor" }]
        },
        {
          name: "Student User",
          email: "student@gmail.com",
          password: "123456",
          role: "Student",
          roles: [{ roleId: 1, roleName: "Student" }],
          xp: 1520,
          streak: 8
        },
        {
          name: "Nguyễn Văn A",
          email: "nguyenvana@gmail.com",
          password: "123456",
          role: "Student",
          roles: [{ roleId: 1, roleName: "Student" }],
          xp: 850,
          streak: 3
        },
        {
          name: "Trần Thị B",
          email: "tranthib@gmail.com",
          password: "123456",
          role: "Student",
          roles: [{ roleId: 1, roleName: "Student" }],
          xp: 2100,
          streak: 15
        }
      ]);

      const mentor = users.find(u => u.role === "Mentor");
      const admin = users.find(u => u.role === "Admin");

      // Seed Categories
      console.log("Seeding initial categories...");
      await Category.create([
        { code: "EWP", name: "English for Working Professionals", description: "Business correspondence, interviews, and networking." },
        { code: "EFK", name: "English for Kids", description: "Fun, game-oriented english learning for toddlers and children." },
        { code: "GHSE", name: "General High School English", description: "Grammar, syntax, and academic vocabulary based on grade levels." },
        { code: "IELTS", name: "IELTS Preparation", description: "Preparation roadmaps for IELTS international English certificate." },
        { code: "TOEIC", name: "TOEIC Preparation", description: "Preparation roadmaps for TOEIC international English certificate." },
        { code: "APTIS", name: "APTIS Preparation", description: "Preparation roadmaps for APTIS international English certificate." },
        { code: "AECP", name: "Academic English & College Prep", description: "Advanced writing, speaking, and research skills for university courses." },
        { code: "CEC", name: "Conversational English & Communication", description: "Daily communication, listening reflexes, and conversational practice." }
      ]);

      // Seed CategoryHistory
      console.log("Seeding category logs...");
      await CategoryHistory.create([
        {
          action: "CREATE",
          categoryName: "English for Working Professionals",
          target: "EWP",
          actorName: admin.name,
          actor: admin.email,
          timestamp: new Date(Date.now() - 3600000 * 24 * 3).toLocaleString("vi-VN")
        },
        {
          action: "CREATE",
          categoryName: "English for Kids",
          target: "EFK",
          actorName: admin.name,
          actor: admin.email,
          timestamp: new Date(Date.now() - 3600000 * 24 * 2).toLocaleString("vi-VN")
        },
        {
          action: "CREATE",
          categoryName: "IELTS Preparation",
          target: "IELTS",
          actorName: admin.name,
          actor: admin.email,
          timestamp: new Date(Date.now() - 3600000 * 24 * 1).toLocaleString("vi-VN")
        }
      ]);

      // Seed Courses
      console.log("Seeding initial courses...");
      await Course.create([
        {
          title: "English Communication for Working Professionals",
          category: "EWP",
          status: "Active",
          mentorName: mentor.name,
          mentorEmail: mentor.email,
          mentorId: mentor._id
        },
        {
          title: "General High School English Foundations",
          category: "GHSE",
          status: "Active",
          mentorName: mentor.name,
          mentorEmail: mentor.email,
          mentorId: mentor._id
        },
        {
          title: "Comprehensive English Grammar for Kids",
          category: "EFK",
          status: "Pending",
          mentorName: mentor.name,
          mentorEmail: mentor.email,
          mentorId: mentor._id
        },
        {
          title: "Secrets to IELTS Speaking Success",
          category: "IELTS",
          status: "Pending",
          mentorName: mentor.name,
          mentorEmail: mentor.email,
          mentorId: mentor._id
        }
      ]);

      // Seed MentorRegistrations
      console.log("Seeding mentor applications...");
      await MentorRegistration.create([
        {
          fullName: "Lê Hoàng Mentor",
          email: "lehoang@gmail.com",
          portfolioUrl: "https://linkedin.com/in/lehoang",
          bio: "Tôi có 5 năm kinh nghiệm giảng dạy tiếng Anh giao tiếp và luyện thi IELTS 8.0.",
          certificate: "IELTS_8.0_Certificate.png",
          status: "Pending"
        },
        {
          fullName: "Phạm Minh Tâm",
          email: "minhtam@gmail.com",
          portfolioUrl: "https://github.com/minhtam",
          bio: "Thạc sĩ ngôn ngữ Anh tại Đại học Ngoại Ngữ, giảng dạy tại các trung tâm lớn.",
          certificate: "Master_Degree_English.png",
          status: "Pending"
        },
        {
          fullName: "Nguyễn Thị Hương",
          email: "huongnguyen@gmail.com",
          portfolioUrl: "https://huongenglish.vn",
          bio: "Giáo viên tiếng Anh cấp 3, kinh nghiệm dạy học sinh mất căn bản.",
          certificate: "TOEIC_950_Certificate.png",
          status: "Approved"
        }
      ]);

      console.log("Database seeded successfully!");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

module.exports = {
  login,
  seedDatabase
};
