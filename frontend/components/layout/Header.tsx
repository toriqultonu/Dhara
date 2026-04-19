"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import LanguageToggle from "./LanguageToggle";

export default function Header() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/search", label: t("search") },
    { href: "/ask", label: t("ask") },
    { href: "/statutes", label: t("statutes") },
    { href: "/judgments", label: t("judgments") },
    { href: "/documents", label: t("documents") },
    { href: "/templates", label: t("templates") },
    { href: "/analysis", label: t("analysis") },
    { href: "/pricing", label: t("pricing") },
  ];

  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold">
          {tc("appName")}
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm hover:text-accent transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageToggle />
          <Link href="/login" className="text-sm hover:text-accent">{t("login")}</Link>
          <Link href="/register" className="text-sm bg-accent text-primary px-4 py-1.5 rounded-md font-medium hover:bg-accent-dark">
            {t("register")}
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-primary-light px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block text-sm" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-primary-light flex gap-3">
            <LanguageToggle />
            <Link href="/login" className="text-sm">{t("login")}</Link>
          </div>
        </div>
      )}
    </header>
  );
}
