const MentorApplication = require("../models/MentorApplication");
const { sendEmail } = require("../utils/email");

// Đăng ký làm Mentor
const applyMentor = async (req, res) => {
  try {
    const { fullName, email, portfolioUrl, bio } = req.body;
    
    // Kiểm tra các trường bắt buộc
    if (!fullName || !email || !bio) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ các thông tin bắt buộc." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng tải lên ảnh chứng chỉ chuyên môn." });
    }

    // Đường dẫn tương đối phục vụ cho việc hiển thị ở Client (ví dụ: /uploads/filename.png)
    const certificatePath = `/uploads/${req.file.filename}`;

    const newApplication = new MentorApplication({
      fullName,
      email,
      portfolioUrl: portfolioUrl || "",
      bio,
      certificatePath
    });

    await newApplication.save();

    // Gửi email chờ duyệt tự động cho ứng viên
    const emailSubject = "[English Master] Hồ sơ đăng ký Mentor của bạn đang được xét duyệt";
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-xl">
        <h2 style="color: #2563eb;">Chào ${fullName},</h2>
        <p>Cảm ơn bạn đã nộp đơn đăng ký trở thành Mentor trên hệ thống <strong>English Master</strong>.</p>
        <p>Chúng tôi đã nhận được hồ sơ của bạn cùng chứng chỉ đính kèm. Hiện tại hồ sơ đang ở trạng thái <strong>Chờ phê duyệt</strong> từ phía Ban quản trị (Admin).</p>
        <p>Thông tin hồ sơ đăng ký:</p>
        <ul>
          <li><strong>Họ và tên:</strong> ${fullName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Giới thiệu/Kinh nghiệm:</strong> ${bio}</li>
        </ul>
        <p>Quy trình xem xét hồ sơ thường mất từ 24 đến 48 giờ làm việc. Ngay khi có kết quả duyệt, chúng tôi sẽ thông báo trực tiếp qua email này cho bạn.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Đây là email tự động từ hệ thống English Master. Vui lòng không trả lời thư này.</p>
      </div>
    `;

    // Gọi hàm gửi mail ẩn (được lưu log vào server/uploads/sent_emails.log)
    await sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml
    });

    return res.status(201).json({
      message: "Đăng ký thành công! Vui lòng kiểm tra email để cập nhật trạng thái.",
      application: newApplication
    });

  } catch (error) {
    console.error("Lỗi đăng ký Mentor:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống khi xử lý hồ sơ." });
  }
};

// Lấy danh sách toàn bộ hồ sơ ứng tuyển
const getApplications = async (req, res) => {
  try {
    const applications = await MentorApplication.find().sort({ createdAt: -1 });
    return res.status(200).json(applications);
  } catch (error) {
    console.error("Lỗi lấy danh sách hồ sơ:", error);
    return res.status(500).json({ message: "Không thể tải danh sách hồ sơ." });
  }
};

// Đếm số lượng thông báo hồ sơ chưa đọc (status = pending và isReadByAdmin = false)
const getUnreadCount = async (req, res) => {
  try {
    const count = await MentorApplication.countDocuments({
      status: "pending",
      isReadByAdmin: false
    });
    return res.status(200).json({ count });
  } catch (error) {
    console.error("Lỗi lấy số thông báo chưa đọc:", error);
    return res.status(500).json({ count: 0 });
  }
};

// Đánh dấu tất cả hồ sơ là đã đọc thông báo
const markAllRead = async (req, res) => {
  try {
    await MentorApplication.updateMany({ isReadByAdmin: false }, { isReadByAdmin: true });
    return res.status(200).json({ message: "Đã đánh dấu đã đọc toàn bộ thông báo." });
  } catch (error) {
    console.error("Lỗi đánh dấu đã đọc:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật trạng thái đã xem." });
  }
};

const generateRandomPassword = (length = 8) => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Phê duyệt hoặc Từ chối hồ sơ kèm gửi mail theo mẫu
const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái phê duyệt không hợp lệ." });
    }

    const application = await MentorApplication.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ đăng ký." });
    }

    application.status = status;
    application.adminComment = comment || "";
    application.isReadByAdmin = true; // Phê duyệt xong mặc định đánh dấu đã xem

    await application.save();

    let randomPassword = "";
    let isNewUser = false;

    // Nếu phê duyệt thành công, cấp quyền Mentor cho tài khoản gmail đó
    if (status === "approved") {
      const User = require("../models/User");

      let user = await User.findOne({ email: application.email.toLowerCase() });
      if (user) {
        user.role = "Mentor";
        await user.save();
        console.log(`Đã nâng cấp quyền Mentor thành công cho tài khoản có sẵn: ${application.email}`);
      } else {
        isNewUser = true;
        randomPassword = generateRandomPassword(8);
        user = new User({
          email: application.email.toLowerCase(),
          name: application.fullName,
          password: randomPassword, // mật khẩu ngẫu nhiên mới cho guest
          role: "Mentor"
        });
        await user.save();
        console.log(`Đã tạo tài khoản Mentor mới cho khách hàng ${application.email} với mật khẩu ngẫu nhiên: ${randomPassword}`);
      }
    }

    // Nội dung email thông báo kết quả duyệt
    const subject = status === "approved" 
      ? "[English Master] Chúc mừng! Hồ sơ Mentor của bạn đã được phê duyệt"
      : "[English Master] Thông báo về kết quả hồ sơ Mentor";

    const statusText = status === "approved" 
      ? "<span style='color: #10b981; font-weight: bold;'>ĐÃ ĐƯỢC CHẤP NHẬN</span>"
      : "<span style='color: #ef4444; font-weight: bold;'>KHÔNG ĐƯỢC CHẤP NHẬN</span>";

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #2563eb;">Chào ${application.fullName},</h2>
        <p>Ban quản trị hệ thống <strong>English Master</strong> đã xem xét hồ sơ ứng tuyển làm Mentor của bạn.</p>
        <p>Kết quả xét duyệt: Trạng thái hồ sơ của bạn là ${statusText}.</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid ${status === "approved" ? "#10b981" : "#ef4444"}; padding: 15px; margin: 15px 0; font-style: italic;">
          "${comment}"
        </div>

        ${status === "approved" 
          ? `
            <p>Chào mừng bạn gia nhập đội ngũ Mentor của English Master! Bạn có thể đăng nhập tài khoản để bắt đầu xây dựng lộ trình học và hỗ trợ các học viên.</p>
            ${isNewUser 
              ? `
                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; margin: 20px 0; border-radius: 8px;">
                  <p style="margin: 0; font-weight: bold; color: #166534;">Thông tin đăng nhập của bạn:</p>
                  <p style="margin: 5px 0 0 0;"><strong>Tài khoản (Email):</strong> ${application.email}</p>
                  <p style="margin: 5px 0 0 0;"><strong>Mật khẩu mới:</strong> <code style="background-color: #dcfce7; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #15803d; font-family: monospace; font-size: 14px;">${randomPassword}</code></p>
                </div>
                `
              : `
                <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; margin: 20px 0; border-radius: 8px;">
                  <p style="margin: 0; font-weight: bold; color: #1e3a8a;">Thông tin đăng nhập của bạn:</p>
                  <p style="margin: 5px 0 0 0;">Tài khoản của bạn đã được nâng cấp lên quyền <strong>Mentor</strong>.</p>
                  <p style="margin: 5px 0 0 0;">Vui lòng sử dụng <strong>Email và Mật khẩu hiện tại</strong> của bạn để đăng nhập vào hệ thống.</p>
                </div>
                `
            }
            `
          : "<p>Cảm ơn bạn đã quan tâm. Chúng tôi hy vọng có cơ hội hợp tác với bạn trong các đợt ứng tuyển sau khi bạn bổ sung thêm năng lực hoặc chứng chỉ.</p>"
        }
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Đây là email tự động từ hệ thống English Master. Trân trọng,</p>
        <p style="font-weight: bold; color: #1e293b;">English Master Admin Team</p>
      </div>
    `;

    await sendEmail({
      to: application.email,
      subject,
      html: emailHtml
    });

    return res.status(200).json({
      message: status === "approved" ? "Phê duyệt hồ sơ thành công!" : "Từ chối hồ sơ thành công!",
      application
    });

  } catch (error) {
    console.error("Lỗi phê duyệt hồ sơ:", error);
    return res.status(500).json({ message: "Không thể xử lý phê duyệt hồ sơ." });
  }
};

module.exports = {
  applyMentor,
  getApplications,
  getUnreadCount,
  markAllRead,
  reviewApplication
};
