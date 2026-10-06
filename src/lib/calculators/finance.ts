// Shared time-value-of-money helpers. Rates are decimals (0.05 = 5%).

/** Real rate of return after inflation. */
export function realRate(nominal: number, inflation: number): number {
  return (1 + nominal) / (1 + inflation) - 1;
}

/** Present value of `n` level payments made at the start of each period (annuity due). */
export function pvAnnuityDue(payment: number, rate: number, n: number): number {
  if (n <= 0) return 0;
  if (Math.abs(rate) < 1e-12) return payment * n;
  return payment * ((1 - Math.pow(1 + rate, -n)) / rate) * (1 + rate);
}

/** Level payment that amortizes `pv` over `n` periods (paid at period end). */
export function amortizedPayment(pv: number, rate: number, n: number): number {
  if (n <= 0) return 0;
  if (Math.abs(rate) < 1e-12) return pv / n;
  return (pv * rate) / (1 - Math.pow(1 + rate, -n));
}

export function clampMin0(n: number): number {
  return n > 0 ? n : 0;
}

export function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step;
}

export function ceilTo(n: number, step: number): number {
  return Math.ceil(n / step) * step;
}
