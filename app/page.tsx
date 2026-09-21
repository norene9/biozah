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
          <div className="home-container home-container--tight">
            <div className="home-cats-head">
               <h2></h2>
              <Link href="/products" className="home-cats-all">
                View all products
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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {categoryList.length > 0 && (
        <section className="home-container home-container--tight">
          <div className="home-cats-head">
            <h2>Shop by category</h2>
            <Link href="/categories" className="home-cats-all">
              View all
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
              <Link className="home-cat" href={`/categories/${category.slug}`} key={category.id}>
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
