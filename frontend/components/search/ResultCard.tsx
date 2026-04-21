import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { SearchResult } from "@/lib/types";

interface ResultCardProps {
  result: SearchResult;
}

const borderColors: Record<string, string> = {
  statute:  "#3B82F6",
  judgment: "#F59E0B",
  sro:      "#8B5CF6",
};

export default function ResultCard({ result }: ResultCardProps) {
  const href =
    result.sourceType === "statute"
      ? `/statutes/${result.sourceId}`
      : result.sourceType === "judgment"
      ? `/judgments/${result.sourceId}`
      : "#";

  const relevance = Math.round(result.score * 100);

  return (
    <Link
      href={href}
      className="block bg-white rounded-xl border-[1.5px] border-gray-200 p-5 hover:border-primary/30 hover:shadow-card-hover transition-all duration-200 group"
      style={{ borderLeftWidth: 4, borderLeftColor: borderColors[result.sourceType] ?? "#CBD5E1" }}
    >
      {/* Top row */}
      <div className="flex items-center gap-2 mb-2.5">
        <Badge variant={result.sourceType as "statute" | "judgment" | "sro"}>
          {result.sourceType}
        </Badge>
        <div className="flex-1" />
        <span className="text-[12px] text-muted">Relevance</span>
        <div className="w-[60px] h-[5px] bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full"
            style={{ width: `${relevance}%` }}
          />
        </div>
        <span className="text-[12px] font-semibold text-secondary w-8 text-right">{relevance}%</span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-[15px] text-foreground group-hover:text-primary leading-snug mb-2 transition-colors">
        {result.title}
      </h3>

      {/* Snippet */}
      <p className="text-[13px] text-muted leading-relaxed line-clamp-2">{result.snippet}</p>
    </Link>
  );
}
