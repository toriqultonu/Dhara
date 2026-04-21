"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { ChatMessage, ChatMode, UploadedDocument, AnalysisUploadResponse } from "@/lib/types";

const LAW_SECTIONS = [
  { id: 1,  nameEn: "Penal Code 1860",                    name: "দণ্ডবিধি ১৮৬০",                  year: 1860 },
  { id: 2,  nameEn: "Code of Criminal Procedure 1898",    name: "ফৌজদারি কার্যবিধি ১৮৯৮",         year: 1898 },
  { id: 3,  nameEn: "Code of Civil Procedure 1908",       name: "দেওয়ানি কার্যবিধি ১৯০৮",          year: 1908 },
  { id: 4,  nameEn: "Contract Act 1872",                  name: "চুক্তি আইন ১৮৭২",                 year: 1872 },
  { id: 5,  nameEn: "Evidence Act 1872",                  name: "সাক্ষ্য আইন ১৮৭২",                year: 1872 },
  { id: 6,  nameEn: "Transfer of Property Act 1882",      name: "সম্পত্তি হস্তান্তর আইন ১৮৮২",    year: 1882 },
  { id: 7,  nameEn: "Companies Act 1994",                 name: "কোম্পানি আইন ১৯৯৪",               year: 1994 },
  { id: 8,  nameEn: "Bangladesh Labour Act 2006",         name: "শ্রম আইন ২০০৬",                   year: 2006 },
  { id: 9,  nameEn: "Family Courts Ordinance 1985",       name: "পারিবারিক আদালত অধ্যাদেশ ১৯৮৫",  year: 1985 },
  { id: 10, nameEn: "Muslim Family Laws Ordinance 1961",  name: "মুসলিম পারিবারিক আইন ১৯৬১",      year: 1961 },
  { id: 11, nameEn: "Land Registration Act 1908",         name: "ভূমি নিবন্ধন আইন ১৯০৮",          year: 1908 },
  { id: 12, nameEn: "Arbitration Act 2001",               name: "সালিসি আইন ২০০১",                 year: 2001 },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ChatInterface() {
  const t = useTranslations("ask");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat mode state
  const [chatMode, setChatMode] = useState<ChatMode>("rag");
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedStatuteId, setSelectedStatuteId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleFileUpload = useCallback(async (file: File) => {
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"];
    if (!allowed.includes(file.type)) {
      setUploadError("Unsupported file type. Please upload PDF, DOCX or TXT.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File exceeds 10 MB limit.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const res = await api.uploadFile<AnalysisUploadResponse>("/api/analysis/upload", file);
      if (res.success) {
        setUploadedDoc({
          sessionId: res.data.sessionId,
          fileName: res.data.fileName,
          wordCount: res.data.wordCount,
        });
        setMessages([]);
      } else {
        setUploadError(t("uploadError"));
      }
    } catch {
      setUploadError(t("uploadError"));
    } finally {
      setUploading(false);
    }
  }, [t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const buildAskPayload = () => {
    const base = { question: input.trim(), language: "bn" };
    if (chatMode === "document" && uploadedDoc) {
      return { ...base, mode: "document", sessionId: uploadedDoc.sessionId };
    }
    if (chatMode === "statute" && selectedStatuteId) {
      return { ...base, mode: "statute", statuteId: selectedStatuteId };
    }
    return { ...base, mode: "rag" };
  };

  const getPlaceholder = () => {
    if (chatMode === "document" && uploadedDoc) return t("documentChatPlaceholder");
    if (chatMode === "statute" && selectedStatuteId) return t("statuteChatPlaceholder");
    return t("placeholder");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const q = input.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(), role: "user", content: q, timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildAskPayload()),
      });
      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(), role: "assistant",
        content: data.success ? (data.data.aiAnswer || data.data.answer || "No answer returned.") : "An error occurred.",
        citations: data.success ? (data.data.citations ?? []) : [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(), role: "assistant",
        content: "Unable to reach the server. Please check your connection.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "What is the punishment for murder under Bangladeshi law?",
    "How does divorce work under Muslim Personal Law?",
    "What are the rights of a tenant in Bangladesh?",
  ];

  const handleModeSwitch = (mode: ChatMode) => {
    setChatMode(mode);
    setMessages([]);
    if (mode !== "document") setUploadedDoc(null);
    if (mode !== "statute") setSelectedStatuteId(null);
  };

  return (
    <div className="flex h-[calc(100vh-62px)] bg-background">
      {/* ── Left Sidebar ── */}
      <aside className="w-[260px] shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-y-auto">
        <div className="p-4 pb-3">
          <Button variant="primary" size="sm" full onClick={() => { setMessages([]); }}>
            + New Conversation
          </Button>
        </div>

        {/* Mode toggle */}
        <div className="px-4 pb-3">
          <p className="text-[11px] font-bold text-muted tracking-widest uppercase mb-2">Chat Mode</p>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[12px] font-medium">
            <button
              onClick={() => handleModeSwitch("rag")}
              className={`flex-1 py-2 transition-colors ${
                chatMode === "rag"
                  ? "bg-primary text-white"
                  : "bg-white text-muted hover:bg-gray-50"
              }`}
            >
              {t("modeRag")}
            </button>
            <button
              onClick={() => handleModeSwitch("document")}
              className={`flex-1 py-2 border-l border-gray-200 transition-colors ${
                chatMode === "document"
                  ? "bg-primary text-white"
                  : "bg-white text-muted hover:bg-gray-50"
              }`}
            >
              {t("modeDocument")}
            </button>
          </div>
        </div>

        {/* Document upload panel — shown in document mode */}
        {chatMode === "document" && (
          <div className="px-4 pb-3 border-t border-gray-100 pt-3">
            <p className="text-[11px] font-bold text-muted tracking-widest uppercase mb-2">
              {t("uploadDocument")}
            </p>

            {!uploadedDoc ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-primary bg-blue-50"
                    : "border-gray-200 hover:border-primary hover:bg-blue-50/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                  }}
                />
                {uploading ? (
                  <p className="text-[12px] text-primary">{t("uploading")}</p>
                ) : (
                  <>
                    <div className="text-[22px] mb-1">📄</div>
                    <p className="text-[12px] text-muted">{t("dropOrClick")}</p>
                    <p className="text-[11px] text-muted/60 mt-0.5">{t("uploadHint")}</p>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-[16px]">✅</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-green-800 truncate">
                      {uploadedDoc.fileName}
                    </p>
                    <p className="text-[11px] text-green-600">
                      {uploadedDoc.wordCount.toLocaleString()} words
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setUploadedDoc(null); setMessages([]); }}
                  className="mt-2 text-[11px] text-primary hover:underline"
                >
                  {t("changeDocument")}
                </button>
              </div>
            )}

            {uploadError && (
              <p className="text-[11px] text-red-500 mt-1">{uploadError}</p>
            )}
          </div>
        )}

        {/* Law section dropdown — shown in both document and rag mode */}
        <div className="px-4 pb-3 border-t border-gray-100 pt-3">
          <p className="text-[11px] font-bold text-muted tracking-widest uppercase mb-2">
            {t("selectLawSection")}
          </p>
          <select
            value={selectedStatuteId ?? ""}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null;
              setSelectedStatuteId(val);
              if (val && chatMode === "rag") {
                setChatMode("statute");
                setMessages([]);
              } else if (!val) {
                if (chatMode === "statute") {
                  setChatMode("rag");
                  setMessages([]);
                }
              }
            }}
            className="w-full text-[12px] border border-gray-200 rounded-lg px-2.5 py-2 bg-white text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">{t("allLaws")}</option>
            {LAW_SECTIONS.map((law) => (
              <option key={law.id} value={law.id}>
                {law.nameEn}
              </option>
            ))}
          </select>
          {selectedStatuteId && (
            <p className="text-[11px] text-muted mt-1">{t("lawSectionHint")}</p>
          )}
        </div>

        {/* Recent conversations */}
        <div className="flex-1 overflow-auto px-2 border-t border-gray-100 pt-2">
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
          <p className="text-[11px] text-muted leading-relaxed">{t("disclaimer")}</p>
        </div>
      </aside>

      {/* ── Chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mode indicator bar */}
        {(chatMode !== "rag" || selectedStatuteId) && (
          <div className="px-5 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-[12px] text-primary">
            {chatMode === "document" && uploadedDoc && (
              <>
                <span>📄</span>
                <span>Chatting with: <strong>{uploadedDoc.fileName}</strong></span>
              </>
            )}
            {chatMode === "document" && !uploadedDoc && (
              <>
                <span>📄</span>
                <span className="text-amber-600">Upload a document to start document chat</span>
              </>
            )}
            {chatMode === "statute" && selectedStatuteId && (
              <>
                <span>⚖️</span>
                <span>
                  Scoped to:{" "}
                  <strong>
                    {LAW_SECTIONS.find((l) => l.id === selectedStatuteId)?.nameEn}
                  </strong>
                </span>
              </>
            )}
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 && (
            <div className="text-center py-16 max-w-[480px] mx-auto">
              <div className="w-[60px] h-[60px] bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 text-[28px]">
                {chatMode === "document" ? "📄" : "⚖️"}
              </div>
              <h2 className="text-[22px] font-bold text-foreground mb-2">
                {chatMode === "document"
                  ? "Ask About Your Document"
                  : chatMode === "statute"
                  ? `Ask About ${LAW_SECTIONS.find((l) => l.id === selectedStatuteId)?.nameEn ?? "Law"}`
                  : "Ask a Legal Question"}
              </h2>
              <p className="text-[14px] text-muted leading-relaxed mb-6">
                {chatMode === "document"
                  ? "Upload a document and ask questions about its contents. AI will answer based on your document."
                  : chatMode === "statute"
                  ? "Questions will be answered from the selected law section only."
                  : "Get cited answers from Bangladesh's Acts, Ordinances, and Court Judgments. Ask in English or Bengali."}
              </p>
              {chatMode === "rag" && (
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
              )}
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
                placeholder={getPlaceholder()}
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
          <p className="text-[11px] text-muted/60 text-center mt-2">Press Enter to send</p>
        </div>
      </div>
    </div>
  );
}
