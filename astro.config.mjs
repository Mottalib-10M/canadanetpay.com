// @ts-check
import { defineConfig } from 'astro/config';
import trustKit from './src/integrations/trust-kit.mjs';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://salaryaftertax.ca',
  /*
   * Pages consolidees le 2026-09-22 : vingt montants dont le texte ne
   * differait que par un chiffre, 378 paires relevees trop proches. Leur
   * contenu reste accessible dans le tableau de /salary/, qui donne le net
   * calcule pour chacun d'eux et permet de les comparer.
   */
  redirects: {
    '/bonus-calculator/': '/bonus-tax-calculator/',
    '/salary/25000-salary-after-tax/': '/salary/',
    '/salary/30000-salary-after-tax/': '/salary/',
    '/salary/35000-salary-after-tax/': '/salary/',
    '/salary/40000-salary-after-tax/': '/salary/',
    '/salary/45000-salary-after-tax/': '/salary/',
    '/salary/55000-salary-after-tax/': '/salary/',
    '/salary/60000-salary-after-tax/': '/salary/',
    '/salary/65000-salary-after-tax/': '/salary/',
    '/salary/70000-salary-after-tax/': '/salary/',
    '/salary/80000-salary-after-tax/': '/salary/',
    '/salary/85000-salary-after-tax/': '/salary/',
    '/salary/90000-salary-after-tax/': '/salary/',
    '/salary/95000-salary-after-tax/': '/salary/',
    '/salary/110000-salary-after-tax/': '/salary/',
    '/salary/120000-salary-after-tax/': '/salary/',
    '/salary/130000-salary-after-tax/': '/salary/',
    '/salary/140000-salary-after-tax/': '/salary/',
    '/salary/175000-salary-after-tax/': '/salary/',
    '/salary/200000-salary-after-tax/': '/salary/',
    '/salary/300000-salary-after-tax/': '/salary/',
  },

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
