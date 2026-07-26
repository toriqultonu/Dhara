import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import AuthProvider from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const locales = ["bn", "en"];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <ToastProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ToastProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
