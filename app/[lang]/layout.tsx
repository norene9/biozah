import "../globals.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CartProvider } from "@/components/cart-provider";
import { LayoutShell } from "./layout-shell";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { locales, rtlLocales, type Locale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: { default: "biozah | Skin, body and beauty rituals", template: "%s | biozah" },
  description: "Thoughtful beauty essentials for your everyday ritual.",
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!locales.includes(lang as Locale)) notFound();
  const locale = lang as Locale;
  const dir = rtlLocales.includes(locale) ? "rtl" : "ltr";
  const dict = await getDictionary(locale);
  const isAdmin = Boolean(await getCurrentAdmin());
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={isAdmin ? "admin-shell" : undefined}>
        <CartProvider>
          <LayoutShell isAdmin={isAdmin} locale={locale} dict={dict.header}>
            {children}
          </LayoutShell>
          <footer className="footer">
            <div>
              <span className="brand">
                <span className="brand-mark">b</span> biozah
              </span>
              <p>{dict.footer.tagline}</p>
            </div>
            <div>
              <p className="eyebrow">{dict.footer.needHelp}</p>
              <p>
                hello@biozah.store
                <br />
                Algiers, Algeria
              </p>
            </div>
            <div>
              <p className="eyebrow">{dict.footer.goodToKnow}</p>
              <p>
                {dict.footer.delivery}
                <br />
                {dict.footer.cod}
              </p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
