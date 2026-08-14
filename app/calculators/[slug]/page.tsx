import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CalculatorShell } from "@/components/calculator/calculator-shell";
import { CalculatorCard } from "@/components/home/calculator-card";
import { getAllSlugs, getCalculatorBySlug, getRelatedCalculators } from "@/lib/registry";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/calculators/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const def = getCalculatorBySlug(slug);
  if (!def) return {};

  return {
    title: def.title,
    description: def.description,
    alternates: { canonical: `/calculators/${def.slug}` },
    openGraph: {
      title: def.title,
      description: def.description,
      url: `/calculators/${def.slug}`,
      type: "website",
    },
  };
}

export default async function CalculatorPage(props: PageProps<"/calculators/[slug]">) {
  const { slug } = await props.params;
  const def = getCalculatorBySlug(slug);
  if (!def) notFound();

  const related = getRelatedCalculators(def);

  const faqJsonLd =
    def.faq && def.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: def.faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }
      : null;

  return (
    <div className="flex flex-col gap-8">
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <Suspense fallback={null}>
        <CalculatorShell slug={slug} />
      </Suspense>

      {related.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-text-secondary">Related calculators</h2>
          <div className="flex flex-col gap-2">
            {related.map((r) => (
              <CalculatorCard key={r.slug} def={r} />
            ))}
          </div>
        </section>
      ) : null}

      <p className="text-xs text-text-muted">
        <Link href="/calculators" className="underline hover:text-text-secondary">
          Browse all calculators
        </Link>
      </p>
    </div>
  );
}
