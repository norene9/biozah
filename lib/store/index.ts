import { unstable_cache } from "next/cache";
import { getFirestoreCategories, getFirestoreCategoryBySlug, getFirestoreProductBySlug, getFirestoreProducts, getFirestoreProductsByCategory } from "@/lib/firestore";
import type { Category, Product } from "@/types/store";

const readCategories = async (): Promise<Category[]> => getFirestoreCategories();
const readProducts = async (): Promise<Product[]> => getFirestoreProducts();

export const getCategories = unstable_cache(readCategories, ["firestore-categories"], { revalidate: 60 });
export const getProducts = unstable_cache(readProducts, ["firestore-products"], { revalidate: 60 });
export const getProductBySlug = getFirestoreProductBySlug;
export const getCategoryBySlug = getFirestoreCategoryBySlug;
export async function getProductsByCategory(slug: string) { const category = await getCategoryBySlug(slug); return category ? getFirestoreProductsByCategory(category.id) : []; }
export async function getCategoryName(id: string) { return (await getFirestoreCategories()).find((category) => category.id === id)?.name ?? "Collection"; }
