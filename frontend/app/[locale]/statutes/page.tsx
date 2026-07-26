import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import ListFilterBar from "@/components/legal/ListFilterBar";
import type { ApiResponse, PagedResponse, StatuteListResponse } from "@/lib/types";

const PAGE_SIZE = 20;

// NOTE: the backend list endpoint only supports page/size (no q/category),
// so we fetch a large page once and filter server-side in this component.
async function fetchStatutes(): Promise<StatuteListResponse[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/statutes?page=0&size=500`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const json: ApiResponse<PagedResponse<StatuteListResponse>> = await res.json();
    return json.success ? json.data.items : [];
  } catch {
    return [];
  }
}

const CATEGORY_BADGE: Record<string, "criminal" | "civil" | "family" | "commercial" | "default"> = {
  "Criminal Law":       "criminal",
  "Criminal Procedure": "criminal",
  "Civil Law":          "civil",
  "Civil Procedure":    "civil",
  "Evidence Law":       "default",
  "Family Law":         "family",
  "Commercial Law":     "commercial",
};

export default async function StatutesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { q = "", category = "", page: pageParam } = await searchParams;
  const t = await getTranslations("statutes");
  const tl = await getTranslations("legal");

  const all = await fetchStatutes();

  const query = q.trim().toLowerCase();
  const filtered = all.filter((s) => {
    if (category && s.category !== category) return false;
    if (!query) return true;
    return (
      s.titleEn.toLowerCase().includes(query) ||
      (s.titleBn ?? "").toLowerCase().includes(query) ||
      (s.actNumber ?? "").toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const categoryPills = [
    { value: "Criminal Law",   label: t("categories.criminal") },
    { value: "Civil Law",      label: t("categories.civil") },
    { value: "Civil Procedure",label: t("categories.civilProcedure") },
    { value: "Family Law",     label: t("categories.family") },
    { value: "Commercial Law", label: t("categories.commercial") },
    { value: "Evidence Law",   label: t("categories.evidence") },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-6 py-7">
        <div className="max-w-[1100px] mx-auto">
          <h1 className="text-[28px] font-extrabold text-foreground tracking-tight mb-1">
            {t("title")}
          </h1>
          <p className="text-[14px] text-muted mb-5">
            {t("subtitle", { count: filtered.length })}
          </p>

          <ListFilterBar
            searchPlaceholder={t("searchPlaceholder")}
            pillParam="category"
            pills={categoryPills}
            allLabel={t("categories.all")}
          />
        </div>
      </div>

      {/* List */}
      <div className="max-w-[1100px] mx-auto px-6 py-6">
        {items.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <p className="text-[16px]">{t("empty")}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((statute) => (
              <Link
                key={statute.id}
                href={`/statutes/${statute.id}`}
                className="flex items-center gap-4 bg-white rounded-xl border-[1.5px] border-gray-200 px-5 py-4 hover:border-primary/40 hover:shadow-card-hover transition-all duration-200 group"
              >
                {/* Year badge */}
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-[18px] font-extrabold text-primary/30 leading-none">
                    {statute.year.toString().slice(2)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-muted font-semibold">
                      {statute.actNumber}
                    </span>
                    {statute.category && (
                      <Badge variant={CATEGORY_BADGE[statute.category] ?? "default"}>
                        {statute.category}
                      </Badge>
                    )}
                    <Badge variant={statute.status === "ACTIVE" ? "active" : "repealed"}>
                      {statute.status === "ACTIVE" ? tl("activeLaw") : tl("repealed")}
                    </Badge>
                  </div>
                  <h2 className="text-[15px] font-semibold text-foreground group-hover:text-primary truncate transition-colors">
                    {statute.titleEn}
                  </h2>
                  {statute.titleBn && (
                    <p className="text-[13px] text-muted font-bengali mt-0.5">{statute.titleBn}</p>
                  )}
                </div>

                <span className="text-muted text-[18px] shrink-0">›</span>
              </Link>
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
