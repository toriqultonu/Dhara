import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
}

export default function Select({ label, error, options, className, children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-medium text-foreground">{label}</label>
      )}
      <div
        className={cn(
          "relative flex items-center bg-white border-[1.5px] rounded-lg transition-all duration-150",
          "focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/10",
          error ? "border-red-400" : "border-gray-200"
        )}
      >
        <select
          className={cn(
            "flex-1 appearance-none px-3.5 py-2.5 pr-9 text-[14px] text-foreground bg-transparent border-none outline-none cursor-pointer",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <svg
          className="absolute right-3 w-4 h-4 text-muted pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {error && <p className="text-red-500 text-[12px]">{error}</p>}
    </div>
  );
}
