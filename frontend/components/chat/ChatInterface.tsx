"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import Button from "@/components/ui/Button";
import type { ChatMessage } from "@/lib/types";

export default function ChatInterface() {
  const t = useTranslations("ask");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const q = input;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: q,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/ask`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q }),
        }
      );
      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.success ? data.data.answer : "An error occurred. Please try again.",
        citations: data.success ? data.data.citations : [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Unable to reach the server. Please check your connection.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "What is the punishment for murder under Bangladeshi law?",
    "How does divorce work under Muslim Personal Law?",
    "What are the rights of a tenant in Bangladesh?",
  ];

  return (
    <div className="flex h-[calc(100vh-62px)] bg-background">
      {/* ── Sidebar ── */}
      <aside className="w-[240px] shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 pb-3">
          <Button
            variant="primary"
            size="sm"
            full
            onClick={() => setMessages([])}
          >
            + New Conversation
          </Button>
        </div>
        <div className="flex-1 overflow-auto px-2">
          <p className="text-[11px] font-bold text-muted tracking-widest uppercase px-2 py-2">
            Recent
          </p>
          {["What are tenant rights?", "Murder under Penal Code", "Divorce laws Bangladesh"].map((s, i) => (
            <button
              key={i}
              className={`w-full text-left text-[13px] px-2.5 py-2 rounded-lg mb-0.5 transition-colors ${
                i === 0 ? "bg-blue-50 text-primary font-medium" : "text-muted hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100">
          <p className="text-[11px] text-muted leading-relaxed">
            AI answers are for research only and do not constitute legal advice.
          </p>
        </div>
      </aside>

      {/* ── Chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 && (
            <div className="text-center py-16 max-w-[480px] mx-auto">
              <div className="w-[60px] h-[60px] bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 text-[28px]">
                ⚖️
              </div>
              <h2 className="text-[22px] font-bold text-foreground mb-2">Ask a Legal Question</h2>
              <p className="text-[14px] text-muted leading-relaxed mb-6">
                Get cited answers from Bangladesh&apos;s Acts, Ordinances, and Court Judgments.
                Ask in English or Bengali.
              </p>
              <div className="space-y-2">
                {suggestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="w-full text-left px-4 py-2.5 bg-white border-[1.5px] border-gray-200 rounded-lg text-[13px] text-foreground hover:border-primary hover:bg-blue-50 transition-all"
                  >
                    ↗ {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {loading && <TypingIndicator />}
        </div>

        {/* Input */}
        <div className="p-5 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="flex gap-2.5 max-w-[800px] mx-auto">
            <div className="flex-1 flex bg-gray-50 border-[1.5px] border-gray-200 rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/10 focus-within:bg-white transition-all">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("placeholder")}
                dir="auto"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) handleSend(e);
                }}
                className="flex-1 px-4 py-3 text-[14px] bg-transparent border-none outline-none text-foreground placeholder:text-muted"
              />
            </div>
            <Button type="submit" variant="primary" disabled={loading || !input.trim()}>
              Send ↗
            </Button>
          </form>
          <p className="text-[11px] text-muted/60 text-center mt-2">
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
