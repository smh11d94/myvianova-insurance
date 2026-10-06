import { useState } from 'react';
import type { Dictionary } from '../../i18n/en';
import { calculateSegFund, type SegFundInput } from '../../lib/calculators/segFund';
import { chartColors, MoneyChart } from './Chart';
import { CalculatorShell, NumberField, ResultRows, Segmented, useMoney, type CalculatorProps } from './ui';

type Strings = Dictionary['calc']['items']['segregated-fund-guarantee'];

const scenarios = { strong: 0.08, steady: 0.05, flat: 0, downturn: -0.04 } as const;
type Scenario = keyof typeof scenarios;

export default function SegFundGuarantee({ locale, common, strings: s, ...rest }: CalculatorProps<Strings>) {
  const [v, setV] = useState<SegFundInput>({
    deposit: 100_000,
    years: 10,
    annualReturn: scenarios.steady,
    mer: 0.025,
    guaranteePct: 0.75,
  });
  const set = (k: keyof SegFundInput) => (n: number) => setV((p) => ({ ...p, [k]: n }));
  const r = calculateSegFund(v);
  const money = useMoney(locale);
  const f = s.fields;
  const activeScenario = (Object.keys(scenarios) as Scenario[]).find((k) => Math.abs(scenarios[k] - v.annualReturn) < 1e-9);

  return (
    <CalculatorShell
      common={common}
      {...rest}
      headlineLabel={s.results.headline}
      headlineValue={money(r.payout)}
      inputs={
        <div className="space-y-5">
          <NumberField locale={locale} label={f.deposit} value={v.deposit} onChange={set('deposit')} slider max={1_000_000} step={5_000} />
          <NumberField locale={locale} label={f.years} value={v.years} onChange={set('years')} kind="number" suffix={common.years} slider min={10} max={30} />
          <Segmented
            label={f.guaranteePct}
            value={v.guaranteePct}
            onChange={(n) => set('guaranteePct')(n)}
            options={[
              { value: 0.75, label: '75%' },
              { value: 1, label: '100%' },
            ]}
          />
          <Segmented<Scenario | 'custom'>
            label={s.scenarios.label}
            value={activeScenario ?? 'custom'}
            onChange={(k) => k !== 'custom' && set('annualReturn')(scenarios[k])}
            options={(Object.keys(scenarios) as Scenario[]).map((k) => ({ value: k, label: s.scenarios[k] }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField locale={locale} label={f.annualReturn} value={v.annualReturn} onChange={set('annualReturn')} kind="percent" min={-0.2} max={0.15} />
            <NumberField locale={locale} label={f.mer} value={v.mer} onChange={set('mer')} kind="percent" max={0.05} />
          </div>
        </div>
      }
      summary={
        <ResultRows
          rows={[
            { label: s.results.marketValue, value: money(r.marketValue) },
            { label: s.results.guaranteedAmount, value: money(r.guaranteedAmount) },
            { label: s.results.topUp, value: money(r.topUp), emphasis: r.topUp > 0 },
          ]}
        />
      }
      note={r.topUp > 0 ? s.results.protected : s.results.growing}
      chart={
        <MoneyChart
          locale={locale}
          data={r.series}
          xKey="year"
          xLabel={common.year}
          series={[
            { key: 'marketValue', label: s.results.chartMarket, color: chartColors.brand, kind: 'area' },
            { key: 'guaranteed', label: s.results.chartGuarantee, color: chartColors.accent, dashed: true },
          ]}
        />
      }
    />
  );
}
