
import { cache } from "react";
import { defaultLocale, locales, type Locale } from "./config";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  ar: () => import("./dictionaries/ar.json").then((m) => m.default),
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

export const getDictionary = cache(async (locale: Locale): Promise<Dictionary> => {
  const loader = dictionaries[locales.includes(locale) ? locale : defaultLocale];
  return loader();
});