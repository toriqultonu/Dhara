import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/utils";

export interface AmendmentEntry {
  date: string | null;
  title: string;
  description?: string;
}

interface AmendmentHistoryProps {
  amendments?: AmendmentEntry[];
}

export default function AmendmentHistory({ amendments = [] }: AmendmentHistoryProps) {
  const t = useTranslations("legal");

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
      <h2 className="text-[15px] font-extrabold text-foreground tracking-tight mb-4">
        {t("amendments")}
      </h2>

      {amendments.length === 0 ? (
        <p className="text-[13px] text-muted">{t("noAmendments")}</p>
      ) : (
        <ol className="relative border-l-2 border-gray-200 ml-2 space-y-6">
          {amendments.map((a, i) => (
            <li key={i} className="pl-5 relative">
              <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-accent border-2 border-white" />
              {a.date && (
                <time className="block text-[11px] font-semibold text-muted uppercase tracking-wide mb-0.5">
                  {formatDate(a.date)}
                </time>
              )}
              <p dir="auto" className="text-[14px] font-semibold text-foreground leading-snug">
                {a.title}
              </p>
              {a.description && (
                <p dir="auto" className="text-[13px] text-muted mt-1 leading-relaxed">
                  {a.description}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
