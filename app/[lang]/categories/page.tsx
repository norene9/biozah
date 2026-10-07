import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/store";
import { localePath } from "@/lib/i18n/locale-path";
import type { Locale } from "@/lib/i18n/config";
import "./categories.css";

export default async function CategoriesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const categories = await getCategories();

  return (
    <main className="categories-page">
      <section className="page-intro">
        <p className="eyebrow">Explore</p>
        <h1>Find your kind of care.</h1>
        <p>Start with what your skin, body or mood is asking for today.</p>
      </section>

      <section className="catalog">
        {categories.length === 0 ? (
          <p className="catalog-empty">No collections yet.</p>
        ) : (
          <div className="category-grid">
            {categories.map((category) => (
              <Link className="category-tile" href={localePath(locale, `/categories/${category.slug}`)} key={category.id}>
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
                    className="category-tile-img"
                  />
                ) : (
                  <span className="category-tile-placeholder" aria-hidden="true">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="category-tile-overlay">
                  <h3>{category.name}</h3>
                  {category.description && <p>{category.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
