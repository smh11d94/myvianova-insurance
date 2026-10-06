import type { Locale } from '../i18n/config';

const intlLocale: Record<Locale, string> = { en: 'en-CA', fr: 'fr-CA', fa: 'fa-IR' };

export function formatCurrency(locale: Locale, value: number, decimals = 0): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: 'currency',
    currency: 'CAD',
    currencyDisplay: locale === 'fa' ? 'symbol' : 'narrowSymbol',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(locale: Locale, value: number, decimals = 0): string {
  return new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: decimals }).format(
    Number.isFinite(value) ? value : 0,
  );
}

/** Compact axis labels for charts, e.g. "$1.2M". */
export function formatCompactCurrency(locale: Locale, value: number): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: 'currency',
    currency: 'CAD',
    currencyDisplay: 'narrowSymbol',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/** Accept Persian and Arabic-Indic digits as well as thousands separators. */
export function parseLocaleNumber(raw: string): number {
  const normalized = raw
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[٫]/g, '.')
    .replace(/[^\d.-]/g, '');
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}
