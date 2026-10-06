import { useState } from 'react';
import type { Dictionary } from '../../i18n/en';
import { calculateLifeNeeds, type LifeNeedsInput } from '../../lib/calculators/lifeNeeds';
import { CalculatorShell, FieldGroup, NumberField, ResultRows, useMoney, type CalculatorProps } from './ui';

type Strings = Dictionary['calc']['items']['life-insurance-needs'];

export default function LifeNeeds({ locale, common, strings: s, ...rest }: CalculatorProps<Strings>) {
  const [v, setV] = useState<LifeNeedsInput>({
    annualIncome: 85_000,
    replacementPct: 0.7,
    yearsOfSupport: 15,
    returnRate: 0.05,
    inflationRate: 0.025,
    mortgage: 450_000,
    otherDebts: 25_000,
    finalExpenses: 20_000,
    educationFund: 60_000,
    emergencyFund: 20_000,
    existingCoverage: 150_000,
    liquidAssets: 40_000,
  });
  const set = (k: keyof LifeNeedsInput) => (n: number) => setV((p) => ({ ...p, [k]: n }));
  const r = calculateLifeNeeds(v);
  const money = useMoney(locale);
  const f = s.fields;
  const field = (k: keyof LifeNeedsInput, extra: Partial<Parameters<typeof NumberField>[0]> = {}) => (
    <NumberField locale={locale} label={f[k]} value={v[k]} onChange={set(k)} {...extra} />
  );

  return (
    <CalculatorShell
      common={common}
      {...rest}
      headlineLabel={s.results.headline}
      headlineValue={money(r.suggestedCoverage)}
      inputs={
        <>
          <FieldGroup title={s.sections.income}>
            {field('annualIncome', { slider: true, max: 500_000, step: 5_000 })}
            {field('replacementPct', { kind: 'percent', slider: true, min: 0.3, max: 1, step: 0.05 })}
            {field('yearsOfSupport', { kind: 'number', suffix: common.years, slider: true, min: 1, max: 40 })}
            <div className="grid gap-4 sm:grid-cols-2">
              {field('returnRate', { kind: 'percent', max: 0.15 })}
              {field('inflationRate', { kind: 'percent', max: 0.1 })}
            </div>
          </FieldGroup>
          <FieldGroup title={s.sections.debts}>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('mortgage')}
              {field('otherDebts')}
            </div>
          </FieldGroup>
          <FieldGroup title={s.sections.costs}>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('finalExpenses')}
              {field('educationFund')}
              {field('emergencyFund')}
            </div>
          </FieldGroup>
          <FieldGroup title={s.sections.resources}>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('existingCoverage')}
              {field('liquidAssets')}
            </div>
          </FieldGroup>
        </>
      }
      summary={
        <ResultRows
          rows={[
            { label: s.results.incomeReplacement, value: money(r.incomeReplacement) },
            { label: s.results.debts, value: money(r.debts) },
            { label: s.results.oneTimeCosts, value: money(r.oneTimeCosts) },
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
