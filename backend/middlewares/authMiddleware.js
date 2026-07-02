const jwt = require('jsonwebtoken');
const User = require('../models/MongoDB/User');

const protect = async (req, res, next) => {
  try {
    let userId;

    // 1. JWT trong Authorization header (nếu có và hợp lệ)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      if (token && token !== 'null' && token !== 'undefined') {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'star_learning_secret');
          userId = decoded.userId;
        } catch (jwtErr) {
          // Token hết hạn/không hợp lệ — thử fallback x-user-id bên dưới
        }
      }
    }

    // 2. Fallback: header x-user-id (cách app đang dùng khi login)
    if (!userId && req.headers['x-user-id']) {
      userId = req.headers['x-user-id'];
    } else if (!userId && req.body && req.body.userId) {
      userId = req.body.userId;
    } else if (!userId && req.query && req.query.userId) {
      userId = req.query.userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. No token or userId provided.' });
    }

    // Verify user exists in MongoDB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. User does not exist.' });
    }

    // Attach user to request
    req.user = { userId: user._id.toString(), _id: user._id };
    next();
  } catch (err) {
    console.error('[AuthMiddleware Error]', err.message);
    return res.status(401).json({ success: false, message: 'Unauthorized. Token is invalid or expired.' });
  }
};

module.exports = { protect };
