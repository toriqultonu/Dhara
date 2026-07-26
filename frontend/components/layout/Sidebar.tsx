"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import LanguageToggle from "./LanguageToggle";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const navLinks = [
    { href: "/search",    label: t("search") },
    { href: "/ask",       label: t("ask") },
    { href: "/statutes",  label: t("statutes") },
    { href: "/judgments", label: t("judgments") },
    ...(isAuthenticated ? [{ href: "/documents", label: t("documents") }] : []),
    { href: "/templates", label: t("templates") },
    { href: "/analysis",  label: t("analysis") },
    { href: "/pricing",   label: t("pricing") },
  ];

  const isActive = (href: string) => pathname?.includes(href);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] md:hidden",
        !open && "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-primary-dark/40 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "absolute top-0 right-0 h-full w-[280px] bg-white shadow-card-hover flex flex-col transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 h-[62px] border-b border-gray-100">
          <span className="font-extrabold text-[17px] text-primary tracking-tight">
            {t("menu")}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-gray-100 transition-colors"
            aria-label={t("closeMenu")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "block px-3 py-2.5 rounded-lg text-[14px] transition-all duration-150",
                isActive(link.href)
                  ? "bg-blue-50 text-primary font-semibold"
                  : "text-muted hover:text-foreground hover:bg-gray-50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100 space-y-3">
          <LanguageToggle />
          {isAuthenticated ? (
            <div className="space-y-2">
              <Link
                href="/profile"
                onClick={onClose}
                dir="auto"
                className="block px-1 text-[13px] font-semibold text-foreground truncate hover:text-primary transition-colors"
              >
                {user?.name}
              </Link>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-[14px] text-muted hover:text-foreground hover:bg-gray-50 transition-colors"
              >
                {t("logout")}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                onClick={onClose}
                className="flex-1 text-center text-[14px] font-medium text-muted hover:text-foreground border-[1.5px] border-gray-200 rounded-lg px-3 py-2 transition-colors"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="flex-1 text-center text-[14px] font-semibold bg-accent hover:bg-accent-dark text-primary rounded-lg px-3 py-2 transition-colors"
              >
                {t("register")}
              </Link>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
