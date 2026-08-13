"use client";

import { useEffect, useState } from "react";
import { Bookmark, Share2, Copy, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isFavorite, toggleFavorite } from "@/lib/storage";
import { cn } from "@/lib/cn";

export function ActionsRow({
  slug,
  shareUrl,
  copyText,
  onReset,
  hasSignificantInput,
}: {
  slug: string;
  shareUrl: string;
  copyText: string;
  onReset: () => void;
  hasSignificantInput: boolean;
}) {
  const [favorite, setFavorite] = useState(false);
  const [copied, setCopied] = useState<"share" | "result" | null>(null);

  useEffect(() => {
    setFavorite(isFavorite(slug));
  }, [slug]);

  async function handleShare() {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "CalcFlow", url: shareUrl });
        return;
      }
    } catch {
      // fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied("share");
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // clipboard unavailable - no-op, URL bar still has the shareable link
    }
  }

  async function handleCopyResult() {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied("result");
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // ignore
    }
  }

  function handleReset() {
    if (hasSignificantInput) {
      const ok = window.confirm("Reset this calculator? Your entered values will be cleared.");
      if (!ok) return;
    }
    onReset();
  }

  function handleFavorite() {
    toggleFavorite(slug);
    setFavorite((f) => !f);
  }

  return (
    <div className="grid grid-cols-4 gap-2" role="group" aria-label="Result actions">
      <Button variant="outline" size="sm" onClick={handleFavorite} className="flex-col h-auto py-2 gap-1" aria-pressed={favorite}>
        <Bookmark className={cn("h-4 w-4", favorite && "fill-accent text-accent")} />
        <span className="text-xs">{favorite ? "Saved" : "Save"}</span>
      </Button>
      <Button variant="outline" size="sm" onClick={handleShare} className="flex-col h-auto py-2 gap-1">
        {copied === "share" ? <Check className="h-4 w-4 text-success" /> : <Share2 className="h-4 w-4" />}
        <span className="text-xs">{copied === "share" ? "Copied" : "Share"}</span>
      </Button>
      <Button variant="outline" size="sm" onClick={handleCopyResult} className="flex-col h-auto py-2 gap-1">
        {copied === "result" ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        <span className="text-xs">{copied === "result" ? "Copied" : "Copy"}</span>
      </Button>
      <Button variant="outline" size="sm" onClick={handleReset} className="flex-col h-auto py-2 gap-1">
        <RotateCcw className="h-4 w-4" />
        <span className="text-xs">Reset</span>
      </Button>
    </div>
  );
}
