// Shared building blocks for calculator islands.
import { useId, useState, type ReactNode } from 'react';
import type { Locale } from '../../i18n/config';
import { formatCurrency, formatNumber, parseLocaleNumber } from '../../lib/format';
import type { Dictionary } from '../../i18n/en';

export type CommonStrings = Dictionary['calc']['common'];

export interface CalculatorProps<S> {
  locale: Locale;
  common: CommonStrings;
  strings: S;
  /** Contact page URL; the calculator appends ?product=&note= to it. */
  contactHref: string;
  product: string;
  calculatorTitle: string;
}

type FieldKind = 'currency' | 'percent' | 'number';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  kind?: FieldKind;
  min?: number;
  max?: number;
  step?: number;
  /** Show a range slider under the input. */
  slider?: boolean;
  suffix?: string;
  locale: Locale;
}

/** Numeric input that accepts Persian digits. Percent fields show/edit whole percents but report decimals. */
export function NumberField({ label, value, onChange, kind = 'currency', min = 0, max, step, slider, suffix, locale }: NumberFieldProps) {
  const id = useId();
  const scale = kind === 'percent' ? 100 : 1;
  const display = value * scale;
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (kind === 'currency' ? formatNumber(locale, display) : formatNumber(locale, display, 2));
  const commit = (raw: string) => {
    let n = parseLocaleNumber(raw);
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    onChange(n / scale);
  };
  const unit = kind === 'currency' ? '$' : kind === 'percent' ? '%' : suffix;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="flex items-center rounded-xl border border-line bg-white focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
        {kind === 'currency' && <span className="ps-3 text-sm text-ink-soft" aria-hidden="true">{unit}</span>}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={shown}
          onChange={(e) => {
            setDraft(e.target.value);
            commit(e.target.value);
          }}
          onBlur={() => setDraft(null)}
          onFocus={(e) => e.target.select()}
          className="w-full min-w-0 rounded-xl bg-transparent px-3 py-2.5 text-base tabular-nums outline-none"
        />
        {kind !== 'currency' && unit && <span className="pe-3 text-sm whitespace-nowrap text-ink-soft" aria-hidden="true">{unit}</span>}
      </div>
      {slider && max !== undefined && (
        <input
          type="range"
          aria-label={label}
          min={min * scale}
          max={max * scale}
          step={(step ?? 1) * scale}
          value={display}
          onChange={(e) => {
            setDraft(null);
            onChange(Number(e.target.value) / scale);
          }}
          className="w-full accent-brand-600"
        />
      )}
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white p-3 text-sm">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 accent-brand-600" />
      <span>{label}</span>
    </label>
  );
}

export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="mb-1.5 text-sm font-medium text-ink">{label}</legend>
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-line bg-white p-1">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={o.value === value}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              o.value === value ? 'bg-brand-600 text-white' : 'text-ink-soft hover:bg-brand-50'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function FieldGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      {title && <h3 className="font-sans text-xs font-semibold tracking-wider text-brand-700 uppercase">{title}</h3>}
      {children}
    </div>
  );
}

export interface ResultRow {
  label: string;
  value: string;
  emphasis?: boolean;
  negative?: boolean;
}

export function ResultRows({ rows }: { rows: ResultRow[] }) {
  return (
    <dl className="divide-y divide-white/10">
      {rows.map((r) => (
        <div key={r.label} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
          <dt className={r.emphasis ? 'font-semibold text-white' : 'text-white/75'}>{r.label}</dt>
          <dd className={`tabular-nums ${r.emphasis ? 'text-base font-semibold text-white' : 'text-white'}`}>
            {r.negative ? '− ' : ''}
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

interface ShellProps {
  common: CommonStrings;
  inputs: ReactNode;
  headlineLabel: string;
  headlineValue: string;
  headlineSuffix?: string;
  summary: ReactNode;
  chart?: ReactNode;
  note?: ReactNode;
  contactHref: string;
  product: string;
  calculatorTitle: string;
}

/** Two-column layout: inputs on one side, sticky dark results card on the other. */
export function CalculatorShell({
  common,
  inputs,
  headlineLabel,
  headlineValue,
  headlineSuffix,
  summary,
  chart,
  note,
  contactHref,
  product,
  calculatorTitle,
}: ShellProps) {
  const noteText = common.noteFromCalculator
    .replace('{calculator}', calculatorTitle)
    .replace('{result}', `${headlineLabel}: ${headlineValue}${headlineSuffix ? ' ' + headlineSuffix : ''}`);
  const href = `${contactHref}?product=${encodeURIComponent(product)}&note=${encodeURIComponent(noteText)}`;
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
      <section className="card space-y-6 lg:self-start" aria-labelledby="calc-inputs">
        <h2 id="calc-inputs" className="text-xl font-semibold">{common.inputs}</h2>
        {inputs}
        <p className="text-xs text-ink-soft">{common.privacy}</p>
      </section>

      <section className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-labelledby="calc-results" aria-live="polite">
        <div className="rounded-2xl bg-ink p-6 text-white shadow-xl sm:p-8">
          <h2 id="calc-results" className="font-sans text-sm font-medium text-white/70">{common.results}</h2>
          <p className="mt-4 text-sm text-accent-300">{headlineLabel}</p>
          <p className="mt-1 font-display text-4xl font-semibold tabular-nums sm:text-5xl">
            {headlineValue}
            {headlineSuffix && <span className="ms-1 font-sans text-lg font-normal text-white/70">{headlineSuffix}</span>}
          </p>
          <div className="mt-6">{summary}</div>
          {note && <div className="mt-4 rounded-xl bg-white/5 p-4 text-sm leading-relaxed text-white/80">{note}</div>}
          <div className="mt-6 flex flex-col gap-3 rounded-xl bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{common.ctaTitle}</p>
              <p className="text-sm text-white/70">{common.ctaText}</p>
            </div>
            <a href={href} className="btn-accent shrink-0">{common.ctaButton}</a>
          </div>
        </div>
        {chart && <div className="card">{chart}</div>}
        <p className="text-xs leading-relaxed text-ink-soft">{common.disclaimer}</p>
      </section>
    </div>
  );
}

export function useMoney(locale: Locale) {
  return (n: number, decimals = 0) => formatCurrency(locale, n, decimals);
}
