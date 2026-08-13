import Decimal from "decimal.js";

// Configure once for the whole app: enough precision for money math,
// ROUND_HALF_UP matches how people expect currency to round.
Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export { Decimal };

export function toDecimal(value: number | string): Decimal {
  return new Decimal(value === "" || value === null || value === undefined ? 0 : value);
}

/** Round a Decimal to 2 places and return a plain JS number (safe for display/JSON). */
export function toMoney(value: Decimal): number {
  return Number(value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2));
}

export function toRounded(value: Decimal, places = 2): number {
  return Number(value.toDecimalPlaces(places, Decimal.ROUND_HALF_UP).toFixed(places));
}

/**
 * Standard amortizing loan payment formula, computed with decimal.js:
 *   M = P * r / (1 - (1 + r)^-n)     when r > 0
 *   M = P / n                        when r == 0
 * where r is the *periodic* interest rate and n the number of periods.
 */
export function monthlyPayment(principal: Decimal, periodicRate: Decimal, numPayments: number): Decimal {
  if (numPayments <= 0) return new Decimal(0);
  if (periodicRate.isZero()) {
    return principal.dividedBy(numPayments);
  }
  const onePlusR = periodicRate.plus(1);
  const denominator = new Decimal(1).minus(onePlusR.pow(-numPayments));
  return principal.times(periodicRate).dividedBy(denominator);
}

export type AmortizationRow = {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

/** Full amortization schedule using decimal-safe arithmetic throughout. */
export function buildAmortizationSchedule(
  principal: Decimal,
  periodicRate: Decimal,
  numPayments: number,
  payment: Decimal
): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  let balance = principal;
  for (let period = 1; period <= numPayments && balance.greaterThan(0); period++) {
    const interestPortion = balance.times(periodicRate);
    let principalPortion = payment.minus(interestPortion);
    let actualPayment = payment;
    if (principalPortion.greaterThan(balance)) {
      principalPortion = balance;
      actualPayment = principalPortion.plus(interestPortion);
    }
    balance = balance.minus(principalPortion);
    if (balance.abs().lessThan(0.005)) balance = new Decimal(0);
    rows.push({
      period,
      payment: toMoney(actualPayment),
      principal: toMoney(principalPortion),
      interest: toMoney(interestPortion),
      balance: toMoney(balance),
    });
  }
  return rows;
}
