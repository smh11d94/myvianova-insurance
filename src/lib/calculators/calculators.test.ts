import { describe, expect, it } from 'vitest';
import { amortizedPayment, pvAnnuityDue, realRate } from './finance';
import { calculateLifeNeeds } from './lifeNeeds';
import { calculateTermVsPermanent } from './termVsPermanent';
import { calculateCriticalIllness } from './criticalIllness';
import { calculateDisabilityIncome } from './disabilityIncome';
import { calculateLongTermCare } from './longTermCare';
import { calculateSegFund } from './segFund';
import { calculateAnnuity } from './annuity';
import { calculateResp, calculateRrsp, calculateTfsa } from './savings';

describe('finance helpers', () => {
  it('computes annuity-due present value', () => {
    expect(pvAnnuityDue(1000, 0, 5)).toBe(5000);
    expect(pvAnnuityDue(1000, 0.05, 3)).toBeCloseTo(2859.41, 2);
    expect(pvAnnuityDue(1000, 0.05, 0)).toBe(0);
  });

  it('computes amortized payments', () => {
    expect(amortizedPayment(100_000, 0.05 / 12, 120)).toBeCloseTo(1060.66, 2);
    expect(amortizedPayment(1200, 0, 12)).toBe(100);
  });

  it('computes the real rate', () => {
    expect(realRate(0.05, 0.05)).toBeCloseTo(0, 12);
    expect(realRate(0.06, 0.02)).toBeCloseTo(0.0392157, 6);
  });
});

describe('life insurance needs', () => {
  it('adds needs, subtracts resources and rounds coverage up', () => {
    const r = calculateLifeNeeds({
      annualIncome: 100_000,
      replacementPct: 0.7,
      yearsOfSupport: 10,
      returnRate: 0.05,
      inflationRate: 0.05,
      mortgage: 300_000,
      otherDebts: 20_000,
      finalExpenses: 25_000,
      educationFund: 50_000,
      emergencyFund: 0,
      existingCoverage: 200_000,
      liquidAssets: 50_000,
    });
    expect(r.incomeReplacement).toBeCloseTo(700_000, 4);
    expect(r.totalNeeds).toBeCloseTo(1_095_000, 4);
    expect(r.gap).toBeCloseTo(845_000, 4);
    expect(r.suggestedCoverage).toBe(850_000);
  });

  it('never returns a negative gap', () => {
    const r = calculateLifeNeeds({
      annualIncome: 0, replacementPct: 0.7, yearsOfSupport: 10, returnRate: 0.05, inflationRate: 0.02,
      mortgage: 0, otherDebts: 0, finalExpenses: 10_000, educationFund: 0, emergencyFund: 0,
      existingCoverage: 500_000, liquidAssets: 0,
    });
    expect(r.gap).toBe(0);
    expect(r.suggestedCoverage).toBe(0);
  });
});

describe('term vs permanent', () => {
  it('invests the premium difference', () => {
    const r = calculateTermVsPermanent({ termMonthly: 50, permanentMonthly: 250, years: 1, investReturn: 0 });
    expect(r.monthlyDifference).toBe(200);
    expect(r.investedDifference).toBe(2400);
    expect(r.termTotal).toBe(600);
    expect(r.permanentTotal).toBe(3000);
    expect(r.series).toHaveLength(2);
  });
});

describe('critical illness', () => {
  it('sizes the lump sum to the nearest $5,000', () => {
    const r = calculateCriticalIllness({
      monthlyExpenses: 4000, recoveryMonths: 12, treatmentCosts: 20_000, debtPayoff: 10_000,
      caregiverIncomeLoss: 0, savings: 10_000, existingCoverage: 0,
    });
    expect(r.totalNeeds).toBe(78_000);
    expect(r.gap).toBe(68_000);
    expect(r.suggestedCoverage).toBe(70_000);
  });
});

