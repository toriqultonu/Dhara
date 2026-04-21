import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { PagedResponse, JudgmentListResponse } from "@/lib/types";

async function fetchJudgments(): Promise<JudgmentListResponse[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/judgments?page=0&size=50`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const json: { success: boolean; data: PagedResponse<JudgmentListResponse> } = await res.json();
    return json.success ? json.data.items : [];
  } catch {
    return [];
  }
}

export default async function JudgmentsPage() {
  const judgments = await fetchJudgments();

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-6 py-7">
        <div className="max-w-[1100px] mx-auto">
          <h1 className="text-[28px] font-extrabold text-foreground tracking-tight mb-1">
            Court Judgments
          </h1>
          <p className="text-[14px] text-muted mb-5">
            Browse {judgments.length} judgments from Bangladesh courts
          </p>

          <div className="flex gap-3 items-center">
            <div className="flex-1 max-w-[480px] flex items-center bg-gray-50 border-[1.5px] border-gray-200 rounded-lg overflow-hidden focus-within:border-primary focus-within:bg-white transition-all">
              <span className="pl-3 text-muted">🔍</span>
              <input
                placeholder="Search case name, citation…"
                className="flex-1 px-3 py-2.5 text-[14px] bg-transparent border-none outline-none text-foreground placeholder:text-muted"
              />
            </div>
            {["All Courts", "Appellate Division", "High Court Division"].map((c, i) => (
              <span
                key={c}
                className={`px-3.5 py-1.5 rounded-full border-[1.5px] text-[12px] font-semibold cursor-pointer transition-all ${
                  i === 0
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 bg-white text-muted hover:border-primary hover:text-primary"
                }`}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-[1100px] mx-auto px-6 py-6">
        {judgments.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <p className="text-[16px]">No judgments found. Make sure the backend is running.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {judgments.map((j) => (
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
                  <h2 className="text-[15px] font-semibold text-foreground group-hover:text-primary mb-1 transition-colors">
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
      </div>
    </div>
  );
}
