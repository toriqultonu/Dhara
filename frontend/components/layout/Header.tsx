"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageToggle from "./LanguageToggle";

export default function Header() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/search",    label: t("search") },
    { href: "/ask",       label: t("ask") },
    { href: "/statutes",  label: t("statutes") },
    { href: "/judgments", label: t("judgments") },
    { href: "/pricing",   label: t("pricing") },
  ];

  const isActive = (href: string) => pathname?.includes(href);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-all duration-200 ${
        scrolled ? "border-b border-gray-200 shadow-sm" : "border-b border-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex items-center h-[62px] gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="9" fill="#1E3A5F"/>
            <line x1="18" y1="10" x2="18" y2="26" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round"/>
            <line x1="10" y1="13" x2="26" y2="13" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M10 13 Q8 17 10 19 Q12 21 14 19 Q16 17 14 13" stroke="#D4A853" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            <path d="M22 13 Q20 17 22 19 Q24 21 26 19 Q28 17 26 13" stroke="#D4A853" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            <path d="M11 27 Q14 25.5 18 27 Q22 28.5 25 27" stroke="#2D7D46" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
            <path d="M13 29.5 Q16 28 18 29.5 Q20 31 23 29.5" stroke="#2D7D46" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
          </svg>
          <span className="font-extrabold text-[19px] text-primary tracking-tight">
            {tc("appName")}
          </span>
          <span className="text-[10px] text-secondary bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full font-bold tracking-wider">
            BETA
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-150 ${
                isActive(link.href)
                  ? "bg-blue-50 text-primary font-semibold"
                  : "text-muted hover:text-foreground hover:bg-gray-50 font-normal"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2.5">
          <LanguageToggle />
          <Link
            href="/login"
            className="text-sm font-medium text-muted hover:text-foreground px-2.5 py-1.5 transition-colors"
          >
            {t("login")}
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold bg-accent hover:bg-accent-dark text-primary px-4 py-1.5 rounded-lg transition-colors"
          >
            {t("register")} →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-6 py-4 space-y-1 bg-white">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm ${
                isActive(link.href)
                  ? "bg-blue-50 text-primary font-semibold"
                  : "text-muted hover:text-foreground hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
            <LanguageToggle />
            <Link href="/login" className="text-sm text-muted" onClick={() => setMenuOpen(false)}>
              {t("login")}
            </Link>
            <Link href="/register" className="text-sm font-semibold text-primary" onClick={() => setMenuOpen(false)}>
              {t("register")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
