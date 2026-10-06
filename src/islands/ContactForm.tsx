import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { PUBLIC_WEB3FORMS_KEY } from 'astro:env/client';
import type { Category, ProductSlug } from '../data/catalog';
import { provinces } from '../config/site';
import type { Dictionary } from '../i18n/en';
import { localeNames, locales, type Locale } from '../i18n/config';
import {
  contactMethods,
  contactSchema,
  contactTimes,
  fieldErrors,
  type ContactErrorKey,
  type ContactInput,
} from '../lib/contactSchema';

interface Props {
  locale: Locale;
  t: Dictionary['contact']['form'];
  categoryNames: Record<Category, string>;
  products: { slug: ProductSlug; title: string; category: Category }[];
  privacyHref: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'rateLimited';
type Errors = Partial<Record<keyof ContactInput, ContactErrorKey>>;

const inputClass =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-base outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 aria-[invalid=true]:border-red-400';

export default function ContactForm({ locale, t, categoryNames, products, privacyHref }: Props) {
  const initial: ContactInput = {
    name: '',
    email: '',
    phone: '',
    province: '' as ContactInput['province'],
    language: locale,
    products: [],
    contactMethod: 'phone',
    bestTime: 'anytime',
    message: '',
    consent: false as unknown as true,
    website: '',
  };
  const [values, setValues] = useState<ContactInput>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');

  // Pre-fill from ?product= and ?note= (set by product pages and calculators).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const product = params.get('product');
    const note = params.get('note');
    setValues((v) => ({
      ...v,
      products: product && products.some((p) => p.slug === product) ? [product as ProductSlug] : v.products,
      message: note ? note.slice(0, 2000) : v.message,
    }));
  }, [products]);

  const set = <K extends keyof ContactInput>(key: K, value: ContactInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleProduct = (slug: ProductSlug) => {
    const current = values.products;
    set('products', current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]);
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      const first = Object.keys(errs)[0];
      document.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
      return;
    }
    if (!PUBLIC_WEB3FORMS_KEY) {
      console.error('[contact] PUBLIC_WEB3FORMS_KEY is not set; cannot send the form.');
      return setStatus('error');
    }
    setStatus('submitting');
    const data = parsed.data;
    const productNames = data.products.map((slug) => products.find((p) => p.slug === slug)?.title ?? slug);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: PUBLIC_WEB3FORMS_KEY,
          subject: `New quote request: ${data.name}`,
          from_name: 'MyVianova Insurance website',
          replyto: data.email,
          botcheck: data.website ? true : '',
          Name: data.name,
          Email: data.email,
          Phone: data.phone,
          Province: data.province,
          'Preferred language': localeNames[data.language],
          'Interested in': productNames.join(', '),
          'Contact by': t.methods[data.contactMethod],
          'Best time': t.times[data.bestTime],
          Message: data.message || '—',
        }),
      });
      if (res.status === 429) return setStatus('rateLimited');
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) return setStatus('error');
      setStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="card text-center" role="status">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-semibold">{t.successTitle}</h2>
        <p className="mt-2 text-ink-soft">{t.successText}</p>
        <button
          type="button"
          className="btn-ghost mt-6"
          onClick={() => {
            setValues(initial);
            setStatus('idle');
          }}
        >
          {t.sendAnother}
        </button>
      </div>
    );
  }

  const err = (k: keyof ContactInput) => (errors[k] ? t.errors[errors[k]!] : undefined);
  const grouped = (['life', 'living', 'investments'] as Category[]).map((c) => ({
    category: c,
    items: products.filter((p) => p.category === c),
  }));

  return (
    <form onSubmit={onSubmit} noValidate className="card space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.name} error={err('name')} required t={t}>
          {(id, describedBy) => (
            <input id={id} data-field="name" autoComplete="name" className={inputClass} value={values.name}
              onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} aria-describedby={describedBy} />
          )}
        </Field>
        <Field label={t.email} error={err('email')} required t={t}>
          {(id, describedBy) => (
            <input id={id} data-field="email" type="email" autoComplete="email" dir="ltr" className={inputClass} value={values.email}
              onChange={(e) => set('email', e.target.value)} aria-invalid={!!errors.email} aria-describedby={describedBy} />
          )}
        </Field>
        <Field label={t.phone} error={err('phone')} required t={t}>
          {(id, describedBy) => (
            <input id={id} data-field="phone" type="tel" autoComplete="tel" dir="ltr" className={inputClass} value={values.phone}
              onChange={(e) => set('phone', e.target.value)} aria-invalid={!!errors.phone} aria-describedby={describedBy} />
          )}
        </Field>
        <Field label={t.province} error={err('province')} required t={t}>
          {(id, describedBy) => (
            <select id={id} data-field="province" autoComplete="address-level1" className={inputClass} value={values.province}
              onChange={(e) => set('province', e.target.value as ContactInput['province'])} aria-invalid={!!errors.province} aria-describedby={describedBy}>
              <option value="" disabled>{t.provincePlaceholder}</option>
              {provinces.map((p) => (
                <option key={p} value={p}>{t.provinceNames[p]}</option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <fieldset data-field="products" tabIndex={-1} aria-describedby={errors.products ? 'products-error' : undefined} className="outline-none">
        <legend className="mb-3 text-sm font-medium">
          {t.products} <span className="text-red-600" aria-hidden="true">*</span>
        </legend>
        <div className="grid gap-4 md:grid-cols-3">
          {grouped.map((g) => (
            <div key={g.category} className="space-y-2">
              <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">{categoryNames[g.category]}</p>
              {g.items.map((p) => {
                const checked = values.products.includes(p.slug);
                return (
                  <label key={p.slug}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition-colors ${
                      checked ? 'border-brand-400 bg-brand-50 text-brand-800' : 'border-line bg-white hover:border-brand-200'
                    }`}>
                    <input type="checkbox" className="size-4 accent-brand-600" checked={checked} onChange={() => toggleProduct(p.slug)} />
                    {p.title}
                  </label>
                );
              })}
            </div>
          ))}
        </div>
        {errors.products && <p id="products-error" className="mt-2 text-sm text-red-600">{err('products')}</p>}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label={t.language} t={t}>
          {(id) => (
            <select id={id} className={inputClass} value={values.language} onChange={(e) => set('language', e.target.value as Locale)}>
              {locales.map((l) => <option key={l} value={l}>{localeNames[l]}</option>)}
            </select>
          )}
        </Field>
        <Field label={t.contactMethod} t={t}>
          {(id) => (
            <select id={id} className={inputClass} value={values.contactMethod}
              onChange={(e) => set('contactMethod', e.target.value as ContactInput['contactMethod'])}>
              {contactMethods.map((m) => <option key={m} value={m}>{t.methods[m]}</option>)}
            </select>
          )}
        </Field>
        <Field label={t.bestTime} t={t}>
          {(id) => (
            <select id={id} className={inputClass} value={values.bestTime}
              onChange={(e) => set('bestTime', e.target.value as ContactInput['bestTime'])}>
              {contactTimes.map((m) => <option key={m} value={m}>{t.times[m]}</option>)}
            </select>
          )}
        </Field>
      </div>

      <Field label={t.message} error={err('message')} optional t={t}>
        {(id, describedBy) => (
          <textarea id={id} rows={4} maxLength={2000} className={inputClass} placeholder={t.messagePlaceholder}
            value={values.message} onChange={(e) => set('message', e.target.value)} aria-describedby={describedBy} />
        )}
      </Field>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set('website', e.target.value)} />
        </label>
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-soft">
          <input type="checkbox" data-field="consent" className="mt-1 size-4 shrink-0 accent-brand-600" checked={values.consent === true}
            onChange={(e) => set('consent', e.target.checked as true)} aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? 'consent-error' : undefined} />
          <span>
            {t.consent}{' '}
            <a href={privacyHref} className="text-brand-700 underline underline-offset-2" target="_blank" rel="noopener">{t.privacyLink}</a>
          </span>
        </label>
        {errors.consent && <p id="consent-error" className="mt-2 text-sm text-red-600">{err('consent')}</p>}
      </div>

      {(status === 'error' || status === 'rateLimited') && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {status === 'rateLimited' ? t.errorRateLimit : t.errorGeneric}
        </p>
      )}

      <button type="submit" className="btn-primary w-full py-3 text-base sm:w-auto" disabled={status === 'submitting'}>
        {status === 'submitting' ? t.submitting : t.submit}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  required,
  optional,
  t,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  t: Props['t'];
  children: (id: string, describedBy: string | undefined) => ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium">
        <span>
          {label}
          {required && <span className="ms-0.5 text-red-600" aria-hidden="true">*</span>}
        </span>
        {optional && <span className="text-xs font-normal text-ink-soft">{t.optional}</span>}
      </label>
      {children(id, error ? errorId : undefined)}
      {error && <p id={errorId} className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
