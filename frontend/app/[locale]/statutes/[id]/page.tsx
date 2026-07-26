import { notFound } from "next/navigation";
import StatuteViewer from "@/components/legal/StatuteViewer";
import SectionNav from "@/components/legal/SectionNav";
import type { ApiResponse, SectionResponse, StatuteResponse } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchStatute(id: string): Promise<StatuteResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/statutes/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json: ApiResponse<StatuteResponse> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

async function fetchSections(id: string): Promise<SectionResponse[]> {
  try {
    const res = await fetch(`${API_BASE}/api/statutes/${id}/sections`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json: ApiResponse<SectionResponse[]> = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

export default async function StatuteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const [statute, sections] = await Promise.all([fetchStatute(id), fetchSections(id)]);
  if (!statute) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
          <div className="hidden lg:block">
            <SectionNav
              sections={sections.map((s) => ({
                id: s.id,
                sectionNumber: s.sectionNumber,
                titleEn: s.titleEn,
                titleBn: s.titleBn,
              }))}
            />
          </div>
          <StatuteViewer statute={statute} sections={sections} />
        </div>
      </div>
    </div>
  );
}
