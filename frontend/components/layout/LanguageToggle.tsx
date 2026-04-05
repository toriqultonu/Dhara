"use client";

import { useState } from "react";

export default function LanguageToggle() {
  const [locale, setLocale] = useState("bn");

  const toggle = () => {
    const next = locale === "bn" ? "en" : "bn";
    setLocale(next);
    // TODO: Integrate with next-intl router to actually switch locale
  };

  return (
    <button
      onClick={toggle}
      className="text-xs border border-white/30 px-2 py-1 rounded hover:bg-white/10 transition-colors"
    >
      {locale === "bn" ? "EN" : "বাং"}
    </button>
  );
}
