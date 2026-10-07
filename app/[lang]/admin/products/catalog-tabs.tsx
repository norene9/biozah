import Link from "next/link";

export function CatalogTabs({ active }: { active: "products" | "collections" }) {
  return (
    <nav className="catalog-tabs" aria-label="Catalogue sections">
      <Link className={active === "products" ? "active" : ""} href="/admin/products">
        Products
      </Link>
      <Link
        className={active === "collections" ? "active" : ""}
        href="/admin/products?view=collections"
      >
        Collections
      </Link>
    </nav>
  );
}
