import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getFirestoreCategoryBySlug, getFirestoreProductsByCategory } from "@/lib/firestore";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/locale-path";
import type { Locale } from "@/lib/i18n/config";
import "./category.css";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>;
}) {
  const { slug, lang } = await params;
  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const category = await getFirestoreCategoryBySlug(slug);
  if (!category) notFound();

  const products = (await getFirestoreProductsByCategory(category.id)).filter((p) => p.active);

  return (
    <main className="category-page">
      <section className="category-hero">
        {category.image_url && (
          <div className="category-hero-media" aria-hidden="true">
            <Image src={category.image_url} alt="" fill sizes="100vw" className="category-hero-img" />
          </div>
        )}
        <div className="category-hero-content">
          <Link href={localePath(locale, "/categories")} className="category-back">← All collections</Link>
          <h1>{category.name}</h1>
          {category.description && <p>{category.description}</p>}
          <p className="category-count">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      <section className="product-grid category-product-grid">
        {products.length === 0 ? (
          <p className="catalog-empty">No products in this collection yet.</p>
        ) : (
          products.map((product) => <ProductCard key={product.id} product={product} locale={locale} dict={dict.product} />)
        )}
      </section>
    </main>
  );
}
