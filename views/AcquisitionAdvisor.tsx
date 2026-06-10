import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are an expert M&A acquisition advisor focused on financial returns. 
You help users with:
- Screening acquisition targets (revenue, EBITDA, margins, multiples)
- Due diligence checklists (financial, commercial, legal)
- LBO / returns modeling (MOIC, IRR, hold period)
- Deal pipeline tracking
- Exit strategy planning

Be concise, professional, and data-driven. When relevant, suggest specific numbers, 
ratios, or frameworks. Always consider downside risk.`;

export default function AcquisitionAdvisor() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your M&A acquisition advisor. I can help with target screening, due diligence, valuation, and returns modeling. What would you like to work on?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, system: SYSTEM_PROMPT }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#1F3864",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: 24,
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Open Acquisition Advisor"
      >
        {open ? "✕" : "💼"}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 24,
            width: 380,
            maxHeight: 560,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9998,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#1F3864",
              color: "#fff",
              padding: "14px 18px",
              fontWeight: 600,
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span>💼</span>
            <div>
              <div>Acquisition Advisor</div>
              <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.75 }}>
                M&A · Due Diligence · Returns
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px 14px 8px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: "#f9fafb",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "9px 13px",
                    borderRadius:
                      msg.role === "user"
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",
                    background: msg.role === "user" ? "#1F3864" : "#fff",
                    color: msg.role === "user" ? "#fff" : "#1a1a1a",
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    border:
                      msg.role === "assistant"
                        ? "0.5px solid #e5e7eb"
                        : "none",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "9px 14px",
                    background: "#fff",
                    borderRadius: "14px 14px 14px 4px",
                    border: "0.5px solid #e5e7eb",
                    fontSize: 13,
                    color: "#888",
                  }}
                >
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "10px 12px",
              borderTop: "0.5px solid #e5e7eb",
              background: "#fff",
              display: "flex",
              gap: 8,
              alignItems: "flex-end",
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about targets, due diligence, valuation…"
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                border: "0.5px solid #d1d5db",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 13.5,
                fontFamily: "inherit",
                outline: "none",
                lineHeight: 1.5,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                background: "#1F3864",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.5 : 1,
                fontSize: 14,
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
