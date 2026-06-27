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
