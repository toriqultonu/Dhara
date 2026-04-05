"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [barCouncilId, setBarCouncilId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call /api/auth/register
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">{t("registerTitle")}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t("name")} value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label={t("email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label={t("password")} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Input label={t("barCouncilId")} value={barCouncilId} onChange={(e) => setBarCouncilId(e.target.value)} />
          <Button type="submit" variant="primary" className="w-full">{t("registerButton")}</Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          {t("hasAccount")} <Link href="/login" className="text-primary hover:underline">{t("signIn")}</Link>
        </p>
      </div>
    </div>
  );
}
