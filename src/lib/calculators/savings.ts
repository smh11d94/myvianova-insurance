// RRSP, TFSA and RESP growth projections. Contributions are made at the start of each year.

export interface GrowthPoint {
  year: number;
  contributed: number;
  balance: number;
}

function project(
  initial: number,
  years: number,
  rate: number,
  contributionFor: (year: number) => number,
): { series: GrowthPoint[]; contributed: number; balance: number } {
  let balance = initial;
  let contributed = 0;
  const series: GrowthPoint[] = [{ year: 0, contributed: 0, balance: initial }];
  for (let year = 1; year <= years; year++) {
    const c = contributionFor(year);
    contributed += c;
    balance = (balance + c) * (1 + rate);
    series.push({ year, contributed, balance });
  }
  return { series, contributed, balance };
}

export interface RrspInput {
  initialBalance: number;
  annualContribution: number;
  years: number;
  returnRate: number;
  marginalTaxRate: number;
  /** Tax rate expected on withdrawals in retirement. */
  retirementTaxRate: number;
}

export interface RrspResult {
  series: GrowthPoint[];
  contributed: number;
  balance: number;
  annualRefund: number;
  totalRefunds: number;
  afterTaxValue: number;
}

export function calculateRrsp(i: RrspInput): RrspResult {
  const p = project(i.initialBalance, i.years, i.returnRate, () => i.annualContribution);
  const annualRefund = i.annualContribution * i.marginalTaxRate;
  return {
    ...p,
    annualRefund,
    totalRefunds: annualRefund * i.years,
    afterTaxValue: p.balance * (1 - i.retirementTaxRate),
  };
}

export interface TfsaInput {
  initialBalance: number;
  annualContribution: number;
  years: number;
  returnRate: number;
}

export interface TfsaResult {
  series: GrowthPoint[];
  contributed: number;
  balance: number;
  taxFreeGrowth: number;
}

export function calculateTfsa(i: TfsaInput): TfsaResult {
  const p = project(i.initialBalance, i.years, i.returnRate, () => i.annualContribution);
  return { ...p, taxFreeGrowth: p.balance - p.contributed - i.initialBalance };
}

export const CESG_RATE = 0.2;
export const CESG_MAX_ANNUAL_CONTRIBUTION = 2_500;
export const CESG_LIFETIME_MAX = 7_200;
export const RESP_LIFETIME_CONTRIBUTION_MAX = 50_000;
/** CESG is paid on contributions up to the end of the calendar year the child turns 17. */
export const CESG_LAST_AGE = 17;

export interface RespInput {
  childAge: number;
  annualContribution: number;
  returnRate: number;
  /** Age the child starts post-secondary studies (usually 18). */
  studyAge: number;
}

export interface RespPoint extends GrowthPoint {
  grants: number;
}

export interface RespResult {
  series: RespPoint[];
  contributed: number;
  grants: number;
  balance: number;
  growth: number;
}

export function calculateResp(i: RespInput): RespResult {
  const years = Math.max(0, i.studyAge - i.childAge);
  let balance = 0;
  let contributed = 0;
  let grants = 0;
  const series: RespPoint[] = [{ year: 0, contributed: 0, grants: 0, balance: 0 }];
  for (let year = 1; year <= years; year++) {
    const age = i.childAge + year - 1;
    const c = Math.min(i.annualContribution, RESP_LIFETIME_CONTRIBUTION_MAX - contributed);
    let grant = 0;
    if (age <= CESG_LAST_AGE) {
      grant = Math.min(c, CESG_MAX_ANNUAL_CONTRIBUTION) * CESG_RATE;
      grant = Math.min(grant, CESG_LIFETIME_MAX - grants);
    }
    contributed += c;
    grants += grant;
    balance = (balance + c + grant) * (1 + i.returnRate);
    series.push({ year, contributed, grants, balance });
  }
  return { series, contributed, grants, balance, growth: balance - contributed - grants };
}
