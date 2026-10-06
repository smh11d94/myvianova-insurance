export interface SegFundInput {
  deposit: number;
  years: number;
  /** Gross annual return before fees for the scenario the user picks. */
  annualReturn: number;
  /** Management expense ratio, deducted from the return each year. */
  mer: number;
  /** Maturity/death benefit guarantee, 0.75 or 1. */
  guaranteePct: number;
}

export interface SegFundPoint {
  year: number;
  marketValue: number;
  guaranteed: number;
}

export interface SegFundResult {
  series: SegFundPoint[];
  marketValue: number;
  guaranteedAmount: number;
  /** What the policy pays at maturity: the higher of market value and the guarantee. */
  payout: number;
  /** Amount the insurer adds when markets fall below the guarantee. */
  topUp: number;
}

export function calculateSegFund(i: SegFundInput): SegFundResult {
  const netGrowth = (1 + i.annualReturn) * (1 - i.mer);
  const guaranteedAmount = i.deposit * i.guaranteePct;
  const series: SegFundPoint[] = [];
  let value = i.deposit;
  for (let year = 0; year <= i.years; year++) {
    if (year > 0) value *= netGrowth;
    series.push({ year, marketValue: value, guaranteed: guaranteedAmount });
  }
  const topUp = Math.max(0, guaranteedAmount - value);
  return {
    series,
    marketValue: value,
    guaranteedAmount,
    payout: value + topUp,
    topUp,
  };
}
