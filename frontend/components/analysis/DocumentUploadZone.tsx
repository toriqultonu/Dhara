"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import type { AnalysisUploadResponse } from "@/lib/types";

interface DocumentUploadZoneProps {
  token: string | null;
  onUploadComplete: (result: AnalysisUploadResponse) => void;
}

export default function DocumentUploadZone({ token, onUploadComplete }: DocumentUploadZoneProps) {
  const t = useTranslations("analysis");
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (file.size > 10 * 1024 * 1024) {
      setError(t("fileTooLarge"));
      return;
    }
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
      setError(t("unsupportedType"));
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/analysis/upload`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      );

      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      if (json.success) onUploadComplete(json.data);
      else throw new Error(json.error || "Upload failed");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("uploadError"));
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:border-gray-300 bg-gray-50"
      } ${uploading ? "cursor-wait" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={onInputChange}
      />

      <div className="text-4xl mb-3">{uploading ? "⏳" : "📄"}</div>
      <p className="text-base font-medium text-gray-700 mb-1">
        {uploading ? t("uploading") : t("dropFile")}
      </p>
      <p className="text-sm text-gray-400">
        {t("supportedFormats")} · {t("maxSize")}
      </p>

      {error && (
        <p className="mt-3 text-sm text-red-500 bg-red-50 rounded px-3 py-2">{error}</p>
      )}

      {!uploading && (
        <button className="mt-4 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">
          {t("browseFiles")}
        </button>
      )}
    </div>
  );
}
