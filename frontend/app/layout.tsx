import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoBengali = Noto_Sans_Bengali({ subsets: ["bengali"], variable: "--font-bengali" });

export const metadata: Metadata = {
  title: "ধারা (Dhara) — AI-Powered Legal Research for Bangladesh",
  description:
    "AI-powered legal research platform for Bangladeshi lawyers and law students.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html lang="bn" className={`${inter.variable} ${notoBengali.variable}`}>
      <body className="min-h-screen flex flex-col font-sans">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
