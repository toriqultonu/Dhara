"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import type { PlanResponse } from "@/lib/types";

type PlanKey = "free" | "student" | "professional" | "firm";

/** Frontend plan key → seeded backend plan name (subscription_plans.name). */
const PLAN_NAME: Record<PlanKey, string> = {
  free: "FREE",
  student: "STUDENT",
  professional: "PROFESSIONAL",
  firm: "FIRM",
};

export default function PricingPage() {
  const t = useTranslations("pricing");
  const te = useTranslations("errors");
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [annual, setAnnual] = useState(false);
  const [subscribing, setSubscribing] = useState<PlanKey | null>(null);

  const plans: PlanKey[] = ["free", "student", "professional", "firm"];

  const handleSubscribe = async (plan: PlanKey) => {
    if (!isAuthenticated) {
      router.push(plan === "free" ? "/register" : "/login");
      return;
    }
    if (plan === "free") {
      toast(t("freePlanActive"), "success");
      return;
    }

    setSubscribing(plan);
    try {
      const plansRes = await api.get<PlanResponse[]>("/api/plans");
      const backendPlan = plansRes.data.find((p) => p.name === PLAN_NAME[plan]);
      if (!backendPlan) {
        toast(te("generic"), "error");
        return;
      }
      const initRes = await api.post<{ gatewayUrl: string }>("/api/payments/init", {
        planId: backendPlan.id,
        currency: "BDT",
      });
      window.location.href = initRes.data.gatewayUrl;
      return;
    } catch (err) {
      toast(err instanceof ApiError ? err.message : te("network"), "error");
    } finally {
      setSubscribing(null);
    }
  };

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
            <span className={`text-[14px] ${!annual ? "font-bold text-primary" : "font-normal text-muted"}`}>
              {t("monthly")}
            </span>
            <button
              onClick={() => setAnnual((a) => !a)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                annual ? "bg-primary" : "bg-gray-300"
              }`}
              aria-label={t("billingToggle")}
            >
              <span
                className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-all duration-200 ${
                  annual ? "left-[23px]" : "left-[3px]"
                }`}
              />
            </button>
            <span className={`text-[14px] ${annual ? "font-bold text-primary" : "font-normal text-muted"}`}>
              {t("annual")}
            </span>
            {annual && (
              <span className="text-[11px] bg-green-50 text-secondary border border-green-200 px-2 py-0.5 rounded-full font-bold">
                {t("save20")}
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
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-primary text-[11px] font-extrabold px-4 py-1 rounded-full tracking-wide whitespace-nowrap uppercase">
                    {t("mostPopular")}
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
                    {t("billedAnnually")}
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
                  onClick={() => handleSubscribe(plan)}
                  disabled={subscribing !== null}
                  className={`w-full py-2.5 rounded-lg border-[1.5px] text-[14px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    featured
                      ? "bg-accent border-accent text-primary hover:bg-accent-dark"
                      : "bg-transparent border-primary text-primary hover:bg-primary hover:text-white"
                  }`}
                >
                  {subscribing === plan ? t("redirecting") : t("subscribe")}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
