import Link from "next/link";
import type { Citation } from "@/lib/types";

interface CitationLinkProps {
  citation: Citation;
}

export default function CitationLink({ citation }: CitationLinkProps) {
  const href = citation.sourceType === "statute"
    ? `/statutes/${citation.sourceId}`
    : `/judgments/${citation.sourceId}`;

  return (
    <Link href={href} className="text-xs text-primary hover:underline block">
      [{citation.sourceType}] {citation.title}
    </Link>
  );
}
