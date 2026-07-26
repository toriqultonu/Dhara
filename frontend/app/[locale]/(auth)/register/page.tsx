"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const t  = useTranslations("auth");
  const te = useTranslations("errors");
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm]       = useState({ name: "", email: "", password: "", barCouncilId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        barCouncilId: form.barCouncilId || undefined,
      });
      router.push("/search");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : te("network"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-62px)] bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-accent font-extrabold text-[22px] font-bengali">ধ</span>
          </div>
          <h1 className="text-[24px] font-extrabold text-foreground tracking-tight mb-1">
            {t("registerTitle")}
          </h1>
          <p className="text-[14px] text-muted">{t("registerSubtitle")}</p>
        </div>

        <Card className="p-8" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t("name")}
              placeholder={t("namePlaceholder")}
              value={form.name}
              onChange={upd("name")}
              dir="auto"
              required
            />
            <Input
              label={t("email")}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={upd("email")}
              dir="ltr"
              required
            />
            <Input
              label={t("password")}
              type="password"
              placeholder={t("passwordHint")}
              value={form.password}
              onChange={upd("password")}
              dir="ltr"
              required
              minLength={6}
            />
            <Input
              label={t("barCouncilId")}
              placeholder="BC-12345"
              value={form.barCouncilId}
              onChange={upd("barCouncilId")}
              dir="ltr"
            />

            {error && (
              <p dir="auto" className="text-[13px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button variant="primary" type="submit" disabled={loading} full>
              {loading ? t("creatingAccount") : t("createFreeAccount")}
            </Button>

            <p className="text-[12px] text-muted text-center leading-relaxed">
              {t.rich("termsNotice", {
                terms: (chunks) => (
                  <Link href="#" className="text-primary hover:underline">{chunks}</Link>
                ),
                privacy: (chunks) => (
                  <Link href="#" className="text-primary hover:underline">{chunks}</Link>
                ),
              })}
            </p>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-[14px] text-muted">
              {t("hasAccount")}{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                {t("signIn")}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
