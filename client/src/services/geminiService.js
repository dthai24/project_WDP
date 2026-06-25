const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5050/api";
const REQUEST_TIMEOUT_MS = 45000;

const geminiService = {
  async generateResponse(userMessage, conversationHistory = []) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      if (!userMessage.trim()) {
        throw new Error("Tin nhắn không được để trống");
      }

      console.log("📤 Sending message to server...", {
        messageLength: userMessage.length,
        historyLength: conversationHistory.length
      });

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          message: userMessage,
          history: conversationHistory
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Server error:", data);
        throw new Error(
          data.message || data.error || `Server error: ${response.status}`
        );
      }

      if (!data.reply) {
        throw new Error("API trả về response rỗng");
      }

      console.log("✅ Response received:", data.reply.substring(0, 50) + "...");
      return data.reply;
    } catch (error) {
      console.error("❌ Error in chat service:", error);

      if (error.name === "AbortError") {
        throw new Error("Server phản hồi quá lâu. Vui lòng thử lại sau vài giây.");
      }

      if (error.message === "Failed to fetch") {
        throw new Error("Không kết nối được backend. Hãy kiểm tra server có đang chạy ở http://localhost:5050 không.");
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async streamResponse(userMessage, conversationHistory = [], onChunk) {
    if (!userMessage.trim()) {
      throw new Error("Tin nhắn không được để trống");
    }

    console.log("📤 Starting response stream from server...");

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        history: conversationHistory,
        stream: true
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        data.message || data.error || `Server error: ${response.status}`
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const rawData = trimmed.substring(6);
          if (rawData === "[DONE]") {
            console.log("✅ Stream completed");
            return;
          }

          try {
            const parsed = JSON.parse(rawData);
            if (parsed.text) {
              onChunk(parsed.text);
            } else if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (jsonErr) {
            console.warn("Failed to parse JSON stream chunk:", jsonErr);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};

export default geminiService;
