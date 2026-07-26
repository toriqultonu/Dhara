"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";

/** Shape of GET /api/my-subscription (backend SubscriptionResponse record). */
interface MySubscription {
  id: number;
  planName: string;
  status: string;
  startedAt: string | null;
  expiresAt: string | null;
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tn = useTranslations("nav");
  const router = useRouter();
  const { user, isAuthenticated, initializing, logout } = useAuth();

  const [subscription, setSubscription] = useState<MySubscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      router.replace("/login");
    }
  }, [initializing, isAuthenticated, router]);

  useEffect(() => {
    if (initializing || !isAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<MySubscription>("/api/my-subscription");
        if (!cancelled && res.success) setSubscription(res.data);
      } catch {
        // No active subscription (or backend down) → show the Free-plan note
      } finally {
        if (!cancelled) setSubLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initializing, isAuthenticated]);

  if (initializing || !isAuthenticated || !user) {
    return <Loading />;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-[680px] mx-auto">
        <h1 className="text-[28px] font-extrabold text-foreground tracking-tight mb-8">
          {t("title")}
        </h1>

        {/* User card */}
        <Card className="p-6 mb-5">
          <div className="flex items-center gap-4 mb-6">
            <span className="w-14 h-14 rounded-full bg-blue-50 text-primary text-[22px] font-extrabold flex items-center justify-center uppercase shrink-0">
              {user.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <p dir="auto" className="text-[18px] font-bold text-foreground truncate">
                {user.name}
              </p>
              <p className="text-[13px] text-muted truncate">{user.email}</p>
            </div>
            {user.role && (
              <Badge variant="statute" className="ml-auto">
                {user.role}
              </Badge>
            )}
          </div>

          <h2 className="text-[13px] font-bold text-muted uppercase tracking-wide mb-3">
            {t("accountInfo")}
          </h2>
          <dl className="space-y-2.5">
            <div className="flex justify-between gap-4 text-[13px]">
              <dt className="text-muted">{t("name")}</dt>
              <dd dir="auto" className="font-semibold text-foreground text-right">{user.name}</dd>
            </div>
            <div className="flex justify-between gap-4 text-[13px]">
              <dt className="text-muted">{t("email")}</dt>
              <dd className="font-semibold text-foreground text-right">{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4 text-[13px]">
              <dt className="text-muted">{t("role")}</dt>
              <dd className="font-semibold text-foreground text-right">{user.role || "—"}</dd>
            </div>
            {user.barCouncilId && (
              <div className="flex justify-between gap-4 text-[13px]">
                <dt className="text-muted">{t("barCouncilId")}</dt>
                <dd dir="auto" className="font-semibold text-foreground text-right">
                  {user.barCouncilId}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        {/* Subscription */}
        <Card className="p-6 mb-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-[15px] font-bold text-foreground">{t("subscription")}</h2>
            <Link href="/pricing">
              <Button size="sm" variant="accent">
                {t("upgrade")}
              </Button>
            </Link>
          </div>

          {subLoading ? (
            <Loading />
          ) : subscription ? (
            <dl className="space-y-2.5">
              <div className="flex justify-between gap-4 text-[13px]">
                <dt className="text-muted">{t("plan")}</dt>
                <dd className="font-bold text-primary text-right">{subscription.planName}</dd>
              </div>
              <div className="flex justify-between gap-4 text-[13px] items-center">
                <dt className="text-muted">{t("status")}</dt>
                <dd>
                  <Badge variant={subscription.status === "ACTIVE" ? "active" : "repealed"}>
                    {subscription.status}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between gap-4 text-[13px]">
                <dt className="text-muted">{t("startedOn")}</dt>
                <dd className="font-semibold text-foreground text-right">
                  {formatDate(subscription.startedAt)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 text-[13px]">
                <dt className="text-muted">{t("expiresOn")}</dt>
                <dd className="font-semibold text-foreground text-right">
                  {formatDate(subscription.expiresAt)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-[13px] text-muted">{t("noSubscription")}</p>
          )}
        </Card>

        {/* Usage note */}
        <Card className="p-6 mb-8">
          <h2 className="text-[15px] font-bold text-foreground mb-2">{t("usage")}</h2>
          <p dir="auto" className="text-[13px] text-muted leading-relaxed">
            {t("usageNote")}
          </p>
        </Card>

        <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={handleLogout}>
          {tn("logout")}
        </Button>
      </div>
    </div>
  );
}
