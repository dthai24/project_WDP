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
    // For now, use generateResponse and call onChunk with full response
    try {
      const response = await this.generateResponse(userMessage, conversationHistory);
      onChunk(response);
    } catch (error) {
      throw error;
    }
  },
};

export default geminiService;
