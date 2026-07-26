import { useTranslations } from "next-intl";
import Badge from "@/components/ui/Badge";
import AmendmentHistory from "./AmendmentHistory";
import { formatDate } from "@/lib/utils";
import type { SectionResponse, StatuteResponse } from "@/lib/types";

const CATEGORY_BADGE: Record<string, "criminal" | "civil" | "family" | "commercial" | "default"> = {
  "Criminal Law":       "criminal",
  "Criminal Procedure": "criminal",
  "Civil Law":          "civil",
  "Civil Procedure":    "civil",
  "Family Law":         "family",
  "Commercial Law":     "commercial",
};

interface StatuteViewerProps {
  statute: StatuteResponse;
  sections: SectionResponse[];
}

export default function StatuteViewer({ statute, sections }: StatuteViewerProps) {
  const t = useTranslations("legal");

  return (
    <article className="space-y-5">
      {/* Metadata header */}
      <header className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="statute">{t("statute")}</Badge>
          {statute.category && (
            <Badge variant={CATEGORY_BADGE[statute.category] ?? "default"}>
              {statute.category}
            </Badge>
          )}
          <Badge variant={statute.status === "ACTIVE" ? "active" : "repealed"}>
            {statute.status === "ACTIVE" ? t("activeLaw") : t("repealed")}
          </Badge>
        </div>

        <h1 className="text-[26px] font-extrabold text-foreground tracking-tight leading-tight mb-1">
          {statute.titleEn}
        </h1>
        {statute.titleBn && (
          <p className="text-[17px] text-muted font-bengali mb-4">{statute.titleBn}</p>
        )}

        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-[13px]">
          <div>
            <dt className="text-muted">{t("actNumber")}</dt>
            <dd className="font-mono font-semibold text-foreground">{statute.actNumber}</dd>
          </div>
          <div>
            <dt className="text-muted">{t("year")}</dt>
            <dd className="font-semibold text-foreground">{statute.year}</dd>
          </div>
          {statute.effectiveDate && (
            <div>
              <dt className="text-muted">{t("effectiveDate")}</dt>
              <dd className="font-semibold text-foreground">{formatDate(statute.effectiveDate)}</dd>
            </div>
          )}
          {statute.sourceUrl && (
            <div>
              <dt className="text-muted">{t("source")}</dt>
              <dd>
                <a
                  href={statute.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline break-all"
                >
                  bdlaws.minlaw.gov.bd ↗
                </a>
              </dd>
            </div>
          )}
        </dl>
      </header>

      {/* Sections */}
      {sections.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
          <p className="text-[14px] text-muted">{t("noSections")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => (
            <section
              key={section.id}
              id={`section-${section.id}`}
              className="bg-white rounded-xl border border-gray-200 shadow-card p-6 scroll-mt-[78px]"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="shrink-0 px-2.5 py-1 rounded-lg bg-blue-50 text-primary text-[12px] font-extrabold font-mono">
                  {t("section")} {section.sectionNumber}
                </span>
                <div className="min-w-0">
                  {section.titleEn && (
                    <h2 className="text-[16px] font-extrabold text-foreground tracking-tight leading-snug">
                      {section.titleEn}
                    </h2>
                  )}
                  {section.titleBn && (
                    <p className="text-[14px] text-muted font-bengali">{section.titleBn}</p>
                  )}
                </div>
              </div>

              {section.contentEn && (
                <p className="text-[14px] text-foreground leading-relaxed whitespace-pre-line mb-3">
                  {section.contentEn}
                </p>
              )}
              {section.contentBn && (
                <p className="text-[14px] text-foreground leading-relaxed whitespace-pre-line font-bengali border-t border-gray-100 pt-3">
                  {section.contentBn}
                </p>
              )}
            </section>
          ))}
        </div>
      )}

      {/* Amendment timeline (no amendment data exposed by the API yet) */}
      <AmendmentHistory />
    </article>
  );
}
