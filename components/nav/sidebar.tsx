"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator } from "lucide-react";
import { navItems, settingsItem } from "./nav-items";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-surface md:h-dvh md:sticky md:top-0 md:px-4 md:py-5">
      <Link href="/" className="flex items-center gap-2 px-2 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-accent text-accent-foreground">
          <Calculator className="h-5 w-5" aria-hidden />
        </div>
        <span className="text-lg font-bold text-text">CalcFlow</span>
      </Link>

      <nav aria-label="Primary" className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 min-h-11 text-sm font-medium transition-[background-color,color,box-shadow] duration-150",
                active
                  ? "bg-accent-soft text-accent shadow-[inset_2px_0_0_var(--accent)]"
                  : "text-text-secondary hover:bg-surface-2 hover:text-text"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-border">
        <Link
          href={settingsItem.href}
          aria-current={isActive(settingsItem.href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 min-h-11 text-sm font-medium transition-[background-color,color,box-shadow] duration-150",
            isActive(settingsItem.href)
              ? "bg-accent-soft text-accent shadow-[inset_2px_0_0_var(--accent)]"
              : "text-text-secondary hover:bg-surface-2 hover:text-text"
          )}
        >
          <settingsItem.icon className="h-4 w-4" aria-hidden />
          {settingsItem.label}
        </Link>
        <div className="px-3 pt-2">
          <ThemeToggle compact />
        </div>
      </div>
    </aside>
  );
}
