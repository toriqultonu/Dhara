"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { StatuteResponse, SectionResponse } from "@/lib/types";

interface StatuteViewerProps {
  statuteId: string;
}

async function loadStatute(id: string): Promise<StatuteResponse | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/statutes/${id}`
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

async function loadSections(id: string): Promise<SectionResponse[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/statutes/${id}/sections`
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

export default function StatuteViewer({ statuteId }: StatuteViewerProps) {
  const t = useTranslations("legal");
  const [statute, setStatute] = useState<StatuteResponse | null>(null);
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadStatute(statuteId), loadSections(statuteId)]).then(
      ([s, secs]) => {
        setStatute(s);
        setSections(secs);
        if (secs.length > 0) setActiveSection(secs[0].sectionNumber);
        setLoading(false);
      }
    );
  }, [statuteId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!statute) {
    return (
      <div className="text-center py-16 text-muted">
        <p className="text-lg">Statute not found.</p>
      </div>
    );
  }

  const activeSec = sections.find((s) => s.sectionNumber === activeSection);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-mono text-muted">{statute.actNumber}</span>
          {statute.category && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
              {statute.category}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statute.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {statute.status === "ACTIVE" ? t("activeLaw") : t("repealed")}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{statute.titleEn}</h1>
        {statute.titleBn && <p className="text-lg text-muted mt-1">{statute.titleBn}</p>}
        <p className="text-sm text-muted mt-2">Year: {statute.year}</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — section list */}
        <aside className="w-56 shrink-0">
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted">
            {t("sections")} ({sections.length})
          </h3>
          {sections.length === 0 ? (
            <p className="text-sm text-muted">{t("browseSections")}</p>
          ) : (
            <nav className="space-y-1">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.sectionNumber)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    activeSection === sec.sectionNumber
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="font-mono">§{sec.sectionNumber}</span>
                  {sec.titleEn && (
                    <span className="block text-xs mt-0.5 truncate opacity-75">{sec.titleEn}</span>
                  )}
                </button>
              ))}
            </nav>
          )}
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {activeSec ? (
            <div>
              <h2 className="text-xl font-bold mb-1">
                Section {activeSec.sectionNumber}
                {activeSec.titleEn && ` — ${activeSec.titleEn}`}
              </h2>
              {activeSec.titleBn && (
                <p className="text-muted mb-4">{activeSec.titleBn}</p>
              )}
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{activeSec.contentEn}</p>
                {activeSec.contentBn && (
                  <p className="mt-4 text-gray-600 leading-relaxed border-t pt-4">{activeSec.contentBn}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted">{t("fullText")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
