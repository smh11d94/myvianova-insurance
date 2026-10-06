import { ceilTo, clampMin0 } from './finance';

export interface CriticalIllnessInput {
  monthlyExpenses: number;
  recoveryMonths: number;
  treatmentCosts: number;
  debtPayoff: number;
  /** Income a partner or caregiver may lose while helping you recover. */
  caregiverIncomeLoss: number;
  savings: number;
  existingCoverage: number;
}

export interface CriticalIllnessResult {
  livingCosts: number;
  totalNeeds: number;
  totalResources: number;
  gap: number;
  /** Gap rounded up to the nearest $5,000. */
  suggestedCoverage: number;
}

export function calculateCriticalIllness(i: CriticalIllnessInput): CriticalIllnessResult {
  const livingCosts = i.monthlyExpenses * i.recoveryMonths;
  const totalNeeds = livingCosts + i.treatmentCosts + i.debtPayoff + i.caregiverIncomeLoss;
  const totalResources = i.savings + i.existingCoverage;
  const gap = clampMin0(totalNeeds - totalResources);
  return {
    livingCosts,
    totalNeeds,
    totalResources,
    gap,
    suggestedCoverage: gap > 0 ? ceilTo(gap, 5_000) : 0,
  };
}
