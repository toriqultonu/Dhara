"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import type { ChatMessage } from "@/lib/types";

export default function ChatInterface() {
  const t = useTranslations("ask");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.success ? data.data.answer : "Error occurred",
        citations: data.success ? data.data.citations : [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg border">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {loading && <TypingIndicator />}
      </div>
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            dir="auto"
            className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50">
            &#10148;
          </button>
        </div>
      </form>
    </div>
  );
}
