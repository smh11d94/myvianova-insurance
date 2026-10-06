import { ceilTo, clampMin0, pvAnnuityDue, realRate } from './finance';

export interface LifeNeedsInput {
  annualIncome: number;
  /** Share of income the family needs replaced, 0–1. */
  replacementPct: number;
  yearsOfSupport: number;
  returnRate: number;
  inflationRate: number;
  mortgage: number;
  otherDebts: number;
  finalExpenses: number;
  educationFund: number;
  emergencyFund: number;
  existingCoverage: number;
  liquidAssets: number;
}

export interface LifeNeedsResult {
  incomeReplacement: number;
  debts: number;
  oneTimeCosts: number;
  totalNeeds: number;
  totalResources: number;
  gap: number;
  /** Gap rounded up to the nearest $25,000, the way coverage is usually bought. */
  suggestedCoverage: number;
}

export function calculateLifeNeeds(i: LifeNeedsInput): LifeNeedsResult {
  const annualNeed = i.annualIncome * i.replacementPct;
  const incomeReplacement = pvAnnuityDue(
    annualNeed,
    realRate(i.returnRate, i.inflationRate),
    i.yearsOfSupport,
  );
  const debts = i.mortgage + i.otherDebts;
  const oneTimeCosts = i.finalExpenses + i.educationFund + i.emergencyFund;
  const totalNeeds = incomeReplacement + debts + oneTimeCosts;
  const totalResources = i.existingCoverage + i.liquidAssets;
  const gap = clampMin0(totalNeeds - totalResources);
  return {
    incomeReplacement,
    debts,
    oneTimeCosts,
    totalNeeds,
    totalResources,
    gap,
    suggestedCoverage: gap > 0 ? ceilTo(gap, 25_000) : 0,
  };
}
