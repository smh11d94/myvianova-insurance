import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { calculatorSlugs, categories, productSlugs } from './data/catalog';

// Entry ids look like "en/term-life".
const products = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/products' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(categories),
    order: z.number(),
    tagline: z.string(),
    summary: z.string(),
    seoDescription: z.string(),
    howItWorks: z.array(z.object({ title: z.string(), text: z.string() })).min(3).max(5),
    benefits: z.array(z.object({ title: z.string(), text: z.string() })).min(4).max(8),
    useCases: z
      .array(z.object({ persona: z.string(), scenario: z.string(), why: z.string() }))
      .min(2)
      .max(4),
    pros: z.array(z.string()).min(3),
    cons: z.array(z.string()).min(2),
    comparison: z
      .object({
        caption: z.string(),
        columns: z.array(z.string()).min(2),
        rows: z.array(z.object({ label: z.string(), values: z.array(z.string()) })).min(3),
      })
      .optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3),
    relatedCalculator: z.enum(calculatorSlugs).optional(),
    relatedProducts: z.array(z.enum(productSlugs)).max(3),
  }),
});

// Long-form legal pages such as the privacy policy. Entry ids look like "en/privacy".
const pages = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updated: z.coerce.date(),
  }),
});

export const collections = { products, pages };
