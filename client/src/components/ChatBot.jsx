import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessage,
  setLoading,
  setError,
  clearError,
  resetChat,
} from "../redux/chatSlice";
import geminiService from "../services/geminiService";
import "./ChatBot.css";

const QUICK_PROMPTS = [
  "Tư vấn lộ trình học IELTS",
  "Sửa ngữ pháp câu tiếng Anh",
  "Gợi ý bài luyện speaking hôm nay",
];

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
  const dispatch = useDispatch();
  const { messages, loading, error } = useSelector((state) => state.chat);
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

    dispatch(addMessage({ text: messageToSend, sender: "user" }));
    setInputMessage("");
    dispatch(clearError());
    dispatch(setLoading(true));

    try {
      const conversationHistory = messages
        .filter((msg) => msg.id !== 1 && msg.text)
        .map((msg) => ({
          sender: msg.sender,
          text: msg.text,
        }));

      const response = await geminiService.generateResponse(
        messageToSend,
        conversationHistory
      );

      dispatch(addMessage({ text: response, sender: "bot" }));
      dispatch(setLoading(false));
    } catch (err) {
      console.error("Chat error:", err);
      dispatch(setError(err.message));
      dispatch(setLoading(false));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleResetChat = () => {
    dispatch(resetChat());
    dispatch(clearError());
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
