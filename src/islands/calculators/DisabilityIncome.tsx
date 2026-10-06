import { useState } from 'react';
import type { Dictionary } from '../../i18n/en';
import { calculateDisabilityIncome, type DisabilityIncomeInput } from '../../lib/calculators/disabilityIncome';
import { CalculatorShell, NumberField, ResultRows, Toggle, useMoney, type CalculatorProps } from './ui';

type Strings = Dictionary['calc']['items']['disability-income'];

export default function DisabilityIncome({ locale, common, strings: s, ...rest }: CalculatorProps<Strings>) {
  const [v, setV] = useState<DisabilityIncomeInput>({
    grossMonthlyIncome: 7_000,
    targetPct: 0.65,
    groupPct: 0.6,
    groupMonthlyMax: 3_500,
    groupTaxable: true,
    marginalTaxRate: 0.3,
    otherMonthlyCoverage: 0,
    yearsToRetirement: 25,
  });
  const set = (k: keyof DisabilityIncomeInput) => (n: number) => setV((p) => ({ ...p, [k]: n }));
  const r = calculateDisabilityIncome(v);
  const money = useMoney(locale);
  const f = s.fields;

  return (
    <CalculatorShell
      common={common}
      {...rest}
      headlineLabel={s.results.headline}
      headlineValue={money(r.monthlyGap)}
      headlineSuffix={common.perMonth}
      inputs={
        <div className="space-y-5">
          <NumberField locale={locale} label={f.grossMonthlyIncome} value={v.grossMonthlyIncome} onChange={set('grossMonthlyIncome')} slider max={30_000} step={250} />
          <NumberField locale={locale} label={f.targetPct} value={v.targetPct} onChange={set('targetPct')} kind="percent" slider min={0.4} max={0.85} step={0.05} />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField locale={locale} label={f.groupPct} value={v.groupPct} onChange={set('groupPct')} kind="percent" max={1} />
            <NumberField locale={locale} label={f.groupMonthlyMax} value={v.groupMonthlyMax} onChange={set('groupMonthlyMax')} />
          </div>
          <Toggle label={f.groupTaxable} checked={v.groupTaxable} onChange={(b) => setV((p) => ({ ...p, groupTaxable: b }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            {v.groupTaxable && (
              <NumberField locale={locale} label={f.marginalTaxRate} value={v.marginalTaxRate} onChange={set('marginalTaxRate')} kind="percent" max={0.55} />
            )}
            <NumberField locale={locale} label={f.otherMonthlyCoverage} value={v.otherMonthlyCoverage} onChange={set('otherMonthlyCoverage')} />
            <NumberField locale={locale} label={f.yearsToRetirement} value={v.yearsToRetirement} onChange={set('yearsToRetirement')} kind="number" suffix={common.years} max={50} />
          </div>
        </div>
      }
      summary={
        <ResultRows
          rows={[
            { label: s.results.targetMonthly, value: money(r.targetMonthly) },
            { label: s.results.existingMonthly, value: money(r.existingMonthly), negative: true },
            { label: s.results.headline, value: money(r.monthlyGap), emphasis: true },
            { label: s.results.incomeAtRisk, value: money(r.incomeAtRisk) },
          ]}
        />
      }
      note={r.monthlyGap === 0 ? s.results.noGap : undefined}
    />
  );
}
