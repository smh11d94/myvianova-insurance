import { useState } from 'react';
import type { Dictionary } from '../../i18n/en';
import { calculateResp, calculateRrsp, calculateTfsa } from '../../lib/calculators/savings';
import { chartColors, MoneyChart } from './Chart';
import { CalculatorShell, NumberField, ResultRows, Segmented, useMoney, type CalculatorProps } from './ui';

type Strings = Dictionary['calc']['items']['rrsp-tfsa-resp'];
type Plan = 'rrsp' | 'tfsa' | 'resp';

export default function SavingsGrowth({ locale, common, strings: s, product: _product, ...rest }: CalculatorProps<Strings>) {
  const [plan, setPlan] = useState<Plan>(() => {
    if (typeof window === 'undefined') return 'rrsp';
    const p = new URLSearchParams(window.location.search).get('plan');
    return p === 'tfsa' || p === 'resp' ? p : 'rrsp';
  });
  const [v, setV] = useState({
    initialBalance: 10_000,
    annualContribution: 6_000,
    years: 25,
    returnRate: 0.05,
    marginalTaxRate: 0.3,
    retirementTaxRate: 0.2,
    childAge: 2,
    respContribution: 2_500,
    studyAge: 18,
  });
  type Key = keyof typeof v;
  const set = (k: Key) => (n: number) => setV((p) => ({ ...p, [k]: n }));
  const money = useMoney(locale);
  const f = s.fields;
  const res = s.results;
  const num = (k: Key, label: string, extra: Partial<Parameters<typeof NumberField>[0]> = {}) => (
    <NumberField locale={locale} label={label} value={v[k]} onChange={set(k)} {...extra} />
  );

  let headlineLabel: string;
  let headlineValue: number;
  let rows: { label: string; value: string; emphasis?: boolean }[];
  let series: object[];
  let note: string;

  if (plan === 'rrsp') {
    const r = calculateRrsp(v);
    headlineLabel = res.rrspHeadline;
    headlineValue = r.balance;
    rows = [
      { label: res.contributed, value: money(r.contributed) },
      { label: res.annualRefund, value: money(r.annualRefund) },
      { label: res.totalRefunds, value: money(r.totalRefunds) },
      { label: res.afterTaxValue, value: money(r.afterTaxValue), emphasis: true },
    ];
    series = r.series;
    note = res.roomNote;
  } else if (plan === 'tfsa') {
    const r = calculateTfsa(v);
    headlineLabel = res.tfsaHeadline;
    headlineValue = r.balance;
    rows = [
      { label: res.contributed, value: money(r.contributed) },
      { label: res.taxFreeGrowth, value: money(r.taxFreeGrowth), emphasis: true },
    ];
    series = r.series;
    note = res.roomNote;
  } else {
    const r = calculateResp({ childAge: v.childAge, annualContribution: v.respContribution, returnRate: v.returnRate, studyAge: v.studyAge });
    headlineLabel = res.respHeadline;
    headlineValue = r.balance;
    rows = [
      { label: res.contributed, value: money(r.contributed) },
      { label: res.grants, value: money(r.grants), emphasis: true },
      { label: res.growth, value: money(r.growth) },
    ];
    series = r.series;
    note = res.respNote;
  }

  return (
    <CalculatorShell
      common={common}
      {...rest}
      product={plan}
      headlineLabel={headlineLabel}
      headlineValue={money(headlineValue)}
      inputs={
        <div className="space-y-5">
          <Segmented<Plan>
            label={s.title}
            value={plan}
            onChange={setPlan}
            options={(['rrsp', 'tfsa', 'resp'] as const).map((p) => ({ value: p, label: s.tabs[p] }))}
          />
          {plan === 'resp' ? (
            <>
              {num('respContribution', f.annualContribution, { slider: true, max: 10_000, step: 250 })}
              <div className="grid gap-4 sm:grid-cols-2">
                {num('childAge', f.childAge, { kind: 'number', max: 17 })}
                {num('studyAge', f.studyAge, { kind: 'number', min: 17, max: 25 })}
              </div>
              {num('returnRate', f.returnRate, { kind: 'percent', slider: true, max: 0.1, step: 0.005 })}
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {num('initialBalance', f.initialBalance)}
                {num('annualContribution', f.annualContribution)}
              </div>
              {num('years', f.years, { kind: 'number', suffix: common.years, slider: true, min: 1, max: 45 })}
              {num('returnRate', f.returnRate, { kind: 'percent', slider: true, max: 0.1, step: 0.005 })}
              {plan === 'rrsp' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {num('marginalTaxRate', f.marginalTaxRate, { kind: 'percent', max: 0.55 })}
                  {num('retirementTaxRate', f.retirementTaxRate, { kind: 'percent', max: 0.55 })}
                </div>
              )}
            </>
          )}
        </div>
      }
      summary={<ResultRows rows={rows} />}
      note={note}
      chart={
        <MoneyChart
          locale={locale}
          data={series}
          xKey="year"
          xLabel={common.year}
          series={[
            { key: 'balance', label: res.chartBalance, color: chartColors.brand, kind: 'area' },
            { key: 'contributed', label: res.chartContributed, color: chartColors.ink, dashed: true },
          ]}
        />
      }
    />
  );
}
