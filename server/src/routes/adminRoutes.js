const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// Apply verifyToken -> isAdmin middlewares to all admin routes
router.use(verifyToken, isAdmin);

// Statistics
router.get("/statistics", adminController.getStatistics);

// Categories CRUD & History
router.get("/categories", adminController.getCategories);
router.post("/categories", adminController.createCategory);
router.put("/categories/:id", adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);
router.get("/categories/history", adminController.getCategoryHistory);

// Users block/unblock & CRUD
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.patch("/users/:id/block", adminController.toggleUserBlock);
router.delete("/users/:id", adminController.deleteUser);

// Course Status Toggle
router.get("/courses", adminController.getCourses);
router.patch("/courses/:id/status", adminController.toggleCourseStatus);

// Mentor Registration Approvals
router.get("/mentors/registrations", adminController.getMentorRegistrations);
router.patch("/mentors/registrations/:id", adminController.processMentorRegistration);

// Notifications Control
router.get("/notifications", adminController.getNotifications);
router.patch("/notifications/:id/read", adminController.toggleNotificationReadStatus);
router.post("/notifications/mark-all-read", adminController.markAllNotificationsRead);

module.exports = router;
