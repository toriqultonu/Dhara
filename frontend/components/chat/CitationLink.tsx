import Link from "next/link";
import type { Citation } from "@/lib/types";

interface CitationLinkProps {
  citation: Citation;
  index?: number;
}

export default function CitationLink({ citation, index }: CitationLinkProps) {
  const href =
    citation.sourceType === "statute"
      ? `/statutes/${citation.sourceId}`
      : citation.sourceType === "judgment"
      ? `/judgments/${citation.sourceId}`
      : "#";

  return (
    <div className="flex items-start gap-2.5">
      {index && (
        <span className="text-[11px] font-bold text-primary bg-blue-50 px-1.5 py-0.5 rounded font-mono shrink-0">
          [{index}]
        </span>
      )}
      <Link
        href={href}
        className="text-[13px] text-primary underline underline-offset-2 hover:text-primary-light leading-relaxed transition-colors"
      >
        {citation.title}
        {citation.sectionNumber && (
          <span className="text-muted ml-1">§{citation.sectionNumber}</span>
        )}
      </Link>
    </div>
  );
}
