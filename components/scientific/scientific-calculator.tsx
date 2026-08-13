"use client";

import { useEffect, useRef, useState } from "react";
import { Delete } from "lucide-react";
import type { CalculatorDef } from "@/lib/types";
import { evaluateExpression, ExpressionError, type AngleMode } from "@/lib/expression-parser";
import { addHistoryEntry } from "@/lib/storage";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

type TapeEntry = { expression: string; result: string };

/** Auto-balance unclosed parentheses so casual mobile typing (e.g. "sin(30")
 *  still evaluates, without changing parser semantics. */
function autoClose(expr: string): string {
  const open = (expr.match(/\(/g) || []).length;
  const close = (expr.match(/\)/g) || []).length;
  return expr + ")".repeat(Math.max(0, open - close));
}

function toggleLeadingSign(expr: string): string {
  const match = expr.match(/(\d+(\.\d+)?)$/);
  if (!match) return expr;
  const start = expr.length - match[0].length;
  const before = expr.slice(0, start);
  const precedingIsMinusOperator = before.endsWith("-") && (start === 1 || /[+\-*/^(]$/.test(before.slice(0, -1)));
  if (precedingIsMinusOperator) {
    return before.slice(0, -1) + match[0];
  }
  return `${before}-(${match[0]})`;
}

const FUNCTION_BUTTONS: { label: string; insert: string; aria: string }[] = [
  { label: "sin", insert: "sin(", aria: "sine" },
  { label: "cos", insert: "cos(", aria: "cosine" },
  { label: "tan", insert: "tan(", aria: "tangent" },
  { label: "ln", insert: "ln(", aria: "natural log" },
  { label: "log", insert: "log(", aria: "log base 10" },
  { label: "√", insert: "sqrt(", aria: "square root" },
  { label: "(", insert: "(", aria: "open parenthesis" },
  { label: ")", insert: ")", aria: "close parenthesis" },
  { label: "π", insert: "pi", aria: "pi" },
  { label: "e", insert: "e", aria: "e" },
];

export function ScientificCalculator({
  def,
  initialExpression,
}: {
  def: CalculatorDef;
  initialExpression?: string;
}) {
  const [expression, setExpression] = useState(initialExpression ?? "");
  const [display, setDisplay] = useState<string>("0");
  const [angleMode, setAngleMode] = useState<AngleMode>("deg");
  const [memory, setMemory] = useState(0);
  const [tape, setTape] = useState<TapeEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const evaluatedOnMount = useRef(false);

  useEffect(() => {
    setDisplay(expression || "0");
  }, [expression]);

  function evaluate(exprToEval: string) {
    if (!exprToEval.trim()) return;
    try {
      const balanced = autoClose(exprToEval);
      const result = evaluateExpression(balanced, angleMode);
      const resultStr = Number.isInteger(result) ? String(result) : String(Math.round(result * 1e10) / 1e10);
      setDisplay(resultStr);
      setTape((t) => [{ expression: balanced, result: resultStr }, ...t].slice(0, 20));
      setError(null);
      setJustEvaluated(true);
      addHistoryEntry({
        slug: def.slug,
        title: def.title,
        summary: `${balanced} = ${resultStr}`,
        params: { expr: balanced },
      });
      setExpression(resultStr);
    } catch (err) {
      setError(err instanceof ExpressionError ? err.message : "Invalid expression");
    }
  }

  useEffect(() => {
    if (!evaluatedOnMount.current && initialExpression) {
      evaluatedOnMount.current = true;
      evaluate(initialExpression);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function append(token: string) {
    setError(null);
    setExpression((prev) => (justEvaluated && /^[0-9.]/.test(token) ? token : prev + token));
    setJustEvaluated(false);
  }

  function appendOperator(token: string) {
    setError(null);
    setExpression((prev) => prev + token);
    setJustEvaluated(false);
  }

  function backspace() {
    setError(null);
    setExpression((prev) => prev.slice(0, -1));
    setJustEvaluated(false);
  }

  function clearAll() {
    setExpression("");
    setError(null);
    setJustEvaluated(false);
  }

  function negate() {
    setExpression((prev) => toggleLeadingSign(prev));
  }

  // Keyboard support
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
      if (/^[0-9.]$/.test(e.key)) {
        append(e.key);
      } else if (["+", "-", "*", "/", "^", "(", ")", "%"].includes(e.key)) {
        appendOperator(e.key);
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        evaluate(expression);
      } else if (e.key === "Backspace") {
        backspace();
      } else if (e.key === "Escape") {
        clearAll();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expression, angleMode, justEvaluated]);

  const btnClass =
    "min-h-12 rounded-[var(--radius-sm)] text-base font-medium bg-surface-2 text-text hover:bg-border active:brightness-95 transition-colors duration-150";
  const opClass = "min-h-12 rounded-[var(--radius-sm)] text-lg font-semibold bg-accent-soft text-accent hover:brightness-95 transition-colors duration-150";

  return (
    <div className="flex flex-col gap-3 bg-surface border border-border rounded-[var(--radius-md)] p-3 sm:p-4">
      <div className="flex items-center justify-between text-xs">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setAngleMode("deg")}
            className={cn(
              "px-2 py-1 rounded-full border min-h-7",
              angleMode === "deg" ? "bg-accent text-accent-foreground border-accent" : "border-border text-text-secondary"
            )}
            aria-pressed={angleMode === "deg"}
          >
            DEG
          </button>
          <button
            type="button"
            onClick={() => setAngleMode("rad")}
            className={cn(
              "px-2 py-1 rounded-full border min-h-7",
              angleMode === "rad" ? "bg-accent text-accent-foreground border-accent" : "border-border text-text-secondary"
            )}
            aria-pressed={angleMode === "rad"}
          >
            RAD
          </button>
        </div>
        <span className="text-text-muted">M: {memory}</span>
      </div>

      <div
        className="min-h-20 rounded-[var(--radius-sm)] bg-surface-2 px-4 py-3 flex flex-col items-end justify-center overflow-x-auto"
        role="status"
        aria-live="polite"
        aria-label="Calculator display"
      >
        <span className="text-3xl sm:text-4xl font-semibold text-text tabular-nums break-all text-right">
          {display}
        </span>
        {error ? <span className="text-sm text-danger mt-1">{error}</span> : null}
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        <button type="button" className={btnClass} onClick={() => setMemory(0)}>
          MC
        </button>
        <button type="button" className={btnClass} onClick={() => setMemory((m) => m + (Number(display) || 0))}>
          M+
        </button>
        <button type="button" className={btnClass} onClick={() => setMemory((m) => m - (Number(display) || 0))}>
          M-
        </button>
        <button type="button" className={btnClass} onClick={() => append(String(memory))}>
          MR
        </button>
        <button type="button" className={btnClass} onClick={clearAll} aria-label="Clear all">
          AC
        </button>

        {FUNCTION_BUTTONS.map((f) => (
          <button key={f.label} type="button" className={btnClass} aria-label={f.aria} onClick={() => append(f.insert)}>
            {f.label}
          </button>
        ))}

        <button type="button" className={btnClass} onClick={() => append("^2")} aria-label="square">
          x²
        </button>
        <button type="button" className={btnClass} onClick={() => appendOperator("^")} aria-label="power">
          x^y
        </button>
        <button type="button" className={btnClass} onClick={() => appendOperator("!")} aria-label="factorial">
          n!
        </button>
        <button type="button" className={btnClass} onClick={() => appendOperator("%")} aria-label="percent">
          %
        </button>
        <button type="button" className={btnClass} onClick={backspace} aria-label="backspace">
          <Delete className="h-4 w-4 mx-auto" />
        </button>

        {["7", "8", "9"].map((d) => (
          <button key={d} type="button" className={btnClass} onClick={() => append(d)}>
            {d}
          </button>
        ))}
        <button type="button" className={opClass} onClick={() => appendOperator("/")} aria-label="divide">
          ÷
        </button>
        <button type="button" className={btnClass} onClick={negate} aria-label="negate">
          ±
        </button>

        {["4", "5", "6"].map((d) => (
          <button key={d} type="button" className={btnClass} onClick={() => append(d)}>
            {d}
          </button>
        ))}
        <button type="button" className={opClass} onClick={() => appendOperator("*")} aria-label="multiply">
          ×
        </button>
        <button type="button" className={btnClass} onClick={() => append(".")} aria-label="decimal point">
          .
        </button>

        {["1", "2", "3"].map((d) => (
          <button key={d} type="button" className={btnClass} onClick={() => append(d)}>
            {d}
          </button>
        ))}
        <button type="button" className={opClass} onClick={() => appendOperator("-")} aria-label="subtract">
          −
        </button>
        <button
          type="button"
          className="row-span-2 rounded-[var(--radius-sm)] text-lg font-semibold bg-accent text-accent-foreground hover:bg-accent-hover transition-colors duration-150"
          onClick={() => evaluate(expression)}
          aria-label="equals"
        >
          =
        </button>

        <button type="button" className={cn(btnClass, "col-span-3")} onClick={() => append("0")}>
          0
        </button>
        <button type="button" className={opClass} onClick={() => appendOperator("+")} aria-label="add">
          +
        </button>
      </div>

      {tape.length > 0 ? (
        <div className="border-t border-border pt-2">
          <h2 className="text-xs font-semibold text-text-secondary mb-1">Recent</h2>
          <ul className="flex flex-col gap-1 max-h-32 overflow-y-auto">
            {tape.map((t, i) => (
              <li key={i} className="text-xs text-text-muted flex justify-between gap-2">
                <span className="truncate">{t.expression}</span>
                <span className="text-text-secondary font-medium">{t.result}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
