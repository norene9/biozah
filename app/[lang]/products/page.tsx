import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/store";
import { ShopFilters } from "@/components/shop-filters";
import { SortSelect } from "@/components/sort-select";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import "./products.css";

const PRICE_MAX = 10000;

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ category?: string; max?: string; sort?: string; search?: string }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const query = await searchParams;
  const [categoryList, allProducts] = await Promise.all([getCategories(), getProducts()]);
  const search = query.search?.trim().toLowerCase() ?? "";
  const activeCategory = query.category ?? "all";
  const maxPrice = query.max ? Number(query.max) : PRICE_MAX;
  const sort = query.sort ?? "featured";

  let products = allProducts.filter((product) => product.active);

  if (activeCategory !== "all") {
    products = products.filter((product) => product.category_id === activeCategory);
  }
  if (!Number.isNaN(maxPrice) && maxPrice < PRICE_MAX) {
    products = products.filter((product) => product.price <= maxPrice);
  }
   if (search) {
     products = products.filter((product) => product.name.toLowerCase().includes(search));
   }
  products = [...products].sort((a, b) => {
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    // "featured" (Best Selling) and "newest" both fall back to featured-first for now —
    // see the note below the file about why true "newest" needs one more field.
    return Number(b.featured) - Number(a.featured);
  });

  return (
    <main className="shop-page">
      {/* HERO */}
      <section className="shop-hero">
        <div className="shop-hero-content">
          <p className="eyebrow">{dict.shop.heroEyebrow}</p>
          <h1>{dict.shop.heroTitle}</h1>
          <p className="shop-hero-description">{dict.shop.heroSubtitle}</p>
          {/* <a href="#catalog" className="shop-circle-link">
            <span>{dict.shop.heroTitle}</span>
            <span>{dict.shop.allProducts}</span>
            <span className="shop-circle-arrow">↗</span>
          </a> */}
        </div>
        <div className="shop-hero-art">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="hero-orb hero-orb-three" />
        </div>
      </section>

      {/* CATALOG */}
      <section id="catalog" className="catalog-section">
        <div className="catalog-toolbar">
          <p className="catalog-count">
            {dict.shop.showing} <strong>{products.length}</strong>{" "}
            {products.length === 1 ? dict.shop.productSingular : dict.shop.productPlural}
          </p>
          {search && (
            <p className="catalog-search-note">
              {dict.shop.resultsFor} "{query.search}"
            </p>
          )}
          <SortSelect value={sort} dict={dict.shop} />
        </div>

        <div className="catalog-layout">
          <ShopFilters
            dict={dict.shop}
            categories={categoryList}
            activeCategory={activeCategory}
            maxPrice={maxPrice}
            priceCeiling={PRICE_MAX}
            totalCount={allProducts.filter((p) => p.active).length}
          />

          <div className="product-grid">
            {products.length === 0 ? (
              <p className="catalog-empty">{dict.shop.empty}</p>
            ) : (
              products.map((product) => <ProductCard key={product.id} product={product} locale={locale} dict={dict.product} />)
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

