"use client";

import Link from "next/link";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-64 bg-white h-full shadow-lg p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted">&#10005;</button>
        <nav className="mt-8 space-y-4">
          <Link href="/search" className="block text-foreground" onClick={onClose}>Search</Link>
          <Link href="/ask" className="block text-foreground" onClick={onClose}>Ask AI</Link>
          <Link href="/statutes" className="block text-foreground" onClick={onClose}>Statutes</Link>
          <Link href="/judgments" className="block text-foreground" onClick={onClose}>Judgments</Link>
          <Link href="/pricing" className="block text-foreground" onClick={onClose}>Pricing</Link>
        </nav>
      </div>
    </div>
  );
}
