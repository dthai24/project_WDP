const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/MongoDB/User');
const Role = require('../models/MongoDB/Role');
const UserRole = require('../models/MongoDB/UserRole');
const OtpVerification = require('../models/MongoDB/OtpVerification');
const UserCategory = require('../models/MongoDB/UserCategory');
const Level = require('../models/MongoDB/Level');

const ROLE_STUDENT = 'Student';

// ============================================================
// Helpers
// ============================================================

const validateEmail = (email) => {
  if (!email || email.includes(' ')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const isProduction = process.env.NODE_ENV === 'production';

const isEmailConfigured = () =>
  Boolean(process.env.EMAIL_USER?.trim() && process.env.EMAIL_PASS?.trim());

const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER?.trim(),
      pass: process.env.EMAIL_PASS?.replace(/\s/g, ''),
    },
  });

/** Gửi OTP qua email; dev fallback in OTP ra console khi chưa cấu hình hoặc SMTP lỗi. */
const sendOtpEmail = async ({ to, subject, html, otpCode, label }) => {
  if (!isEmailConfigured()) {
    console.warn(`[Email] Chưa cấu hình EMAIL_USER/EMAIL_PASS — OTP ${label}: ${otpCode} → ${to}`);
    return { emailSent: false };
  }

  try {
    await createTransporter().sendMail({
      from: `"English Master" <${process.env.EMAIL_USER.trim()}>`,
      to,
      subject,
      html,
    });
    return { emailSent: true };
  } catch (err) {
    console.error(`[Email Error] ${label}:`, err.message);
    if (!isProduction) {
      console.warn(`[Email Dev Fallback] OTP ${label}: ${otpCode} → ${to}`);
      return { emailSent: false };
    }
    throw err;
  }
};

const otpDeliveryMessage = (email, emailSent) =>
  emailSent
    ? `Mã OTP đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư (kể cả Spam).`
    : `Mã OTP đã được tạo. Môi trường dev: xem mã OTP trong terminal backend.`;

/** Email OTP cho đăng ký tài khoản (gradient tím) */
const buildRegisterOtpHtml = (fullName, otpCode) => `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0f0e17;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#6c63ff,#a78bfa);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">⭐ English Master</h1>
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
      <p style="color:#555;font-size:12px;margin:0;">© ${new Date().getFullYear()} English Master. All rights reserved.</p>
    </div>
  </div>
`;

