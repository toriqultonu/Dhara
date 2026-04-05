import { useTranslations } from "next-intl";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";

export default function StatutesPage() {
  const t = useTranslations("legal");

  // TODO: Fetch from API with server component fetch
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("statute")}</h1>
      <div className="space-y-4">
        <p className="text-muted">{t("browseSections")}</p>
        {/* Statute list will be populated from API */}
      </div>
    </div>
  );
}
