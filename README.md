# MyVianova Insurance

Website for an LLQP-licensed insurance practice based in Vancouver, BC. Visitors can learn about insurance and savings products, run free calculators, and request a quote. The site is available in English, French and Farsi (right-to-left).

Built with **Astro** (static pages) and **React + Tailwind** islands for the interactive parts (calculators and the contact form).

## Commands

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Production build (static files in `dist/`) |
| `npm run preview` | Serve the build locally at `localhost:4321/myvianova-insurance/` |
| `npm run test` | Calculator unit tests (Vitest) |
| `npm run check` | Type-check `.astro` and `.ts(x)` files |

## Hosting

The site is fully static and deploys to **GitHub Pages** at https://smh11d94.github.io/myvianova-insurance/ via [.github/workflows/deploy.yml](.github/workflows/deploy.yml) on every push to `main`.

To move to a custom domain later, set `site` to the domain and remove `base` in `astro.config.mjs`, then add the domain under **Settings → Pages**.

## Contact form

The form sends leads by email through [Web3Forms](https://web3forms.com) (free tier: 250 submissions/month):

1. Get an access key at web3forms.com using the email address that should receive leads.
2. In GitHub, go to **Settings → Secrets and variables → Actions → Variables** and add `PUBLIC_WEB3FORMS_KEY`.
3. Re-run the deploy workflow.

For local testing, put the key in `.env` (see `.env.example`). Until a key is set, submitting the form shows an error that asks visitors to call or email instead.

## Before launch

- Replace the placeholders in `src/config/site.ts` (licence number, phone, email, provinces) and set `site` in `astro.config.mjs`.
- Replace the sample testimonials (`home.testimonials` in `src/i18n/*.ts`) and, optionally, the About page image placeholder.
- Have native speakers review the French and Farsi text, and have compliance review the product content and the privacy policy.

## Where things live

- `src/content/products/<locale>/<slug>.mdx`: product pages. The schema is in `src/content.config.ts`.
- `src/content/pages/<locale>/privacy.mdx`: privacy policy and disclaimer.
- `src/i18n/{en,fr,fa}.ts`: UI strings. `fr` and `fa` are typed against `en`, so a missing key fails type-checking.
- `src/data/catalog.ts`: the list of products and calculators and how they link to each other.
- `src/lib/calculators/`: pure calculation functions with tests.
- `src/islands/`: React islands (calculators, contact form).
- `src/assets/photos/`: CC0 photos, credited in `CREDITS.md`. Replace a file with the same name to change a photo.
