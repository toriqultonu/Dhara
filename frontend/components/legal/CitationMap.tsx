"use client";

import { useTranslations } from "next-intl";

interface CitationItem {
  id: string;
  type: "statute" | "judgment";
  title: string;
  reference: string;
  url?: string;
}

interface CitationMapProps {
  statuteCitations: CitationItem[];
  judgmentCitations: CitationItem[];
}

export default function CitationMap({
  statuteCitations,
  judgmentCitations,
}: CitationMapProps) {
  const t = useTranslations("legal");

  return (
    <div className="space-y-6">
      {statuteCitations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {t("statute")} {t("citation")}
          </h4>
          <ul className="space-y-2">
            {statuteCitations.map((cite) => (
              <li key={cite.id}>
                <a
                  href={cite.url || `/statutes/${cite.id}`}
                  className="block p-3 border border-gray-200 rounded-md hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <span className="text-sm font-medium text-primary-700">
                    {cite.reference}
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">
                    {cite.title}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {judgmentCitations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {t("relatedCases")}
          </h4>
          <ul className="space-y-2">
            {judgmentCitations.map((cite) => (
              <li key={cite.id}>
                <a
                  href={cite.url || `/judgments/${cite.id}`}
                  className="block p-3 border border-gray-200 rounded-md hover:border-secondary-300 hover:bg-secondary-50 transition-colors"
                >
                  <span className="text-sm font-medium text-secondary-700">
                    {cite.reference}
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">
                    {cite.title}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {statuteCitations.length === 0 && judgmentCitations.length === 0 && (
        <p className="text-sm text-gray-400 italic">No citations found.</p>
      )}
    </div>
  );
}
