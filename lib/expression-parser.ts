/**
 * Hand-written safe math expression parser/evaluator for the scientific
 * calculator. Deliberately does NOT use eval() or new Function().
 *
 * Grammar (recursive descent, standard operator precedence):
 *
 *   expression := term (('+' | '-') term)*
 *   term       := unary (('*' | '/' | implicit-mult) unary)*
 *   unary      := ('-' | '+') unary | power
 *   power      := postfix ('^' unary)?        // right-associative
 *   postfix    := primary ('!' | '%')*
 *   primary    := NUMBER | CONST | FUNC '(' expression ')' | '(' expression ')'
 *
 * Angle mode (deg/rad) affects trig functions only.
 */

export type AngleMode = "deg" | "rad";

export class ExpressionError extends Error {}

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

type UnaryFn = (x: number) => number;

function factorial(n: number): number {
  if (n < 0 || !Number.isFinite(n)) throw new ExpressionError("Invalid factorial input");
  if (Math.abs(n - Math.round(n)) > 1e-9) throw new ExpressionError("Factorial requires an integer");
  const r = Math.round(n);
  if (r > 170) throw new ExpressionError("Value too large");
  let result = 1;
  for (let i = 2; i <= r; i++) result *= i;
  return result;
}

function buildFunctions(mode: AngleMode): Record<string, UnaryFn> {
  const toRad = (x: number) => (mode === "deg" ? (x * Math.PI) / 180 : x);
  const fromRad = (x: number) => (mode === "deg" ? (x * 180) / Math.PI : x);
  return {
    sin: (x) => Math.sin(toRad(x)),
    cos: (x) => Math.cos(toRad(x)),
    tan: (x) => Math.tan(toRad(x)),
    asin: (x) => fromRad(Math.asin(x)),
    acos: (x) => fromRad(Math.acos(x)),
    atan: (x) => fromRad(Math.atan(x)),
    sqrt: (x) => {
      if (x < 0) throw new ExpressionError("Cannot take square root of a negative number");
      return Math.sqrt(x);
    },
    cbrt: (x) => Math.cbrt(x),
    ln: (x) => {
      if (x <= 0) throw new ExpressionError("ln requires a positive number");
      return Math.log(x);
    },
    log: (x) => {
      if (x <= 0) throw new ExpressionError("log requires a positive number");
      return Math.log10(x);
    },
    abs: (x) => Math.abs(x),
    exp: (x) => Math.exp(x),
  };
}

type TokenType =
  | "number"
  | "identifier"
  | "op"
  | "lparen"
  | "rparen"
  | "comma"
  | "eof";

type Token = { type: TokenType; value: string };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = input.replace(/\s+/g, "");
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i + 1;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      // scientific notation e.g. 1.5e-10
      if (j < s.length && (s[j] === "e" || s[j] === "E")) {
        let k = j + 1;
        if (s[k] === "+" || s[k] === "-") k++;
        if (k < s.length && /[0-9]/.test(s[k])) {
          let m = k;
          while (m < s.length && /[0-9]/.test(s[m])) m++;
          j = m;
        }
      }
      const raw = s.slice(i, j);
      if ((raw.match(/\./g) || []).length > 1) {
        throw new ExpressionError("Invalid number: " + raw);
      }
      tokens.push({ type: "number", value: raw });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i + 1;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      tokens.push({ type: "identifier", value: s.slice(i, j) });
      i = j;
      continue;
    }
    if (c === "(") {
      tokens.push({ type: "lparen", value: c });
      i++;
      continue;
    }
    if (c === ")") {
      tokens.push({ type: "rparen", value: c });
      i++;
      continue;
    }
    if (c === ",") {
      tokens.push({ type: "comma", value: c });
      i++;
      continue;
    }
    if ("+-*/^!%".includes(c)) {
      // support × ÷ later if needed; keep ASCII operators here
      tokens.push({ type: "op", value: c });
      i++;
      continue;
    }
    if (c === "×") {
      tokens.push({ type: "op", value: "*" });
      i++;
      continue;
    }
    if (c === "÷") {
      tokens.push({ type: "op", value: "/" });
      i++;
      continue;
    }
    throw new ExpressionError(`Unexpected character: "${c}"`);
  }
  tokens.push({ type: "eof", value: "" });
  return tokens;
}

