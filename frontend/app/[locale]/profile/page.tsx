"use client";

import { useTranslations } from "next-intl";
import Card from "@/components/ui/Card";

export default function ProfilePage() {
  const t = useTranslations("profile");

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">{t("subscription")}</h2>
        <p className="text-muted">{t("queriesUsed")}: 0</p>
      </Card>
      <Card>
        <h2 className="text-xl font-semibold mb-4">{t("usage")}</h2>
        <p className="text-muted">{t("memberSince")}: -</p>
      </Card>
    </div>
  );
}
