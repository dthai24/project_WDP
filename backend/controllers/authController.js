const { sql } = require('../config/db');
const nodemailer = require('nodemailer');

const ROLE_STUDENT = 'Student';

// ============================================================
// Helpers
// ============================================================

const validateEmail = (email) => {
  if (!email || email.includes(' ')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

/** Email OTP cho đăng ký tài khoản (gradient tím) */
const buildRegisterOtpHtml = (fullName, otpCode) => `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0f0e17;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#6c63ff,#a78bfa);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">⭐ S.T.A.R Learning Path</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Xác thực tài khoản của bạn</p>
    </div>
    <div style="padding:32px 24px;background:#1a1830;">
      <p style="color:#c4c3d0;font-size:15px;">Xin chào <strong style="color:#a78bfa;">${fullName}</strong>,</p>
      <p style="color:#c4c3d0;font-size:15px;">Dưới đây là mã OTP để hoàn tất đăng ký tài khoản:</p>
      <div style="text-align:center;margin:28px 0;">
        <span style="display:inline-block;font-size:38px;font-weight:800;letter-spacing:12px;color:#fff;background:linear-gradient(135deg,#6c63ff,#a78bfa);padding:16px 32px;border-radius:12px;">${otpCode}</span>
      </div>
      <p style="color:#8885a0;font-size:13px;text-align:center;">⏰ Mã có hiệu lực trong <strong style="color:#f6b93b;">3 phút</strong>. Vui lòng không chia sẻ với bất kỳ ai.</p>
    </div>
    <div style="padding:16px 24px;background:#0f0e17;text-align:center;">
      <p style="color:#555;font-size:12px;margin:0;">© ${new Date().getFullYear()} S.T.A.R Learning Path. All rights reserved.</p>
    </div>
  </div>
`;

/** Email OTP cho đặt lại mật khẩu (gradient cam-đỏ) */
const buildResetPasswordHtml = (fullName, otpCode) => `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0f0e17;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#f6b93b,#ff6b6b);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">🔑 S.T.A.R Learning Path</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Yêu cầu đặt lại mật khẩu</p>
    </div>
    <div style="padding:32px 24px;background:#1a1830;">
      <p style="color:#c4c3d0;font-size:15px;">Xin chào <strong style="color:#f6b93b;">${fullName}</strong>,</p>
      <p style="color:#c4c3d0;font-size:15px;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Mã OTP:</p>
      <div style="text-align:center;margin:28px 0;">
        <span style="display:inline-block;font-size:38px;font-weight:800;letter-spacing:12px;color:#fff;background:linear-gradient(135deg,#f6b93b,#ff6b6b);padding:16px 32px;border-radius:12px;">${otpCode}</span>
      </div>
      <p style="color:#8885a0;font-size:13px;text-align:center;">⏰ Mã có hiệu lực trong <strong style="color:#f6b93b;">5 phút</strong>. Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>
    </div>
    <div style="padding:16px 24px;background:#0f0e17;text-align:center;">
      <p style="color:#555;font-size:12px;margin:0;">© ${new Date().getFullYear()} S.T.A.R Learning Path. All rights reserved.</p>
    </div>
  </div>
`;

// ============================================================
// POST /api/auth/login
// Works for ALL roles: Admin, Mentor, Student
// ============================================================
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email và mật khẩu không được để trống.' });
  if (!validateEmail(email))
    return res.status(400).json({ success: false, message: 'Định dạng email không hợp lệ.' });

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Lấy thông tin user
    const userReq = new sql.Request();
    userReq.input('email', sql.NVarChar(150), normalizedEmail);
    const userResult = await userReq.query('SELECT UserId, FullName, Email, Phone, Password, IsFirstLogin FROM Users WHERE Email = @email');

    if (userResult.recordset.length === 0)
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });

    const user = userResult.recordset[0];

    if (user.Password !== password)
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });

    // 2. Lấy danh sách roles của user từ User_Roles
    const roleReq = new sql.Request();
    roleReq.input('userId', sql.Int, user.UserId);
    const roleResult = await roleReq.query(`
      SELECT r.RoleName
      FROM   User_Roles ur
      JOIN   Roles      r ON r.RoleId = ur.RoleId
      WHERE  ur.UserId = @userId
    `);

    // Mảng tên roles, ví dụ: ['Admin'] | ['Student'] | ['Mentor']
    let roles = roleResult.recordset.map((r) => r.RoleName);

    // Tài khoản đăng ký qua OTP là Student; fallback nếu chưa có bản ghi User_Roles
    if (roles.length === 0) {
      roles = [ROLE_STUDENT];
    }

    return res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: {
        userId:      user.UserId,
        fullName:    user.FullName,
        email:       user.Email,
        phone:       user.Phone,
        isFirstLogin: user.IsFirstLogin === true || user.IsFirstLogin === 1,
        roles,  // [] nếu Student chưa được gán role, hoặc ['Admin'] / ['Mentor']
      },
    });
  } catch (err) {
    console.error('[Login Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server. Vui lòng thử lại sau.' });
  }
};

