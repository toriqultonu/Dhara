"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import type { DocumentResponse, DocumentStatus, ShareDocumentResponse } from "@/lib/types";

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";
type ExportFormat = "pdf" | "docx" | "txt";

const CATEGORY_KEYS = ["contract", "employment", "nda", "real-estate", "business", "personal", "other"] as const;

function categoryKey(category: string): string {
  return category === "real-estate" ? "realEstate" : category;
}

interface EditorState {
  title: string;
  category: string;
  status: DocumentStatus;
  content: string;
  tags: string[];
}

export default function DocumentEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("documents");
  const te = useTranslations("errors");
  const router = useRouter();
  const { isAuthenticated, initializing } = useAuth();
  const { toast } = useToast();

  const [notFound, setNotFound] = useState(false);
  const [doc, setDoc] = useState<EditorState | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [tagInput, setTagInput] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [shareResult, setShareResult] = useState<ShareDocumentResponse | null>(null);
  const [sharing, setSharing] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDoc = useRef<EditorState | null>(null);
  latestDoc.current = doc;

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      router.replace("/login");
    }
  }, [initializing, isAuthenticated, router]);

  // Load the document
  useEffect(() => {
    if (initializing || !isAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<DocumentResponse>(`/api/documents/${id}`);
        if (cancelled || !res.success) return;
        setDoc({
          title: res.data.title,
          category: res.data.category,
          status: res.data.status,
          content: res.data.content ?? "",
          tags: res.data.tags ?? [],
        });
      } catch {
        if (!cancelled) setNotFound(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initializing, isAuthenticated, id]);

  const persist = useCallback(async () => {
    const current = latestDoc.current;
    if (!current) return;
    setSaveState("saving");
    try {
      await api.put<DocumentResponse>(`/api/documents/${id}`, {
        title: current.title || t("untitled"),
        category: current.category,
        status: current.status,
        content: current.content,
        tags: current.tags,
      });
      setSaveState("saved");
    } catch (err) {
      setSaveState("error");
      toast(err instanceof ApiError ? err.message : t("saveError"), "error");
    }
  }, [id, t, toast]);

  /** Apply an edit and schedule a debounced (2s) auto-save. */
  const applyEdit = useCallback(
    (patch: Partial<EditorState>) => {
      setDoc((prev) => (prev ? { ...prev, ...patch } : prev));
      setSaveState("dirty");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(persist, 2000);
    },
    [persist]
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || !doc || doc.tags.includes(value)) {
      setTagInput("");
      return;
    }
    applyEdit({ tags: [...doc.tags, value] });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    if (!doc) return;
    applyEdit({ tags: doc.tags.filter((x) => x !== tag) });
  };

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    try {
      const blob = await api.postForBlob(`/api/documents/${id}/export`, { format });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc?.title || "document"}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExportOpen(false);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : t("exportError"), "error");
    } finally {
      setExporting(null);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await api.post<ShareDocumentResponse>(`/api/documents/${id}/share`, {
        permission: "view",
      });
      setShareResult(res.data);
      setDoc((prev) => (prev ? { ...prev, status: "shared" } : prev));
      toast(t("shareSuccess"), "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : te("generic"), "error");
    } finally {
      setSharing(false);
    }
  };

  const copyShareUrl = async () => {
    if (!shareResult) return;
    await navigator.clipboard.writeText(shareResult.shareUrl);
    toast(t("copied"), "success");
  };

  if (initializing || !isAuthenticated) {
    return <Loading text={t("loading")} />;
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background py-16 px-6 text-center">
        <p className="text-[16px] text-muted mb-5">{t("notFound")}</p>
        <Link href="/documents" className="text-primary font-semibold text-[14px] hover:underline">
          ← {t("backToDocuments")}
        </Link>
      </div>
    );
  }

  if (!doc) {
    return <Loading text={t("loading")} />;
  }

  const wordCount = doc.content.trim() ? doc.content.trim().split(/\s+/).length : 0;

  const saveLabel: Record<SaveState, string> = {
    idle: t("saved"),
    dirty: t("saving"),
    saving: t("saving"),
    saved: t("saved"),
    error: t("saveError"),
  };

  return (
    <div className="min-h-screen bg-background py-8 px-6">
      <div className="max-w-[860px] mx-auto">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            href="/documents"
            className="text-[13px] font-semibold text-muted hover:text-primary transition-colors"
          >
            ← {t("backToDocuments")}
          </Link>
          <div className="flex items-center gap-2">
            <span
              className={`text-[12px] font-medium px-2 py-1 rounded-md ${
                saveState === "error"
                  ? "text-red-600 bg-red-50"
                  : saveState === "saving" || saveState === "dirty"
                    ? "text-amber-600 bg-amber-50"
                    : "text-secondary bg-green-50"
              }`}
              role="status"
            >
              {saveLabel[saveState]}
            </span>
            <Button size="sm" variant="outline" onClick={() => setExportOpen(true)}>
              {t("export")}
            </Button>
            <Button size="sm" variant="outline" onClick={handleShare} disabled={sharing}>
              {t("share")}
            </Button>
            <Button
              size="sm"
              variant={doc.status === "completed" ? "secondary" : "primary"}
              onClick={() =>
                applyEdit({ status: doc.status === "completed" ? "draft" : "completed" })
              }
            >
              {doc.status === "completed" ? t("markDraft") : t("markCompleted")}
            </Button>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3 mb-4">
          <input
            dir="auto"
            value={doc.title}
            onChange={(e) => applyEdit({ title: e.target.value })}
            placeholder={t("titlePlaceholder")}
            className="w-full px-4 py-3 text-[20px] font-bold text-foreground bg-white border-[1.5px] border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
          />
          <Select
            value={doc.category}
            onChange={(e) => applyEdit({ category: e.target.value })}
            options={CATEGORY_KEYS.map((c) => ({
              value: c,
              label: t(`categories.${categoryKey(c)}`),
            }))}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[13px] font-medium text-muted">{t("tags")}:</span>
          {doc.tags.map((tag) => (
            <span
              key={tag}
              dir="auto"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full"
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-primary/60 hover:text-primary"
                aria-label="✕"
              >
                ✕
              </button>
            </span>
          ))}
          <input
            dir="auto"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            onBlur={addTag}
            placeholder={t("tagPlaceholder")}
            className="flex-1 min-w-[180px] px-3 py-1.5 text-[13px] bg-white border-[1.5px] border-gray-200 rounded-lg outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Writing surface */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-card">
          <textarea
            dir="auto"
            value={doc.content}
            onChange={(e) => applyEdit({ content: e.target.value })}
            placeholder={t("contentPlaceholder")}
            className="w-full min-h-[60vh] p-8 text-[15px] leading-relaxed text-foreground bg-transparent border-none outline-none resize-y rounded-xl placeholder:text-muted"
          />
        </div>
        <p className="text-[12px] text-muted mt-2 text-right">
          {wordCount} {t("words")}
        </p>
      </div>

      {/* Export modal */}
      <Modal open={exportOpen} onClose={() => setExportOpen(false)} title={t("exportDocument")}>
        <div className="grid grid-cols-3 gap-3">
          {(["pdf", "docx", "txt"] as ExportFormat[]).map((format) => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              disabled={exporting !== null}
              className="flex flex-col items-center gap-2 p-5 border-[1.5px] border-gray-200 rounded-xl hover:border-primary hover:bg-blue-50 transition-all disabled:opacity-50"
            >
              <span className="text-[24px]">{format === "pdf" ? "📕" : format === "docx" ? "📘" : "📄"}</span>
              <span className="text-[13px] font-bold text-foreground uppercase">
                {exporting === format ? t("exporting") : format}
              </span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Share modal */}
      <Modal open={shareResult !== null} onClose={() => setShareResult(null)} title={t("shareTitle")}>
        {shareResult && (
          <div className="space-y-4">
            <p className="text-[13px] font-medium text-foreground">{t("shareUrlLabel")}</p>
            <div className="flex items-center gap-2">
              <input
                dir="auto"
                readOnly
                value={shareResult.shareUrl}
                className="flex-1 px-3 py-2 text-[13px] bg-gray-50 border-[1.5px] border-gray-200 rounded-lg outline-none"
                onFocus={(e) => e.target.select()}
              />
              <Button size="sm" onClick={copyShareUrl}>
                {t("copy")}
              </Button>
            </div>
            <p className="text-[12px] text-muted">
              {t("shareExpires", { date: formatDate(shareResult.expiresAt) })}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
