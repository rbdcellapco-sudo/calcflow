import Link from "next/link";
import { Calculator, Settings } from "lucide-react";

export function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/95 backdrop-blur shadow-[var(--shadow-sm)] px-4 min-h-14">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-accent text-accent-foreground">
          <Calculator className="h-4 w-4" aria-hidden />
        </div>
        <span className="text-base font-bold text-text">CalcFlow</span>
      </Link>
      <Link
        href="/settings"
        aria-label="Settings"
        className="flex h-11 w-11 items-center justify-center text-text-secondary hover:text-text"
      >
        <Settings className="h-5 w-5" aria-hidden />
      </Link>
    </header>
  );
}
