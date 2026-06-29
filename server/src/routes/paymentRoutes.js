const express = require("express");
const router = express.Router();
const { sendEmail } = require("../utils/email");

// Đăng ký thanh toán (Bắt đầu thanh toán)
router.post("/initiate", async (req, res) => {
  try {
    const { email, userName, courseTitle, price, paymentMethod } = req.body;

    if (!email || !courseTitle) {
      return res.status(400).json({ success: false, message: "Missing required billing details" });
    }

    const priceText = price ? `${price.toLocaleString("vi-VN")} VND` : "Miễn phí";
    const methodText = paymentMethod ? paymentMethod.toUpperCase() : "Chuyển khoản / Ví điện tử";

    const subject = `[English Master] Thông báo yêu cầu đăng ký khóa học: ${courseTitle}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #e11d48; margin: 0;">English Master</h2>
          <p style="font-size: 14px; color: #64748b; margin: 5px 0 0 0;">Hệ sinh thái học Tiếng Anh thông minh</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 20px;" />
        
        <h3 style="color: #0f172a; margin-top: 0;">Chào ${userName || "Học viên"},</h3>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Yêu cầu đăng ký khóa học của bạn đã được ghi nhận trên hệ thống và đang chờ hoàn tất thanh toán để kích hoạt.
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px;">Thông tin đơn đăng ký:</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 120px;">Khóa học:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${courseTitle}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Học phí:</td>
              <td style="padding: 6px 0; color: #e11d48; font-weight: bold;">${priceText}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Phương thức:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${methodText}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Trạng thái:</td>
              <td style="padding: 6px 0; color: #d97706; font-weight: bold;">Chờ thanh toán ⏳</td>
            </tr>
          </table>
        </div>

        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Vui lòng hoàn tất chuyển khoản theo hướng dẫn trên màn hình giao dịch của ứng dụng để khóa học được kích hoạt tự động.
        </p>

        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          Mọi thắc mắc vui lòng liên hệ bộ phận hỗ trợ English Master qua hòm thư hỗ trợ. Trân trọng!
        </p>
      </div>
    `;

    await sendEmail({ to: email, subject, html });

    return res.status(200).json({ success: true, message: "Initiation email logged/sent successfully" });
  } catch (error) {
    console.error("Error sending initiation email:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Thanh toán hoàn tất (Đã nhận tiền)
router.post("/complete", async (req, res) => {
  try {
    const { email, userName, courseTitle, price, paymentMethod } = req.body;

    if (!email || !courseTitle) {
      return res.status(400).json({ success: false, message: "Missing required billing details" });
    }

    const priceText = price ? `${price.toLocaleString("vi-VN")} VND` : "Miễn phí";
    const methodText = paymentMethod ? paymentMethod.toUpperCase() : "Chuyển khoản / Ví điện tử";

    const subject = `[English Master] Kích hoạt khóa học thành công: ${courseTitle}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #e11d48; margin: 0;">English Master</h2>
          <p style="font-size: 14px; color: #64748b; margin: 5px 0 0 0;">Hệ sinh thái học Tiếng Anh thông minh</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 20px;" />
        
        <h3 style="color: #0f172a; margin-top: 0;">Chào ${userName || "Học viên"},</h3>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Chúc mừng bạn! Giao dịch thanh toán khóa học đã hoàn tất thành công. Khóa học đã được kích hoạt hoàn toàn trên tài khoản của bạn.
        </p>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #166534; font-size: 14px;">Thông tin hóa đơn học phí:</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 120px;">Khóa học:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${courseTitle}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Học phí:</td>
              <td style="padding: 6px 0; color: #166534; font-weight: bold;">${priceText}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Phương thức:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${methodText}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Trạng thái:</td>
              <td style="padding: 6px 0; color: #15803d; font-weight: bold;">Đã thanh toán thành công 🎉</td>
            </tr>
          </table>
        </div>

        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Bạn có thể truy cập mục <strong>Khóa học của tôi</strong> trong ứng dụng để bắt đầu bài học đầu tiên ngay bây giờ.
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <a href="http://localhost:3000" style="background-color: #e11d48; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block;">Vào Học Ngay</a>
        </div>

        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          Chúc bạn có những trải nghiệm học tập tuyệt vời tại English Master!
        </p>
      </div>
    `;

    await sendEmail({ to: email, subject, html });

    return res.status(200).json({ success: true, message: "Completion email logged/sent successfully" });
  } catch (error) {
    console.error("Error sending completion email:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
