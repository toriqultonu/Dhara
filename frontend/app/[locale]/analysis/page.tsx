"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";
import Select from "@/components/ui/Select";
import type {
  AnalysisQueryResponse,
  AnalysisUploadResponse,
  VerifyItem,
  VerifyResponse,
} from "@/lib/types";

type TabKey = "analyze" | "verify" | "library";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];
const DOCUMENT_TYPES = ["employment", "rental", "business", "nda", "other"] as const;

/** Seeded statute ids from backend V7 migration (inserted in this order). */
const LIBRARY_ITEMS: { key: string; statuteId: number }[] = [
  { key: "penal", statuteId: 1 },
  { key: "evidence", statuteId: 2 },
  { key: "contract", statuteId: 3 },
  { key: "muslimFamily", statuteId: 4 },
  { key: "moneyLoan", statuteId: 5 },
  { key: "cpc", statuteId: 6 },
  { key: "crpc", statuteId: 7 },
];

interface QAEntry {
  question: string;
  answer: AnalysisQueryResponse;
}

function isAllowedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export default function AnalysisPage() {
  const t = useTranslations("analysis");
  const te = useTranslations("errors");
  const locale = useLocale();
  const router = useRouter();
  const { isAuthenticated, initializing } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<TabKey>("analyze");
  const [session, setSession] = useState<AnalysisUploadResponse | null>(null);
  const [uploading, setUploading] = useState(false);

  // Tab 1 — Q&A
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [qaHistory, setQaHistory] = useState<QAEntry[]>([]);

  // Tab 2 — Verify
  const [documentType, setDocumentType] = useState<string>("employment");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null);

  const handleUpload = async (file: File) => {
    if (!isAllowedFile(file)) {
      toast(t("unsupportedType"), "error");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast(t("fileTooLarge"), "error");
      return;
    }
    setUploading(true);
    try {
      const res = await api.uploadFile<AnalysisUploadResponse>("/api/analysis/upload", file);
      if (res.success) {
        setSession(res.data);
        setQaHistory([]);
        setVerifyResult(null);
      }
    } catch (err) {
      toast(err instanceof ApiError ? err.message : t("uploadError"), "error");
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async () => {
    const query = question.trim();
    if (!query || !session || asking) return;
    setAsking(true);
    try {
      const res = await api.post<AnalysisQueryResponse>("/api/analysis/query", {
        sessionId: session.sessionId,
        query,
        language: locale,
      });
      setQaHistory((prev) => [...prev, { question: query, answer: res.data }]);
      setQuestion("");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : t("queryError"), "error");
    } finally {
      setAsking(false);
    }
  };

  const handleVerify = async () => {
    if (!session || verifying) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await api.post<VerifyResponse>("/api/analysis/verify", {
        sessionId: session.sessionId,
        documentType,
      });
      setVerifyResult(res.data);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : t("verifyError"), "error");
    } finally {
      setVerifying(false);
    }
  };

  const resetSession = () => {
    setSession(null);
    setQaHistory([]);
    setVerifyResult(null);
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "analyze", label: t("tabAnalyze") },
    { key: "verify", label: t("tabVerify") },
    { key: "library", label: t("tabLibrary") },
  ];

  const needsAuth = !initializing && !isAuthenticated;

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[30px] font-extrabold text-foreground tracking-tight mb-2">
            {t("title")}
          </h1>
          <p className="text-[14px] text-muted">{t("subtitle")}</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-1.5 mb-8 bg-white border border-gray-200 rounded-xl p-1.5 max-w-fit mx-auto shadow-card">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
                tab === item.key
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* ── Tab 1: Upload & Analyze ─────────────────────────── */}
        {tab === "analyze" && (
          <div className="space-y-6">
            <p className="text-center text-[13px] text-muted">{t("analyzeHint")}</p>

            {needsAuth ? (
              <LoginPrompt t={t} onLogin={() => router.push("/login")} />
            ) : !session ? (
              <FileDropZone
                label={t("dropFile")}
                uploading={uploading}
                onFile={handleUpload}
                t={t}
              />
            ) : (
              <>
                <SessionCard session={session} onReset={resetSession} t={t} />

                {/* Q&A */}
                <Card className="p-6">
                  <h2 className="text-[15px] font-bold text-foreground mb-4">{t("chatTitle")}</h2>
                  <div className="flex gap-2 mb-5">
                    <input
                      dir="auto"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAsk();
                      }}
                      placeholder={t("askPlaceholder")}
                      className="flex-1 px-3.5 py-2.5 text-[14px] bg-white border-[1.5px] border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all placeholder:text-muted"
                    />
                    <Button onClick={handleAsk} disabled={asking || !question.trim()}>
                      {asking ? t("thinking") : t("send")}
                    </Button>
                  </div>

                  {qaHistory.length === 0 && !asking && (
                    <p className="text-center text-[13px] text-muted py-6">{t("noQuestions")}</p>
                  )}
                  {asking && <Loading text={t("thinking")} />}

                  <div className="space-y-4">
                    {[...qaHistory].reverse().map((entry, i) => (
                      <div key={qaHistory.length - i} className="border border-gray-100 rounded-xl p-5 bg-gray-50/50">
                        <p dir="auto" className="text-[13px] font-bold text-primary mb-2">
                          {entry.question}
                        </p>
                        <p dir="auto" className="text-[14px] text-foreground leading-relaxed whitespace-pre-line mb-4">
                          {entry.answer.answer}
                        </p>

                        {entry.answer.references.length > 0 && (
                          <div className="mb-4">
                            <p className="text-[12px] font-bold text-muted uppercase tracking-wide mb-2">
                              {t("references")}
                            </p>
                            <ul className="space-y-1.5">
                              {entry.answer.references.map((ref, j) => (
                                <li key={j} className="text-[12px] text-foreground bg-white border border-gray-200 rounded-lg px-3 py-2">
                                  <span dir="auto" className="font-semibold">{ref.law}</span>
                                  {ref.section && <span className="text-muted"> — {ref.section}</span>}
                                  {ref.relevance && (
                                    <span dir="auto" className="block text-muted mt-0.5">{ref.relevance}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Confidence bar */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-muted whitespace-nowrap">
                            {t("confidence")}
                          </span>
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                entry.answer.confidence >= 0.7
                                  ? "bg-secondary"
                                  : entry.answer.confidence >= 0.4
                                    ? "bg-accent"
                                    : "bg-red-400"
                              }`}
                              style={{ width: `${Math.round(entry.answer.confidence * 100)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-foreground">
                            {Math.round(entry.answer.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>
        )}

        {/* ── Tab 2: Verify ───────────────────────────────────── */}
        {tab === "verify" && (
          <div className="space-y-6">
            <p className="text-center text-[13px] text-muted">{t("verifyHint")}</p>

            {needsAuth ? (
              <LoginPrompt t={t} onLogin={() => router.push("/login")} />
            ) : !session ? (
              <FileDropZone
                label={t("dropToVerify")}
                uploading={uploading}
                onFile={handleUpload}
                t={t}
              />
            ) : (
              <>
                <SessionCard session={session} onReset={resetSession} t={t} />

                <Card className="p-6">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[220px]">
                      <Select
                        label={t("documentType")}
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        options={DOCUMENT_TYPES.map((dt) => ({
                          value: dt,
                          label: t(`documentTypes.${dt}`),
                        }))}
                      />
                    </div>
                    <Button onClick={handleVerify} disabled={verifying}>
                      {verifying ? t("verifying") : t("verifyButton")}
                    </Button>
                  </div>
                </Card>

                {verifying && <Loading text={t("verifying")} />}

                {verifyResult && (
                  <div className="space-y-5">
                    <h2 className="text-[16px] font-bold text-foreground">{t("verifyResults")}</h2>

                    {/* Summary chips */}
                    <div className="grid grid-cols-3 gap-3">
                      <Card className="p-4 text-center border-green-200">
                        <p className="text-[24px] font-extrabold text-secondary leading-none">
                          {verifyResult.summary.valid}
                        </p>
                        <p className="text-[12px] text-muted mt-1.5">{t("compliant")}</p>
                      </Card>
                      <Card className="p-4 text-center border-amber-200">
                        <p className="text-[24px] font-extrabold text-accent-dark leading-none">
                          {verifyResult.summary.warnings}
                        </p>
                        <p className="text-[12px] text-muted mt-1.5">{t("warnings")}</p>
                      </Card>
                      <Card className="p-4 text-center border-red-200">
                        <p className="text-[24px] font-extrabold text-red-600 leading-none">
                          {verifyResult.summary.issues}
                        </p>
                        <p className="text-[12px] text-muted mt-1.5">{t("issues")}</p>
                      </Card>
                    </div>

                    <VerifySection
                      title={t("issuesFound")}
                      items={verifyResult.results.issues}
                      tone="issue"
                      t={t}
                    />
                    <VerifySection
                      title={t("warningsFound")}
                      items={verifyResult.results.warnings}
                      tone="warning"
                      t={t}
                    />
                    <VerifySection
                      title={t("compliantClauses")}
                      items={verifyResult.results.valid}
                      tone="valid"
                      t={t}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Tab 3: BD Legal Library ─────────────────────────── */}
        {tab === "library" && (
          <div className="space-y-6">
            <p className="text-center text-[13px] text-muted">{t("libraryHint")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LIBRARY_ITEMS.map((item) => (
                <Link key={item.key} href={`/statutes/${item.statuteId}`}>
                  <Card hoverable className="p-5 h-full">
                    <h3 dir="auto" className="text-[14px] font-bold text-foreground mb-1">
                      {t(`library.${item.key}.title`)}
                    </h3>
                    <p dir="auto" className="text-[12px] text-muted leading-snug">
                      {t(`library.${item.key}.hint`)}
                    </p>
                  </Card>
                </Link>
              ))}
              <Link href="/statutes">
                <Card hoverable className="p-5 h-full bg-primary border-primary">
                  <h3 className="text-[14px] font-bold text-white mb-1">
                    {t("library.browseAll")} →
                  </h3>
                  <p className="text-[12px] text-slate-300 leading-snug">
                    {t("library.browseAllHint")}
                  </p>
                </Card>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Local building blocks ─────────────────────────────────── */

type Translator = ReturnType<typeof useTranslations<"analysis">>;

function LoginPrompt({ t, onLogin }: { t: Translator; onLogin: () => void }) {
  return (
    <Card className="p-10 text-center">
      <div className="text-[32px] mb-3">🔒</div>
      <p className="text-[14px] text-muted mb-5">{t("loginPrompt")}</p>
      <Button onClick={onLogin}>{t("loginButton")}</Button>
    </Card>
  );
}

function FileDropZone({
  label,
  uploading,
  onFile,
  t,
}: {
  label: string;
  uploading: boolean;
  onFile: (file: File) => void;
  t: Translator;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
      }}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl bg-white p-12 text-center cursor-pointer transition-all duration-150 ${
        dragging ? "border-primary bg-blue-50" : "border-gray-300 hover:border-primary"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      {uploading ? (
        <Loading text={t("uploading")} />
      ) : (
        <>
          <div className="text-[36px] mb-3">📤</div>
          <p className="text-[15px] font-semibold text-foreground mb-1">{label}</p>
          <p className="text-[12px] text-muted mb-5">
            {t("supportedFormats")} · {t("maxSize")}
          </p>
          <Button variant="outline" size="sm">
            {t("browseFiles")}
          </Button>
        </>
      )}
    </div>
  );
}

function SessionCard({
  session,
  onReset,
  t,
}: {
  session: AnalysisUploadResponse;
  onReset: () => void;
  t: Translator;
}) {
  return (
    <Card className="p-5 flex flex-wrap items-center gap-4">
      <span className="text-[24px]">📑</span>
      <div className="flex-1 min-w-[200px]">
        <p dir="auto" className="text-[14px] font-bold text-foreground truncate">
          {session.fileName}
        </p>
        <p className="text-[12px] text-muted mt-0.5">
          {session.pageCount} {t("pages")} · {session.wordCount} {t("words")}
        </p>
      </div>
      <Button size="sm" variant="ghost" onClick={onReset}>
        {t("uploadAnother")}
      </Button>
    </Card>
  );
}

function VerifySection({
  title,
  items,
  tone,
  t,
}: {
  title: string;
  items: VerifyItem[];
  tone: "valid" | "warning" | "issue";
  t: Translator;
}) {
  if (items.length === 0) return null;

  const toneStyles: Record<typeof tone, { border: string; icon: string; text: string }> = {
    valid: { border: "border-l-secondary", icon: "✓", text: "text-secondary" },
    warning: { border: "border-l-accent", icon: "⚠", text: "text-accent-dark" },
    issue: { border: "border-l-red-500", icon: "✕", text: "text-red-600" },
  };
  const style = toneStyles[tone];

  return (
    <div>
      <h3 className={`text-[13px] font-bold uppercase tracking-wide mb-3 ${style.text}`}>
        {style.icon} {title} ({items.length})
      </h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <Card key={i} className={`p-5 border-l-4 ${style.border}`}>
            <p dir="auto" className="text-[14px] font-bold text-foreground mb-1.5">
              {item.section}
            </p>
            <p dir="auto" className="text-[13px] text-foreground leading-snug mb-3">
              {item.text}
            </p>
            {(item.law || item.lawSection) && (
              <p className="text-[12px] text-muted mb-2">
                <span className="font-semibold">{t("applicableLaw")}:</span>{" "}
                <span dir="auto">
                  {item.law}
                  {item.lawSection ? ` — ${item.lawSection}` : ""}
                </span>
              </p>
            )}
            {item.suggestion && (
              <p dir="auto" className="text-[12px] text-foreground bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                <span className="font-semibold text-primary">{t("suggestion")}:</span> {item.suggestion}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
