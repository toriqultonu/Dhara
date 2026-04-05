"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

interface SectionItem {
  id: string;
  number: string;
  title: string;
  titleBn?: string;
}

interface SectionNavProps {
  sections: SectionItem[];
  activeSectionId?: string;
  onSectionClick: (sectionId: string) => void;
  locale?: string;
}

export default function SectionNav({
  sections,
  activeSectionId,
  onSectionClick,
  locale = "bn",
}: SectionNavProps) {
  const t = useTranslations("legal");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = sections.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.number.toLowerCase().includes(q) ||
      s.title.toLowerCase().includes(q) ||
      (s.titleBn && s.titleBn.includes(searchQuery))
    );
  });

  return (
    <nav className="w-full">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {t("sections")}
      </h3>
      <input
        type="text"
        dir="auto"
        placeholder={t("browseSections")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
      <ul className="space-y-1 max-h-[60vh] overflow-y-auto">
        {filtered.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => onSectionClick(section.id)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                activeSectionId === section.id
                  ? "bg-primary-100 text-primary-800 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="font-medium">{t("section")} {section.number}</span>
              <span className="block text-xs text-gray-500 truncate">
                {locale === "bn" && section.titleBn ? section.titleBn : section.title}
              </span>
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-3 py-2 text-sm text-gray-400">{t("browseSections")}</li>
        )}
      </ul>
    </nav>
  );
}
