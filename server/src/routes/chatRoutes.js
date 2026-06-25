const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM_PROMPT = `Bạn là EM Assistant - trợ lý AI chính thức của English Master.

Nhiệm vụ duy nhất của bạn là hỗ trợ người dùng trong phạm vi học tập tiếng Anh và giải đáp thắc mắc về các tính năng của hệ thống English Master.
Bạn tuyệt đối KHÔNG trả lời các câu hỏi ngoài phạm vi này (ví dụ: làm bài tập toán, viết code lập trình, công thức nấu ăn, kể chuyện không liên quan, v.v.).

English Master là nền tảng học tiếng Anh trực tuyến với các tính năng chính:
- Adaptive Learning (học thích ứng theo trình độ)
- Gamification (Daily Streak, Leaderboards, Badges)
- Hybrid Evaluation (AI chấm + Mentor chấm)
- Trình độ phù hợp: Cấp 1-2 (Beginner), Cấp 3 (Intermediate), ĐH+ (Advanced)

Khi trả lời:
- Luôn giữ thái độ thân thiện, lịch sự và dùng xưng hô "Em" và "Anh/Chị".
- Viết ngắn gọn, sử dụng bullet points, in đậm từ khóa quan trọng và emojis tinh tế (🚀, 🎓, 🌟).
- Nếu người dùng hỏi câu hỏi ngoài phạm vi học tiếng Anh hoặc hệ thống English Master, hãy từ chối một cách lịch sự, giải thích rõ giới hạn phạm vi hỗ trợ của trợ lý và hướng dẫn họ quay trở lại mục tiêu học tập tiếng Anh.`;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const GEMINI_FALLBACK_MODELS = [
  GEMINI_MODEL,
  "gemini-1.5-flash",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
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
          systemInstruction: SYSTEM_PROMPT,
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
