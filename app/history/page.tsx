import type { Metadata } from "next";
import { HistoryView } from "@/components/history/history-view";

export const metadata: Metadata = {
  title: "History",
  description: "Your recent calculations.",
};

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text">History</h1>
        <p className="text-sm text-text-secondary mt-1">Reopen, delete, or clear your past calculations.</p>
      </div>
      <HistoryView />
    </div>
  );
}
