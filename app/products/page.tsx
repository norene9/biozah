import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/store";
import { ShopFilters } from "@/components/shop-filters";
import { SortSelect } from "@/components/sort-select";
import "./products.css";

const PRICE_MAX = 10000;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; max?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const [categoryList, allProducts] = await Promise.all([getCategories(), getProducts()]);

  const activeCategory = params.category ?? "all";
  const maxPrice = params.max ? Number(params.max) : PRICE_MAX;
  const sort = params.sort ?? "featured";

  let products = allProducts.filter((product) => product.active);

  if (activeCategory !== "all") {
    products = products.filter((product) => product.category_id === activeCategory);
  }
  if (!Number.isNaN(maxPrice) && maxPrice < PRICE_MAX) {
    products = products.filter((product) => product.price <= maxPrice);
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
          <p className="eyebrow">Beauty, thoughtfully selected</p>
          <h1>SHOP</h1>
          <p className="shop-hero-description">Discover products designed for your daily ritual.</p>
          <a href="#catalog" className="shop-circle-link">
            <span>Shop</span>
            <span>All Products</span>
            <span className="shop-circle-arrow">↗</span>
          </a>
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
            Showing <strong>{products.length}</strong> product{products.length === 1 ? "" : "s"}
          </p>
          <SortSelect value={sort} />
        </div>

        <div className="catalog-layout">
          <ShopFilters
            categories={categoryList}
            activeCategory={activeCategory}
            maxPrice={maxPrice}
            priceCeiling={PRICE_MAX}
            totalCount={allProducts.filter((p) => p.active).length}
          />

          <div className="product-grid">
            {products.length === 0 ? (
              <p className="catalog-empty">No products match these filters.</p>
            ) : (
              products.map((product) => <ProductCard key={product.id} product={product} />)
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
