// Locale-independent catalog: which products and calculators exist and how they relate.
// Localized copy lives in src/content/products/<locale>/<slug>.mdx and src/i18n/<locale>.ts.
import type { IconName } from '../lib/icons';

export const categories = ['life', 'living', 'investments'] as const;
export type Category = (typeof categories)[number];

export const categoryIcons: Record<Category, IconName> = {
  life: 'shield',
  living: 'heartPulse',
  investments: 'trendingUp',
};

export const productSlugs = [
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
] as const;
export type ProductSlug = (typeof productSlugs)[number];

export const productMeta: Record<ProductSlug, { category: Category; icon: IconName }> = {
  'term-life': { category: 'life', icon: 'shield' },
  'whole-life': { category: 'life', icon: 'infinity' },
  'universal-life': { category: 'life', icon: 'layers' },
  'critical-illness': { category: 'living', icon: 'heartPulse' },
  disability: { category: 'living', icon: 'umbrella' },
  'long-term-care': { category: 'living', icon: 'home' },
  'health-dental': { category: 'living', icon: 'stethoscope' },
  'segregated-funds': { category: 'investments', icon: 'lock' },
  annuities: { category: 'investments', icon: 'wallet' },
  rrsp: { category: 'investments', icon: 'landmark' },
  tfsa: { category: 'investments', icon: 'piggyBank' },
  resp: { category: 'investments', icon: 'graduationCap' },
};

export const calculatorSlugs = [
  'life-insurance-needs',
  'term-vs-permanent',
  'critical-illness',
  'disability-income',
  'long-term-care',
  'segregated-fund-guarantee',
  'annuity-payout',
  'rrsp-tfsa-resp',
] as const;
export type CalculatorSlug = (typeof calculatorSlugs)[number];

export const calculatorMeta: Record<CalculatorSlug, { icon: IconName; product: ProductSlug }> = {
  'life-insurance-needs': { icon: 'shield', product: 'term-life' },
  'term-vs-permanent': { icon: 'scale', product: 'whole-life' },
  'critical-illness': { icon: 'heartPulse', product: 'critical-illness' },
  'disability-income': { icon: 'umbrella', product: 'disability' },
  'long-term-care': { icon: 'home', product: 'long-term-care' },
  'segregated-fund-guarantee': { icon: 'lock', product: 'segregated-funds' },
  'annuity-payout': { icon: 'wallet', product: 'annuities' },
  'rrsp-tfsa-resp': { icon: 'piggyBank', product: 'rrsp' },
};

export const featuredCalculators: CalculatorSlug[] = [
  'life-insurance-needs',
  'critical-illness',
  'segregated-fund-guarantee',
  'rrsp-tfsa-resp',
];
