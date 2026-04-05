export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 px-4 py-3 rounded-lg flex gap-1">
        <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
