
import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts, pickRandom } from "@/lib/store";

import "./products.css"
export default async function ProductsPage() {
  const products = (await getProducts()).filter((product) => product.active);
  const [categoryList, productList] = await Promise.all([getCategories(), getProducts()]);

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
            Showing <strong>{products.length}</strong> products
          </p>

          <label className="catalog-sort">
            <span>Sort by</span>

            <select defaultValue="featured">
              <option value="featured">Best Selling</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </label>
        </div>

        <div className="catalog-layout">
          {/* SIDEBAR */}
          <aside className="catalog-sidebar">
            <div className="filter-block">
              <div className="filter-title">
                <span>Categories</span>
                <span>−</span>
              </div>

              <label className="filter-option">
                <input type="radio" name="category" defaultChecked />
                <span>All Products</span>
                <small>{products.length}</small>
              </label>
              {categoryList.map((category) => (
                <label className="filter-option">
                  <input type="radio" name="category" />
                  <span>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</span>
                </label>
              ))}
            </div>

            <div className="filter-block">
              <div className="filter-title">
                <span>Price Range</span>
                <span>−</span>
              </div>

              <input className="price-range" type="range" min="0" max="200" defaultValue="120" />

              <div className="price-labels">
                <span>0DA</span>
                <span>10000DA</span>
              </div>
            </div>

            {/* <div className="filter-block">
              <div className="filter-title">
                <span>Skin Type</span>
                <span>−</span>
              </div>

              <label className="filter-checkbox">
                <input type="checkbox" />
                All Skin Types
              </label>

              <label className="filter-checkbox">
                <input type="checkbox" />
                Dry
              </label>

              <label className="filter-checkbox">
                <input type="checkbox" />
                Oily
              </label>

              <label className="filter-checkbox">
                <input type="checkbox" />
                Sensitive
              </label>
            </div> */}
          </aside>

          {/* PRODUCTS */}
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
