import CitationLink from "./CitationLink";
import type { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] px-4 py-3 rounded-lg ${isUser ? "bg-primary text-white" : "bg-gray-100 text-foreground"}`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.citations && message.citations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
            {message.citations.map((c, i) => (
              <CitationLink key={i} citation={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
