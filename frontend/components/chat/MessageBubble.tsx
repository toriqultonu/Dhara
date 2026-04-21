import CitationLink from "./CitationLink";
import type { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-primary text-white px-4 py-2.5 rounded-[12px_12px_3px_12px] max-w-[480px] text-[14px] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  // ── Legal memo style for AI responses ──
  const memoRef = `REF-${message.id.slice(-4).toUpperCase()}`;
  const title = `Legal Analysis — ${message.content.slice(0, 48)}${message.content.length > 48 ? "…" : ""}`;

  return (
    <div className="flex justify-start">
      <div className="max-w-[680px] w-full">
        <div className="bg-white border-[1.5px] border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {/* Memo header */}
          <div className="bg-primary px-5 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-accent font-bold tracking-widest uppercase mb-1">
                Legal Analysis Memo
              </p>
              <p className="text-[13px] text-white font-semibold">{title}</p>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">{memoRef}</span>
          </div>

          {/* Memo body */}
          <div className="px-6 py-5">
            {message.content.split("\n\n").map((para, i) => (
              <p key={i} className="text-[14px] text-foreground leading-[1.75] mb-3 last:mb-0">
                {para}
              </p>
            ))}

            {/* Citations */}
            {message.citations && message.citations.length > 0 && (
              <div className="mt-5 pt-4 border-t-[1.5px] border-gray-200">
                <p className="text-[11px] font-bold text-muted tracking-widest uppercase mb-3">
                  Sources &amp; Citations
                </p>
                <div className="space-y-2">
                  {message.citations.map((c, i) => (
                    <CitationLink key={i} citation={c} index={i + 1} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
