import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div className={cn("p-6 bg-white rounded-lg shadow-md border border-gray-100", className)}>
      {children}
    </div>
  );
}
