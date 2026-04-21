"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

interface FilterPanelProps {
  filters: string[];
  onFiltersChange: (filters: string[]) => void;
}

const SOURCE_TYPES = [
  { key: "statutes",  label: "Statutes & Acts" },
  { key: "judgments", label: "Court Judgments" },
  { key: "sros",      label: "SROs & Orders" },
];

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const t = useTranslations("search");

  const toggle = (key: string) => {
    if (filters.includes(key)) {
      onFiltersChange(filters.filter((f) => f !== key));
    } else {
      onFiltersChange([...filters, key]);
    }
  };

  return (
    <aside className="w-[220px] shrink-0 space-y-4">
      {/* Source type filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-[11px] font-bold text-muted tracking-widest uppercase mb-4">
          Filters
        </h3>
        <div className="mb-5">
          <p className="text-[12px] font-semibold text-foreground mb-2.5">Source Type</p>
          <div className="space-y-2">
            {SOURCE_TYPES.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer text-[13px] text-foreground">
                <input
                  type="checkbox"
                  checked={filters.includes(key)}
                  onChange={() => toggle(key)}
                  className="accent-primary w-[15px] h-[15px] rounded"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        <Button variant="outline" size="sm" full onClick={() => onFiltersChange(SOURCE_TYPES.map((s) => s.key))}>
          Reset Filters
        </Button>
      </div>

      {/* Quick access */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-[11px] font-bold text-muted tracking-widest uppercase mb-3">
          Quick Access
        </p>
        {["Penal Code", "Civil Procedure", "Evidence Act", "Family Courts"].map((q) => (
          <button
            key={q}
            className="block w-full text-left text-[13px] text-primary font-medium py-1.5 hover:underline transition-all"
          >
            → {q}
          </button>
        ))}
      </div>
    </aside>
  );
}
