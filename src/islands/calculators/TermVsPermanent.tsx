import { useState } from 'react';
import type { Dictionary } from '../../i18n/en';
import { calculateTermVsPermanent, type TermVsPermanentInput } from '../../lib/calculators/termVsPermanent';
import { chartColors, MoneyChart } from './Chart';
import { CalculatorShell, NumberField, ResultRows, useMoney, type CalculatorProps } from './ui';

type Strings = Dictionary['calc']['items']['term-vs-permanent'];

export default function TermVsPermanent({ locale, common, strings: s, ...rest }: CalculatorProps<Strings>) {
  const [v, setV] = useState<TermVsPermanentInput>({
    termMonthly: 45,
    permanentMonthly: 320,
    years: 25,
    investReturn: 0.05,
  });
  const set = (k: keyof TermVsPermanentInput) => (n: number) => setV((p) => ({ ...p, [k]: n }));
  const r = calculateTermVsPermanent(v);
  const money = useMoney(locale);

  return (
    <CalculatorShell
      common={common}
      {...rest}
      headlineLabel={s.results.headline.replace('{years}', String(v.years))}
      headlineValue={money(r.investedDifference)}
      inputs={
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField locale={locale} label={s.fields.termMonthly} value={v.termMonthly} onChange={set('termMonthly')} />
            <NumberField locale={locale} label={s.fields.permanentMonthly} value={v.permanentMonthly} onChange={set('permanentMonthly')} />
          </div>
          <NumberField locale={locale} label={s.fields.years} value={v.years} onChange={set('years')} kind="number" suffix={common.years} slider min={5} max={40} />
          <NumberField locale={locale} label={s.fields.investReturn} value={v.investReturn} onChange={set('investReturn')} kind="percent" slider min={0} max={0.1} step={0.005} />
        </div>
      }
      summary={
        <ResultRows
          rows={[
            { label: s.results.monthlyDifference, value: money(r.monthlyDifference) },
            { label: s.results.termTotal, value: money(r.termTotal) },
            { label: s.results.permanentTotal, value: money(r.permanentTotal) },
          ]}
        />
      }
      note={s.results.note}
      chart={
        <MoneyChart
          locale={locale}
          data={r.series}
          xKey="year"
          xLabel={common.year}
          series={[
            { key: 'investedDifference', label: s.results.chartInvested, color: chartColors.brand, kind: 'area' },
            { key: 'permanentPaid', label: s.results.chartPermanent, color: chartColors.accent },
            { key: 'termPaid', label: s.results.chartTerm, color: chartColors.ink, dashed: true },
          ]}
        />
      }
    />
  );
}
