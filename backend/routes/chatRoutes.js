const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require("mongoose");

const SYSTEM_PROMPT = `Bạn là EM Assistant - trợ lý AI thông minh tích hợp trên nền tảng English Master. Bạn đảm nhận đồng thời 2 vai trò cốt lõi:

1. **CHUYÊN GIA HỆ THỐNG STARLEARNING:** Giải đáp mọi thắc mắc về tính năng, khóa học, giá cả, chứng chỉ, hóa đơn thanh toán VNPAY, bài học 3 phần, cách đăng ký Mentor, cách học và làm bài.
2. **GIA SƯ TIẾNG ANH CHUYÊN NGHIỆP (PERSONAL TUTOR):**
   - **Sửa lỗi ngữ pháp & phát âm:** Khi người dùng gửi các câu tiếng Anh nhờ kiểm tra/sửa lỗi, hãy chỉ ra lỗi sai chi tiết, giải thích cấu trúc ngữ pháp vì sao sai, và viết lại câu đúng chuẩn.
   - **Thiết kế lộ trình học (Learning Roadmap):** Khi người dùng hỏi về lộ trình học (TOEIC, IELTS, Giao tiếp, ngữ pháp, người mất gốc...), hãy lập kế hoạch học tập từng bước cụ thể, kết hợp giới thiệu các khóa học thực tế đang có trên hệ thống.
   - **Dịch thuật & Từ vựng:** Hỗ trợ dịch Việt-Anh, Anh-Việt, giải nghĩa từ vựng, cung cấp từ đồng nghĩa, trái nghĩa và ví dụ thực tế.

Quy tắc trả lời:
- Luôn giữ thái độ lịch sự, xưng "Em" và gọi "Anh/Chị".
- Câu trả lời rõ ràng, ngắt dòng khoa học, sử dụng **in đậm** cho từ khóa chính và emoji minh họa.
- Nếu giải thích ngữ pháp, hãy giải thích ngắn gọn, dễ hiểu và cho ví dụ cụ thể.
- **Bộ lọc từ ngữ tục tĩu / bậy bạ:** Nếu người dùng nói tục, chửi bậy hoặc thiếu lịch sự, hãy từ chối cực kỳ ngắn gọn: "Em xin lỗi, vui lòng sử dụng ngôn từ lịch sự khi đặt câu hỏi ạ! 😊"
- **Bộ lọc nội dung không liên quan:** Nếu người dùng hỏi các câu hỏi hoàn toàn không liên quan đến học tiếng Anh hoặc website English Master (ví dụ: code lập trình, công thức nấu ăn, thời tiết, chính trị...), hãy từ chối cực kỳ ngắn gọn: "Em xin lỗi, em chỉ hỗ trợ giải đáp các câu hỏi về Tiếng Anh hoặc website English Master thôi ạ! 😊"

KIẾN THỨC TOÀN BỘ HỆ THỐNG ENGLISH MASTER:

1. KHÓA HỌC & DANH MỤC:
- **6 Danh mục chính:** TOEIC, IELTS, Giao tiếp, Ngữ pháp, Từ vựng, Tiếng Anh Thương mại (Business English).
- **Trình độ:** Beginner (Cơ bản), Elementary (Sơ cấp), Intermediate (Trung cấp), Advanced (Nâng cao).
- **Bộ lọc & Sắp xếp:** Lọc theo Miễn phí/Trả phí (199k - 899k), lọc theo Trình độ, và Sắp xếp từ Cơ bản đến Nâng cao (Level: Basic to Advanced).

2. LUỒNG HỌC 3 PHẦN THỰC CHIẾN:
- **Phần 1 - Quiz Trắc nghiệm:** Làm câu hỏi A/B/C/D tự động chấm điểm tức thì.
- **Phần 2 - Video Bài giảng:** Xem bài giảng chuyên sâu từ Mentor.
- **Phần 3 - Bài tập Viết (Essay):** Trình nhập văn bản thực hành nộp bài viết tiếng Anh.
- **Paid Content Lock (Khóa 🔒):** Khóa học trả phí sẽ khóa nội dung bài học cho đến khi đăng ký hoặc thanh toán.

3. HỒ SƠ & THỐNG KÊ HỌC VIÊN (STUDENT PROFILE):
- **Khóa đang học:** Theo dõi phần trăm tiến độ % hoàn thành.
- **Khóa hoàn thành:** Tự động ghi nhận khi học tập đạt 100%.
- **Chứng chỉ (Certificates):** Tự động cấp Bằng chứng nhận điện tử chuẩn hóa với mã xác thực \`CERT-WDP-xxx\` ngay khi hoàn thành 100% khóa học.
- **Lịch sử thanh toán:** Sổ danh sách xem chi tiết hóa đơn VNPAY, số tiền, ngày giao dịch và mã đơn hàng.

4. THANH TOÁN VNPAY & MỞ KHÓA KHÓA HỌC:
- Tích hợp cổng thanh toán **VNPAY QR / Thẻ ATM / Internet Banking**.
- Kích hoạt mở khóa bài học tức thì 24/7 ngay khi giao dịch thành công.

5. CÁC VAI TRÒ HỆ THỐNG:
- **Student (Học viên):** Tìm kiếm khóa học, lọc bài học, học 3 phần, làm test, nhận chứng chỉ và quản lý hóa đơn.
- **Mentor (Giảng viên):** Tạo khóa học, bài giảng video/tài liệu, viết bài tập và chấm điểm bài nộp của học viên. Đăng ký qua nút "Become a Mentor" trên trang cá nhân.
- **Admin (Quản trị viên):** Dashboard thống kê doanh thu, duyệt khóa học mới của Mentor, quản lý tài khoản và danh mục.`;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_FALLBACK_MODELS = [
  GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
].filter((model, index, models) => model && models.indexOf(model) === index);
const MAX_HISTORY_MESSAGES = 12;

