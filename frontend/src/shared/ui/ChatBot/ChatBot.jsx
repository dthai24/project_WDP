import React, { useState, useRef, useEffect } from "react";
import chatbotService from "../../../services/chatbotService";
import "./ChatBot.css";

const QUICK_PROMPTS = [
  "Tư vấn lộ trình học IELTS",
  "Sửa ngữ pháp câu tiếng Anh",
  "Gợi ý bài luyện speaking hôm nay",
];

const INITIAL_MESSAGE = {
  id: 1,
  text: "Xin chào! Em là EM Assistant, trợ lý ảo của English Master. Em có thể giúp gì cho Anh/Chị hôm nay? 😊",
  sender: "bot",
  timestamp: new Date().toISOString(),
};

function renderInlineText(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function MessageText({ text }) {
  const lines = text.split("\n");

  return (
    <div className="message-text">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={index} className="message-spacer" />;
        }

        if (/^[-*•]\s+/.test(trimmed)) {
          return (
            <div key={index} className="message-bullet">
              <span>•</span>
              <p>{renderInlineText(trimmed.replace(/^[-*•]\s*/, ""))}</p>
            </div>
          );
        }

        return <p key={index}>{renderInlineText(line)}</p>;
      })}
    </div>
  );
}

export default function ChatBot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 110)}px`;
  }, [inputMessage]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const messageToSend = inputMessage.trim();
    if (!messageToSend || loading) return;

    const userMsg = {
      id: Date.now(),
      text: messageToSend,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage("");
    setError("");
    setLoading(true);

    try {
      const conversationHistory = newMessages
        .filter((msg) => msg.id !== 1 && msg.text)
        .map((msg) => ({
          sender: msg.sender,
          text: msg.text,
        }));

      // Add a placeholder bot message
      const botPlaceholderId = Date.now() + 1;
      const botMsgPlaceholder = {
        id: botPlaceholderId,
        text: "...",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, botMsgPlaceholder]);
      
      let accumulatedText = "";
      let isFirstChunk = true;
      
      await chatbotService.streamResponse(
        messageToSend,
        conversationHistory,
        (chunk) => {
          if (isFirstChunk) {
            isFirstChunk = false;
            accumulatedText = chunk;
            setLoading(false);
          } else {
            accumulatedText += chunk;
          }
          
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === botPlaceholderId ? { ...msg, text: accumulatedText } : msg
            )
          );
        }
      );
      
      setLoading(false);
    } catch (err) {
      console.error("Chat error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setError("");
    setInputMessage("");
  };

  const handleQuickPrompt = (prompt) => {
    if (loading) return;
    setInputMessage(prompt);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  if (!isOpen) return null;
  const showQuickPrompts = messages.length <= 1 && !loading;

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-content">
          <h2>EM Assistant 🎓</h2>
          <p>English Master Chatbot</p>
        </div>
        <div className="header-actions">
          <button className="header-btn" onClick={handleResetChat} title="Xóa hội thoại" type="button">
            ↻
          </button>
          <button className="header-btn" onClick={onClose} title="Đóng chat" type="button">
            ✕
          </button>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender === "user" ? "user-msg" : "bot-msg"}`}
          >
            <div className="message-avatar">
              {msg.sender === "user" ? "👤" : "🤖"}
            </div>
            <div className="message-content">
              <MessageText text={msg.text} />
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message bot-msg">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-bubble">
                <div className="typing-indicator" aria-label="EM Assistant đang trả lời">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {showQuickPrompts && (
          <div className="quick-prompts" aria-label="Gợi ý câu hỏi">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleQuickPrompt(prompt)}
                className="quick-prompt-btn"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chatbot-input-area" onSubmit={handleSendMessage}>
        <textarea
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu hỏi của bạn..."
          disabled={loading}
          className="chat-input"
          rows={1}
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="send-btn"
        >
          {loading ? "⏳" : "📤"}
        </button>
      </form>
    </div>
  );
}
