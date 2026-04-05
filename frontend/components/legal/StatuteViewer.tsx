import { useTranslations } from "next-intl";

interface StatuteViewerProps {
  statuteId: string;
}

export default function StatuteViewer({ statuteId }: StatuteViewerProps) {
  const t = useTranslations("legal");

  // TODO: Fetch statute and sections from API
  return (
    <div className="flex gap-8">
      <aside className="w-64 shrink-0">
        <h3 className="font-semibold mb-4">{t("sections")}</h3>
        <p className="text-sm text-muted">{t("browseSections")}</p>
      </aside>
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">{t("statute")} #{statuteId}</h1>
        <p className="text-muted">{t("fullText")}</p>
      </div>
    </div>
  );
}
