"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export function useToast(): ToastContextType {
  return useContext(ToastContext);
}

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-white border-green-200 text-foreground",
  error: "bg-white border-red-200 text-foreground",
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: (
    <span className="w-5 h-5 rounded-full bg-green-50 text-secondary flex items-center justify-center text-[12px] font-bold shrink-0">
      ✓
    </span>
  ),
  error: (
    <span className="w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-[12px] font-bold shrink-0">
      !
    </span>
  ),
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-[110] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-center gap-2.5 max-w-[360px] px-4 py-3 rounded-lg border-[1.5px] shadow-card-hover text-[13px] font-medium page-enter",
              variantStyles[t.variant]
            )}
          >
            {variantIcons[t.variant]}
            <span dir="auto" className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted hover:text-foreground transition-colors shrink-0"
              aria-label="✕"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
