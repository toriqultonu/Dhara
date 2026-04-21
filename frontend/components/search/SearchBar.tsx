"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface SearchBarProps {
  onSearch: (query: string) => void;
  defaultValue?: string;
  size?: "default" | "large";
}

export default function SearchBar({ onSearch, defaultValue = "", size = "default" }: SearchBarProps) {
  const t = useTranslations("search");
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) onSearch(query);
    },
    [query, onSearch]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`flex items-center bg-gray-50 border-[1.5px] border-gray-200 rounded-xl overflow-hidden transition-all focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/10 focus-within:bg-white ${size === "large" ? "shadow-search" : ""}`}>
        <span className="pl-4 text-muted text-[16px] shrink-0">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          dir="auto"
          className={`flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted ${size === "large" ? "px-4 py-4 text-[16px]" : "px-4 py-3 text-[15px]"}`}
        />
        <button
          type="submit"
          className="bg-primary hover:bg-primary-light text-white font-semibold text-[14px] px-5 h-full py-3 transition-colors shrink-0"
        >
          {t("startSearching")}
        </button>
      </div>
    </form>
  );
}
