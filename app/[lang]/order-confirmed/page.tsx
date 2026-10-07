import Link from "next/link";
import { localePath } from "@/lib/i18n/locale-path";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import "./page.css"
export default async function OrderConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const { order } = await searchParams;

  return (
    <main className="confirmation-page">
      <section className="confirmation">
        <div className="confirmation-mark">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        </div>

        <p className="confirmation-eyebrow">
          {dict.order.eyebrow}
        </p>

        <h1>{dict.order.title}</h1>

        <p className="confirmation-text">
          {order ? `№ ${order} — ` : ""}{order ? dict.order.received : `${dict.order.onItsWay}. ${dict.order.received}`}
        </p>

        {order && (
          <p className="confirmation-number">
            {dict.order.orderNumber}&nbsp; · &nbsp;{order}
          </p>
        )}

        <Link
          href={localePath(locale, "/products")}
          className="confirmation-button"
        >
          {dict.order.returnToStore}
          <span>↗</span>
        </Link>
      </section>
    </main>
  );
}
