"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const t = useTranslations("search");
  const [query, setQuery] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) onSearch(query);
    },
    [query, onSearch]
  );

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("placeholder")}
        dir="auto"
        className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
      />
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </form>
  );
}
