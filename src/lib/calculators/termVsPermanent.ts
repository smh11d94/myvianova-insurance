export interface TermVsPermanentInput {
  termMonthly: number;
  permanentMonthly: number;
  years: number;
  /** Annual return on the invested premium difference. */
  investReturn: number;
}

export interface TermVsPermanentPoint {
  year: number;
  termPaid: number;
  permanentPaid: number;
  investedDifference: number;
}

export interface TermVsPermanentResult {
  series: TermVsPermanentPoint[];
  monthlyDifference: number;
  termTotal: number;
  permanentTotal: number;
  investedDifference: number;
}

/**
 * "Buy term and invest the difference": cumulative premiums for each option plus the
 * value of investing the monthly premium difference, compounded monthly.
 */
export function calculateTermVsPermanent(i: TermVsPermanentInput): TermVsPermanentResult {
  const monthlyDifference = Math.max(0, i.permanentMonthly - i.termMonthly);
  const r = i.investReturn / 12;
  const series: TermVsPermanentPoint[] = [{ year: 0, termPaid: 0, permanentPaid: 0, investedDifference: 0 }];
  let balance = 0;
  for (let year = 1; year <= i.years; year++) {
    for (let m = 0; m < 12; m++) balance = (balance + monthlyDifference) * (1 + r);
    series.push({
      year,
      termPaid: i.termMonthly * 12 * year,
      permanentPaid: i.permanentMonthly * 12 * year,
      investedDifference: balance,
    });
  }
  const last = series[series.length - 1];
  return {
    series,
    monthlyDifference,
    termTotal: last.termPaid,
    permanentTotal: last.permanentPaid,
    investedDifference: last.investedDifference,
  };
}
