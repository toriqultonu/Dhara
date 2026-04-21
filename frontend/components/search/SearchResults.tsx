import ResultCard from "./ResultCard";
import { Skeleton } from "@/components/ui/Loading";
import type { SearchResult } from "@/lib/types";

interface SearchResultsProps {
  results: SearchResult[];
  loading?: boolean;
  query?: string;
}

export default function SearchResults({ results, loading, query }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-5 w-10 rounded" />
            </div>
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-2/3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div>
      {query && (
        <p className="text-[13px] text-muted mb-4">
          {results.length} results for <strong className="text-foreground">&quot;{query}&quot;</strong>
        </p>
      )}
      <div className="space-y-3">
        {results.map((result, i) => (
          <ResultCard key={`${result.sourceType}-${result.sourceId}-${i}`} result={result} />
        ))}
      </div>
    </div>
  );
}
