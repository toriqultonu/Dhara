import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { PagedResponse, StatuteListResponse } from "@/lib/types";

async function fetchStatutes(): Promise<StatuteListResponse[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/statutes?page=0&size=50`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const json: { success: boolean; data: PagedResponse<StatuteListResponse> } = await res.json();
    return json.success ? json.data.items : [];
  } catch {
    return [];
  }
}

const CATEGORY_BADGE: Record<string, "criminal" | "civil" | "family" | "commercial" | "default"> = {
  "Criminal Law":      "criminal",
  "Civil Law":         "civil",
  "Civil Procedure":   "civil",
  "Evidence Law":      "default",
  "Family Law":        "family",
  "Commercial Law":    "commercial",
  "Criminal Procedure":"criminal",
};

const CATEGORIES = ["All", "Criminal Law", "Civil Law", "Civil Procedure", "Family Law", "Commercial Law", "Evidence Law"];

export default async function StatutesPage() {
  const statutes = await fetchStatutes();

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-6 py-7">
        <div className="max-w-[1100px] mx-auto">
          <h1 className="text-[28px] font-extrabold text-foreground tracking-tight mb-1">
            Acts &amp; Statutes
          </h1>
          <p className="text-[14px] text-muted mb-5">
            Browse {statutes.length} acts — full text with section-by-section navigation
          </p>

          {/* Search + category filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[260px] flex items-center bg-gray-50 border-[1.5px] border-gray-200 rounded-lg overflow-hidden focus-within:border-primary focus-within:bg-white transition-all">
              <span className="pl-3 text-muted">🔍</span>
              <input
                placeholder="Search acts by name, number…"
                className="flex-1 px-3 py-2.5 text-[14px] bg-transparent border-none outline-none text-foreground placeholder:text-muted"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <span
                  key={c}
                  className="px-3.5 py-1.5 rounded-full border-[1.5px] border-gray-200 bg-white text-muted text-[12px] font-semibold cursor-pointer hover:border-primary hover:text-primary transition-all first:border-primary first:bg-primary first:text-white"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-[1100px] mx-auto px-6 py-6">
        {statutes.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <p className="text-[16px]">No statutes found. Make sure the backend is running.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {statutes.map((statute) => (
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
                      {statute.status === "ACTIVE" ? "Active" : "Repealed"}
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
      </div>
    </div>
  );
}
