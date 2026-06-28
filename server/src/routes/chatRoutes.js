const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Course = require("../models/courseModel");
const Category = require("../models/categoryModel");

const SYSTEM_PROMPT = `Bạn là EM Assistant - trợ lý AI chính thức của nền tảng học tiếng Anh English Master.

Nhiệm vụ: Hỗ trợ người dùng giải đáp thắc mắc về tính năng, vai trò và kiến thức hoạt động của English Master.
Quy tắc trả lời:
- Luôn giữ thái độ lịch sự, xưng hô "Em" - "Anh/Chị".
- Trả lời cực kỳ NGẮN GỌN, đi thẳng vào vấn đề, tập trung vào các từ khóa (in đậm).
- Sử dụng danh sách liệt kê (bullet points) để thông tin hiển thị rõ ràng, súc tích nhất.
- Tuyệt đối KHÔNG trả lời dài dòng, lan man. Từ chối lịch sự nếu câu hỏi ngoài phạm vi English Master.

KIẾN THỨC TOÀN BỘ HỆ THỐNG ENGLISH MASTER:

1. DÀNH CHO HỌC VIÊN (LEARNER/STUDENT):
- Lộ trình thích ứng (Adaptive Learning): Làm bài test đầu vào (Placement Test) để xếp lớp: Cấp 1-2 (Beginner), Cấp 3 (Intermediate), ĐH+ (Advanced). Có thể bỏ qua bài học (Skip Lesson) nếu đạt yêu cầu.
- Gamification: Daily Streak (chuỗi ngày học), Bảng xếp hạng (Leaderboards), và Huy hiệu (Badges). Kiếm điểm kinh nghiệm (XP) qua Nhiệm vụ hàng ngày/tuần.
- Đánh giá hỗn hợp (Hybrid Evaluation): Bài viết/nói được chấm tự động bằng AI, sau đó Mentor sẽ chấm và nhận xét chi tiết.
- Gói VIP/Premium: Mở khóa bài học nâng cao, video/podcast độc quyền, Chatbot AI gia sư riêng và tính năng chat 1-1 với Mentor.

2. DÀNH CHO GIÁO VIÊN (MENTOR):
- Đăng ký: Truy cập mục "Become a Mentor" trên Topbar học viên để điền thông tin ứng tuyển.
- Quản lý lộ trình: Tạo khóa học, bài học mới, tải lên bài giảng (video, podcast, tài liệu PDF).
- Chấm điểm: Xem, chấm điểm và viết nhận xét cho bài nộp của học viên.

3. DÀNH CHO QUẢN TRỊ VIÊN (ADMIN):
- Thống kê: Dashboard hiển thị tổng số người dùng, khóa học hoạt động và doanh thu.
- Duyệt khóa học: Xem xét phê duyệt/từ chối các khóa học mới do Mentor tạo ra.
- Quản trị: Quản lý danh mục tiếng Anh, phân quyền tài khoản (Admin, Mentor, Learner), khóa/mở khóa người dùng vi phạm.

4. DÀNH CHO KHÁCH (GUEST):
- Xem thông tin giới thiệu, tìm hiểu lộ trình mẫu tại trang chủ, đăng ký tài khoản để bắt đầu học.`;

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
    return "Gemini API key không hợp lệ. Hãy tạo key mới trong Google AI Studio và cập nhật GEMINI_API_KEY trong server/.env.";
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
    return `Model ${GEMINI_MODEL} không dùng được với key này. Hãy đổi GEMINI_MODEL trong server/.env.`;
  }

  return message || "Không gọi được Gemini API.";
}

function isRetryableGeminiError(error) {
  const message = error?.message?.toLowerCase() || "";

  return (
    message.includes("503") ||
    message.includes("429") ||
    message.includes("404") ||
    message.includes("not found") ||
    message.includes("high demand") ||
    message.includes("quota") ||
    message.includes("service unavailable") ||
    message.includes("overloaded")
  );
}

// Chat endpoint
router.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    const cleanMessage = typeof message === "string" ? message.trim() : "";
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();

    if (!cleanMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!geminiApiKey || geminiApiKey.includes("your_gemini_api_key_here")) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY",
        message: "Vui lòng thêm GEMINI_API_KEY vào file server/.env và restart server.",
      });
    }

    // Dynamic database knowledge retrieval
    let dbKnowledge = "";
    try {
      const courses = await Course.find({ status: "Active" }).select("title category instructor mentorName price description");
      const categories = await Category.find().select("name code description");

      if (courses.length > 0 || categories.length > 0) {
        dbKnowledge = "\n\nDỮ LIỆU THỰC TẾ TỪ DATABASE:\n";
        if (categories.length > 0) {
          dbKnowledge += "Danh mục khóa học hiện có:\n" + categories.map(c => `- ${c.name} (${c.code}): ${c.description || ""}`).join("\n") + "\n";
        }
        if (courses.length > 0) {
          dbKnowledge += "Danh sách khóa học và giáo viên:\n" + courses.map(c => `- Khóa học: "${c.title}" thuộc danh mục ${c.category}. Giảng viên: ${c.instructor || c.mentorName || "Chưa rõ"}. Giá: ${c.price ? c.price.toLocaleString("vi-VN") + " VND" : "Miễn phí"}. Mô tả: ${c.description || ""}`).join("\n") + "\n";
        }
      }
    } catch (dbErr) {
      console.warn("DB knowledge fetch skipped:", dbErr.message);
    }

    console.log("📤 Sending to Gemini API...");

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const isStream = req.body.stream === true;
    let result;
    let resultStream;
    let usedModel = GEMINI_MODEL;
    let lastError;

    for (const modelName of GEMINI_FALLBACK_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT + dbKnowledge,
          generationConfig: {
            maxOutputTokens: 800,
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
          res.write(`data: ${JSON.stringify({ error: "Streaming failed" })}\n\n`);
        }
        res.end();
      }
      return;
    }

    if (!result) {
      throw lastError || new Error("Gemini API failed");
    }

    let text = result.response.text()?.trim();

    if (!text) {
      console.error("❌ Empty response from Gemini");
      return res.status(500).json({ 
        error: "Empty response from AI",
        message: "API trả về response rỗng" 
      });
    }

    if (!text || text.length < 5) {
      text = "Em xin lỗi, em không hiểu rõ câu hỏi của anh/chị. Anh/chị có thể nói lại không? 😊";
    }

    console.log(`✅ Response received from Gemini (${usedModel})`);
    res.json({ 
      success: true,
      reply: text,
      timestamp: new Date()
    });

  } catch (error) {
    console.error("❌ Chat API Error:", error);
    
    res.status(500).json({ 
      error: mapGeminiError(error),
      details: error.toString()
    });
  }
});

module.exports = router;
