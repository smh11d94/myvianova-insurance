import type { ImageMetadata } from 'astro';

// Photos live in src/assets/photos/<name>.jpg (CC0, see CREDITS.md there).
// Alt text is localized under `photos` in src/i18n/<locale>.ts.
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.jpg', { eager: true });

export const photoNames = [
  'home-hero',
  'category-life',
  'category-living',
  'category-investments',
  'term-life',
  'whole-life',
  'universal-life',
  'critical-illness',
  'disability',
  'long-term-care',
  'health-dental',
  'segregated-funds',
  'annuities',
  'rrsp',
  'tfsa',
  'resp',
  'vancouver',
] as const;
export type PhotoName = (typeof photoNames)[number];

export function photo(name: PhotoName): ImageMetadata {
  const file = files[`../assets/photos/${name}.jpg`];
  if (!file) throw new Error(`Missing photo: src/assets/photos/${name}.jpg`);
  return file.default;
}
