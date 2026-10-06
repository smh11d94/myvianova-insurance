import { useState } from 'react';
import type { Dictionary } from '../../i18n/en';
import { calculateAnnuity, type AnnuityInput } from '../../lib/calculators/annuity';
import { CalculatorShell, NumberField, ResultRows, Toggle, useMoney, type CalculatorProps } from './ui';

type Strings = Dictionary['calc']['items']['annuity-payout'];

export default function AnnuityPayout({ locale, common, strings: s, ...rest }: CalculatorProps<Strings>) {
  const [v, setV] = useState<AnnuityInput>({
    principal: 250_000,
    annualRate: 0.045,
    years: 20,
    paymentsInAdvance: false,
  });
  const set = (k: keyof AnnuityInput) => (n: number) => setV((p) => ({ ...p, [k]: n }));
  const r = calculateAnnuity(v);
  const money = useMoney(locale);
  const f = s.fields;

  return (
    <CalculatorShell
      common={common}
      {...rest}
      headlineLabel={s.results.headline}
      headlineValue={money(r.monthlyPayment)}
      headlineSuffix={common.perMonth}
      inputs={
        <div className="space-y-5">
          <NumberField locale={locale} label={f.principal} value={v.principal} onChange={set('principal')} slider max={2_000_000} step={10_000} />
          <NumberField locale={locale} label={f.annualRate} value={v.annualRate} onChange={set('annualRate')} kind="percent" slider min={0} max={0.1} step={0.0025} />
          <NumberField locale={locale} label={f.years} value={v.years} onChange={set('years')} kind="number" suffix={common.years} slider min={1} max={40} />
          <Toggle label={f.paymentsInAdvance} checked={v.paymentsInAdvance} onChange={(b) => setV((p) => ({ ...p, paymentsInAdvance: b }))} />
        </div>
      }
      summary={
        <ResultRows
          rows={[
            { label: s.results.totalPayments, value: money(r.totalPayments) },
            { label: s.results.interestEarned, value: money(r.interestEarned) },
          ]}
        />
      }
      note={s.results.note}
    />
  );
}
