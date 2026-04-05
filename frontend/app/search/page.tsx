"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import SearchBar from "@/components/search/SearchBar";
import FilterPanel from "@/components/search/FilterPanel";
import SearchResults from "@/components/search/SearchResults";
import type { SearchResult } from "@/lib/types";

export default function SearchPage() {
  const t = useTranslations("search");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<string[]>(["statutes", "judgments", "sros"]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, filters }),
      });
      const data = await res.json();
      if (data.success) setResults(data.data.results);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchBar onSearch={handleSearch} />
      <div className="mt-8 flex gap-8">
        <FilterPanel filters={filters} onFiltersChange={setFilters} />
        <div className="flex-1">
          {loading ? (
            <p className="text-center text-muted">{t("noResults")}</p>
          ) : (
            <SearchResults results={results} />
          )}
        </div>
      </div>
    </div>
  );
}