describe('disability income', () => {
  it('caps and taxes group coverage', () => {
    const r = calculateDisabilityIncome({
      grossMonthlyIncome: 8000, targetPct: 0.7, groupPct: 0.6, groupMonthlyMax: 4000,
      groupTaxable: true, marginalTaxRate: 0.3, otherMonthlyCoverage: 0, yearsToRetirement: 20,
    });
    expect(r.targetMonthly).toBe(5600);
    expect(r.groupGross).toBe(4000);
    expect(r.groupAfterTax).toBeCloseTo(2800, 6);
    expect(r.monthlyGap).toBeCloseTo(2800, 6);
    expect(r.incomeAtRisk).toBeCloseTo(672_000, 4);
  });
});

describe('long-term care', () => {
  it('projects cost and shortfall', () => {
    const flat = calculateLongTermCare({
      currentAge: 60, careStartAge: 80, monthlyCostToday: 5000, inflationRate: 0, yearsOfCare: 3, monthlySupportToday: 1000,
    });
    expect(flat.totalCost).toBe(180_000);
    expect(flat.totalShortfall).toBe(144_000);
    const inflated = calculateLongTermCare({
      currentAge: 60, careStartAge: 80, monthlyCostToday: 5000, inflationRate: 0.03, yearsOfCare: 3, monthlySupportToday: 0,
    });
    expect(inflated.monthlyCostAtStart).toBeCloseTo(9030.56, 2);
  });
});

describe('segregated fund guarantee', () => {
  it('pays market value when above the guarantee', () => {
    const r = calculateSegFund({ deposit: 100_000, years: 10, annualReturn: 0, mer: 0, guaranteePct: 0.75 });
    expect(r.payout).toBe(100_000);
    expect(r.topUp).toBe(0);
  });

  it('tops up to the guaranteed floor in a downturn', () => {
    const r = calculateSegFund({ deposit: 100_000, years: 10, annualReturn: -0.05, mer: 0, guaranteePct: 1 });
    expect(r.marketValue).toBeCloseTo(59_873.69, 2);
    expect(r.topUp).toBeCloseTo(40_126.31, 2);
    expect(r.payout).toBeCloseTo(100_000, 6);
  });
});

describe('annuity payout', () => {
  it('amortizes the principal monthly', () => {
    expect(calculateAnnuity({ principal: 100_000, annualRate: 0.05, years: 10, paymentsInAdvance: false }).monthlyPayment)
      .toBeCloseTo(1060.66, 2);
    expect(calculateAnnuity({ principal: 100_000, annualRate: 0.05, years: 10, paymentsInAdvance: true }).monthlyPayment)
      .toBeCloseTo(1056.25, 2);
    expect(calculateAnnuity({ principal: 100_000, annualRate: 0, years: 10, paymentsInAdvance: false }).monthlyPayment)
      .toBeCloseTo(833.33, 2);
  });
});

describe('registered savings', () => {
  it('grows RRSP contributions and reports refunds', () => {
    const r = calculateRrsp({
      initialBalance: 0, annualContribution: 1000, years: 3, returnRate: 0.1, marginalTaxRate: 0.4, retirementTaxRate: 0.2,
    });
    expect(r.balance).toBeCloseTo(3641, 6);
    expect(r.annualRefund).toBe(400);
    expect(r.totalRefunds).toBe(1200);
    expect(r.afterTaxValue).toBeCloseTo(2912.8, 6);
  });

  it('reports TFSA tax-free growth', () => {
    const r = calculateTfsa({ initialBalance: 0, annualContribution: 1000, years: 3, returnRate: 0.1 });
    expect(r.taxFreeGrowth).toBeCloseTo(641, 6);
  });

  it('caps CESG at the $7,200 lifetime maximum', () => {
    const r = calculateResp({ childAge: 0, annualContribution: 2500, returnRate: 0, studyAge: 18 });
    expect(r.contributed).toBe(45_000);
    expect(r.grants).toBe(7200);
    expect(r.balance).toBe(52_200);
  });

  it('caps contributions at the $50,000 lifetime limit', () => {
    const r = calculateResp({ childAge: 0, annualContribution: 5000, returnRate: 0, studyAge: 18 });
    expect(r.contributed).toBe(50_000);
    expect(r.grants).toBe(5000);
  });

  it('stops CESG after the year the child turns 17', () => {
    const r = calculateResp({ childAge: 16, annualContribution: 2500, returnRate: 0, studyAge: 20 });
    expect(r.grants).toBe(1000);
  });
});
