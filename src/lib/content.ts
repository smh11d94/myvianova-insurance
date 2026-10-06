import { getCollection, type CollectionEntry } from 'astro:content';
import { categories, type Category, type ProductSlug } from '../data/catalog';
import type { Locale } from '../i18n/config';

export type ProductEntry = CollectionEntry<'products'> & { slug: ProductSlug };

/** Products for a locale, sorted by category then order. Falls back to English for missing translations. */
export async function getProducts(locale: Locale): Promise<ProductEntry[]> {
  const all = await getCollection('products');
  const bySlug = new Map<string, ProductEntry>();
  for (const loc of ['en', locale]) {
    for (const entry of all) {
      const [entryLocale, slug] = entry.id.split('/');
      if (entryLocale === loc) bySlug.set(slug, { ...entry, slug: slug as ProductSlug });
    }
  }
  return [...bySlug.values()].sort(
    (a, b) =>
      categories.indexOf(a.data.category) - categories.indexOf(b.data.category) || a.data.order - b.data.order,
  );
}

export async function getProductsByCategory(locale: Locale): Promise<Record<Category, ProductEntry[]>> {
  const products = await getProducts(locale);
  return Object.fromEntries(
    categories.map((c) => [c, products.filter((p) => p.data.category === c)]),
  ) as Record<Category, ProductEntry[]>;
}

export async function getProduct(locale: Locale, slug: string): Promise<ProductEntry | undefined> {
  return (await getProducts(locale)).find((p) => p.slug === slug);
}
