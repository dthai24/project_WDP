const jwt = require('jsonwebtoken');
const { sql } = require('../config/db');

const protect = async (req, res, next) => {
  try {
    let userId;

    // 1. Check for JWT Token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'star_learning_secret');
      userId = decoded.userId;
    } 
    // 2. Fallback check for session-based custom header or body/query payload 
    // (since frontend currently stores raw user object in sessionStorage)
    else if (req.headers['x-user-id']) {
      userId = req.headers['x-user-id'];
    } else if (req.body && req.body.userId) {
      userId = req.body.userId;
    } else if (req.query && req.query.userId) {
      userId = req.query.userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. No token or userId provided.' });
    }

    // Verify user exists in DB
    const checkReq = new sql.Request();
    checkReq.input('userId', sql.Int, parseInt(userId, 10));
    const result = await checkReq.query('SELECT UserId FROM Users WHERE UserId = @userId');

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'Unauthorized. User does not exist.' });
    }

    // Attach user to request
    req.user = { userId: parseInt(userId, 10) };
    next();
  } catch (err) {
    console.error('[AuthMiddleware Error]', err.message);
    return res.status(401).json({ success: false, message: 'Unauthorized. Token is invalid or expired.' });
  }
};

module.exports = { protect };
