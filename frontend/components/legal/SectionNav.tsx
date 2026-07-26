"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface SectionNavItem {
  id: number;
  sectionNumber: string;
  titleEn: string;
  titleBn: string;
}

interface SectionNavProps {
  sections: SectionNavItem[];
}

export default function SectionNav({ sections }: SectionNavProps) {
  const t = useTranslations("legal");
  const [activeId, setActiveId] = useState<number | null>(sections[0]?.id ?? null);

  useEffect(() => {
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = Number(visible[0].target.id.replace("section-", ""));
          if (!Number.isNaN(id)) setActiveId(id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(`section-${s.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <nav className="sticky top-[78px] max-h-[calc(100vh-100px)] overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-card p-4">
      <h2 className="text-[11px] font-extrabold text-muted uppercase tracking-wider mb-3 px-2">
        {t("sections")}
      </h2>
      <ul className="space-y-0.5">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#section-${s.id}`}
              className={cn(
                "block px-2 py-1.5 rounded-lg text-[13px] leading-snug transition-colors duration-150",
                activeId === s.id
                  ? "bg-blue-50 text-primary font-semibold"
                  : "text-muted hover:text-foreground hover:bg-gray-50"
              )}
            >
              <span className="font-mono text-[11px] mr-1.5">{s.sectionNumber}</span>
              <span dir="auto" className="truncate">{s.titleEn || s.titleBn}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
