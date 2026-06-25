const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const sendEmail = async ({ to, subject, html }) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  
  const logMessage = `======================================================
[EMAIL SENT]
To: ${to}
Subject: ${subject}
Date: ${new Date().toLocaleString()}
Content:
${html}
======================================================\n\n`;

  // Ghi log vào file trong thư mục uploads để dễ dàng kiểm tra mà không cần cấu hình SMTP thực tế
  try {
    const logDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(path.join(logDir, "sent_emails.log"), logMessage);
    console.log(`Email successfully logged to server/uploads/sent_emails.log`);
  } catch (err) {
    console.error("Failed to write email log:", err);
  }

  // Nếu có tài khoản cấu hình thì thực hiện gửi mail thực tế qua SMTP Gmail
  if (user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user,
          pass,
        },
      });

      await transporter.sendMail({
        from: `"English Master Admin" <${user}>`,
        to,
        subject,
        html,
      });
      console.log(`Email sent successfully to ${to} via Gmail SMTP.`);
      return true;
    } catch (error) {
      console.error("Nodemailer error sending email:", error);
      return false;
    }
  } else {
    console.log("Gmail SMTP credentials not configured (EMAIL_USER/EMAIL_PASS is missing in .env). Email logged to file.");
    return true;
  }
};

module.exports = { sendEmail };
