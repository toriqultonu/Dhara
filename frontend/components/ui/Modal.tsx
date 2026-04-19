"use client";

interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ open, isOpen, onClose, title, children }: ModalProps) {
  if (!open && !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {title && <h2 className="text-lg font-semibold mb-4 pr-8">{title}</h2>}
        <button onClick={onClose} className="absolute top-3 right-3 text-muted hover:text-foreground">&#10005;</button>
        {children}
      </div>
    </div>
  );
}
