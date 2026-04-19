"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import TemplateCard from "@/components/templates/TemplateCard";
import TemplatePreviewModal from "@/components/templates/TemplatePreviewModal";
import type { TemplateListResponse, PagedResponse } from "@/lib/types";

const CATEGORIES = [
  { value: "", label: "All Templates" },
  { value: "employment", label: "Employment" },
  { value: "contract", label: "Contracts" },
  { value: "nda", label: "NDAs" },
  { value: "real-estate", label: "Real Estate" },
  { value: "business", label: "Business" },
  { value: "personal", label: "Personal" },
];

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("dhara_auth");
    return raw ? JSON.parse(raw).token : null;
  } catch {
    return null;
  }
}

export default function TemplatesPage() {
  const t = useTranslations("templates");
  const router = useRouter();

  const [templates, setTemplates] = useState<TemplateListResponse[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateListResponse | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: "0", size: "50" });
    if (category) params.set("category", category);
    if (search.trim()) params.set("search", search.trim());

    fetch(`${API}/api/templates?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const paged: PagedResponse<TemplateListResponse> = json.data;
          setTemplates(paged.items);
          setTotal(paged.total);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, search]);

  const handleUseTemplate = async (templateId: number) => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }

    const res = await fetch(`${API}/api/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: "New Document from Template", templateId }),
    });
    const json = await res.json();
    if (json.success) router.push(`/documents/${json.data.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted">{t("subtitle")}</p>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 outline-none"
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                category === cat.value
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">{t("loading")}</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">📋</p>
          <p>{t("noTemplates")}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{total} {t("templatesFound")}</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((tmpl) => (
              <TemplateCard
                key={tmpl.id}
                template={tmpl}
                onUse={handleUseTemplate}
                onPreview={setPreviewTemplate}
              />
            ))}
          </div>
        </>
      )}

      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={handleUseTemplate}
      />
    </div>
  );
}
