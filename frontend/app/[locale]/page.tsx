import { useTranslations } from "next-intl";
import Link from "next/link";

export default function HomePage() {
  const t = useTranslations("common");
  const ts = useTranslations("search");
  const tf = useTranslations("features");

  return (
    <div>
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">{t("appName")}</h1>
          <p className="text-xl mb-8 text-gray-200">{t("tagline")}</p>
          <Link
            href="/search"
            className="inline-block bg-accent hover:bg-accent-dark text-primary font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
          >
            {ts("startSearching")}
          </Link>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {tf("title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(
              ["aiSearch", "caseAnalysis", "bilingual", "citations"] as const
            ).map((key) => (
              <div
                key={key}
                className="p-6 rounded-lg border border-gray-200 text-center"
              >
                <h3 className="text-lg font-semibold mb-2">
                  {tf(`${key}.title`)}
                </h3>
                <p className="text-muted">{tf(`${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
