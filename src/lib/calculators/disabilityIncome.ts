import { clampMin0 } from './finance';

export interface DisabilityIncomeInput {
  grossMonthlyIncome: number;
  /** Share of gross income you want protected, 0–1. Insurers usually cap around 0.6–0.7. */
  targetPct: number;
  /** Group long-term disability benefit as a share of gross income, 0–1. */
  groupPct: number;
  /** Monthly maximum of the group plan, 0 = no maximum. */
  groupMonthlyMax: number;
  /** Group benefits are taxable when the employer pays the premium. */
  groupTaxable: boolean;
  marginalTaxRate: number;
  otherMonthlyCoverage: number;
  yearsToRetirement: number;
}

export interface DisabilityIncomeResult {
  targetMonthly: number;
  groupGross: number;
  groupAfterTax: number;
  existingMonthly: number;
  monthlyGap: number;
  /** Income at risk if disabled until retirement without more coverage. */
  incomeAtRisk: number;
}

export function calculateDisabilityIncome(i: DisabilityIncomeInput): DisabilityIncomeResult {
  const targetMonthly = i.grossMonthlyIncome * i.targetPct;
  let groupGross = i.grossMonthlyIncome * i.groupPct;
  if (i.groupMonthlyMax > 0) groupGross = Math.min(groupGross, i.groupMonthlyMax);
  const groupAfterTax = i.groupTaxable ? groupGross * (1 - i.marginalTaxRate) : groupGross;
  const existingMonthly = groupAfterTax + i.otherMonthlyCoverage;
  const monthlyGap = clampMin0(targetMonthly - existingMonthly);
  return {
    targetMonthly,
    groupGross,
    groupAfterTax,
    existingMonthly,
    monthlyGap,
    incomeAtRisk: monthlyGap * 12 * Math.max(0, i.yearsToRetirement),
  };
}
