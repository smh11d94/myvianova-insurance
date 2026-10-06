import { useState } from 'react';
import type { Dictionary } from '../../i18n/en';
import { calculateLongTermCare, type LongTermCareInput } from '../../lib/calculators/longTermCare';
import { chartColors, MoneyChart } from './Chart';
import { CalculatorShell, NumberField, ResultRows, useMoney, type CalculatorProps } from './ui';

type Strings = Dictionary['calc']['items']['long-term-care'];

export default function LongTermCare({ locale, common, strings: s, ...rest }: CalculatorProps<Strings>) {
  const [v, setV] = useState<LongTermCareInput>({
    currentAge: 55,
    careStartAge: 80,
    monthlyCostToday: 6_000,
    inflationRate: 0.03,
    yearsOfCare: 4,
    monthlySupportToday: 2_000,
  });
  const set = (k: keyof LongTermCareInput) => (n: number) => setV((p) => ({ ...p, [k]: n }));
  const r = calculateLongTermCare(v);
  const money = useMoney(locale);
  const f = s.fields;

  return (
    <CalculatorShell
      common={common}
      {...rest}
      headlineLabel={s.results.headline}
      headlineValue={money(r.totalShortfall)}
      inputs={
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField locale={locale} label={f.currentAge} value={v.currentAge} onChange={set('currentAge')} kind="number" min={18} max={95} />
            <NumberField locale={locale} label={f.careStartAge} value={v.careStartAge} onChange={set('careStartAge')} kind="number" min={40} max={100} />
          </div>
          <NumberField locale={locale} label={f.monthlyCostToday} value={v.monthlyCostToday} onChange={set('monthlyCostToday')} slider max={20_000} step={250} />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField locale={locale} label={f.inflationRate} value={v.inflationRate} onChange={set('inflationRate')} kind="percent" max={0.1} />
            <NumberField locale={locale} label={f.yearsOfCare} value={v.yearsOfCare} onChange={set('yearsOfCare')} kind="number" suffix={common.years} min={1} max={20} />
          </div>
          <NumberField locale={locale} label={f.monthlySupportToday} value={v.monthlySupportToday} onChange={set('monthlySupportToday')} />
        </div>
      }
      summary={
        <ResultRows
          rows={[
            { label: s.results.monthlyCostAtStart, value: money(r.monthlyCostAtStart) },
            { label: s.results.totalCost, value: money(r.totalCost) },
            { label: s.results.totalShortfall, value: money(r.totalShortfall), emphasis: true },
          ]}
        />
      }
      chart={
        <MoneyChart
          locale={locale}
          data={r.series}
          xKey="age"
          xLabel={common.age}
          series={[
            { key: 'annualCost', label: s.results.chartCost, color: chartColors.ink, dashed: true },
            { key: 'annualShortfall', label: s.results.chartShortfall, color: chartColors.accent, kind: 'area' },
          ]}
        />
      }
    />
  );
}
