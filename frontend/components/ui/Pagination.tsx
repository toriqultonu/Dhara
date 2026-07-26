"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface PaginationProps {
  /** Current page, 1-based. */
  page: number;
  totalPages: number;
  /** Override navigation. Default: updates the `page` URL query param. */
  onPageChange?: (page: number) => void;
  className?: string;
}

function pageRange(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "…")[] = [1];
  if (page > 3) pages.push("…");
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
    pages.push(p);
  }
  if (page < totalPages - 2) pages.push("…");
  pages.push(totalPages);
  return pages;
}

export default function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    if (onPageChange) {
      onPageChange(p);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (p === 1) {
      params.delete("page");
    } else {
      params.set("page", p.toString());
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const navButton =
    "min-w-[34px] h-[34px] px-2 inline-flex items-center justify-center rounded-lg border-[1.5px] text-[13px] font-semibold transition-all duration-150";

  return (
    <nav className={cn("flex items-center justify-center gap-1.5 py-6", className)}>
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        aria-label={t("previous")}
        className={cn(
          navButton,
          "border-gray-200 bg-white text-muted hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-muted"
        )}
      >
        ‹
      </button>

      {pageRange(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted text-[13px]">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              navButton,
              p === page
                ? "border-primary bg-primary text-white"
                : "border-gray-200 bg-white text-muted hover:border-primary hover:text-primary"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        aria-label={t("next")}
        className={cn(
          navButton,
          "border-gray-200 bg-white text-muted hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-muted"
        )}
      >
        ›
      </button>
    </nav>
  );
}
