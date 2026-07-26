import { notFound } from "next/navigation";
import JudgmentViewer from "@/components/legal/JudgmentViewer";
import type { ApiResponse, JudgmentResponse } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchJudgment(id: string): Promise<JudgmentResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/judgments/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json: ApiResponse<JudgmentResponse> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export default async function JudgmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const judgment = await fetchJudgment(id);
  if (!judgment) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[900px] mx-auto px-6 py-8">
        <JudgmentViewer judgment={judgment} />
      </div>
    </div>
  );
}
