"use client";

import { useTranslations } from "next-intl";
import ChatInterface from "@/components/chat/ChatInterface";

export default function AskPage() {
  const t = useTranslations("ask");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-muted mb-6">{t("subtitle")}</p>
      <ChatInterface />
      <p className="mt-4 text-xs text-muted text-center">{t("disclaimer")}</p>
    </div>
  );
}
