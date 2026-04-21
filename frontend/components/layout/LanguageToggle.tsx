"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";

export default function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const toggle = () => {
    const next = locale === "bn" ? "en" : "bn";
    // Replace current locale prefix in pathname
    const newPath = pathname.replace(`/${locale}`, `/${next}`);
    router.push(newPath);
  };

  return (
    <button
      onClick={toggle}
      className="text-[12px] font-bold bg-gray-100 border border-gray-200 text-foreground px-2.5 py-1 rounded-lg hover:bg-gray-200 transition-colors"
    >
      {locale === "bn" ? "EN" : "বাং"}
    </button>
  );
}
