"use client";

import type { TemplateListResponse } from "@/lib/types";

interface TemplateCardProps {
  template: TemplateListResponse;
  onUse: (id: number) => void;
  onPreview: (template: TemplateListResponse) => void;
}

const CATEGORY_STYLES: Record<string, string> = {
  employment: "bg-purple-100 text-purple-700",
  contract: "bg-indigo-100 text-indigo-700",
  nda: "bg-red-100 text-red-700",
  "real-estate": "bg-orange-100 text-orange-700",
  business: "bg-teal-100 text-teal-700",
  personal: "bg-pink-100 text-pink-700",
};

export default function TemplateCard({ template, onUse, onPreview }: TemplateCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-primary hover:shadow-sm transition-all flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_STYLES[template.category] ?? "bg-gray-100 text-gray-600"}`}>
            {template.category}
          </span>
          <h3 className="text-sm font-semibold text-gray-900 mt-2 leading-snug">{template.title}</h3>
        </div>
        {template.popularity > 0 && (
          <span className="shrink-0 text-xs text-amber-600 font-medium">
            ★ {template.popularity}%
          </span>
        )}
      </div>

      {template.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{template.description}</p>
      )}

      <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
        <button
          onClick={() => onPreview(template)}
          className="flex-1 text-xs py-1.5 border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
        >
          Preview
        </button>
        <button
          onClick={() => onUse(template.id)}
          className="flex-1 text-xs py-1.5 bg-primary text-white rounded hover:bg-primary/90"
        >
          Use Template
        </button>
      </div>
    </div>
  );
}
