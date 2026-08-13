import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { buttonVariants } from "./button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel = "Explore calculators",
  ctaHref = "/calculators",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-16 px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-text-muted">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-text">{title}</h2>
      <p className="text-sm text-text-secondary max-w-xs">{description}</p>
      <Link href={ctaHref} className={buttonVariants({ variant: "primary", size: "sm", className: "mt-2" })}>
        {ctaLabel}
      </Link>
    </div>
  );
}
