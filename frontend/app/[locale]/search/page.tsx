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
  const [searched, setSearched] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  const handleSearch = async (query: string) => {
    setLoading(true);
    setSearched(true);
    setLastQuery(query);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, filters }),
        }
      );
      const data = await res.json();
      if (data.success) setResults(data.data.results);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky search header */}
      <div className="sticky top-[62px] z-40 bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[900px] mx-auto">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-7 flex gap-6">
        <FilterPanel filters={filters} onFiltersChange={setFilters} />

        <div className="flex-1 min-w-0">
          {!searched && !loading && (
            <div className="text-center py-16 text-muted">
              <div className="text-[40px] mb-4">🔍</div>
              <p className="text-[16px] font-medium mb-2">Search Bangladesh Legal Database</p>
              <p className="text-[14px]">Type a legal question, act name, or case reference above</p>
            </div>
          )}

          {searched && !loading && results.length === 0 && (
            <div className="text-center py-12 text-muted">
              <p className="text-[16px]">{t("noResults")}</p>
            </div>
          )}

          <SearchResults results={results} loading={loading} query={lastQuery} />
        </div>
      </div>
    </div>
  );
}
