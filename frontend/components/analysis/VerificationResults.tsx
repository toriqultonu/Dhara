"use client";

import { useTranslations } from "next-intl";
import type { VerifyResponse, VerifyItem } from "@/lib/types";

interface VerificationResultsProps {
  result: VerifyResponse;
}

function VerifyItemCard({ item, type }: { item: VerifyItem; type: "valid" | "warning" | "issue" }) {
  const styles = {
    valid: { border: "border-green-200", bg: "bg-green-50", badge: "bg-green-100 text-green-700", icon: "✅" },
    warning: { border: "border-yellow-200", bg: "bg-yellow-50", badge: "bg-yellow-100 text-yellow-700", icon: "⚠️" },
    issue: { border: "border-red-200", bg: "bg-red-50", badge: "bg-red-100 text-red-700", icon: "❌" },
  }[type];

  return (
    <div className={`border rounded-lg p-4 ${styles.border} ${styles.bg}`}>
      <div className="flex items-start gap-2 mb-2">
        <span>{styles.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-gray-800">{item.section}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${styles.badge}`}>{item.law}</span>
          </div>
          <p className="text-xs text-gray-600 italic mb-2">"{item.text}"</p>
          <p className="text-xs text-gray-700 leading-relaxed">{item.suggestion}</p>
          <p className="text-xs text-gray-400 mt-1">{item.lawSection}</p>
        </div>
      </div>
    </div>
  );
}

export default function VerificationResults({ result }: VerificationResultsProps) {
  const t = useTranslations("analysis");

  return (
    <div>
      {/* Summary counts */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{result.summary.valid}</p>
          <p className="text-sm text-green-700 mt-1">{t("compliant")}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{result.summary.warnings}</p>
          <p className="text-sm text-yellow-700 mt-1">{t("warnings")}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{result.summary.issues}</p>
          <p className="text-sm text-red-700 mt-1">{t("issues")}</p>
        </div>
      </div>

      {/* Detailed results */}
      {result.results.issues.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-red-700 mb-3">🚨 {t("issuesFound")}</h3>
          <div className="space-y-3">
            {result.results.issues.map((item, i) => (
              <VerifyItemCard key={i} item={item} type="issue" />
            ))}
          </div>
        </div>
      )}

      {result.results.warnings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-yellow-700 mb-3">⚠️ {t("warningsFound")}</h3>
          <div className="space-y-3">
            {result.results.warnings.map((item, i) => (
              <VerifyItemCard key={i} item={item} type="warning" />
            ))}
          </div>
        </div>
      )}

      {result.results.valid.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-green-700 mb-3">✅ {t("compliantClauses")}</h3>
          <div className="space-y-3">
            {result.results.valid.map((item, i) => (
              <VerifyItemCard key={i} item={item} type="valid" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
