import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, hoverable = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-card transition-all duration-200",
        hoverable && "hover:border-primary/20 hover:shadow-card-hover cursor-pointer hover:-translate-y-px",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
