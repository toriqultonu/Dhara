import { useTranslations } from "next-intl";
import Badge from "@/components/ui/Badge";
import CitationMap, { type CitationRef } from "./CitationMap";
import AmendmentHistory from "./AmendmentHistory";
import { formatDate } from "@/lib/utils";
import type { JudgmentResponse } from "@/lib/types";

interface JudgmentViewerProps {
  judgment: JudgmentResponse;
  /** Cross-references, when available from the API. */
  citations?: CitationRef[];
}

export default function JudgmentViewer({ judgment, citations }: JudgmentViewerProps) {
  const t = useTranslations("legal");

  return (
    <article className="space-y-5">
      {/* Metadata header */}
      <header className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-accent shadow-card p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="judgment">{t("judgment")}</Badge>
          {judgment.court && <Badge variant="default">{judgment.court}</Badge>}
          <Badge variant={judgment.status === "ACTIVE" ? "active" : "repealed"}>
            {judgment.status}
          </Badge>
        </div>

        <h1 dir="auto" className="text-[24px] font-extrabold text-foreground tracking-tight leading-tight mb-4">
          {judgment.caseName}
        </h1>

        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-[13px]">
          <div>
            <dt className="text-muted">{t("citation")}</dt>
            <dd className="font-mono font-semibold text-foreground">{judgment.citation}</dd>
          </div>
          <div>
            <dt className="text-muted">{t("court")}</dt>
            <dd className="font-semibold text-foreground">{judgment.court}</dd>
          </div>
          {judgment.bench && (
            <div>
              <dt className="text-muted">{t("bench")}</dt>
              <dd dir="auto" className="font-semibold text-foreground">{judgment.bench}</dd>
            </div>
          )}
          {judgment.judgmentDate && (
            <div>
              <dt className="text-muted">{t("date")}</dt>
              <dd className="font-semibold text-foreground">{formatDate(judgment.judgmentDate)}</dd>
            </div>
          )}
          {judgment.sourceUrl && (
            <div>
              <dt className="text-muted">{t("source")}</dt>
              <dd>
                <a
                  href={judgment.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline break-all"
                >
                  supremecourt.gov.bd ↗
                </a>
              </dd>
            </div>
          )}
        </dl>
      </header>

      {/* Headnotes */}
      {(judgment.headnotesEn || judgment.headnotesBn) && (
        <section className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
          <h2 className="text-[15px] font-extrabold text-foreground tracking-tight mb-3">
            {t("headnotes")}
          </h2>
          {judgment.headnotesEn && (
            <p className="text-[14px] text-foreground leading-relaxed whitespace-pre-line mb-3">
              {judgment.headnotesEn}
            </p>
          )}
          {judgment.headnotesBn && (
            <p className="text-[14px] text-foreground leading-relaxed whitespace-pre-line font-bengali border-t border-gray-100 pt-3">
              {judgment.headnotesBn}
            </p>
          )}
        </section>
      )}

      {/* Full text */}
      {judgment.fullText && (
        <section className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
          <h2 className="text-[15px] font-extrabold text-foreground tracking-tight mb-3">
            {t("fullText")}
          </h2>
          <p dir="auto" className="text-[14px] text-foreground leading-relaxed whitespace-pre-line">
            {judgment.fullText}
          </p>
        </section>
      )}

      {/* Cross references + amendments (API does not expose these yet — empty states) */}
      <CitationMap citations={citations} />
      <AmendmentHistory />
    </article>
  );
}
