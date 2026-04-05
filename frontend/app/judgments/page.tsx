import { useTranslations } from "next-intl";

export default function JudgmentsPage() {
  const t = useTranslations("legal");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("judgment")}</h1>
      <div className="space-y-4">
        <p className="text-muted">{t("relatedCases")}</p>
        {/* Judgment list will be populated from API */}
      </div>
    </div>
  );
}
