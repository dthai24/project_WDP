import React from "react";
import "./FloatingChatButton.css";

export default function FloatingChatButton({ onClick }) {
  return (
    <button
      className="floating-chat-btn"
      onClick={onClick}
      title="Chat với EM Assistant"
      aria-label="Open chat"
    >
      <span className="chat-icon">💬</span>
      <span className="pulse"></span>
    </button>
  );
}
