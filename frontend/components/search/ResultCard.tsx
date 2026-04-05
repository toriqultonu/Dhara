import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { SearchResult } from "@/lib/types";

interface ResultCardProps {
  result: SearchResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  const href = result.sourceType === "statute"
    ? `/statutes/${result.sourceId}`
    : result.sourceType === "judgment"
    ? `/judgments/${result.sourceId}`
    : "#";

  return (
    <Link href={href} className="block p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant={result.sourceType as "statute" | "judgment" | "sro"}>{result.sourceType}</Badge>
        <span className="text-xs text-muted">{Math.round(result.score * 100)}%</span>
      </div>
      <h3 className="font-semibold mb-1">{result.title}</h3>
      <p className="text-sm text-muted line-clamp-2">{result.snippet}</p>
    </Link>
  );
}
