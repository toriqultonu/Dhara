export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border-[1.5px] border-gray-200 rounded-xl px-5 py-3.5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-muted">Analysing law</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-[5px] h-[5px] bg-primary rounded-full animate-bounce-dot"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
