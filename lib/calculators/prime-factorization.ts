import { Hash } from "lucide-react";
import { z } from "zod";
import type { CalcResult, CalculatorDef } from "../types";
import { numberField } from "../validation";

export const primeFactorizationSchema = z.object({
  value: numberField({ label: "Number", min: 2, max: 100_000_000, integer: true }),
});

export type PrimeFactorizationValues = z.infer<typeof primeFactorizationSchema>;

function calculate(values: PrimeFactorizationValues): CalcResult {
  let n = values.value;
  const factors: number[] = [];
  for (let d = 2; d * d <= n; d++) {
    while (n % d === 0) {
      factors.push(d);
      n /= d;
    }
  }
  if (n > 1) factors.push(n);

  const counts = new Map<number, number>();
  for (const f of factors) counts.set(f, (counts.get(f) ?? 0) + 1);
  const exponentForm = [...counts.entries()].map(([base, exp]) => (exp > 1 ? `${base}^${exp}` : `${base}`)).join(" × ");

  const isPrime = factors.length === 1;

  return {
    primary: { key: "factorization", label: "Prime factorization", value: exponentForm, format: "text" },
    secondary: [
      { key: "factorList", label: "Factors", value: factors.join(" × "), format: "text" },
      { key: "isPrime", label: "Is prime?", value: isPrime ? "Yes" : "No", format: "text" },
    ],
  };
}

export const primeFactorizationCalculator: CalculatorDef = {
  id: "prime-factorization",
  slug: "prime-factorization",
  title: "Prime Factorization Calculator",
  description: "Break a number down into its prime factors.",
  category: "math",
  icon: Hash,
  keywords: ["prime factorization", "prime factors", "factor tree", "is it prime"],
  inputs: [
    { name: "value", label: "Number", kind: "number", defaultValue: "", min: 2, max: 100_000_000, step: 1, required: true },
  ],
  schema: primeFactorizationSchema,
  calculate: calculate as (values: Record<string, unknown>) => CalcResult,
  formula: "Repeatedly divide by the smallest possible prime until only 1 remains — every remaining divisor found is a prime factor.",
  explanation: [
    {
      heading: "Every number has a unique prime factorization",
      body: "This is the Fundamental Theorem of Arithmetic — every integer greater than 1 is either prime itself or can be broken down into primes in exactly one way (ignoring order).",
    },
  ],
  faq: [
    { q: "How do I know if a number is prime?", a: "If the factorization contains only the number itself (no smaller prime factors), it's prime." },
  ],
  related: ["factor", "gcf", "lcm"],
};
