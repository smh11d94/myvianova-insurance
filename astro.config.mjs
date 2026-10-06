// @ts-check
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Hosted on GitHub Pages at https://smh11d94.github.io/myvianova-insurance/.
  // For a custom domain later: set `site` to the domain and remove `base`.
  site: 'https://smh11d94.github.io',
  base: '/myvianova-insurance',
  output: 'static',
  trailingSlash: 'ignore',

  i18n: {
    locales: ['en', 'fr', 'fa'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },

  env: {
    schema: {
      // Web3Forms access key (https://web3forms.com). It is designed to be public, so it ships in the client bundle.
      PUBLIC_WEB3FORMS_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },

  integrations: [
    react(),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en-CA', fr: 'fr-CA', fa: 'fa' },
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