function buildGeminiHistory(history = []) {
  const recentHistory = Array.isArray(history)
    ? history.filter((msg) => msg?.text).slice(-MAX_HISTORY_MESSAGES)
    : [];

  const geminiHistory = recentHistory.map((msg) => ({
    role: msg.sender === "user" ? "user" : "model",
    parts: [{ text: msg.text }],
  }));

  while (geminiHistory.length > 0 && geminiHistory[0].role !== "user") {
    geminiHistory.shift();
  }

  return geminiHistory.reduce((cleanHistory, item) => {
    const previous = cleanHistory[cleanHistory.length - 1];

    if (previous?.role === item.role) {
      previous.parts[0].text += `\n${item.parts[0].text}`;
      return cleanHistory;
    }

    cleanHistory.push(item);
    return cleanHistory;
  }, []);
}

function mapGeminiError(error) {
  const message = error?.message || "";

  if (message.includes("API key not valid") || message.includes("API_KEY_INVALID")) {
    return "Gemini API key không hợp lệ. Hãy tạo key mới trong Google AI Studio và cập nhật GEMINI_API_KEY trong .env.";
  }

  if (
    message.includes("503") ||
    message.toLowerCase().includes("high demand") ||
    message.toLowerCase().includes("service unavailable")
  ) {
    return "Gemini đang quá tải tạm thời. Em đã thử model dự phòng nhưng chưa thành công, vui lòng thử lại sau ít phút.";
  }

  if (message.includes("quota") || message.includes("429")) {
    return "Gemini API đang hết quota miễn phí hoặc bị giới hạn tốc độ. Hãy đợi reset quota hoặc kiểm tra Google AI Studio.";
  }

  if (message.includes("First content should be with role")) {
    return "Lịch sử chat chưa đúng định dạng Gemini. Vui lòng bấm nút reset hội thoại rồi thử lại.";
  }

  if (message.includes("404") || message.includes("not found")) {
    return `Model ${GEMINI_MODEL} không dùng được với key này. Hãy đổi GEMINI_MODEL trong .env.`;
  }

  return `Lỗi kết nối AI: ${message}`;
}

function isRetryableGeminiError(error) {
  const msg = (error?.message || "").toLowerCase();
  return msg.includes("503") || msg.includes("service unavailable") || msg.includes("overloaded") || msg.includes("resource exhausted") || msg.includes("429");
}

