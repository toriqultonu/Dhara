"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation";

const ROLES = ["lawyer", "student", "judge", "other"] as const;
type Role = (typeof ROLES)[number];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ name: "", email: "", password: "" });
  const [role, setRole]     = useState<Role>("lawyer");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, role }),
        }
      );
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("access_token", data.data.accessToken);
        router.push("/search");
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-62px)] bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-accent font-extrabold text-[22px]">ধ</span>
          </div>
          <h1 className="text-[24px] font-extrabold text-foreground tracking-tight mb-1">
            Create your account
          </h1>
          <p className="text-[14px] text-muted">Free for 14 days, no credit card needed</p>
        </div>

        <Card className="p-8" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              placeholder="Md. Rafiqul Islam"
              value={form.name}
              onChange={upd("name")}
              dir="auto"
              required
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={upd("email")}
              dir="ltr"
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={upd("password")}
              dir="ltr"
              required
              minLength={8}
            />

            {/* Role selector */}
            <div>
              <label className="text-[13px] font-medium text-foreground block mb-2">I am a</label>
              <div className="grid grid-cols-4 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-lg border-[1.5px] text-[12px] font-semibold capitalize transition-all ${
                      role === r
                        ? "border-primary bg-blue-50 text-primary"
                        : "border-gray-200 bg-white text-muted hover:border-gray-300"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-[13px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button variant="primary" type="submit" disabled={loading} full>
              {loading ? "Creating account…" : "Create Free Account"}
            </Button>

            <p className="text-[12px] text-muted text-center leading-relaxed">
              By signing up, you agree to our{" "}
              <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-[14px] text-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
