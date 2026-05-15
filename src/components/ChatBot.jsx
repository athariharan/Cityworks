import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import "../styles/ChatBot.css";

const WELCOME = "Hi! I'm your CityWorks assistant. Ask me anything about work orders, assets, staff, or maintenance.";

export default function ChatBot() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: WELCOME }]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef(null);
  const inputRef                = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post("/api/chat", { message: userMsg });
      const reply = res.data?.data || "Sorry, I couldn't process that.";
      setMessages(m => [...m, { role: "bot", text: reply }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Unable to reach the assistant. Please try again.";
      setMessages(m => [
        ...m,
        { role: "bot", text: errMsg, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => setMessages([{ role: "bot", text: WELCOME }]);

  return (
    <>
      {/* Floating action button */}
      <button
        className={`cb-fab ${open ? "cb-fab--open" : ""}`}
        onClick={() => setOpen(o => !o)}
        title="CityWorks Assistant"
      >
        {open ? "✕" : "🤖"}
      </button>

      {open && (
        <div className="cb-window">

          {/* Header */}
          <div className="cb-header">
            <div className="cb-header-left">
              <div className="cb-avatar">🏛️</div>
              <div>
                <p className="cb-header-title">CityWorks Assistant</p>
                <p className="cb-header-sub">Ask me anything about CityWorks</p>
              </div>
            </div>
            <button className="cb-clear" onClick={clearChat} title="Clear chat">🗑️</button>
          </div>

          {/* Messages */}
          <div className="cb-messages">
            {messages.map((m, i) => (
              <div key={i} className={`cb-bubble-row cb-bubble-row--${m.role}`}>
                {m.role === "bot" && <div className="cb-bot-icon">🤖</div>}
                <div className={`cb-bubble cb-bubble--${m.role} ${m.isError ? "cb-bubble--error" : ""}`}>
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="cb-bubble-row cb-bubble-row--bot">
                <div className="cb-bot-icon">🤖</div>
                <div className="cb-bubble cb-bubble--bot cb-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="cb-input-area">
            <div className="cb-input-row">
              <textarea
                ref={inputRef}
                className="cb-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about work orders, assets, staff…"
                disabled={loading}
                rows={1}
              />
              <button
                className="cb-send"
                onClick={send}
                disabled={loading || !input.trim()}
                title="Send"
              >
                ➤
              </button>
            </div>
            <p className="cb-hint">Press Enter to send · Shift+Enter for new line</p>
          </div>

        </div>
      )}
    </>
  );
}