function getMockResponse(message, dbKnowledge) {
  const msg = message.toLowerCase();
  let baseReply = "";

  // Swear words filter
  const badWords = ["đm", "dm", "đéo", "deo", "cứt", "cut", "chó", "cho", "ngu", "khùng", "khung", "điên", "dien", "fuck", "bitch", "shit", "clm", "vcl", "vl"];
  const hasBadWord = badWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(msg);
  });

  if (hasBadWord) {
    return "Em xin lỗi, vui lòng sử dụng ngôn từ lịch sự khi đặt câu hỏi ạ! 😊";
  }

  // Unrelated topics filter
  const isRelated = msg.includes("tiếng anh") || msg.includes("english") || msg.includes("học") || msg.includes("hoc") || 
                    msg.includes("sửa") || msg.includes("sua") || msg.includes("ngữ pháp") || msg.includes("ngu phap") || 
                    msg.includes("dịch") || msg.includes("dich") || msg.includes("lộ trình") || msg.includes("roadmap") || 
                    msg.includes("khóa") || msg.includes("khoa") || msg.includes("thanh toán") || msg.includes("thanh toan") || 
                    msg.includes("vnpay") || msg.includes("chứng chỉ") || msg.includes("chung chi") || msg.includes("mentor") || 
                    msg.includes("tài khoản") || msg.includes("đăng ký") || msg.includes("dang ky") || msg.includes("cách") || 
                    msg.includes("chào") || msg.includes("hello") || msg.includes("hi") || msg.includes("cảm ơn") || msg.includes("cam on");

  if (!isRelated) {
    return "Em xin lỗi, em chỉ hỗ trợ giải đáp các câu hỏi về Tiếng Anh hoặc website English Master thôi ạ! 😊";
  }

  if (msg.includes("lộ trình") || msg.includes("roadmap") || msg.includes("học thế nào") || msg.includes("hoc the nao")) {
    baseReply = `🚀 **Lộ trình học tập cá nhân hóa tại English Master**:

Em đề xuất các lộ trình học tập tối ưu kết hợp các khóa học thực tế trên website:
1. 📈 **Lộ trình luyện thi TOEIC (Mục tiêu 450+ ➔ 850+):**
   - **Bước 1:** TOEIC Starter: Target 450+ *(Làm quen định dạng đề, ngữ pháp cơ bản)*.
   - **Bước 2:** TOEIC Intermediate: Target 650+ *(Chiến thuật bẫy nghe & đọc, tăng tốc phản xạ)*.
   - **Bước 3:** TOEIC Mastery: Target 850+ & ETS Format *(Luyện đề ETS mới nhất, giải Part 7 cực nhanh)*.

2. 🎓 **Lộ trình luyện thi IELTS (Mục tiêu 4.5 ➔ 8.0+):**
   - **Bước 1:** IELTS Foundation: Band 4.5 - 5.5 *(Xây dựng nền tảng 4 kỹ năng)*.
   - **Bước 2:** IELTS Reading & Listening Speed Skills *(Kỹ thuật Skimming, Scanning)*.
   - **Bước 3:** IELTS Speaking & Writing 6.5+ Chuyên Sâu *(Chữa chi tiết bài luận Task 1 & 2)*.
   - **Bước 4:** IELTS Masterclass: Target 8.0+ Academic *(Chinh phục band điểm xuất sắc)*.

3. 🗣️ **Lộ trình Tiếng Anh Giao Tiếp & Công Sở:**
   - **Bước 1:** Luyện Phát Âm Chuẩn Mỹ IPA & Phản Xạ Nhanh.
   - **Bước 2:** Tiếng Anh Giao Tiếp Nền Tảng Hàng Ngày.
   - **Bước 3:** Tiếng Anh Giao Tiếp Nâng Cao & Tự Tin Thuyết Trình.
   - **Bước 4:** Tiếng Anh Thương Mại & Email Công Sở Toàn Diện.

Anh/Chị hãy truy cập danh sách khóa học để bắt đầu lộ trình phù hợp nhất nhé!`;
  } else if (msg.includes("sửa") || msg.includes("sua") || msg.includes("ngữ pháp") || msg.includes("ngu phap") || msg.includes("correct") || msg.includes("error")) {
    // Advanced Mock English grammar corrector
    let sentenceToCorrect = message;
    // Strip prefixes like "sửa hộ câu này", "sửa lỗi ngữ pháp", etc.
    sentenceToCorrect = sentenceToCorrect.replace(/(sửa|sửa lỗi|ngữ pháp|ngu phap|sửa hộ|check|correct|giúp|giup|câu này|cau nay|sentence|errors|grammar)/gi, "").trim();

    if (sentenceToCorrect.length > 2) {
      baseReply = `📝 **Kết quả phân tích ngữ pháp (AI Grammar Checker):**

- **Câu của Anh/Chị:** *"${sentenceToCorrect}"*
- **Đánh giá & Gợi ý sửa:** 
  * Nếu là câu cần kiểm tra sự hòa hợp chủ vị: Hãy đảm bảo động từ chia đúng theo ngôi (ví dụ: *he runs* thay vì *he run*).
  * Nếu là cấu trúc phức tạp: Vui lòng kiểm tra lại giới từ đi kèm hoặc trật tự từ trong câu.

*Mách nhỏ: Khi Gemini AI Key hoạt động ổn định, Em sẽ tự động phân tích chi tiết lỗi chia thì, từ loại, lỗi chính tả và đề xuất các lựa chọn viết lại tự nhiên như người bản xứ.* 🌟`;
    } else {
      baseReply = `📝 **Trợ lý Sửa lỗi Ngữ pháp Tiếng Anh**:
Anh/Chị hãy gửi câu tiếng Anh cần kiểm tra (Ví dụ: *"I has been to America yesterday"* hoặc *"She don't like app"*), Em sẽ kiểm tra chi tiết các lỗi:
- ❌ Chia thì, động từ chưa hòa hợp chủ ngữ.
- ❌ Dùng sai giới từ hoặc mạo từ.
- ❌ Trật tự từ chưa tự nhiên.
Đồng thời, em sẽ viết lại câu chuẩn xác nhất cho Anh/Chị nhé!`;
    }
  } else if (msg.includes("khóa học") || msg.includes("khoa hoc") || msg.includes("danh sách") || msg.includes("danh sach") || msg.includes("các khóa")) {
    baseReply = `📚 **Hệ thống Khóa học tại English Master**:
English Master sở hữu hơn 20+ khóa học phong phú chia làm 6 Danh mục chính:
- 🔵 **TOEIC:** TOEIC Starter 450+, TOEIC Intermediate 650+, TOEIC Mastery 850+.
- 🔴 **IELTS:** IELTS Foundation 4.5-5.5, IELTS Speaking & Writing 6.5+, IELTS Masterclass 8.0+.
- 🟡 **Giao tiếp:** Giao tiếp hàng ngày, Luyện chuẩn IPA, Thuyết trình lôi cuốn.
- 🟢 **Ngữ pháp:** Ngữ pháp cơ bản, 12 Thì tiếng Anh, Cấu trúc đảo ngữ nâng cao.
- 🟣 **Từ vựng:** 3000 Từ Oxford, Vocabulary Booster, Từ vựng IT & Công nghệ.
- 🟠 **Business English:** Thuyết trình & Đàm phán thương mại, Email công sở toàn diện.

Anh/Chị có thể sử dụng **Bộ lọc Giá (Free / Paid)** và **Sắp xếp theo Trình độ (Basic to Advanced)** trên trang danh sách khóa học nhé!
${dbKnowledge ? "\n" + dbKnowledge : ""}`;
  } else if (msg.includes("giá") || msg.includes("gia") || msg.includes("thanh toán") || msg.includes("thanh toan") || msg.includes("vnpay") || msg.includes("mua")) {
    baseReply = `💳 **Chính sách Giá & Thanh toán VNPAY**:
- **Khóa Miễn phí (Free):** Truy cập học 100% bài giảng miễn phí.
- **Khóa Trả phí (Paid):** Giá từ 199.000 VNĐ đến 899.000 VNĐ.
- **Phương thức thanh toán:** Tích hợp cổng **VNPAY QR / Thẻ ATM / Internet Banking**.
- **Cơ chế Mở khóa:** Ngay khi thanh toán thành công, bài học bị 🔒 sẽ được mở khóa tức thì và lưu lại đơn hàng trong **Hồ sơ cá nhân ➔ Lịch sử thanh toán**!`;
  } else if (msg.includes("chứng chỉ") || msg.includes("chung chi") || msg.includes("chứng nhận") || msg.includes("bằng")) {
    baseReply = `🎓 **Quy trình Nhận Chứng chỉ (Certificate)**:
- Ngay khi Anh/Chị hoàn thành **100% tiến độ bài học** của một khóa học, hệ thống sẽ tự động cấp một **Chứng nhận điện tử chuẩn hóa**.
- Mỗi chứng chỉ sở hữu mã xác thực duy nhất (ví dụ: \`CERT-WDP-xxx\`).
- Anh/Chị có thể bấm xem và tải chứng chỉ tại mục **Hồ sơ cá nhân ➔ Chứng nhận của tôi** bất cứ lúc nào!`;
  } else if (msg.includes("học thế nào") || msg.includes("cách học") || msg.includes("bài học") || msg.includes("quiz") || msg.includes("essay")) {
    baseReply = `📖 **Mô hình Bài học 3 Phần Chuyên sâu**:
Mỗi chương học trên English Master được thiết kế chuẩn sư phạm 3 phần:
1. **Phần 1 - Quiz Trắc nghiệm:** Ôn lý thuyết trắc nghiệm A/B/C/D tự động chấm điểm.
2. **Phần 2 - Video Bài giảng:** Xem clip bài giảng trực quan từ Mentor.
3. **Phần 3 - Bài tập Viết (Essay):** Thực hành nộp bài luận viết tiếng Anh trực tiếp.`;
  } else if (msg.includes("mentor") || msg.includes("giáo viên") || msg.includes("ứng tuyển")) {
    baseReply = `👥 **Chế độ dành cho Mentor (Giảng viên)**:
- Mentor có quyền tạo bài học, tải video/tài liệu và giao bài tập cho học viên.
- Anh/Chị muốn trở thành Mentor? Chỉ cần vào trang **Hồ sơ cá nhân**, nhấn nút **Ứng tuyển Mentor (Become a Mentor)** để gửi đơn ứng tuyển!`;
  } else {
    baseReply = `🤖 **Trợ lý EM Assistant xin chào Anh/Chị!**
English Master là nền tảng học tiếng Anh trực tuyến toàn diện, cung cấp:
- 📚 20+ Khóa học chuẩn chuẩn TOEIC, IELTS, Giao tiếp & Business English.
- 📖 Mô hình **Học 3 Phần** (Quiz trắc nghiệm $\\rightarrow$ Video $\\rightarrow$ Essay bài tập viết).
- 💳 Thanh toán mượt mà qua **VNPAY**, tự động lưu hóa đơn.
- 🎓 Cấp **Chứng chỉ mã CERT-WDP** chuẩn hóa ngay khi đạt 100%.

Anh/Chị cần em tư vấn thêm thông tin gì về khóa học hay tính năng nào không ạ? 😊
${dbKnowledge ? "\n" + dbKnowledge : ""}`;
  }

  return baseReply;
}

