export const locales = ['en', 'fr', 'fa'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  fa: 'فارسی',
};

export const htmlLang: Record<Locale, string> = { en: 'en-CA', fr: 'fr-CA', fa: 'fa' };

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

export function dir(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'fa' ? 'rtl' : 'ltr';
}

/** Site base path without a trailing slash, e.g. "/myvianova-insurance" (empty at the domain root). */
export const basePath = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Prefix a site-relative path with the base path: withBase('favicon.svg') → '/myvianova-insurance/favicon.svg' */
export function withBase(path = ''): string {
  return `${basePath}/${path.replace(/^\/+/, '')}`;
}

/** Remove the base path from a pathname so the first segment is the locale. */
export function stripBase(pathname: string): string {
  return basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) || '/' : pathname;
}

/** Build a locale-prefixed path: localizePath('fr', '/insurance') → '<base>/fr/insurance/' */
export function localizePath(locale: Locale, path = '/'): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return withBase(clean ? `${locale}/${clean}/` : `${locale}/`);
}

/** Swap the locale prefix of the current pathname (which includes the base path). */
export function switchLocalePath(pathname: string, target: Locale): string {
  const rest = stripBase(pathname).replace(/^\/(en|fr|fa)(?=\/|$)/, '');
  return localizePath(target, rest);
}

/** getStaticPaths helper for pages under src/pages/[locale]. */
export function localeStaticPaths() {
  return locales.map((locale) => ({ params: { locale } }));
}
