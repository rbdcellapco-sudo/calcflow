import { Card } from "@/components/ui/card";

export function FormulaCard({ formula }: { formula?: string }) {
  if (!formula) return null;
  return (
    <Card className="p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-text-secondary mb-2">Formula</h2>
      <p className="font-mono text-sm text-text bg-surface-2 rounded-[var(--radius-sm)] px-3 py-2 overflow-x-auto">
        {formula}
      </p>
    </Card>
  );
}
