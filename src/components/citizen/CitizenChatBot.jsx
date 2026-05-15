// components/citizen/CitizenChatBot.jsx
// Floating chat assistant for citizens — uses the public /api/chat/citizen endpoint
// Response shape: { answer: string, followUp: string[] }
import { useState, useRef, useEffect } from "react";
import api from "../../services/api";
import "../../styles/CitizenChatBot.css";

const WELCOME_TEXT    = "Hi there! 👋 I'm your CityWorks assistant. I can help you submit complaints, track your requests, and answer any questions about city services.";
const WELCOME_FOLLOWUP = ["How do I register?", "How do I submit a complaint?", "How do I track my request?"];

export default function CitizenChatBot() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: WELCOME_TEXT, followUp: WELCOME_FOLLOWUP },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: msg }]);
    setLoading(true);

    try {
      // /api/chat/citizen is public — no auth required
      const res      = await api.post("/api/chat/citizen", { message: msg });
      const data     = res.data?.data || {};
      // Backend returns { answer: "...", followUp: ["...", ...] }
      const answer   = typeof data === "string" ? data : (data.answer  || "Sorry, I couldn't process that.");
      const followUp = Array.isArray(data.followUp) ? data.followUp : [];
      setMessages(m => [...m, { role: "bot", text: answer, followUp }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Unable to reach the assistant. Please try again.";
      setMessages(m => [...m, { role: "bot", text: errMsg, isError: true, followUp: [] }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () =>
    setMessages([{ role: "bot", text: WELCOME_TEXT, followUp: WELCOME_FOLLOWUP }]);

  return (
    <>
      {/* ── Floating Action Button ── */}
      <button
        className={`ccb-fab ${open ? "ccb-fab--open" : ""}`}
        onClick={() => setOpen(o => !o)}
        title="CityWorks Help"
        aria-label="Open chat assistant"
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="ccb-window">

          {/* Header */}
          <div className="ccb-header">
            <div className="ccb-header-left">
              <div className="ccb-avatar">🏙️</div>
              <div>
                <p className="ccb-header-title">CityWorks Help</p>
                <p className="ccb-header-sub">Here to help you 24/7</p>
              </div>
            </div>
            <button className="ccb-clear" onClick={clearChat} title="Clear chat">🗑️</button>
          </div>

          {/* Messages */}
          <div className="ccb-messages">
            {messages.map((m, i) => (
              <div key={i}>
                {/* Bubble */}
                <div className={`ccb-row ccb-row--${m.role}`}>
                  {m.role === "bot" && <div className="ccb-bot-icon">🤖</div>}
                  <div className={`ccb-bubble ccb-bubble--${m.role} ${m.isError ? "ccb-bubble--error" : ""}`}>
                    {m.text}
                  </div>
                </div>

                {/* Follow-up suggestion chips */}
                {m.role === "bot" && m.followUp?.length > 0 && (
                  <div className="ccb-chips">
                    {m.followUp.map((chip, ci) => (
                      <button
                        key={ci}
                        className="ccb-chip"
                        onClick={() => send(chip)}
                        disabled={loading}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="ccb-row ccb-row--bot">
                <div className="ccb-bot-icon">🤖</div>
                <div className="ccb-bubble ccb-bubble--bot ccb-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="ccb-input-area">
            <div className="ccb-input-row">
              <textarea
                ref={inputRef}
                className="ccb-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about city services…"
                disabled={loading}
                rows={1}
              />
              <button
                className="ccb-send"
                onClick={() => send()}
                disabled={loading || !input.trim()}
                title="Send"
              >
                ➤
              </button>
            </div>
            <p className="ccb-hint">Press Enter to send · Shift+Enter for new line</p>
          </div>

        </div>
      )}
    </>
  );
}
