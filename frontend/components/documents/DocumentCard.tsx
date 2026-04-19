"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import type { DocumentListResponse } from "@/lib/types";

interface DocumentCardProps {
  document: DocumentListResponse;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
  onShare: (id: number) => void;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  shared: "bg-blue-100 text-blue-700",
};

const CATEGORY_STYLES: Record<string, string> = {
  employment: "bg-purple-100 text-purple-700",
  contract: "bg-indigo-100 text-indigo-700",
  nda: "bg-red-100 text-red-700",
  "real-estate": "bg-orange-100 text-orange-700",
  business: "bg-teal-100 text-teal-700",
  personal: "bg-pink-100 text-pink-700",
  other: "bg-gray-100 text-gray-600",
};

export default function DocumentCard({ document, onDelete, onDuplicate, onShare }: DocumentCardProps) {
  const t = useTranslations("documents");

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-primary hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_STYLES[document.category] ?? "bg-gray-100 text-gray-600"}`}>
              {document.category}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[document.status] ?? "bg-gray-100 text-gray-600"}`}>
              {document.status}
            </span>
            {document.shared && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600">
                {t("shared")}
              </span>
            )}
          </div>
          <Link href={`/documents/${document.id}`}>
            <h3 className="text-base font-semibold text-gray-900 hover:text-primary truncate cursor-pointer">
              {document.title}
            </h3>
          </Link>
        </div>
      </div>

      {document.tags && document.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {document.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {t("modified")} {formatDate(document.modifiedAt)}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onShare(document.id)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {t("share")}
          </button>
          <button
            onClick={() => onDuplicate(document.id)}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
          >
            {t("duplicate")}
          </button>
          <button
            onClick={() => onDelete(document.id)}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
