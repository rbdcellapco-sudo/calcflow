# CalcFlow — Build Instructions for Claude Code

> **Working name:** CalcFlow · **Tagline:** "Every calculation. One simple app."
> A mobile-first, installable calculator super-app. Broad calculator library inspired
> by the *breadth and information architecture* of calculator.net, but with an
> original visual identity, modern mobile UX, and a fully working calculation engine.

---

## 0. HOW TO USE THIS FILE

You are building a **real, shippable product**, not a mockup. Work through the
phases in order. After each phase, stop, run the build/tests, and confirm the
phase's checklist passes before moving on. Do not leave TODOs, placeholder
buttons, or fake results in any primary user flow.

**Non-negotiables (fail the build if violated):**
- No `eval()` anywhere — the scientific calculator uses a safe expression parser.
- No copied calculator.net branding, CSS, layout, colors, text, or source.
- No login required for core functionality.
- Every calculator produces **real** calculations.
- Financial math uses decimal-safe arithmetic, not raw floating point.
- Mobile-first: the app must be excellent at 360px width with no horizontal scroll.

**Ask me before:** publishing anything, adding paid/API services with keys, or
making architectural changes that contradict Section 2.

---

## 1. TECH STACK

- **Next.js** (App Router) + **React** + **TypeScript** (strict)
- **Tailwind CSS** + **shadcn/ui** + **Lucide** icons
- **Recharts** for charts
- **Zod** for validation, **React Hook Form** where useful
- **date-fns** for date math
- **decimal.js** (or `big.js`) for all money math
- **Vitest** + **@testing-library/react** for tests
- PWA via `next-pwa` (or a hand-rolled service worker if cleaner)

Keep dependencies lean. Lazy-load charts and complex calculators.

---

## 2. ARCHITECTURE (build this first, before any calculator)

The whole app is driven by a **calculator definition system** so that hundreds of
calculators can be added without rewriting UI. Separate these six concerns and
never mix calculation logic into presentation components:

1. Calculator **metadata** (id, slug, title, description, category, icon, related)
2. **Input schema** (typed field definitions)
3. **Calculation engine** (pure functions, no React)
4. **Validation** (Zod schemas)
5. **Result formatting**
6. **Explanatory content** (formula, about, FAQ)

### Core type (shape it roughly like this)

```ts
type CalculatorDef = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: CategoryId;
  icon: LucideIcon;
  region?: string;               // e.g. "US" — label region-specific calcs
  inputs: InputField[];
  advancedInputs?: InputField[];
  schema: ZodSchema;
  calculate: (values) => CalcResult;   // pure, testable
  results: { primary: ResultKey; secondary: ResultKey[] };
  charts?: ChartSpec[];
  formula?: string;
  explanation?: ContentBlock[];
  faq?: { q: string; a: string }[];
  related: string[];             // slugs
};
```

Calculators live in `/lib/calculators/<slug>.ts` and register into a central
`registry`. The generic `CalculatorShell` renders any definition.

### Reusable components to build
`CalculatorShell`, `CalculatorHeader`, `CalculatorInput`, `CurrencyInput`,
`PercentageInput`, `NumberInput`, `SelectInput`, `DateInput`, `SegmentedControl`,
`Toggle`, `AdvancedOptions`, `ResultCard`, `ResultBreakdown`, `ChartCard`,
`FormulaCard`, `ExplanationCard`, `HistoryCard`, `FavoriteButton`, `ShareButton`,
`CalculatorCard`, `CategoryCard`, `SearchBar`, `BottomNavigation`.

---

## 3. ROUTES

```
/                         Home
/calculators              All calculators
/categories               Category grid
/categories/[category]    finance | health | math | date | conversion | other
/calculators/[slug]       Calculator detail (SEO route, shareable)
/favorites
/history
/settings
```

Each `/calculators/[slug]` has: unique `<title>`, meta description, canonical
URL, semantic headings, and FAQ structured data where a FAQ exists. Generate a
sitemap automatically.

**Shareable state:** calculations are reproducible from query params, e.g.
`/calculators/bmi?weight=72&height=175` → populate fields, auto-calculate, show
results. Sanitize all incoming params. Never put sensitive data in the URL.