class Parser {
  private tokens: Token[];
  private pos = 0;
  private fns: Record<string, UnaryFn>;

  constructor(tokens: Token[], mode: AngleMode) {
    this.tokens = tokens;
    this.fns = buildFunctions(mode);
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private next(): Token {
    return this.tokens[this.pos++];
  }

  private expect(type: TokenType): Token {
    const t = this.peek();
    if (t.type !== type) {
      throw new ExpressionError(`Unexpected token "${t.value || "end of expression"}"`);
    }
    return this.next();
  }

  parse(): number {
    const value = this.parseExpression();
    this.expect("eof");
    return value;
  }

  private parseExpression(): number {
    let value = this.parseTerm();
    for (;;) {
      const t = this.peek();
      if (t.type === "op" && (t.value === "+" || t.value === "-")) {
        this.next();
        const rhs = this.parseTerm();
        value = t.value === "+" ? value + rhs : value - rhs;
      } else {
        break;
      }
    }
    return value;
  }

  private startsFactor(): boolean {
    const t = this.peek();
    if (t.type === "number" || t.type === "identifier" || t.type === "lparen") return true;
    return false;
  }

  private parseTerm(): number {
    let value = this.parseUnary();
    for (;;) {
      const t = this.peek();
      if (t.type === "op" && (t.value === "*" || t.value === "/")) {
        this.next();
        const rhs = this.parseUnary();
        if (t.value === "*") {
          value = value * rhs;
        } else {
          if (rhs === 0) throw new ExpressionError("Division by zero");
          value = value / rhs;
        }
      } else if (this.startsFactor()) {
        // implicit multiplication, e.g. 2(3+4) or 2pi
        const rhs = this.parseUnary();
        value = value * rhs;
      } else {
        break;
      }
    }
    return value;
  }

  private parseUnary(): number {
    const t = this.peek();
    if (t.type === "op" && t.value === "-") {
      this.next();
      return -this.parseUnary();
    }
    if (t.type === "op" && t.value === "+") {
      this.next();
      return this.parseUnary();
    }
    return this.parsePower();
  }

  private parsePower(): number {
    const base = this.parsePostfix();
    const t = this.peek();
    if (t.type === "op" && t.value === "^") {
      this.next();
      const exp = this.parseUnary(); // right-associative
      return Math.pow(base, exp);
    }
    return base;
  }

  private parsePostfix(): number {
    let value = this.parsePrimary();
    for (;;) {
      const t = this.peek();
      if (t.type === "op" && t.value === "!") {
        this.next();
        value = factorial(value);
      } else if (t.type === "op" && t.value === "%") {
        this.next();
        value = value / 100;
      } else {
        break;
      }
    }
    return value;
  }

  private parsePrimary(): number {
    const t = this.peek();
    if (t.type === "number") {
      this.next();
      const n = Number(t.value);
      if (!Number.isFinite(n)) throw new ExpressionError("Invalid number");
      return n;
    }
    if (t.type === "lparen") {
      this.next();
      const value = this.parseExpression();
      this.expect("rparen");
      return value;
    }
    if (t.type === "identifier") {
      this.next();
      const name = t.value.toLowerCase();
      if (name in CONSTANTS) {
        return CONSTANTS[name];
      }
      if (name in this.fns) {
        // function must be followed by '(' expression ')'
        this.expect("lparen");
        const arg = this.parseExpression();
        this.expect("rparen");
        return this.fns[name](arg);
      }
      throw new ExpressionError(`Unknown identifier "${t.value}"`);
    }
    throw new ExpressionError(`Unexpected token "${t.value || "end of expression"}"`);
  }
}

/**
 * Safely evaluate a math expression string. No eval(), no Function()
 * construction — this is a from-scratch tokenizer + recursive-descent
 * parser/evaluator operating purely on numbers.
 */
export function evaluateExpression(input: string, mode: AngleMode = "deg"): number {
  if (!input || !input.trim()) throw new ExpressionError("Empty expression");
  const tokens = tokenize(input);
  const parser = new Parser(tokens, mode);
  const result = parser.parse();
  if (!Number.isFinite(result)) throw new ExpressionError("Result is not a finite number");
  return result;
}
