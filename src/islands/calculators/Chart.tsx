import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Locale } from '../../i18n/config';
import { formatCompactCurrency, formatCurrency, formatNumber } from '../../lib/format';

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  kind?: 'line' | 'area';
  dashed?: boolean;
}

interface Props {
  locale: Locale;
  data: object[];
  xKey: string;
  xLabel: string;
  series: ChartSeries[];
}

export const chartColors = {
  brand: '#1b6f63',
  accent: '#e08a1e',
  ink: '#3d5566',
  soft: '#74c3b6',
};

/** Line/area chart for money over time. Rendered LTR even on RTL pages so time reads left to right. */
export function MoneyChart({ locale, data, xKey, xLabel, series }: Props) {
  return (
    <div dir="ltr" className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="#e6e0d6" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: '#3d5566' }}
            tickFormatter={(v) => formatNumber(locale, Number(v))}
            tickLine={false}
            axisLine={{ stroke: '#e6e0d6' }}
            label={{ value: xLabel, position: 'insideBottomRight', offset: -2, fontSize: 11, fill: '#3d5566' }}
          />
          <YAxis
            width={64}
            tick={{ fontSize: 12, fill: '#3d5566' }}
            tickFormatter={(v) => formatCompactCurrency(locale, Number(v))}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value, name) => [formatCurrency(locale, Number(value)), name]}
            labelFormatter={(label) => `${xLabel} ${formatNumber(locale, Number(label))}`}
            contentStyle={{ borderRadius: 12, borderColor: '#e6e0d6', fontSize: 13 }}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} iconType="plainline" />
          {series.map((s) =>
            s.kind === 'area' ? (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.12}
                strokeWidth={2.5}
                isAnimationActive={false}
              />
            ) : (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={s.dashed ? '6 4' : undefined}
                dot={false}
                isAnimationActive={false}
              />
            ),
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
