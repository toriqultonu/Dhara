"use client";

import { useTranslations } from "next-intl";

interface Amendment {
  id: string;
  actNumber: string;
  actTitle: string;
  year: number;
  description?: string;
}

interface AmendmentHistoryProps {
  amendments: Amendment[];
}

export default function AmendmentHistory({ amendments }: AmendmentHistoryProps) {
  const t = useTranslations("legal");

  if (amendments.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">
        No {t("amendments").toLowerCase()} found.
      </p>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {t("amendments")}
      </h4>
      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />
        <ul className="space-y-4">
          {amendments.map((amendment) => (
            <li key={amendment.id} className="relative pl-8">
              <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary-500 border-2 border-white" />
              <div className="p-3 border border-gray-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {amendment.actTitle}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {amendment.year}
                  </span>
                </div>
                <span className="text-xs text-primary-600">
                  {amendment.actNumber}
                </span>
                {amendment.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {amendment.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
