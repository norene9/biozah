"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const current = pathname.split("/")[1];

  function switchTo(locale: Locale) {
    const segments = pathname.split("/");
    segments[1] = locale;
    const query = searchParams.toString();
    router.push(segments.join("/") + (query ? `?${query}` : ""));
  }

  return (
    <div className="language-switcher">
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          className={locale === current ? "language-option active" : "language-option"}
          aria-pressed={locale === current}
          onClick={() => switchTo(locale)}
        >
          {localeNames[locale]}
        </button>
      ))}
    </div>
  );
}