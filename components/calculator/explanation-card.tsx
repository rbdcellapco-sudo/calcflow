import { Card } from "@/components/ui/card";
import type { ContentBlock, FaqItem } from "@/lib/types";

export function ExplanationCard({
  explanation,
  faq,
}: {
  explanation?: ContentBlock[];
  faq?: FaqItem[];
}) {
  if ((!explanation || explanation.length === 0) && (!faq || faq.length === 0)) return null;

  return (
    <Card className="p-4 sm:p-5 flex flex-col gap-5">
      {explanation?.map((block) => (
        <div key={block.heading}>
          <h2 className="text-sm font-semibold text-text mb-1">{block.heading}</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{block.body}</p>
        </div>
      ))}
      {faq && faq.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-text mb-2">Frequently asked questions</h2>
          <div className="flex flex-col gap-3">
            {faq.map((item) => (
              <details key={item.q} className="group">
                <summary className="cursor-pointer text-sm font-medium text-text list-none flex items-center justify-between gap-2 min-h-11 sm:min-h-0 sm:py-1">
                  {item.q}
                  <span className="text-text-muted transition-transform duration-150 group-open:rotate-45 text-lg leading-none">
                    +
                  </span>
                </summary>
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
