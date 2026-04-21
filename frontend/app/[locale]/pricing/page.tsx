"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function PricingPage() {
  const t = useTranslations("pricing");
  const [annual, setAnnual] = useState(false);

  const plans = ["free", "student", "professional", "firm"] as const;

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-[38px] font-extrabold text-foreground tracking-tight mb-3">
            {t("title")}
          </h1>
          <p className="text-[16px] text-muted mb-7">{t("subtitle")}</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-white border-[1.5px] border-gray-200 rounded-full px-5 py-2">
            <span className={`text-[14px] font-${!annual ? "bold" : "normal"} ${!annual ? "text-primary" : "text-muted"}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual((a) => !a)}
              className="relative w-11 h-6 rounded-full transition-colors duration-200"
              style={{ background: annual ? "#1E3A5F" : "#CBD5E1" }}
              aria-label="Toggle billing period"
            >
              <span
                className="absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-all duration-200"
                style={{ left: annual ? 23 : 3 }}
              />
            </button>
            <span className={`text-[14px] font-${annual ? "bold" : "normal"} ${annual ? "text-primary" : "text-muted"}`}>
              Annual
            </span>
            {annual && (
              <span className="text-[11px] bg-green-50 text-secondary border border-green-200 px-2 py-0.5 rounded-full font-bold">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => {
            const featured = plan === "professional";
            return (
              <div
                key={plan}
                className={`relative rounded-2xl p-7 border-2 transition-all ${
                  featured
                    ? "bg-primary border-primary shadow-[0_12px_40px_rgba(30,58,95,0.2)] scale-[1.03]"
                    : "bg-white border-gray-200 shadow-card"
                }`}
              >
                {featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-primary text-[11px] font-extrabold px-4 py-1 rounded-full tracking-wide whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}

                <h3 className={`text-[17px] font-extrabold mb-1 ${featured ? "text-white" : "text-foreground"}`}>
                  {t(`${plan}.name`)}
                </h3>
                <div className="flex items-baseline gap-1 mb-0.5">
                  <span className={`text-[32px] font-extrabold tracking-tight ${featured ? "text-white" : "text-foreground"}`}>
                    {t(`${plan}.price`)}
                  </span>
                  <span className={`text-[13px] ${featured ? "text-slate-400" : "text-muted"}`}>
                    {t(`${plan}.period`)}
                  </span>
                </div>
                {annual && plan !== "free" && (
                  <p className={`text-[11px] font-semibold mb-5 ${featured ? "text-accent" : "text-secondary"}`}>
                    Billed annually
                  </p>
                )}

                <ul className="space-y-2.5 mb-6 mt-4">
                  {(t.raw(`${plan}.features`) as string[]).map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className={`font-bold text-[14px] shrink-0 ${featured ? "text-accent" : "text-secondary"}`}>✓</span>
                      <span className={`text-[13px] leading-snug ${featured ? "text-slate-300" : "text-foreground"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-2.5 rounded-lg border-[1.5px] text-[14px] font-bold transition-all ${
                    featured
                      ? "bg-accent border-accent text-primary hover:bg-accent-dark"
                      : "bg-transparent border-primary text-primary hover:bg-primary hover:text-white"
                  }`}
                >
                  {t("subscribe")}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