---

## 4. NAVIGATION

- **Mobile:** persistent bottom nav — Home · Categories · Search · Favorites · History.
- **Desktop/tablet:** convert to a left sidebar + top nav workspace. Do **not**
  just scale the mobile layout up; give desktop a proper sidebar + optional
  right-hand result/related panel.

---

## 5. DESIGN SYSTEM

Original identity — clean neutral background, high-contrast text, **one** strong
accent color, subtle borders, moderate radius, minimal shadows, large type,
generous spacing. Trustworthy, modern, fast, professional.

Avoid: heavy gradients, glassmorphism, decorative illustrations, gratuitous
animation, tiny text, dense desktop tables on mobile, cards-inside-cards.

**Dark mode:** genuinely designed (not inverted) — dark bg, lighter surfaces,
subdued borders, readable secondary text, clear result emphasis. Persist theme
(light/dark/system) in local storage.

**Animation:** subtle only, 150–250ms (result number transition, accordion,
button feedback, page transition). Respect `prefers-reduced-motion`. Never gate
a result behind an animation.

---

## 6. KEY UX RULES

- **Search before browsing.** Full-screen mobile search with recent searches +
  live fuzzy results (icon, title, short description, category). Understand
  synonyms ("loan payment" → Loan, Mortgage, Payment).
- **Calculate immediately** where appropriate; a dominant `Calculate` CTA where
  the calc is complex, becoming `Recalculate` after.
- **Progressive disclosure:** basic inputs → calculate → collapsible Advanced
  options. Never open with 20 fields.
- **Results are the hero:** the primary result visually dominates, with a
  secondary breakdown beneath it.
- **Order of experience:** Find → Enter → Calculate → Understand → Save/Share.
  The user must never need to read the formula before using the calculator.
- Under every result: **Save · Share · Copy Result · Reset**. Save persists state
  locally; Share copies a param URL; Reset confirms only if significant data was
  entered.

### Mobile input requirements
Numeric keyboard, currency + percentage formatting with thousands separators,
min/max validation, decimals, negatives where valid, unit selectors where
relevant. Touch targets ≥ 44px, input font ≥ 18px. Typing `400000` shows
`$400,000`; typing `5.25` shows `5.25%`.

### Tables on mobile
Never render big desktop tables on phones. Desktop = table; mobile = one card per
row (e.g. amortization month cards) with filtering by year/month/interest/principal.

