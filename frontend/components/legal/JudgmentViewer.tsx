"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { JudgmentResponse } from "@/lib/types";

interface JudgmentViewerProps {
  judgmentId: string;
}

async function loadJudgment(id: string): Promise<JudgmentResponse | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/judgments/${id}`
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-BD", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default function JudgmentViewer({ judgmentId }: JudgmentViewerProps) {
  const t = useTranslations("legal");
  const [judgment, setJudgment] = useState<JudgmentResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJudgment(judgmentId).then((j) => {
      setJudgment(j);
      setLoading(false);
    });
  }, [judgmentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!judgment) {
    return (
      <div className="text-center py-16 text-muted">
        <p className="text-lg">Judgment not found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
          {judgment.citation}
        </span>
      </div>

      <h1 className="text-2xl font-bold mb-4 text-gray-900">{judgment.caseName}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-4 bg-gray-50 rounded-lg text-sm">
        <div>
          <span className="font-semibold text-gray-600">{t("court")}: </span>
          <span className="text-gray-800">{judgment.court || "—"}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-600">{t("date")}: </span>
          <span className="text-gray-800">{formatDate(judgment.judgmentDate)}</span>
        </div>
        <div className="sm:col-span-2">
          <span className="font-semibold text-gray-600">{t("bench")}: </span>
          <span className="text-gray-800">{judgment.bench || "—"}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-600">{t("citation")}: </span>
          <span className="text-gray-800 font-mono">{judgment.citation}</span>
        </div>
      </div>

      {judgment.headnotesEn && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">{t("headnotes")}</h2>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-gray-700 leading-relaxed">{judgment.headnotesEn}</p>
          </div>
          {judgment.headnotesBn && (
            <p className="mt-3 text-gray-600 leading-relaxed">{judgment.headnotesBn}</p>
          )}
        </section>
      )}

      {judgment.fullText && (
        <section>
          <h2 className="text-lg font-semibold mb-2">{t("fullText")}</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{judgment.fullText}</p>
          </div>
        </section>
      )}

      {judgment.sourceUrl && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <a
            href={judgment.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            View original source →
          </a>
        </div>
      )}
    </div>
  );
}
