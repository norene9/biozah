import "./globals.css";
import type { Metadata } from "next";
import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import { getCurrentAdmin } from "@/lib/firebase/server";

export const metadata: Metadata = {
  title: { default: "biozah | Skin, body and beauty rituals", template: "%s | biozah" },
  description: "Thoughtful beauty essentials for your everyday ritual.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const isAdmin = Boolean(await getCurrentAdmin());
  return <html lang="en"><body><CartProvider><SiteHeader isAdmin={isAdmin} />{children}<footer className="footer"><div><span className="brand"><span className="brand-mark">b</span> biozah</span><p>Small rituals. Real comfort.</p></div><div><p className="eyebrow">Need help?</p><p>hello@biozah.store<br />Algiers, Algeria</p></div><div><p className="eyebrow">Good to know</p><p>Delivery across Algeria<br />Cash on delivery available</p></div></footer></CartProvider></body></html>;
}
