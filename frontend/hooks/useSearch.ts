"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import type { SearchResult } from "@/lib/types";

interface UseSearchOptions {
  debounceMs?: number;
}

interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  totalResults: number;
  search: (q?: string) => Promise<void>;
  clearResults: () => void;
}

export function useSearch({ debounceMs = 300 }: UseSearchOptions = {}): UseSearchReturn {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (q?: string) => {
    const searchQuery = q ?? query;
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ results: SearchResult[]; total: number }>(
        "/api/search",
        { query: searchQuery, limit: 20 }
      );
      if (response.success && response.data) {
        setResults(response.data.results);
        setTotalResults(response.data.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      search(query);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debounceMs, search]);

  const clearResults = useCallback(() => {
    setQuery("");
    setResults([]);
    setTotalResults(0);
    setError(null);
  }, []);

  return { query, setQuery, results, isLoading, error, totalResults, search, clearResults };
}
