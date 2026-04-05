import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Footer() {
  const t = useTranslations("common");

  return (
    <footer className="bg-primary text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-lg font-bold">{t("appName")}</div>
          <div className="flex gap-6 text-sm">
            <Link href="/search" className="hover:text-accent">Search</Link>
            <Link href="/ask" className="hover:text-accent">Ask AI</Link>
            <Link href="/pricing" className="hover:text-accent">Pricing</Link>
          </div>
          <div className="text-sm text-gray-300">
            &copy; 2024 ধারা (Dhara). All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
