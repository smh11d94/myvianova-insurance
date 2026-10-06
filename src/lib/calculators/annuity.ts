import { amortizedPayment } from './finance';

export interface AnnuityInput {
  principal: number;
  annualRate: number;
  years: number;
  /** true = first payment today (annuity due), false = first payment in one month. */
  paymentsInAdvance: boolean;
}

export interface AnnuityResult {
  monthlyPayment: number;
  totalPayments: number;
  interestEarned: number;
}

/** Term-certain annuity paid monthly. Rate compounds monthly at annualRate / 12. */
export function calculateAnnuity(i: AnnuityInput): AnnuityResult {
  const n = Math.round(i.years * 12);
  const r = i.annualRate / 12;
  let monthlyPayment = amortizedPayment(i.principal, r, n);
  if (i.paymentsInAdvance) monthlyPayment /= 1 + r;
  const totalPayments = monthlyPayment * n;
  return {
    monthlyPayment,
    totalPayments,
    interestEarned: totalPayments - i.principal,
  };
}
