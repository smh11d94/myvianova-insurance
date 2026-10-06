import type { Locale } from './config';
import { en, type Dictionary } from './en';
import { fr } from './fr';
import { fa } from './fa';

export * from './config';
export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { en, fr, fa };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Fill {placeholders} in a string. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? String(vars[key]) : m));
}
