"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import Select from "@/components/ui/Select";
import type {
  DocumentListResponse,
  DocumentResponse,
  DocumentStatsResponse,
  DocumentStatus,
  PagedResponse,
  ShareDocumentResponse,
} from "@/lib/types";

const PAGE_SIZE = 10;

const CATEGORY_KEYS = ["contract", "employment", "nda", "real-estate", "business", "personal", "other"] as const;
const STATUS_KEYS: DocumentStatus[] = ["draft", "completed", "shared"];

/** Backend category value → i18n key ("real-estate" → "realEstate"). */
function categoryKey(category: string): string {
  return category === "real-estate" ? "realEstate" : category;
}

const STATUS_BADGE: Record<DocumentStatus, "repealed" | "active" | "civil"> = {
  draft: "repealed",
  completed: "active",
  shared: "civil",
};

export default function DocumentsPage() {
  const t = useTranslations("documents");
  const te = useTranslations("errors");
  const router = useRouter();
  const { isAuthenticated, initializing } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState<DocumentStatsResponse | null>(null);
  const [docs, setDocs] = useState<DocumentListResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DocumentListResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [shareResult, setShareResult] = useState<ShareDocumentResponse | null>(null);

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      router.replace("/login");
    }
  }, [initializing, isAuthenticated, router]);

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get<DocumentStatsResponse>("/api/documents/stats");
      if (res.success) setStats(res.data);
    } catch {
      // stats row is non-critical — list error handling covers the page
    }
  }, []);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page - 1), size: String(PAGE_SIZE) });
      if (status) params.set("status", status);
      if (category) params.set("category", category);
      if (search.trim()) params.set("search", search.trim());
      const res = await api.get<PagedResponse<DocumentListResponse>>(`/api/documents?${params}`);
      if (res.success) {
        setDocs(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      toast(err instanceof ApiError ? err.message : te("network"), "error");
    } finally {
      setLoading(false);
    }
  }, [page, status, category, search, toast, te]);

  useEffect(() => {
    if (initializing || !isAuthenticated) return;
    loadStats();
  }, [initializing, isAuthenticated, loadStats]);

  useEffect(() => {
    if (initializing || !isAuthenticated) return;
    const timer = setTimeout(loadDocs, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [initializing, isAuthenticated, loadDocs, search]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await api.post<DocumentResponse>("/api/documents", {
        title: t("untitled"),
        category: "other",
        content: "",
        tags: [],
      });
      toast(t("created"), "success");
      router.push(`/documents/${res.data.id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : te("generic"), "error");
      setCreating(false);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await api.post<DocumentResponse>(`/api/documents/${id}/duplicate`, {});
      toast(t("duplicated"), "success");
      loadDocs();
      loadStats();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : te("generic"), "error");
    }
  };

  const handleShare = async (id: number) => {
    try {
      const res = await api.post<ShareDocumentResponse>(`/api/documents/${id}/share`, {
        permission: "view",
      });
      setShareResult(res.data);
      loadDocs();
      loadStats();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : te("generic"), "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete<string>(`/api/documents/${deleteTarget.id}`);
      toast(t("deleted"), "success");
      setDeleteTarget(null);
      loadDocs();
      loadStats();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : te("generic"), "error");
    } finally {
      setDeleting(false);
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const statCards: { key: string; value: number }[] = [
    { key: "total", value: stats?.total ?? 0 },
    { key: "drafts", value: stats?.drafts ?? 0 },
    { key: "completed", value: stats?.completed ?? 0 },
    { key: "shared", value: stats?.shared ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] font-extrabold text-foreground tracking-tight">
              {t("title")}
            </h1>
            <p className="text-[14px] text-muted mt-1">{t("subtitle")}</p>
          </div>
          <Button onClick={handleCreate} disabled={creating}>
            + {t("newDocument")}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => (
            <Card key={s.key} className="p-5">
              <p className="text-[26px] font-extrabold text-primary leading-none">{s.value}</p>
              <p className="text-[13px] text-muted mt-1.5">{t(s.key)}</p>
            </Card>
          ))}
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px_200px] gap-3 mb-6">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t("searchPlaceholder")}
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "", label: t("allStatuses") },
              ...STATUS_KEYS.map((s) => ({
                value: s,
                label: t(`status${s.charAt(0).toUpperCase()}${s.slice(1)}`),
              })),
            ]}
          />
          <Select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "", label: t("allCategories") },
              ...CATEGORY_KEYS.map((c) => ({ value: c, label: t(`categories.${categoryKey(c)}`) })),
            ]}
          />
        </div>

        {/* List */}
        {loading ? (
          <Loading text={t("loading")} />
        ) : docs.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-[36px] mb-3">📄</div>
            <p className="text-[16px] font-semibold text-foreground mb-1">{t("noDocuments")}</p>
            <p className="text-[13px] text-muted mb-5">{t("noDocumentsHint")}</p>
            <Button onClick={handleCreate} disabled={creating}>
              {t("createFirst")}
            </Button>
          </Card>
        ) : (
          <>
            <p className="text-[13px] text-muted mb-3">
              {total} {t("documentsFound")}
            </p>
            <div className="space-y-3">
              {docs.map((doc) => (
                <Card key={doc.id} hoverable className="p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => router.push(`/documents/${doc.id}`)}
                      className="flex-1 min-w-[200px] text-left"
                    >
                      <span dir="auto" className="block text-[15px] font-bold text-foreground hover:text-primary transition-colors truncate">
                        {doc.title}
                      </span>
                      <span className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="default">{t(`categories.${categoryKey(doc.category)}`)}</Badge>
                        <Badge variant={STATUS_BADGE[doc.status]}>
                          {t(`status${doc.status.charAt(0).toUpperCase()}${doc.status.slice(1)}`)}
                        </Badge>
                        {(doc.tags ?? []).map((tag) => (
                          <span
                            key={tag}
                            dir="auto"
                            className="text-[11px] text-muted bg-gray-100 px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </span>
                      <span className="block text-[12px] text-muted mt-2">
                        {t("modified")}: {formatDate(doc.modifiedAt)}
                      </span>
                    </button>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/documents/${doc.id}`)}>
                        {t("open")}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDuplicate(doc.id)}>
                        {t("duplicate")}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleShare(doc.id)}>
                        {t("share")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => setDeleteTarget(doc)}
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Delete confirm */}
      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title={t("deleteTitle")}>
        <p dir="auto" className="text-[14px] text-foreground mb-6">{t("confirmDelete")}</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            {t("cancel")}
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-500 active:bg-red-700"
            onClick={handleDelete}
            disabled={deleting}
          >
            {t("delete")}
          </Button>
        </div>
      </Modal>

      {/* Share result */}
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
