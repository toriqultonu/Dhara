import Link from "next/link";

export default function Footer() {
  const sections = [
    {
      title: "Product",
      links: [
        { label: "Search", href: "/search" },
        { label: "Ask AI", href: "/ask" },
        { label: "Statutes", href: "/statutes" },
        { label: "Judgments", href: "/judgments" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Pricing", href: "/pricing" },
        { label: "Blog", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Use", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Disclaimer", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-[#142840] text-white pt-12 pb-8">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              {/* Inverted logo: gold background, navy letter */}
              <div className="w-[34px] h-[34px] bg-accent rounded-[9px] flex items-center justify-center shrink-0">
                <span className="text-primary font-extrabold text-[17px]">ধ</span>
              </div>
              <span className="font-extrabold text-[17px]">Dhara</span>
            </div>
            <p className="text-[13px] text-slate-400 leading-relaxed max-w-[220px]">
              AI flowing through the law. Bangladesh&apos;s first AI-powered legal research platform.
            </p>
          </div>

          {/* Link columns */}
          {sections.map((sec) => (
            <div key={sec.title}>
              <h4 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-3.5">
                {sec.title}
              </h4>
              <ul className="space-y-2.5">
                {sec.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-slate-400 hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="text-[12px] text-slate-500">
            &copy; 2026 Dhara Technologies Ltd. All rights reserved.
          </span>
          <span className="text-[12px] text-slate-500 font-bengali">
            ধারা — আইনের ধারায় AI
          </span>
        </div>
      </div>
    </footer>
  );
}
