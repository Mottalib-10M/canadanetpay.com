/**
 * Number formatting utilities for Canadian locale
 */

const cadFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const cadDetailFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('en-CA', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat('en-CA', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number, detailed = false): string {
  return detailed ? cadDetailFormatter.format(value) : cadFormatter.format(value);
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value / 100);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function parseNumber(input: string): number {
  const cleaned = input.replace(/[^0-9.-]/g, '');
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

/** Formats dépendant de la langue de la page : le français canadien écrit « 29,7 % ». */
const LOCALE = { en: 'en-CA', fr: 'fr-CA' } as const;

export function formatCurrencyLang(value: number, lang: 'en' | 'fr' = 'en', detailed = false): string {
  return new Intl.NumberFormat(LOCALE[lang], {
    style: 'currency', currency: 'CAD',
    minimumFractionDigits: detailed ? 2 : 0,
    maximumFractionDigits: detailed ? 2 : 0,
  }).format(value);
}

export function formatPercentLang(value: number, lang: 'en' | 'fr' = 'en'): string {
  return new Intl.NumberFormat(LOCALE[lang], {
    style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1,
  }).format(value / 100);
}
