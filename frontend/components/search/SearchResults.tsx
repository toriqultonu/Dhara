import ResultCard from "./ResultCard";
import type { SearchResult } from "@/lib/types";

interface SearchResultsProps {
  results: SearchResult[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-4">
      {results.map((result, i) => (
        <ResultCard key={i} result={result} />
      ))}
    </div>
  );
}
