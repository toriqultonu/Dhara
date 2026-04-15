import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function PricingPage() {
  const t = useTranslations("pricing");

  const plans = ["free", "student", "professional", "firm"] as const;

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-4">{t("title")}</h1>
      <p className="text-center text-muted mb-12">{t("subtitle")}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan) => (
          <Card key={plan} className={plan === "professional" ? "border-2 border-primary" : ""}>
            <h3 className="text-xl font-bold mb-2">{t(`${plan}.name`)}</h3>
            <div className="text-3xl font-bold text-primary mb-1">{t(`${plan}.price`)}</div>
            <div className="text-sm text-muted mb-6">{t(`${plan}.period`)}</div>
            <ul className="space-y-2 mb-6">
              {(t.raw(`${plan}.features`) as string[]).map((feature: string, i: number) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-secondary">&#10003;</span> {feature}
                </li>
              ))}
            </ul>
            <Button variant={plan === "professional" ? "primary" : "outline"} className="w-full">
              {t("subscribe")}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
