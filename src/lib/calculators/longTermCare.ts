import { clampMin0 } from './finance';

export interface LongTermCareInput {
  currentAge: number;
  careStartAge: number;
  /** Monthly cost of care in today's dollars. */
  monthlyCostToday: number;
  inflationRate: number;
  yearsOfCare: number;
  /** Monthly government support or pension income that will go toward care, in today's dollars. */
  monthlySupportToday: number;
}

export interface LongTermCarePoint {
  age: number;
  annualCost: number;
  annualShortfall: number;
}

export interface LongTermCareResult {
  monthlyCostAtStart: number;
  totalCost: number;
  totalShortfall: number;
  series: LongTermCarePoint[];
}

export function calculateLongTermCare(i: LongTermCareInput): LongTermCareResult {
  const yearsUntilCare = Math.max(0, i.careStartAge - i.currentAge);
  const growth = (k: number) => Math.pow(1 + i.inflationRate, yearsUntilCare + k);
  const series: LongTermCarePoint[] = [];
  let totalCost = 0;
  let totalShortfall = 0;
  for (let k = 0; k < i.yearsOfCare; k++) {
    const annualCost = i.monthlyCostToday * 12 * growth(k);
    const annualShortfall = clampMin0(annualCost - i.monthlySupportToday * 12 * growth(k));
    totalCost += annualCost;
    totalShortfall += annualShortfall;
    series.push({ age: i.careStartAge + k, annualCost, annualShortfall });
  }
  return {
    monthlyCostAtStart: i.monthlyCostToday * growth(0),
    totalCost,
    totalShortfall,
    series,
  };
}
