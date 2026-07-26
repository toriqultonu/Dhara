import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import ListFilterBar from "@/components/legal/ListFilterBar";
import type { ApiResponse, JudgmentListResponse, PagedResponse } from "@/lib/types";

const PAGE_SIZE = 20;

// NOTE: the backend list endpoint only supports page/size (no q/court),
// so we fetch a large page once and filter server-side in this component.
async function fetchJudgments(): Promise<JudgmentListResponse[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/judgments?page=0&size=500`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const json: ApiResponse<PagedResponse<JudgmentListResponse>> = await res.json();
    return json.success ? json.data.items : [];
  } catch {
    return [];
  }
}

export default async function JudgmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; court?: string; page?: string }>;
}) {
  const { q = "", court = "", page: pageParam } = await searchParams;
  const t = await getTranslations("judgments");

  const all = await fetchJudgments();

  const query = q.trim().toLowerCase();
  const filtered = all.filter((j) => {
    if (court && j.court !== court) return false;
    if (!query) return true;
    return (
      j.caseName.toLowerCase().includes(query) ||
      (j.citation ?? "").toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const courtPills = [
    { value: "Appellate Division", label: t("appellateDivision") },
    { value: "High Court Division", label: t("highCourtDivision") },
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
            pillParam="court"
            pills={courtPills}
            allLabel={t("allCourts")}
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
            {items.map((j) => (
              <Link
                key={j.id}
                href={`/judgments/${j.id}`}
                className="flex items-start gap-4 bg-white rounded-xl border-[1.5px] border-l-4 border-gray-200 border-l-accent px-5 py-4 hover:border-primary/30 hover:shadow-card-hover transition-all duration-200 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-mono text-muted font-semibold">
                      {j.citation}
                    </span>
                    <Badge variant="default">{j.court}</Badge>
                    <Badge variant={j.status === "ACTIVE" ? "active" : "repealed"}>
                      {j.status}
                    </Badge>
                  </div>
                  <h2 dir="auto" className="text-[15px] font-semibold text-foreground group-hover:text-primary mb-1 transition-colors">
                    {j.caseName}
                  </h2>
                  <div className="flex gap-4 text-[12px] text-muted">
                    <span>🏛 {j.court}</span>
                    {j.judgmentDate && <span>📅 {j.judgmentDate}</span>}
                  </div>
                </div>
                <span className="text-muted text-[18px] shrink-0 mt-1">›</span>
              </Link>
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