/** Email OTP cho đặt lại mật khẩu (gradient cam-đỏ) */
const buildResetPasswordHtml = (fullName, otpCode) => `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0f0e17;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#f6b93b,#ff6b6b);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">🔑 English Master</h1>
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
      <p style="color:#555;font-size:12px;margin:0;">© ${new Date().getFullYear()} English Master. All rights reserved.</p>
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

    // 1. Lấy thông tin user từ MongoDB
    const user = await User.findOne({ email: normalizedEmail });
    if (!user)
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });

    // Kiểm tra trạng thái khóa tài khoản
    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
    }

    // So sánh mật khẩu (plain text hoặc bcrypt)
    const passToCompare = user.password || user.passwordHash || '';
    const isPasswordValid = passToCompare === password || (passToCompare && await bcrypt.compare(password, passToCompare).catch(() => false));
    if (!isPasswordValid)
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });

    // 2. Lấy danh sách roles của user từ User_Roles
    const userRoles = await UserRole.find({ userId: user._id }).populate('roleId', 'roleName');
    let roles = userRoles.map((ur) => ur.roleId?.roleName).filter(Boolean);

    // Tài khoản đăng ký qua OTP là Student; fallback nếu chưa có bản ghi User_Roles
    if (roles.length === 0) {
      roles = [ROLE_STUDENT];
    }

    return res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: {
        userId: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isFirstLogin: user.isFirstLogin === true,
        roles,
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
    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(409).json({ success: false, message: 'Email này đã được đăng ký. Vui lòng đăng nhập.' });

    // Kiểm tra phone đã tồn tại trong Users
    const existingPhone = await User.findOne({ phone });
    if (existingPhone)
      return res.status(409).json({ success: false, message: 'Số điện thoại này đã được đăng ký.' });

    // Xoá OTP cũ nếu có
    await OtpVerification.deleteMany({ email });

    // Tạo OTP + thời hạn 3 phút
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    await OtpVerification.create({
      email,
      fullName,
      phone,
      password,
      dateOfBirth: new Date(dateOfBirth),
      otpCode,
      expiresAt,
    });

    const { emailSent } = await sendOtpEmail({
      to: email,
      subject: '🔐 Mã xác thực OTP của bạn - English Master',
      html: buildRegisterOtpHtml(fullName, otpCode),
      otpCode,
      label: 'đăng ký',
    });

    return res.json({
      success: true,
      message: otpDeliveryMessage(email, emailSent),
    });
  } catch (err) {
    console.error('[Register Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Không thể gửi email OTP. Vui lòng thử lại sau.',
    });
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
    const normalizedEmail = email.toLowerCase().trim();
    const record = await OtpVerification.findOne({
      email: normalizedEmail,
      otpCode: otpCode.trim(),
    });

    if (!record)
      return res.status(400).json({ success: false, message: 'Mã OTP không đúng. Vui lòng kiểm tra lại.' });

    if (new Date() > new Date(record.expiresAt))
      return res.status(400).json({
        success: false,
        message: 'Mã OTP đã hết hạn (quá 3 phút). Vui lòng yêu cầu mã mới.',
      });

    // Tạo user mới trong MongoDB
    const newUser = await User.create({
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      password: record.password,
      dateOfBirth: record.dateOfBirth,
      isFirstLogin: true,
      isActive: true,
    });

    // Gán role Student
    const studentRole = await Role.findOne({ roleName: ROLE_STUDENT });
    if (studentRole) {
      await UserRole.create({
        userId: newUser._id,
        roleId: studentRole._id,
      });
    }

    // Xoá bản ghi OTP
    await OtpVerification.deleteOne({ _id: record._id });

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
// POST /api/auth/onboarding
// Lấy kết quả 3 câu hỏi (Category, Level, Goal) lưu vào Users
// ============================================================
const saveOnboarding = async (req, res) => {
  const { userId, categoryIds, levelId, goal } = req.body;

  if (!userId || !categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0 || !levelId || !goal)
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin (chọn ít nhất 1 Lĩnh vực).' });

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });

    // 1. Cập nhật bảng Users (Level, Goal)
    await User.findByIdAndUpdate(userId, {
      currentLevelId: levelId,
      learningGoal: goal,
      isFirstLogin: false,
    });

    // 2. Xóa dữ liệu cũ trong bảng User_Categories (nếu có)
    await UserCategory.deleteMany({ userId });

    // 3. Insert các lĩnh vực đã chọn vào bảng User_Categories
    for (const catId of categoryIds) {
      await UserCategory.create({ userId, categoryId: catId });
    }

    return res.json({ success: true, message: 'Đã lưu kết quả khảo sát thành công!' });
  } catch (err) {
    console.error('[SaveOnboarding Error]', err.message);
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
    const user = await User.findOne({ email: normalizedEmail });
    if (!user)
      return res.status(404).json({ success: false, message: 'Email này chưa được đăng ký trong hệ thống.' });

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    // Lưu OTP vào cột ResetOtpCode, ResetOtpExpires trên bảng Users
    await User.updateOne(
      { email: normalizedEmail },
      { resetOtpCode: otpCode, resetOtpExpires: expiresAt }
    );

    const { emailSent } = await sendOtpEmail({
      to: normalizedEmail,
      subject: '🔑 Mã OTP đặt lại mật khẩu - English Master',
      html: buildResetPasswordHtml(user.fullName, otpCode),
      otpCode,
      label: 'đặt lại mật khẩu',
    });

    return res.json({
      success: true,
      message: otpDeliveryMessage(normalizedEmail, emailSent),
    });
  } catch (err) {
    console.error('[ForgotPassword Error]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Không thể gửi email OTP. Vui lòng thử lại sau.',
    });
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
    const user = await User.findOne({ email: normalizedEmail });
    if (!user)
      return res.status(404).json({ success: false, message: 'Email này không tồn tại trong hệ thống.' });

    if (!user.resetOtpCode)
      return res.status(400).json({ success: false, message: 'Không có yêu cầu đặt lại mật khẩu nào. Vui lòng thử lại từ đầu.' });

    if (user.resetOtpCode !== otp.trim())
      return res.status(400).json({ success: false, message: 'Mã OTP không đúng. Vui lòng kiểm tra lại.' });

    if (new Date() > new Date(user.resetOtpExpires))
      return res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn (quá 5 phút). Vui lòng yêu cầu mã mới.' });

    // Cập nhật mật khẩu và xoá OTP
    await User.updateOne(
      { email: normalizedEmail },
      { password: newPassword, resetOtpCode: null, resetOtpExpires: null }
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

module.exports = { login, register, verifyOtp, forgotPassword, resetPassword, saveOnboarding };
