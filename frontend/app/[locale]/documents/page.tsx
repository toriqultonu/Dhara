"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import DocumentCard from "@/components/documents/DocumentCard";
import type { DocumentListResponse, DocumentStatsResponse, PagedResponse } from "@/lib/types";

const CATEGORY_FILTERS = ["all", "contract", "employment", "nda", "real-estate", "business", "personal", "other"];
const STATUS_FILTERS = ["all", "draft", "completed", "shared"];

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("dhara_auth");
    return raw ? JSON.parse(raw).token : null;
  } catch {
    return null;
  }
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function DocumentsPage() {
  const t = useTranslations("documents");
  const router = useRouter();

  const [documents, setDocuments] = useState<DocumentListResponse[]>([]);
  const [stats, setStats] = useState<DocumentStatsResponse | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchDocuments = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }

    setLoading(true);
    try {
      const params = new URLSearchParams({ page: "0", size: "20" });
      if (status !== "all") params.set("status", status);
      if (category !== "all") params.set("category", category);
      if (search.trim()) params.set("search", search.trim());

      const [docsRes, statsRes] = await Promise.all([
        fetch(`${API}/api/documents?${params}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/documents/stats`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const docsJson = await docsRes.json();
      const statsJson = await statsRes.json();

      if (docsJson.success) {
        const paged: PagedResponse<DocumentListResponse> = docsJson.data;
        setDocuments(paged.items);
        setTotal(paged.total);
      }
      if (statsJson.success) setStats(statsJson.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router, status, category, search]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async (id: number) => {
    if (!confirm(t("confirmDelete"))) return;
    const token = getToken();
    await fetch(`${API}/api/documents/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token ?? ""}` },
    });
    fetchDocuments();
  };

  const handleDuplicate = async (id: number) => {
    const token = getToken();
    const res = await fetch(`${API}/api/documents/${id}/duplicate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token ?? ""}` },
    });
    const json = await res.json();
    if (json.success) router.push(`/documents/${json.data.id}`);
  };

  const handleShare = async (id: number) => {
    const token = getToken();
    const res = await fetch(`${API}/api/documents/${id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ permission: "view" }),
    });
    const json = await res.json();
    if (json.success) {
      await navigator.clipboard.writeText(json.data.shareUrl).catch(() => {});
      alert(`Share link copied: ${json.data.shareUrl}`);
      fetchDocuments();
    }
  };

  const handleNew = async () => {
    const token = getToken();
    const res = await fetch(`${API}/api/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ title: "Untitled Document", category: "other" }),
    });
    const json = await res.json();
    if (json.success) router.push(`/documents/${json.data.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted mt-1">{t("subtitle")}</p>
        </div>
        <button
          onClick={handleNew}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
        >
          + {t("newDocument")}
        </button>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: t("total"), value: stats.total },
            { label: t("drafts"), value: stats.drafts },
            { label: t("completed"), value: stats.completed },
            { label: t("shared"), value: stats.shared },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          {CATEGORY_FILTERS.map((c) => (
            <option key={c} value={c}>{c === "all" ? t("allCategories") : c}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>{s === "all" ? t("allStatuses") : s}</option>
          ))}
        </select>
      </div>

      {/* Document grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">{t("loading")}</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📝</p>
          <p className="text-lg font-medium text-gray-700">{t("noDocuments")}</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">{t("noDocumentsHint")}</p>
          <button
            onClick={handleNew}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
          >
            {t("createFirst")}
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{total} {t("documentsFound")}</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onShare={handleShare}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
