"use client";

import { useTranslations } from "next-intl";

interface SmartFieldsSidebarProps {
  onInsert: (field: string) => void;
}

const FIELDS = [
  { label: "Party Name 1", value: "[PARTY NAME 1]" },
  { label: "Party Name 2", value: "[PARTY NAME 2]" },
  { label: "Date", value: "[DATE]" },
  { label: "Address", value: "[ADDRESS]" },
  { label: "Amount (BDT)", value: "BDT [AMOUNT]" },
  { label: "Phone Number", value: "[PHONE NUMBER]" },
  { label: "NID Number", value: "[NID NUMBER]" },
  { label: "Signature", value: "___________________" },
  { label: "Start Date", value: "[START DATE]" },
  { label: "End Date", value: "[END DATE]" },
  { label: "Job Title", value: "[JOB TITLE]" },
  { label: "Company Name", value: "[COMPANY NAME]" },
];

export default function SmartFieldsSidebar({ onInsert }: SmartFieldsSidebarProps) {
  const t = useTranslations("documents");

  return (
    <div className="h-full flex flex-col">
      <h3 className="font-semibold text-sm mb-3">{t("smartFields")}</h3>
      <p className="text-xs text-gray-400 mb-3">{t("smartFieldsHint")}</p>
      <div className="flex-1 overflow-y-auto space-y-1">
        {FIELDS.map((field) => (
          <button
            key={field.value}
            onClick={() => onInsert(field.value)}
            className="w-full text-left text-xs px-3 py-2 rounded border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <span className="font-medium text-gray-700">{field.label}</span>
            <span className="block text-gray-400 font-mono mt-0.5">{field.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
