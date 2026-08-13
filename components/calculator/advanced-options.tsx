"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export function AdvancedOptions({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-border pt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between min-h-11 text-sm font-semibold text-text"
      >
        Advanced options
        <ChevronDown
          className={cn("h-4 w-4 text-text-secondary transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      {open ? <div className="mt-3 flex flex-col gap-4">{children}</div> : null}
    </div>
  );
}
