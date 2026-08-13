import type { Metadata } from "next";
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

/** Only accept query params that correspond to a real input field on this
 * calculator, and coerce to plain strings - keeps shared URLs safe and
 * predictable even if extra/garbage params are appended. */
function sanitizeParams(
  slug: string,
  searchParams: Record<string, string | string[] | undefined>
): Record<string, string> {
  const def = getCalculatorBySlug(slug);
  if (!def) return {};
  const allowedNames = new Set([...def.inputs, ...(def.advancedInputs ?? [])].map((f) => f.name));
  if (def.custom) allowedNames.add("expr");

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (!allowedNames.has(key)) continue;
    const raw = Array.isArray(value) ? value[0] : value;
    if (raw === undefined) continue;
    result[key] = raw.slice(0, 200);
  }
  return result;
}

export default async function CalculatorPage(props: PageProps<"/calculators/[slug]">) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const def = getCalculatorBySlug(slug);
  if (!def) notFound();

  const initialParams = sanitizeParams(slug, searchParams);
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

      <CalculatorShell slug={slug} initialParams={initialParams} />

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
