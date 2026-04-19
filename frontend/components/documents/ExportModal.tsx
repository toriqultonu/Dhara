"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";

interface ExportModalProps {
  documentId: number;
  documentTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = "pdf" | "docx" | "txt";

const FORMATS: { value: ExportFormat; label: string; desc: string }[] = [
  { value: "pdf", label: "PDF", desc: "Best for sharing and printing" },
  { value: "docx", label: "Word (DOCX)", desc: "Editable in Microsoft Word" },
  { value: "txt", label: "Plain Text", desc: "Simple text without formatting" },
];

export default function ExportModal({ documentId, documentTitle, isOpen, onClose }: ExportModalProps) {
  const t = useTranslations("documents");
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = (() => {
        try {
          const raw = localStorage.getItem("dhara_auth");
          return raw ? JSON.parse(raw).token : null;
        } catch {
          return null;
        }
      })();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/documents/${documentId}/export`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ format: selectedFormat }),
        }
      );

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentTitle}.${selectedFormat}`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("exportDocument")}>
      <div className="space-y-3 mb-6">
        {FORMATS.map((fmt) => (
          <label
            key={fmt.value}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedFormat === fmt.value
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="format"
              value={fmt.value}
              checked={selectedFormat === fmt.value}
              onChange={() => setSelectedFormat(fmt.value)}
              className="accent-primary"
            />
            <div>
              <span className="font-medium text-sm">{fmt.label}</span>
              <p className="text-xs text-gray-400">{fmt.desc}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          {t("cancel")}
        </button>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {exporting ? t("exporting") : t("export")}
        </button>
      </div>
    </Modal>
  );
}
