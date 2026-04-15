import Link from "next/link";
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-BD", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default async function JudgmentsPage() {
  const judgments: JudgmentListResponse[] = await fetchJudgments();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Case Law & Judgments</h1>
        <p className="text-muted">Bangladesh Supreme Court and subordinate court decisions — {judgments.length} cases available</p>
      </div>

      {judgments.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="text-lg">No judgments found. Make sure the backend is running.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {judgments.map((judgment) => (
            <Link
              key={judgment.id}
              href={`/judgments/${judgment.id}`}
              className="block p-5 rounded-lg border border-gray-200 bg-white hover:border-primary hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {judgment.citation}
                    </span>
                    <span className="text-xs text-muted">{formatDate(judgment.judgmentDate)}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{judgment.caseName}</h2>
                  <p className="text-sm text-muted mt-0.5">{judgment.court}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
