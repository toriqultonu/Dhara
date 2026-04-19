"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import DocumentUploadZone from "@/components/analysis/DocumentUploadZone";
import AnalysisChat from "@/components/analysis/AnalysisChat";
import VerificationResults from "@/components/analysis/VerificationResults";
import type { AnalysisUploadResponse, VerifyResponse } from "@/lib/types";

type Tab = "analyze" | "verify" | "library";

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("dhara_auth");
    return raw ? JSON.parse(raw).token : null;
  } catch {
    return null;
  }
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const BD_LAWS = [
  { title: "The Constitution of Bangladesh", year: 1972, category: "constitution", icon: "📜" },
  { title: "Penal Code", year: 1860, category: "criminal", icon: "⚖️" },
  { title: "Code of Criminal Procedure", year: 1898, category: "criminal", icon: "🔏" },
  { title: "Contract Act", year: 1872, category: "civil", icon: "📋" },
  { title: "Muslim Family Laws Ordinance", year: 1961, category: "family", icon: "👨‍👩‍👧" },
  { title: "Transfer of Property Act", year: 1882, category: "property", icon: "🏠" },
  { title: "Bangladesh Labour Act", year: 2006, category: "labor", icon: "👷" },
  { title: "Companies Act", year: 1994, category: "commercial", icon: "🏢" },
  { title: "Evidence Act", year: 1872, category: "civil", icon: "📑" },
  { title: "Specific Relief Act", year: 1877, category: "civil", icon: "⚡" },
  { title: "Succession Act", year: 1925, category: "civil", icon: "📰" },
  { title: "Registration Act", year: 1908, category: "property", icon: "🗂️" },
];

const CATEGORY_COLORS: Record<string, string> = {
  constitution: "bg-amber-100 text-amber-700",
  criminal: "bg-red-100 text-red-700",
  civil: "bg-blue-100 text-blue-700",
  family: "bg-pink-100 text-pink-700",
  property: "bg-green-100 text-green-700",
  labor: "bg-orange-100 text-orange-700",
  commercial: "bg-teal-100 text-teal-700",
};

export default function AnalysisPage() {
  const t = useTranslations("analysis");
  const [activeTab, setActiveTab] = useState<Tab>("analyze");
  const [uploadedSession, setUploadedSession] = useState<AnalysisUploadResponse | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [docType, setDocType] = useState("employment");
  const [libraryFilter, setLibraryFilter] = useState("");

  const token = typeof window !== "undefined" ? getToken() : null;

  const handleVerifyUpload = async (file: File) => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API}/api/analysis/verify?documentType=${docType}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const json = await res.json();
      if (json.success) setVerifyResult(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  const filteredLaws = BD_LAWS.filter((law) =>
    libraryFilter === "" || law.category === libraryFilter
  );

  const TABS: { key: Tab; label: string }[] = [
    { key: "analyze", label: t("tabAnalyze") },
    { key: "verify", label: t("tabVerify") },
    { key: "library", label: t("tabLibrary") },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted">{t("subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Upload & Analyze */}
      {activeTab === "analyze" && (
        <div>
          {!uploadedSession ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">{t("analyzeHint")}</p>
              <DocumentUploadZone token={token} onUploadComplete={setUploadedSession} />
            </div>
          ) : (
            <div className="flex flex-col h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t("chatTitle")}</h2>
                <button
                  onClick={() => setUploadedSession(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← {t("uploadAnother")}
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <AnalysisChat session={uploadedSession} token={token} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Verify Document */}
      {activeTab === "verify" && (
        <div>
          {!verifyResult ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">{t("verifyHint")}</p>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium text-gray-700">{t("documentType")}:</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="employment">Employment Contract</option>
                  <option value="lease">Lease Agreement</option>
                  <option value="nda">NDA</option>
                  <option value="contract">General Contract</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div
                className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer hover:border-gray-300 bg-gray-50"
                onClick={() => {
                  const input = window.document.createElement("input");
                  input.type = "file";
                  input.accept = ".pdf,.doc,.docx,.txt";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleVerifyUpload(file);
                  };
                  input.click();
                }}
              >
                <div className="text-4xl mb-3">{verifying ? "⏳" : "🔍"}</div>
                <p className="text-base font-medium text-gray-700">
                  {verifying ? t("verifying") : t("dropToVerify")}
                </p>
                <p className="text-sm text-gray-400 mt-1">{t("supportedFormats")}</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t("verifyResults")}</h2>
                <button
                  onClick={() => setVerifyResult(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← {t("verifyAnother")}
                </button>
              </div>
              <VerificationResults result={verifyResult} />
            </div>
          )}
        </div>
      )}

      {/* Tab: BD Legal Library */}
      {activeTab === "library" && (
        <div>
          <p className="text-sm text-gray-600 mb-4">{t("libraryHint")}</p>

          <div className="flex flex-wrap gap-2 mb-5">
            {["", "constitution", "criminal", "civil", "family", "property", "labor", "commercial"].map((cat) => (
              <button
                key={cat}
                onClick={() => setLibraryFilter(cat)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  libraryFilter === cat
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {cat === "" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLaws.map((law) => (
              <div
                key={law.title}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{law.icon}</span>
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[law.category] ?? "bg-gray-100 text-gray-600"}`}>
                      {law.category}
                    </span>
                    <h3 className="text-sm font-semibold text-gray-900 mt-1">{law.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{law.year}</p>
                  </div>
                </div>
                <a
                  href={`/statutes?search=${encodeURIComponent(law.title)}`}
                  className="mt-3 block text-xs text-primary hover:underline"
                >
                  {t("viewInStatutes")} →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
