// @ts-check
import { defineConfig } from 'astro/config';
import trustKit from './src/integrations/trust-kit.mjs';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://salaryaftertax.ca',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    trustKit({ lang: 'en', siteUrl: 'https://salaryaftertax.ca', siteName: 'SalaryAfterTax.ca', founded: '2026-06-27', about: '/about/', method: '/methodology/' }), react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
