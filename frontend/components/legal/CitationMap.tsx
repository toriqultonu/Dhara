import { useTranslations } from "next-intl";
import Link from "next/link";

export interface CitationRef {
  id: number;
  title: string;
  type: "statute" | "judgment";
}

interface CitationMapProps {
  citations?: CitationRef[];
}

function ChipGroup({ label, items }: { label: string; items: CitationRef[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-[11px] font-extrabold text-muted uppercase tracking-wider mb-2">
        {label}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((c) => (
          <Link
            key={`${c.type}-${c.id}`}
            href={c.type === "statute" ? `/statutes/${c.id}` : `/judgments/${c.id}`}
            dir="auto"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border-[1.5px] border-gray-200 bg-white text-[12px] font-semibold text-foreground hover:border-primary hover:text-primary transition-all duration-150"
          >
            {c.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function CitationMap({ citations = [] }: CitationMapProps) {
  const t = useTranslations("legal");
  const statutes = citations.filter((c) => c.type === "statute");
  const judgments = citations.filter((c) => c.type === "judgment");

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
      <h2 className="text-[15px] font-extrabold text-foreground tracking-tight mb-4">
        {t("citedReferences")}
      </h2>

      {citations.length === 0 ? (
        <p className="text-[13px] text-muted">{t("noCitations")}</p>
      ) : (
        <div className="space-y-4">
          <ChipGroup label={t("citedStatutes")} items={statutes} />
          <ChipGroup label={t("citedJudgments")} items={judgments} />
        </div>
      )}
    </section>
  );
}
