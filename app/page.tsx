import Image from "next/image";
import Link from "next/link";
import { getCategories, getProducts, pickRandom } from "@/lib/store";
import { ProductCard } from "@/components/product-card";
import "./home.css";
const heroFeatures = [
  { title: "Gentle by design", text: "Formulas made for everyday skin." },
  { title: "Natural ingredients", text: "Simple, well-chosen actives." },
  { title: "Made to be used daily", text: "Light textures that fit your routine." },
];
export default async function Home() {
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
              Timeless beauty,
              <br />
              naturally you.
            </h1>
            <p>Thoughtful skincare powered by nature and science.</p>
            <Link href="/products" className="button button-dark">
              Explore now <span aria-hidden="true">›</span>
            </Link>
          </div>

          <ul className="home-hero-features">
            {heroFeatures.map((feature) => (
              <li key={feature.title}>
                <strong>{feature.title}</strong>
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="hero-art">
          <span className="hero-note">Quietly effective.</span>
        </div>
      </section>
      {displayedProducts.length > 0 && (
        <section className="home-container">
          <div className="home-heading">
            <h2>{hasFeatured ? "Our best-selling skincare" : "Our products"}</h2>
            <p>
              {hasFeatured
                ? "Carefully crafted formulas loved by our customers for visible, natural results."
                : "Carefully crafted formulas for visible, natural results."}
            </p>
          </div>
          <div className="home-product-grid">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="home-more">
            <Link href="/products" className="text-link">
              View all products
            </Link>
          </div>
        </section>
      )}

      {categoryList.length > 0 && (
        <section className="home-container home-container--tight">
          <div className="home-heading">
            <h2>Shop by feeling</h2>
            <p>Find the ritual that suits your skin today.</p>
          </div>
          <div className="category-grid">
            {categoryList.map((category) => (
              <Link
                className="category-tile"
                href={`/categories/${category.slug}`}
                key={category.id}
                style={{ backgroundImage: `url(${category.image_url})` }}
              >
                <div>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="home-more">
            <Link href="/categories" className="text-link">
              View all collections
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
