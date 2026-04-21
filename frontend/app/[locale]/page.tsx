import { useTranslations } from "next-intl";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function HomePage() {
  const t  = useTranslations("common");
  const ts = useTranslations("search");
  const tf = useTranslations("features");

  const stats = [
    { value: "2,500+", label: "Acts & Ordinances" },
    { value: "50,000+", label: "Court Judgments" },
    { value: "2", label: "Languages" },
    { value: "< 2s", label: "Avg Response" },
  ];

  const features = [
    { icon: "⚡", key: "aiSearch",      color: "#D4A853" },
    { icon: "💬", key: "caseAnalysis",  color: "#2D7D46" },
    { icon: "📚", key: "bilingual",     color: "#1E3A5F" },
    { icon: "⚖️", key: "citations",    color: "#7C3AED" },
  ] as const;

  const steps = [
    { step: "01", title: "Ask your question",   desc: "Type in English or Bengali — AI understands both automatically." },
    { step: "02", title: "AI searches the law", desc: "We scan 2,500+ statutes and 50,000+ judgments using semantic search." },
    { step: "03", title: "Get cited answers",   desc: "Receive clear answers with exact citations you can verify." },
  ];

  return (
    <div className="bg-background">
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden text-center py-[88px] px-6"
        style={{ background: "linear-gradient(160deg, #142840 0%, #1E3A5F 60%, #1a4a7a 100%)" }}
      >
        {/* Subtle radial accents */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(212,168,83,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(45,125,70,0.08) 0%, transparent 50%)" }} />

        <div className="relative max-w-[760px] mx-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/15 rounded-full px-3.5 py-1 mb-7">
            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
            <span className="text-[12px] text-slate-300 font-medium tracking-wide">
              AI-Powered · Bilingual · Bangladesh Law
            </span>
          </div>

          <h1 className="text-[52px] font-extrabold text-white leading-[1.12] mb-4 tracking-tight">
            Bangladesh Legal Research,<br />
            <span className="text-accent">Powered by AI</span>
          </h1>

          <p className="text-[18px] text-slate-400 mb-9 leading-relaxed">
            Search 2,500+ Acts, 50,000+ Judgments — in English or Bengali.<br />
            Get cited AI answers in seconds.
          </p>

          {/* Search bar */}
          <div className="max-w-[640px] mx-auto mb-5">
            <div className="flex bg-white rounded-xl overflow-hidden shadow-search">
              <Link
                href="/search"
                className="flex-1 px-5 py-4 text-[15px] text-muted hover:text-foreground transition-colors"
              >
                {ts("placeholder")}
              </Link>
              <Link
                href="/search"
                className="bg-accent hover:bg-accent-dark text-primary font-bold text-[14px] px-6 flex items-center transition-colors"
              >
                {ts("startSearching")} →
              </Link>
            </div>
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-2 justify-center">
            {["Section 302 Penal Code", "Tenant eviction rights", "Divorce under Muslim law", "Land registration"].map((q) => (
              <Link
                key={q}
                href={`/search?q=${encodeURIComponent(q)}`}
                className="bg-white/[0.08] border border-white/15 rounded-full px-3.5 py-1 text-[12px] text-slate-300 hover:bg-white/[0.16] hover:text-white transition-all"
              >
                ↗ {q}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6 flex justify-center">
          {stats.map(({ value, label }, i) => (
            <div
              key={label}
              className={`px-12 py-7 text-center ${i < stats.length - 1 ? "border-r border-gray-200" : ""}`}
            >
              <div className="text-[26px] font-extrabold text-primary tracking-tight">{value}</div>
              <div className="text-[13px] text-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-[1200px] mx-auto px-6 py-[72px]">
        <div className="text-center mb-12">
          <h2 className="text-[34px] font-extrabold text-foreground tracking-tight mb-3">
            {tf("title")}
          </h2>
          <p className="text-[16px] text-muted max-w-[520px] mx-auto">
            From quick lookups to deep analysis — Dhara handles it all, bilingually.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon, key, color }) => (
            <Card key={key} className="p-6" hoverable>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: color + "1A" }}
              >
                {icon}
              </div>
              <h3 className="font-bold text-[15px] text-foreground mb-2">{tf(`${key}.title`)}</h3>
              <p className="text-[13px] text-muted leading-relaxed">{tf(`${key}.description`)}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-[30px] font-extrabold text-center text-foreground tracking-tight mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-[52px] h-[52px] bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-accent font-extrabold text-[15px]">
                  {step}
                </div>
                <h3 className="font-bold text-[16px] text-foreground mb-2">{title}</h3>
                <p className="text-[13px] text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="py-[72px] px-6 text-center"
        style={{ background: "linear-gradient(135deg, #1E3A5F 0%, #142840 100%)" }}
      >
        <h2 className="text-[34px] font-extrabold text-white tracking-tight mb-3">
          Start your free legal research
        </h2>
        <p className="text-[16px] text-slate-400 mb-8">No credit card required. Full access for 14 days.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button variant="accent" size="lg">
            <Link href="/register">Create Free Account →</Link>
          </Button>
          <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10 hover:text-white">
            <Link href="/search">Try Search</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
