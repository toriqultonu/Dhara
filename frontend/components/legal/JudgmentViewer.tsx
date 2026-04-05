import { useTranslations } from "next-intl";

interface JudgmentViewerProps {
  judgmentId: string;
}

export default function JudgmentViewer({ judgmentId }: JudgmentViewerProps) {
  const t = useTranslations("legal");

  // TODO: Fetch judgment from API
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t("judgment")} #{judgmentId}</h1>
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div><span className="font-semibold">{t("court")}:</span> -</div>
        <div><span className="font-semibold">{t("date")}:</span> -</div>
        <div><span className="font-semibold">{t("bench")}:</span> -</div>
        <div><span className="font-semibold">{t("citation")}:</span> -</div>
      </div>
      <h2 className="text-xl font-semibold mb-2">{t("headnotes")}</h2>
      <p className="text-muted mb-6">-</p>
      <h2 className="text-xl font-semibold mb-2">{t("fullText")}</h2>
      <p className="text-muted">-</p>
    </div>
  );
}