// Chat endpoint
router.post("/chat", async (req, res) => {
  const { message, history } = req.body;
  const cleanMessage = typeof message === "string" ? message.trim() : "";
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();

  if (!cleanMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Dynamic database knowledge retrieval
  let dbKnowledge = "";
  try {
    const db = mongoose.connection.db;

    const [courses, categories, levels] = await Promise.all([
      db.collection("courses").find({ status: { $ne: "inactive" } }).toArray(),
      db.collection("categories").find({}).toArray(),
      db.collection("levels").find({}).toArray()
    ]);

    const activeCourses = courses.map(c => {
      const name = c.courseName || c.CourseName;
      const price = c.isPaid ? `${(c.price || 0).toLocaleString('vi-VN')} VNĐ` : "Miễn phí";
      return `• ${name} (${price})`;
    }).join("\n");

    const categoryList = categories.map(cat => cat.displayName || cat.categoryName || cat.CategoryName).join(", ");
    const levelList = levels.map(l => l.displayName || l.levelName || l.DisplayName).join(", ");

    dbKnowledge = `📌 DỮ LIỆU THỰC TẾ HỆ THỐNG (REAL-TIME DB):
- Danh mục hiện có: ${categoryList}
- Các cấp độ: ${levelList}
- Danh sách 20 khóa học đang mở trên hệ thống:
${activeCourses}`;
  } catch (dbErr) {
    console.warn("DB knowledge fetch skipped:", dbErr.message);
  }

  const isStream = req.body.stream === true;

  // Fallback to Mock Response if API key is missing or placeholder
  const isInvalidKey = !geminiApiKey || 
                       geminiApiKey.includes("your_gemini_api_key_here");

  if (isInvalidKey) {
    console.warn("⚠️ Using Smart Mock AI Assistant due to missing or invalid Gemini API Key format.");
    const replyText = getMockResponse(cleanMessage, dbKnowledge);

    if (isStream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      
      const words = replyText.split(" ");
      let currentIdx = 0;
      
      const interval = setInterval(() => {
        if (currentIdx < words.length) {
          const chunk = words.slice(currentIdx, currentIdx + 3).join(" ") + " ";
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
          currentIdx += 3;
        } else {
          res.write("data: [DONE]\n\n");
          res.end();
          clearInterval(interval);
        }
      }, 60);
      return;
    } else {
      return res.json({
        success: true,
        reply: replyText,
        timestamp: new Date()
      });
    }
  }

  try {
    console.log("📤 Sending to Gemini API...");

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    let result;
    let resultStream;
    let usedModel = GEMINI_MODEL;
    let lastError;

    const fullInstruction = `${SYSTEM_PROMPT}\n\n${dbKnowledge}`;

    for (const modelName of GEMINI_FALLBACK_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: fullInstruction,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          },
        });

        const chat = model.startChat({
          history: buildGeminiHistory(history),
        });

        if (isStream) {
          resultStream = await chat.sendMessageStream(cleanMessage);
        } else {
          result = await chat.sendMessage(cleanMessage);
        }
        usedModel = modelName;
        break;
      } catch (error) {
        lastError = error;
        console.error(`❌ Gemini model ${modelName} failed:`, error.message);

        if (!isRetryableGeminiError(error)) {
          throw error;
        }
      }
    }

    if (isStream) {
      if (!resultStream) {
        throw lastError || new Error("Gemini Streaming API failed");
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let hasSentData = false;
      try {
        for await (const chunk of resultStream.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            hasSentData = true;
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
          }
        }
        res.write("data: [DONE]\n\n");
        res.end();
      } catch (streamError) {
        console.error("❌ Error during streaming:", streamError);
        if (!hasSentData) {
          const fallbackText = getMockResponse(cleanMessage, dbKnowledge);
          res.write(`data: ${JSON.stringify({ text: fallbackText })}\n\n`);
        }
        res.write("data: [DONE]\n\n");
        res.end();
      }
      return;
    }

    if (!result) {
      throw lastError || new Error("Gemini API failed");
    }

    let text = result.response.text()?.trim();

    if (!text || text.length < 5) {
      text = getMockResponse(cleanMessage, dbKnowledge);
    }

    console.log(`✅ Response received from Gemini (${usedModel})`);
    res.json({ 
      success: true,
      reply: text,
      timestamp: new Date()
    });

  } catch (error) {
    console.error("❌ Chat API Error:", error);
    
    // Fallback to Smart Mock AI on any API error or quota issue
    console.warn("⚠️ Chat API error. Responding with Smart Mock AI Assistant.");
    const replyText = getMockResponse(cleanMessage, dbKnowledge);
    
    if (isStream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      
      const words = replyText.split(" ");
      let currentIdx = 0;
      const interval = setInterval(() => {
        if (currentIdx < words.length) {
          const chunk = words.slice(currentIdx, currentIdx + 3).join(" ") + " ";
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
          currentIdx += 3;
        } else {
          res.write("data: [DONE]\n\n");
          res.end();
          clearInterval(interval);
        }
      }, 60);
      return;
    } else {
      return res.json({
        success: true,
        reply: replyText,
        timestamp: new Date()
      });
    }
  }
});

module.exports = router;