### Errors & empty states
Human-readable errors placed under the relevant input ("Interest rate must be
greater than 0"). Don't wipe valid input when another field is invalid. Friendly
empty states for Favorites and History with an "Explore Calculators" CTA.

---

## 7. STATE / PERSISTENCE

Local storage only (no account): favorites, history, preferences, saved
calculations. History entries: calculator + summary + timestamp; support reopen,
delete, clear all. Favorites: bookmark toggle per calculator; reorder if practical.

---

## 8. PWA

Manifest, app icon, theme color, standalone display, launch screen, service
worker with offline support. Cache calculator logic so **all local calculators
work offline**. Currency conversion is API-dependent — cache the most recent
rates and show the "as of" timestamp.

---

## 9. ACCESSIBILITY (WCAG AA)

Keyboard navigation, visible focus, semantic HTML, ARIA only where needed,
sufficient contrast, labeled form fields, accessible error messages,
screen-reader-friendly results, no color-only indicators, reduced-motion support.

---

## 10. BUILD PHASES

### Phase 1 — Foundation
Project scaffold, design system + tokens, theming (light/dark/system), routing,
navigation (mobile bottom nav + desktop sidebar), PWA baseline, calculator
definition architecture + registry + generic `CalculatorShell`.
**Done when:** app boots, navigates, installs as PWA, one trivial calculator
renders end-to-end through the shell.

### Phase 2 — Core UX
Home, full-screen Search (fuzzy + synonyms), Categories + category pages,
Favorites, History, Settings. Local persistence wired up.
**Done when:** all six screens work with real local data; empty states correct.

### Phase 3 — First calculators (all genuinely functional)
1. Percentage 2. Tip 3. BMI 4. Age 5. Mortgage 6. Loan
7. Compound Interest 8. Scientific Calculator
**Done when:** each computes correct results, is shareable via URL, and appears
in search/categories/favorites/history.

### Phase 4 — Results depth
Charts (Recharts, responsive), result breakdowns, mobile card tables + desktop
tables, amortization schedule (collapsible), formula/about/FAQ sections, sharing.

### Phase 5 — Expansion
Add the rest of the MVP set below, then wire "Related calculators" loops.

### Phase 6 — Quality
Accessibility audit, performance (Lighthouse 90+, code splitting, lazy charts),
responsive QA at all breakpoints, calculation tests, SEO + PWA checks.

---

## 11. MVP CALCULATOR SET (~20)

**Finance:** Mortgage, Loan, Compound Interest, Investment, Simple Interest,
Savings, Percentage, Tip
**Health:** BMI, BMR, Calorie, Ideal Weight
**Math:** Scientific, Fraction, Percentage, Average
**Date & Time:** Age, Date, Time Duration
**Conversion:** Unit Converter

Build for extensibility — adding more later must not require touching the shell.

### Calculator-specific notes
- **Mortgage:** monthly payment, total interest, total cost, principal, tax,
  insurance, PMI, HOA, other costs, payoff date, full amortization schedule,
  extra/biweekly payments (progressive disclosure). Decimal-safe. Charts:
  principal vs interest, remaining balance over time.
- **Scientific:** real mobile-calculator feel — sin/cos/tan, π, e, brackets, %,
  √, x², xʸ, ln, log, DEG/RAD toggle, memory, answer history, backspace, clear,
  negatives, scientific notation, keyboard support. **Safe parser, no `eval()`.**
- **Currency-dependent calcs:** configurable currency (USD/INR/EUR/GBP/CAD/AUD),
  locale-detected default, manual override. Label region-specific calculators
  explicitly (e.g. "US Tax Calculator").

Architect strings for future i18n (English, Indian English, Hindi, Spanish) —
no hard-coded strings inside calculation components.

---

## 12. TESTING

Unit-test every calculator's `calculate()`:
- **Financial:** normal, zero-where-valid, boundary, invalid, rounding, very
  large, very small values.
- **Date:** leap years, month boundaries, timezone/DST considerations.
- **Percentage:** increase, decrease, percentage-of, percentage-difference.

- **Scientific:** operator precedence, brackets, trig, deg/rad, float edge cases.

Visual QA at: 360×800, 375×812, 390×844, 412×915, 430×932, 768×1024, 1024×1366,
1440×900. Check for horizontal scroll, clipped buttons, oversized tables,
keyboard overlap, input/chart overflow, sticky-nav conflicts, bottom-nav
covering content.

---

## 13. DEFINITION OF DONE

- [ ] Mobile-first; excellent at 360px; responsive desktop workspace
- [ ] Installable PWA; local calculators work offline
- [ ] Search, categories, favorites, history, settings all work
- [ ] Dark mode works and persists
- [ ] Calculator URLs are shareable and reproduce state
- [ ] Calculations accurate; financial math decimal-safe
- [ ] Mobile-friendly inputs (≥44px targets, ≥18px font)
- [ ] Advanced options collapsible; results visually dominant
- [ ] Charts responsive; tables become cards on mobile
- [ ] Accessibility (WCAG AA) addressed
- [ ] SEO metadata + sitemap; FAQ schema where relevant
- [ ] No `eval()`; safe expression parser
- [ ] No fake functionality, no placeholder buttons, no primary-flow TODOs
- [ ] No login required
- [ ] No horizontal scrolling
- [ ] No copied calculator.net branding
- [ ] Architecture supports hundreds of calculators

**Final feel:** "This has hundreds of calculators, but somehow it feels
incredibly simple."

---

## 14. FIRST DELIVERABLE

Complete **Phases 1–3** as a polished, fully working prototype:
Home · Search · Categories · Favorites · History · Settings, plus these eight
working calculators — Percentage, Tip, BMI, Age, Mortgage, Loan, Compound
Interest, Scientific. Everything real, nothing faked. Then pause and report
status before Phase 4.
