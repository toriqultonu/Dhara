import Link from "next/link";
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

const CATEGORY_COLORS: Record<string, string> = {
  "Criminal Law": "bg-red-100 text-red-700",
  "Civil Law": "bg-blue-100 text-blue-700",
  "Evidence Law": "bg-purple-100 text-purple-700",
  "Family Law": "bg-pink-100 text-pink-700",
  "Commercial Law": "bg-yellow-100 text-yellow-700",
  "Civil Procedure": "bg-green-100 text-green-700",
  "Criminal Procedure": "bg-orange-100 text-orange-700",
};

export default async function StatutesPage() {
  const statutes: StatuteListResponse[] = await fetchStatutes();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Acts & Statutes</h1>
        <p className="text-muted">Browse the laws of Bangladesh — {statutes.length} acts available</p>
      </div>

      {statutes.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="text-lg">No statutes found. Make sure the backend is running.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {statutes.map((statute) => (
            <Link
              key={statute.id}
              href={`/statutes/${statute.id}`}
              className="block p-5 rounded-lg border border-gray-200 bg-white hover:border-primary hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted">{statute.actNumber}</span>
                    {statute.category && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[statute.category] ?? "bg-gray-100 text-gray-600"}`}>
                        {statute.category}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statute.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {statute.status === "ACTIVE" ? "Active" : "Repealed"}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 truncate">{statute.titleEn}</h2>
                  {statute.titleBn && (
                    <p className="text-sm text-muted mt-0.5">{statute.titleBn}</p>
                  )}
                </div>
                <span className="shrink-0 text-2xl font-bold text-gray-200">{statute.year}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
