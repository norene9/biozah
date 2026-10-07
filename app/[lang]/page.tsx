import Image from "next/image";
import Link from "next/link";
import { getCategories, getProducts, pickRandom } from "@/lib/store";
import { ProductCard } from "@/components/product-card";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/locale-path";
import type { Locale } from "@/lib/i18n/config";
import "../styles/home.css";
export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const [categoryList, productList] = await Promise.all([getCategories(), getProducts()]);
  const featuredProducts = productList.filter((product) => product.featured);
  const hasFeatured = featuredProducts.length > 0;
  const displayedProducts = hasFeatured ? featuredProducts : pickRandom(productList, 8);
  return (
    <main className="home">
      <section className="home-hero">
        <div className="home-hero-media" aria-hidden="true">
          <Image
            src="/images/hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="home-hero-img"
          />
        </div>
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <h1>
              {dict.home.heroTitle1}
              <br />
              {dict.home.heroTitle2}
            </h1>
            <p>{dict.home.heroSubtitle}</p>
            <Link href={localePath(locale, "/products")} className="button button-dark">
              {dict.home.exploreNow} <span aria-hidden="true">›</span>
            </Link>
          </div>

          <ul className="home-hero-features">
            {dict.home.features.map((feature) => (
              <li key={feature.title}>
                <strong>{feature.title}</strong>
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="hero-art">
          <span className="hero-note">{dict.home.heroNote}</span>
        </div>
      </section>
      {displayedProducts.length > 0 && (
        <section className="home-container">
          <div className="home-heading">
            <h2>{hasFeatured ? dict.home.bestSelling : dict.home.ourProducts}</h2>
            <p>
              {hasFeatured ? dict.home.bestSellingSub : dict.home.ourProductsSub}
            </p>
          </div>
          <div className="home-container home-container--tight">
            <div className="home-cats-head">
               <h2></h2>
              <Link href={localePath(locale, "/products")} className="home-cats-all">
                {dict.home.viewAllProducts}
                <span className="home-cats-arrow" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
          <div className="home-product-grid">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} dict={dict.product} />
            ))}
          </div>
        </section>
      )}

      {categoryList.length > 0 && (
        <section className="home-container home-container--tight">
          <div className="home-cats-head">
            <h2>{dict.home.shopByCategory}</h2>
            <Link href={localePath(locale, "/categories")} className="home-cats-all">
              {dict.home.viewAll}
              <span className="home-cats-arrow" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          </div>

          <div className="home-cats">
            {categoryList.map((category) => (
              <Link className="home-cat" href={localePath(locale, `/categories/${category.slug}`)} key={category.id}>
                <span className="home-cat-arch">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 150px, 190px"
                      className="home-cat-img"
                    />
                  ) : (
                    <span className="home-cat-placeholder" aria-hidden="true">
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="home-cat-name">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
