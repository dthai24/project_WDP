const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ email và mật khẩu." });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      password: password
    });

    if (!user) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không chính xác." });
    }

    return res.status(200).json({
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi đăng nhập." });
  }
});

module.exports = router;
