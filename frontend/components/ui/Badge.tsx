import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "statute" | "judgment" | "sro" | "active" | "repealed" | "criminal" | "civil" | "family" | "commercial" | "default";
  className?: string;
}

const colors: Record<string, string> = {
  statute:    "bg-blue-50 text-blue-700 border border-blue-200",
  judgment:   "bg-orange-50 text-orange-700 border border-orange-200",
  sro:        "bg-violet-50 text-violet-700 border border-violet-200",
  active:     "bg-green-50 text-green-700 border border-green-200",
  repealed:   "bg-gray-50 text-gray-500 border border-gray-200",
  criminal:   "bg-red-50 text-red-700 border border-red-200",
  civil:      "bg-blue-50 text-blue-700 border border-blue-200",
  family:     "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200",
  commercial: "bg-amber-50 text-amber-700 border border-amber-200",
  default:    "bg-gray-100 text-gray-600 border border-gray-200",
};

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md uppercase tracking-wide whitespace-nowrap",
        colors[variant] ?? colors.default,
        className
      )}
    >
      {children}
    </span>
  );
}
