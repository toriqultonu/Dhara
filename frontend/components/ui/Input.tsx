import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: React.ReactNode;
}

export default function Input({ label, error, suffix, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-medium text-foreground">{label}</label>
      )}
      <div
        className={cn(
          "flex items-center bg-white border-[1.5px] rounded-lg transition-all duration-150",
          "focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/10",
          error ? "border-red-400" : "border-gray-200"
        )}
      >
        <input
          dir="auto"
          className={cn(
            "flex-1 px-3.5 py-2.5 text-[14px] text-foreground bg-transparent border-none outline-none placeholder:text-muted",
            className
          )}
          {...props}
        />
        {suffix && <span className="px-3 text-muted">{suffix}</span>}
      </div>
      {error && <p className="text-red-500 text-[12px]">{error}</p>}
    </div>
  );
}
