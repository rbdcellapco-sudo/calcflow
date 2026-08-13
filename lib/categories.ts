import {
  Landmark,
  HeartPulse,
  Calculator,
  CalendarClock,
  Ruler,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId } from "./types";

export type CategoryMeta = {
  id: CategoryId;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const categories: CategoryMeta[] = [
  {
    id: "finance",
    label: "Finance",
    description: "Loans, mortgages, interest, tips and money math.",
    icon: Landmark,
  },
  {
    id: "health",
    label: "Health",
    description: "BMI, calories, and everyday health calculations.",
    icon: HeartPulse,
  },
  {
    id: "math",
    label: "Math",
    description: "Percentages, averages, and a full scientific calculator.",
    icon: Calculator,
  },
  {
    id: "date",
    label: "Date & Time",
    description: "Age, durations, and date arithmetic.",
    icon: CalendarClock,
  },
  {
    id: "conversion",
    label: "Conversion",
    description: "Units, currencies, and measurements.",
    icon: Ruler,
  },
  {
    id: "other",
    label: "Other",
    description: "Everything else.",
    icon: LayoutGrid,
  },
];

export const categoryMap: Record<CategoryId, CategoryMeta> = categories.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CategoryId, CategoryMeta>
);
