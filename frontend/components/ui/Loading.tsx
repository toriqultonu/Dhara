export default function Loading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-muted">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-primary rounded-full animate-bounce-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-[14px]">{text}</span>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gray-200 rounded animate-shimmer ${className}`} />
  );
}
