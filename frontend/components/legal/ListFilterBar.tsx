"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface FilterPill {
  value: string;
  label: string;
}

interface ListFilterBarProps {
  searchPlaceholder: string;
  /** Query param used by the pills (e.g. "category", "court"). */
  pillParam: string;
  pills: FilterPill[];
  allLabel: string;
}

export default function ListFilterBar({
  searchPlaceholder,
  pillParam,
  pills,
  allLabel,
}: ListFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activePill = searchParams.get(pillParam) ?? "";
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const navigate = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ q: query.trim() });
        }}
        className="flex-1 min-w-[260px] flex items-center bg-gray-50 border-[1.5px] border-gray-200 rounded-lg overflow-hidden focus-within:border-primary focus-within:bg-white transition-all"
      >
        <span className="pl-3 text-muted">🔍</span>
        <input
          dir="auto"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-3 py-2.5 text-[14px] bg-transparent border-none outline-none text-foreground placeholder:text-muted"
        />
      </form>

      <div className="flex flex-wrap gap-1.5">
        {[{ value: "", label: allLabel }, ...pills].map((pill) => {
          const active = activePill === pill.value;
          return (
            <button
              key={pill.value || "__all"}
              onClick={() => navigate({ [pillParam]: pill.value })}
              className={cn(
                "px-3.5 py-1.5 rounded-full border-[1.5px] text-[12px] font-semibold transition-all",
                active
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 bg-white text-muted hover:border-primary hover:text-primary"
              )}
            >
              {pill.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
