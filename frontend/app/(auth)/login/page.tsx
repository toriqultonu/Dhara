"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call /api/auth/login
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">{t("loginTitle")}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t("email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label={t("password")} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" variant="primary" className="w-full">{t("loginButton")}</Button>
        </form>
        <div className="mt-4 text-center">
          <Button variant="outline" className="w-full">{t("googleLogin")}</Button>
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          {t("noAccount")} <Link href="/register" className="text-primary hover:underline">{t("signUp")}</Link>
        </p>
      </div>
    </div>
  );
}
