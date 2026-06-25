const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authentication token not found." });
    }

    const token = authHeader.split(" ")[1];
    
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET || "english_master_secret_key_123", async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
      }

      // Find user supporting nested _id.$oid (Extended JSON)
      const user = await User.findOne({ $or: [{ _id: decoded.id }, { "_id.$oid": decoded.id }] });
      if (!user) {
        return res.status(401).json({ success: false, message: "User account does not exist." });
      }

      // Whitelist bypass: Skip block checks and automatically authorize admin@gmail.com and minh@gmail.com
      if (user.email === "admin@gmail.com" || user.email === "minh@gmail.com") {
        req.user = user;
        return next();
      }

      if (user.isBlocked) {
        return res.status(403).json({ success: false, message: "Your account has been blocked." });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Lỗi verifyToken middleware:", error);
    return res.status(500).json({ success: false, message: "System authentication error." });
  }
};

const isAdmin = (req, res, next) => {
  // Whitelist bypass
  if (req.user && (req.user.email === "admin@gmail.com" || req.user.email === "minh@gmail.com")) {
    return next();
  }
  
  const hasAdminRole = req.user && (
    req.user.role === "Admin" ||
    (req.user.roles && req.user.roles.some(r => r.roleId === 3 || r.roleName === "Admin")) ||
    req.user.email === "minh@gmail.com"
  );
  if (hasAdminRole) {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }
};

module.exports = {
  verifyToken,
  isAdmin
};
