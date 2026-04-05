"use client";

import { useTranslations } from "next-intl";

interface FilterPanelProps {
  filters: string[];
  onFiltersChange: (filters: string[]) => void;
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const t = useTranslations("search");
  const types = ["statutes", "judgments", "sros"];

  const toggle = (type: string) => {
    if (filters.includes(type)) {
      onFiltersChange(filters.filter((f) => f !== type));
    } else {
      onFiltersChange([...filters, type]);
    }
  };

  return (
    <div className="w-48 shrink-0">
      <h3 className="font-semibold mb-3">{t("filterBy")}</h3>
      <div className="space-y-2">
        {types.map((type) => (
          <label key={type} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.includes(type)}
              onChange={() => toggle(type)}
              className="rounded text-primary"
            />
            <span className="text-sm capitalize">{type}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
