const { sql } = require('../config/db');

// ============================================================
// GET /api/users/profile
// ============================================================
const getProfile = async (req, res) => {
  const userId = req.user.userId;

  try {
    const userReq = new sql.Request();
    userReq.input('userId', sql.Int, userId);
    
    // Fetch basic user profile fields (FullName, Email, Phone, DateOfBirth, CreatedAt)
    const userResult = await userReq.query(`
      SELECT FullName, Email, Phone, DateOfBirth, CreatedAt
      FROM Users
      WHERE UserId = @userId
    `);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const user = userResult.recordset[0];

    // Fetch learning stats (In progress courses & Completed courses)
    const statsReq = new sql.Request();
    statsReq.input('userId', sql.Int, userId);
    const statsResult = await statsReq.query(`
      SELECT 
        COUNT(CASE WHEN uc.ProgressPercentage < 100 THEN 1 END) AS learning,
        COUNT(CASE WHEN uc.ProgressPercentage = 100 THEN 1 END) AS completed
      FROM User_Courses uc
      INNER JOIN Courses c ON uc.CourseId = c.CourseId
      WHERE uc.UserId = @userId
    `);

    const stats = statsResult.recordset[0];

    return res.json({
      success: true,
      profile: {
        name: user.FullName,
        email: user.Email,
        phone: user.Phone,
        dateOfBirth: user.DateOfBirth,
        joinedAt: user.CreatedAt,
        stats: {
          learning: stats.learning || 0,
          completed: stats.completed || 0
        }
      }
    });

  } catch (err) {
    console.error('[GetProfile Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ============================================================
// PUT /api/users/profile
// ============================================================
const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  // SECURITY RULE: Ignoring Email if sent to prevent malicious updates
  const { name, phone, dateOfBirth } = req.body; 

  if (!name || !phone || !dateOfBirth) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ tên, số điện thoại và ngày sinh.' });
  }

  try {
    const updateReq = new sql.Request();
    updateReq.input('userId', sql.Int, userId);
    updateReq.input('name', sql.NVarChar(100), name);
    updateReq.input('phone', sql.NVarChar(20), phone);
    updateReq.input('dateOfBirth', sql.Date, new Date(dateOfBirth));
    
    await updateReq.query(`
      UPDATE Users 
      SET FullName = @name, 
          Phone = @phone, 
          DateOfBirth = @dateOfBirth,
          UpdatedAt = GETDATE()
      WHERE UserId = @userId
    `);

    return res.json({
      success: true,
      message: 'Cập nhật hồ sơ thành công.'
    });

  } catch (err) {
    console.error('[UpdateProfile Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ============================================================
// PUT /api/users/change-password
// ============================================================
const changePassword = async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin.' });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ success: false, message: 'Mật khẩu mới không được trùng với mật khẩu cũ.' });
  }

  try {
    const userReq = new sql.Request();
    userReq.input('userId', sql.Int, userId);
    const result = await userReq.query('SELECT Password FROM Users WHERE UserId = @userId');

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
    }

    const storedPassword = result.recordset[0].Password;

    if (storedPassword !== currentPassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    }

    const updateReq = new sql.Request();
    updateReq.input('userId', sql.Int, userId);
    updateReq.input('newPassword', sql.NVarChar(255), newPassword);
    
    await updateReq.query(`
      UPDATE Users 
      SET Password = @newPassword, UpdatedAt = GETDATE()
      WHERE UserId = @userId
    `);

    return res.json({ success: true, message: 'Đổi mật khẩu thành công.' });
  } catch (err) {
    console.error('[ChangePassword Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
