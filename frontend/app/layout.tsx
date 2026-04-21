import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dhara — AI Legal Research for Bangladesh",
  description: "Search 2,500+ Acts and 50,000+ Court Judgments in English or Bengali.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
