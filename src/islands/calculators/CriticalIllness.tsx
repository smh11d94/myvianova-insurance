import { useState } from 'react';
import type { Dictionary } from '../../i18n/en';
import { calculateCriticalIllness, type CriticalIllnessInput } from '../../lib/calculators/criticalIllness';
import { CalculatorShell, NumberField, ResultRows, useMoney, type CalculatorProps } from './ui';

type Strings = Dictionary['calc']['items']['critical-illness'];

export default function CriticalIllness({ locale, common, strings: s, ...rest }: CalculatorProps<Strings>) {
  const [v, setV] = useState<CriticalIllnessInput>({
    monthlyExpenses: 5_000,
    recoveryMonths: 12,
    treatmentCosts: 15_000,
    debtPayoff: 20_000,
    caregiverIncomeLoss: 10_000,
    savings: 15_000,
    existingCoverage: 0,
  });
  const set = (k: keyof CriticalIllnessInput) => (n: number) => setV((p) => ({ ...p, [k]: n }));
  const r = calculateCriticalIllness(v);
  const money = useMoney(locale);
  const f = s.fields;

  return (
    <CalculatorShell
      common={common}
      {...rest}
      headlineLabel={s.results.headline}
      headlineValue={money(r.suggestedCoverage)}
      inputs={
        <div className="space-y-5">
          <NumberField locale={locale} label={f.monthlyExpenses} value={v.monthlyExpenses} onChange={set('monthlyExpenses')} slider max={20_000} step={250} />
          <NumberField locale={locale} label={f.recoveryMonths} value={v.recoveryMonths} onChange={set('recoveryMonths')} kind="number" slider min={1} max={36} />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField locale={locale} label={f.treatmentCosts} value={v.treatmentCosts} onChange={set('treatmentCosts')} />
            <NumberField locale={locale} label={f.debtPayoff} value={v.debtPayoff} onChange={set('debtPayoff')} />
            <NumberField locale={locale} label={f.caregiverIncomeLoss} value={v.caregiverIncomeLoss} onChange={set('caregiverIncomeLoss')} />
            <NumberField locale={locale} label={f.savings} value={v.savings} onChange={set('savings')} />
            <NumberField locale={locale} label={f.existingCoverage} value={v.existingCoverage} onChange={set('existingCoverage')} />
          </div>
        </div>
      }
      summary={
        <ResultRows
          rows={[
            { label: s.results.livingCosts, value: money(r.livingCosts) },
            { label: s.results.totalNeeds, value: money(r.totalNeeds), emphasis: true },
            { label: s.results.totalResources, value: money(r.totalResources), negative: true },
            { label: s.results.gap, value: money(r.gap), emphasis: true },
          ]}
        />
      }
      note={r.gap === 0 ? s.results.noGap : undefined}
    />
  );
}
