import Link from "next/link";
import "./page.css"
export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
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
          Thank you
        </p>

        <h1>Order confirmed.</h1>

        <p className="confirmation-text">
          Your order{" "}
          <strong>{order ?? "is on its way"}</strong>{" "}
          has been received. We&apos;ll be in touch shortly
          to confirm your delivery details.
        </p>

        {order && (
          <p className="confirmation-number">
            Order number&nbsp; · &nbsp;{order}
          </p>
        )}

        <Link
          href="/products"
          className="confirmation-button"
        >
          Return to the store
          <span>↗</span>
        </Link>
      </section>
    </main>
  );
}
