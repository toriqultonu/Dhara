"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const t  = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("access_token", data.data.accessToken);
        router.push("/search");
      } else {
        setError(data.error || "Invalid credentials.");
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-62px)] bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-accent font-extrabold text-[22px]">ধ</span>
          </div>
          <h1 className="text-[24px] font-extrabold text-foreground tracking-tight mb-1">
            Welcome back
          </h1>
          <p className="text-[14px] text-muted">Sign in to your Dhara account</p>
        </div>

        <Card className="p-8" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
              required
            />
            <div className="flex justify-end">
              <button type="button" className="text-[13px] text-primary hover:underline">
                Forgot password?
              </button>
            </div>
            {error && (
              <p className="text-[13px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <Button variant="primary" type="submit" disabled={loading} full>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-[14px] text-muted">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Sign up free
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
