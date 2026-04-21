import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  full?: boolean;
}

const variants = {
  primary:   "bg-primary text-white hover:bg-primary-light active:bg-primary-dark",
  secondary: "bg-secondary text-white hover:bg-secondary-light active:bg-secondary-dark",
  accent:    "bg-accent text-primary hover:bg-accent-dark font-semibold",
  outline:   "border-[1.5px] border-primary text-primary hover:bg-blue-50",
  ghost:     "text-muted hover:bg-gray-100",
};

const sizes = {
  sm: "px-3.5 py-1.5 text-[13px]",
  md: "px-5 py-2.5 text-[14px]",
  lg: "px-8 py-3 text-[15px]",
};

export default function Button({
  variant = "primary",
  size = "md",
  full,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        full && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