// ============================================================
// POST /api/auth/register  (Student only — Admin/Mentor được seed thẳng vào DB)
// ============================================================
const register = async (req, res) => {
  let { fullName, dateOfBirth, phone, email, password } = req.body;

  if (!fullName || !dateOfBirth || !phone || !email || !password)
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ tất cả các trường.' });

  email = email.toLowerCase().trim();
  phone = phone.trim();

  if (!validateEmail(email))
    return res.status(400).json({
      success: false,
      message: 'Email không hợp lệ. Phải có @, dấu chấm và tên miền, không có khoảng trắng.',
    });

  try {
    // Kiểm tra email đã tồn tại trong Users
    const emailCheckReq = new sql.Request();
    emailCheckReq.input('email', sql.NVarChar(150), email);
    const emailCheck = await emailCheckReq.query('SELECT UserId FROM Users WHERE Email = @email');
    if (emailCheck.recordset.length > 0)
      return res.status(409).json({ success: false, message: 'Email này đã được đăng ký. Vui lòng đăng nhập.' });

    // Kiểm tra phone đã tồn tại trong Users
    const phoneCheckReq = new sql.Request();
    phoneCheckReq.input('phone', sql.NVarChar(20), phone);
    const phoneCheck = await phoneCheckReq.query('SELECT UserId FROM Users WHERE Phone = @phone');
    if (phoneCheck.recordset.length > 0)
      return res.status(409).json({ success: false, message: 'Số điện thoại này đã được đăng ký.' });

    // Xoá OTP cũ nếu có
    const deleteReq = new sql.Request();
    deleteReq.input('email', sql.NVarChar(150), email);
    await deleteReq.query('DELETE FROM OTP_Verification WHERE Email = @email');

    // Tạo OTP + thời hạn 3 phút
    const otpCode  = generateOTP();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    const insertReq = new sql.Request();
    insertReq.input('email',       sql.NVarChar(150), email);
    insertReq.input('fullName',    sql.NVarChar(100), fullName);
    insertReq.input('phone',       sql.NVarChar(20),  phone);
    insertReq.input('password',    sql.NVarChar(255), password);
    insertReq.input('dateOfBirth', sql.Date,          new Date(dateOfBirth));
    insertReq.input('otpCode',     sql.NVarChar(6),   otpCode);
    insertReq.input('expiresAt',   sql.DateTime,      expiresAt);

    await insertReq.query(`
      INSERT INTO OTP_Verification (Email, FullName, Phone, Password, DateOfBirth, OtpCode, ExpiresAt)
      VALUES (@email, @fullName, @phone, @password, @dateOfBirth, @otpCode, @expiresAt)
    `);

    const transporter = createTransporter();
    await transporter.sendMail({
      from:    `"S.T.A.R Learning Path" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: '🔐 Mã xác thực OTP của bạn - S.T.A.R Learning Path',
      html:    buildRegisterOtpHtml(fullName, otpCode),
    });

    return res.json({
      success: true,
      message: `Mã OTP đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư (kể cả Spam).`,
    });
  } catch (err) {
    console.error('[Register Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

// ============================================================
// POST /api/auth/verify-otp
// ============================================================
const verifyOtp = async (req, res) => {
  const { email, otpCode } = req.body;

  if (!email || !otpCode)
    return res.status(400).json({ success: false, message: 'Email và mã OTP không được để trống.' });

  try {
    const findReq = new sql.Request();
    findReq.input('email',   sql.NVarChar(150), email.toLowerCase().trim());
    findReq.input('otpCode', sql.NVarChar(6),   otpCode.trim());

    const result = await findReq.query(
      'SELECT * FROM OTP_Verification WHERE Email = @email AND OtpCode = @otpCode'
    );

    if (result.recordset.length === 0)
      return res.status(400).json({ success: false, message: 'Mã OTP không đúng. Vui lòng kiểm tra lại.' });

    const record = result.recordset[0];

    if (new Date() > new Date(record.ExpiresAt))
      return res.status(400).json({
        success: false,
        message: 'Mã OTP đã hết hạn (quá 3 phút). Vui lòng yêu cầu mã mới.',
      });

    const transaction = new sql.Transaction();
    await transaction.begin();

    try {
      // Chèn user mới vào Users
      const insertReq = new sql.Request(transaction);
      insertReq.input('fullName',    sql.NVarChar(100), record.FullName);
      insertReq.input('email',       sql.NVarChar(150), record.Email);
      insertReq.input('phone',       sql.NVarChar(20),  record.Phone);
      insertReq.input('password',    sql.NVarChar(255), record.Password);
      insertReq.input('dateOfBirth', sql.Date,          record.DateOfBirth);

      const userResult = await insertReq.query(`
        INSERT INTO Users (FullName, Email, Phone, Password, DateOfBirth)
        OUTPUT INSERTED.UserId
        VALUES (@fullName, @email, @phone, @password, @dateOfBirth)
      `);

      const newUserId = userResult.recordset[0]?.UserId;

      if (newUserId) {
        const assignRoleReq = new sql.Request(transaction);
        assignRoleReq.input('userId', sql.Int, newUserId);
        assignRoleReq.input('roleName', sql.NVarChar(50), ROLE_STUDENT);
        await assignRoleReq.query(`
          INSERT INTO User_Roles (UserId, RoleId)
          SELECT @userId, RoleId FROM Roles WHERE RoleName = @roleName
        `);
      }

      // Xoá bản ghi OTP
      const deleteReq = new sql.Request(transaction);
      deleteReq.input('email', sql.NVarChar(150), record.Email);
      await deleteReq.query('DELETE FROM OTP_Verification WHERE Email = @email');

      await transaction.commit();
    } catch (dbErr) {
      await transaction.rollback();
      throw dbErr;
    }

    return res.json({
      success: true,
      message: 'Xác thực thành công. Tài khoản đã được tạo. Bạn có thể đăng nhập ngay.',
    });
  } catch (err) {
    console.error('[VerifyOTP Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

// ============================================================
// GET /api/auth/tags
// ============================================================
const getTags = async (req, res) => {
  try {
    const request = new sql.Request();
    const result  = await request.query('SELECT TagId, TagName, DisplayName FROM Tags ORDER BY TagId');
    return res.json({ success: true, tags: result.recordset });
  } catch (err) {
    console.error('[GetTags Error]', err.message);
    return res.status(500).json({ success: false, message: 'Không thể lấy danh sách chủ đề.' });
  }
};

// ============================================================
// POST /api/auth/save-preferences
// ============================================================
const savePreferences = async (req, res) => {
  const { userId, tagIds } = req.body;

  if (!userId)
    return res.status(400).json({ success: false, message: 'userId không được để trống.' });

  if (!Array.isArray(tagIds) || tagIds.length < 3 || tagIds.length > 5)
    return res.status(400).json({
      success: false,
      message: 'Vui lòng chọn từ 3 đến 5 chủ đề yêu thích.',
    });

  try {
    const userCheck = new sql.Request();
    userCheck.input('userId', sql.Int, userId);
    const userResult = await userCheck.query('SELECT UserId FROM Users WHERE UserId = @userId');
    if (userResult.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });

    const transaction = new sql.Transaction();
    await transaction.begin();

    try {
      const deleteOld = new sql.Request(transaction);
      deleteOld.input('userId', sql.Int, userId);
      await deleteOld.query('DELETE FROM User_Preferences WHERE UserId = @userId');

      for (const tagId of tagIds) {
        const insertReq = new sql.Request(transaction);
        insertReq.input('userId', sql.Int, parseInt(userId, 10));
        insertReq.input('tagId',  sql.Int, parseInt(tagId,  10));
        await insertReq.query('INSERT INTO User_Preferences (UserId, TagId) VALUES (@userId, @tagId)');
      }

      const updateReq = new sql.Request(transaction);
      updateReq.input('userId', sql.Int, userId);
      await updateReq.query('UPDATE Users SET IsFirstLogin = 0, UpdatedAt = GETDATE() WHERE UserId = @userId');

      await transaction.commit();
    } catch (dbErr) {
      await transaction.rollback();
      throw dbErr;
    }

    return res.json({
      success: true,
      message: 'Đã lưu sở thích thành công. Chào mừng bạn đến với S.T.A.R Learning Path.',
    });
  } catch (err) {
    console.error('[SavePreferences Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

// ============================================================
// POST /api/auth/forgot-password
// Works for ALL roles — Admin, Mentor, Student
// ============================================================
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email || !validateEmail(email.trim()))
    return res.status(400).json({ success: false, message: 'Vui lòng nhập email hợp lệ.' });

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const findReq = new sql.Request();
    findReq.input('email', sql.NVarChar(150), normalizedEmail);
    const result = await findReq.query('SELECT UserId, FullName FROM Users WHERE Email = @email');

    if (result.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Email này chưa được đăng ký trong hệ thống.' });

    const user      = result.recordset[0];
    const otpCode   = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    // Lưu OTP vào cột ResetOtpCode, ResetOtpExpires trên bảng Users
    const updateReq = new sql.Request();
    updateReq.input('email',     sql.NVarChar(150), normalizedEmail);
    updateReq.input('otpCode',   sql.NVarChar(6),   otpCode);
    updateReq.input('expiresAt', sql.DateTime,      expiresAt);
    await updateReq.query(
      'UPDATE Users SET ResetOtpCode = @otpCode, ResetOtpExpires = @expiresAt WHERE Email = @email'
    );

    const transporter = createTransporter();
    await transporter.sendMail({
      from:    `"S.T.A.R Learning Path" <${process.env.EMAIL_USER}>`,
      to:      normalizedEmail,
      subject: '🔑 Mã OTP đặt lại mật khẩu - S.T.A.R Learning Path',
      html:    buildResetPasswordHtml(user.FullName, otpCode),
    });

    return res.json({
      success: true,
      message: `Mã OTP đã được gửi đến ${normalizedEmail}. Vui lòng kiểm tra hộp thư (kể cả Spam).`,
    });
  } catch (err) {
    console.error('[ForgotPassword Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

// ============================================================
// POST /api/auth/reset-password
// Works for ALL roles — Admin, Mentor, Student
// ============================================================
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword)
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ email, OTP và mật khẩu mới.' });

  if (!validateEmail(email.trim()))
    return res.status(400).json({ success: false, message: 'Định dạng email không hợp lệ.' });

  if (newPassword.length < 6)
    return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const findReq = new sql.Request();
    findReq.input('email', sql.NVarChar(150), normalizedEmail);
    const result = await findReq.query(
      'SELECT UserId, ResetOtpCode, ResetOtpExpires FROM Users WHERE Email = @email'
    );

    if (result.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Email này không tồn tại trong hệ thống.' });

    const user = result.recordset[0];

    if (!user.ResetOtpCode)
      return res.status(400).json({ success: false, message: 'Không có yêu cầu đặt lại mật khẩu nào. Vui lòng thử lại từ đầu.' });

    if (user.ResetOtpCode !== otp.trim())
      return res.status(400).json({ success: false, message: 'Mã OTP không đúng. Vui lòng kiểm tra lại.' });

    if (new Date() > new Date(user.ResetOtpExpires))
      return res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn (quá 5 phút). Vui lòng yêu cầu mã mới.' });

    // Cập nhật mật khẩu và xoá OTP
    const updateReq = new sql.Request();
    updateReq.input('email',       sql.NVarChar(150), normalizedEmail);
    updateReq.input('newPassword', sql.NVarChar(255), newPassword);
    await updateReq.query(
      'UPDATE Users SET Password = @newPassword, ResetOtpCode = NULL, ResetOtpExpires = NULL, UpdatedAt = GETDATE() WHERE Email = @email'
    );

    return res.json({
      success: true,
      message: 'Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.',
    });
  } catch (err) {
    console.error('[ResetPassword Error]', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

module.exports = { login, register, verifyOtp, getTags, savePreferences, forgotPassword, resetPassword };
