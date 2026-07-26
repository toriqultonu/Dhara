"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import Modal from "@/components/ui/Modal";
import type {
  DocumentResponse,
  PagedResponse,
  TemplateListResponse,
  TemplateResponse,
} from "@/lib/types";

/** Category values seeded in backend V9 migration. */
const CATEGORIES = ["all", "employment", "contract", "nda", "real-estate", "business", "personal"] as const;

function categoryKey(category: string): string {
  return category === "real-estate" ? "realEstate" : category;
}

const CATEGORY_BADGE: Record<string, "civil" | "commercial" | "sro" | "family" | "judgment" | "active" | "default"> = {
  employment: "civil",
  contract: "commercial",
  nda: "sro",
  "real-estate": "judgment",
  business: "active",
  personal: "family",
};

/** Strip seeded HTML tags for a readable plain-text preview. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
}

export default function TemplatesPage() {
  const t = useTranslations("templates");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [templates, setTemplates] = useState<TemplateListResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TemplateResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: "0", size: "60" });
      if (category !== "all") params.set("category", category);
      if (search.trim()) params.set("search", search.trim());
      const res = await api.get<PagedResponse<TemplateListResponse>>(`/api/templates?${params}`);
      if (res.success) {
        setTemplates(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      toast(err instanceof ApiError ? err.message : te("network"), "error");
    } finally {
      setLoading(false);
    }
  }, [category, search, toast, te]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const openPreview = async (id: number) => {
    setPreviewLoading(true);
    try {
      const res = await api.get<TemplateResponse>(`/api/templates/${id}`);
      if (res.success) setSelected(res.data);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : t("loadError"), "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  const useTemplate = async () => {
    if (!selected) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setCreating(true);
    try {
      const res = await api.post<DocumentResponse>("/api/documents", {
        title: selected.title,
        category: selected.category,
        templateId: selected.id,
        tags: [],
      });
      router.push(`/documents/${res.data.id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : t("createError"), "error");
      setCreating(false);
    }
  };

  const maxPopularity = Math.max(1, ...templates.map((tpl) => tpl.popularity));

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[32px] font-extrabold text-foreground tracking-tight mb-2">
            {t("title")}
          </h1>
          <p className="text-[15px] text-muted">{t("subtitle")}</p>
        </div>

        {/* Search + category pills */}
        <div className="max-w-[480px] mx-auto mb-6">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            suffix="🔍"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border-[1.5px] transition-all duration-150 ${
                category === c
                  ? "bg-primary border-primary text-white"
                  : "bg-white border-gray-200 text-muted hover:border-primary hover:text-primary"
              }`}
            >
              {t(`categories.${categoryKey(c)}`)}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <Loading text={t("loading")} />
        ) : templates.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <div className="text-[36px] mb-3">📋</div>
            <p className="text-[15px]">{t("noTemplates")}</p>
          </div>
        ) : (
          <>
            <p className="text-[13px] text-muted mb-4">
              {total} {t("templatesFound")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {templates.map((tpl) => (
                <Card key={tpl.id} hoverable onClick={() => openPreview(tpl.id)} className="p-6 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant={CATEGORY_BADGE[tpl.category] ?? "default"}>
                      {t(`categories.${categoryKey(tpl.category)}`)}
                    </Badge>
                    <span className="text-[11px] font-semibold text-accent-dark whitespace-nowrap">
                      ★ {t("popularityLabel", { count: tpl.popularity })}
                    </span>
                  </div>
                  <h3 dir="auto" className="text-[15px] font-bold text-foreground mb-1.5">
                    {tpl.title}
                  </h3>
                  <p dir="auto" className="text-[13px] text-muted leading-snug mb-4 line-clamp-2">
                    {tpl.description}
                  </p>
                  {tpl.preview && (
                    <p
                      dir="auto"
                      className="text-[12px] text-muted/80 leading-snug bg-gray-50 border border-gray-100 rounded-lg p-3 line-clamp-3 mb-4 whitespace-pre-line"
                    >
                      {stripHtml(tpl.preview)}
                    </p>
                  )}
                  {/* Popularity bar */}
                  <div className="mt-auto h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${Math.round((tpl.popularity / maxPopularity) * 100)}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Preview modal */}
      <Modal
        open={selected !== null || previewLoading}
        onClose={() => setSelected(null)}
        title={selected ? <span dir="auto">{selected.title}</span> : t("preview")}
        className="max-w-[680px]"
      >
        {previewLoading || !selected ? (
          <Loading text={t("loading")} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={CATEGORY_BADGE[selected.category] ?? "default"}>
                {t(`categories.${categoryKey(selected.category)}`)}
              </Badge>
              <span className="text-[12px] font-semibold text-accent-dark">
                ★ {t("popularityLabel", { count: selected.popularity })}
              </span>
            </div>
            <p dir="auto" className="text-[13px] text-muted leading-snug">
              {selected.description}
            </p>
            <div
              dir="auto"
              className="max-h-[45vh] overflow-y-auto bg-gray-50 border border-gray-100 rounded-lg p-5 text-[13px] leading-relaxed text-foreground whitespace-pre-line"
            >
              {stripHtml(selected.content)}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSelected(null)}>
                {tc("close")}
              </Button>
              <Button onClick={useTemplate} disabled={creating}>
                {creating ? t("creating") : t("useTemplate")}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
