import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "statute" | "judgment" | "sro" | "default";
}

const colors = {
  statute: "bg-blue-100 text-blue-800",
  judgment: "bg-purple-100 text-purple-800",
  sro: "bg-green-100 text-green-800",
  default: "bg-gray-100 text-gray-800",
};

export default function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full uppercase", colors[variant])}>
      {children}
    </span>
  );
}
