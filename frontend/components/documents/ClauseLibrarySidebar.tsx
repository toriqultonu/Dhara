"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { ClauseResponse } from "@/lib/types";

interface ClauseLibrarySidebarProps {
  onInsert: (content: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  general: "General",
  employment: "Employment",
  contract: "Contract",
};

export default function ClauseLibrarySidebar({ onInsert }: ClauseLibrarySidebarProps) {
  const t = useTranslations("documents");
  const [clauses, setClauses] = useState<ClauseResponse[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/clauses`;
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setClauses(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "all"
    ? clauses
    : clauses.filter((c) => c.category === activeCategory);

  return (
    <div className="h-full flex flex-col">
      <h3 className="font-semibold text-sm mb-3">{t("clauseLibrary")}</h3>

      <div className="flex flex-wrap gap-1 mb-3">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`text-xs px-2 py-1 rounded-full border transition-colors ${
              activeCategory === key
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <p className="text-xs text-gray-400">{t("loading")}</p>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-gray-400">{t("noClauses")}</p>
        ) : (
          filtered.map((clause) => (
            <div
              key={clause.id}
              className="border border-gray-200 rounded p-2 hover:border-primary cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-800 group-hover:text-primary">
                  {clause.title}
                </span>
                <button
                  onClick={() => onInsert(clause.content)}
                  className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Insert
                </button>
              </div>
              <span className="text-xs text-gray-400 capitalize">{clause.category}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
