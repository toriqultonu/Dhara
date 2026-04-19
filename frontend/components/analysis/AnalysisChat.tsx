"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { AnalysisUploadResponse, AnalysisQueryResponse, LegalReference } from "@/lib/types";

interface AnalysisChatProps {
  session: AnalysisUploadResponse;
  token: string | null;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: LegalReference[];
}

const QUICK_QUESTIONS = [
  "What is the main purpose of this document?",
  "Who are the parties involved?",
  "What are the key obligations?",
  "Are there any penalty clauses?",
  "What is the governing law?",
  "What are the payment terms?",
];

export default function AnalysisChat({ session, token }: AnalysisChatProps) {
  const t = useTranslations("analysis");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Document "${session.fileName}" loaded successfully (${session.wordCount} words, ~${session.pageCount} pages). Ask me anything about it.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendQuery = async (query: string) => {
    if (!query.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/analysis/query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ sessionId: session.sessionId, query, language: "en" }),
        }
      );

      const json = await res.json();
      const data: AnalysisQueryResponse = json.data;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.answer,
          references: data.references,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: t("queryError") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Session info */}
      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200 mb-4">
        <span className="text-green-600">📄</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-800 truncate">{session.fileName}</p>
          <p className="text-xs text-green-600">
            {session.wordCount} words · ~{session.pageCount} pages
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
              msg.role === "user"
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-800"
            }`}>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              {msg.references && msg.references.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                  {msg.references.map((ref, i) => (
                    <p key={i} className="text-xs text-gray-500">
                      📖 {ref.law} — {ref.section}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
              <span className="text-gray-400 text-sm">{t("thinking")}</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div className="flex flex-wrap gap-2 mb-3">
        {QUICK_QUESTIONS.slice(0, 3).map((q) => (
          <button
            key={q}
            onClick={() => sendQuery(q)}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-full hover:border-primary hover:text-primary transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); sendQuery(input); }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("askPlaceholder")}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {t("send")}
        </button>
      </form>
    </div>
  );
}
