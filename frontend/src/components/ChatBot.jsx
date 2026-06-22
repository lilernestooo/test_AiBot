import { useState, useRef, useEffect } from "react";
import "../styles/ChatBot.css";

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hi! Welcome to Ukay Chatbot. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history }),
      });

      const text = await response.text();
      setMessages((prev) => [...prev, { role: "bot", content: text }]);
      setHistory((prev) => [
        ...prev,
        { role: "user", content: userMessage },
        { role: "assistant", content: text },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Sorry, I couldn't connect. Please try again." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-wrapper">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header__left">
          <div className="chat-header__icon">
            <i className="ti ti-shirt" aria-hidden="true" />
          </div>
          <div>
            <div className="chat-header__name">Ukay Chatbot</div>
            <div className="chat-header__sub">
              <span className="chat-header__status-dot" />
              Online · usually replies instantly
            </div>
          </div>
        </div>
        <div className="chat-header__actions">
          <button className="icon-btn" aria-label="Search conversation">
            <i className="ti ti-search" aria-hidden="true" />
          </button>
          <button className="icon-btn" aria-label="More options">
            <i className="ti ti-dots-vertical" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        <div className="chat-divider">
          <hr /><span>Today</span><hr />
        </div>

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`msg-row ${msg.role === "user" ? "msg-row--user" : "msg-row--bot"}`}
          >
            {msg.role === "bot" && (
              <div className="bot-avatar" aria-hidden="true">
                <i className="ti ti-shirt" />
              </div>
            )}
            <div className={`bubble ${msg.role === "user" ? "bubble--user" : "bubble--bot"}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="msg-row msg-row--bot">
            <div className="bot-avatar" aria-hidden="true">
              <i className="ti ti-shirt" />
            </div>
            <div className="bubble bubble--bot">
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <button className="attach-btn" aria-label="Attach file">
          <i className="ti ti-paperclip" aria-hidden="true" />
        </button>
        <input
          ref={inputRef}
          className="chat-input"
          type="text"
          placeholder="Ask about our products..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          aria-label="Message input"
        />
        <button
          className="send-btn"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          <i className="ti ti-send-2" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="typing-dots">
      <span className="typing-dots__dot" />
      <span className="typing-dots__dot" />
      <span className="typing-dots__dot" />
    </div>
  );
}