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

export default function LoginPage() {
  const t  = useTranslations("auth");
  const te = useTranslations("errors");
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/search");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : te("network"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-62px)] bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-accent font-extrabold text-[22px] font-bengali">ধ</span>
          </div>
          <h1 className="text-[24px] font-extrabold text-foreground tracking-tight mb-1">
            {t("welcomeBack")}
          </h1>
          <p className="text-[14px] text-muted">{t("loginSubtitle")}</p>
        </div>

        <Card className="p-8" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t("email")}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              required
            />
            <Input
              label={t("password")}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
              required
            />
            <div className="flex justify-end">
              <button type="button" className="text-[13px] text-primary hover:underline">
                {t("forgotPassword")}
              </button>
            </div>
            {error && (
              <p dir="auto" className="text-[13px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <Button variant="primary" type="submit" disabled={loading} full>
              {loading ? t("signingIn") : t("signIn")}
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-[14px] text-muted">
              {t("noAccount")}{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                {t("signUpFree")}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
