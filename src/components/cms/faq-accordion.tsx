import { RichText } from '@/components/cms/rich-text';
import { FaqList } from '@/components/ui/faq-list';
import type { AnsweredFaq } from '@/lib/cms/repositories/content';

/**
 * The FAQ block of a content section.
 *
 * The heading is written here rather than read from the CMS because the
 * `college.faq-section` component has exactly one field — the list — and
 * inventing a title field to fill a gap in the layout is how a schema starts
 * drifting from what editors actually maintain.
 *
 * The list arrives already filtered, because the section emits the same
 * questions as FAQPage markup: a question shown here but missing there is the
 * kind of drift that makes structured data worth less than none.
 */
export function FaqAccordion({ faqs }: { faqs: AnsweredFaq[] }) {
  if (faqs.length === 0) return null;

  return (
    // Held to the measure RichText gives the prose above it, so the body and the
    // questions under it agree on where the column ends. `first:mt-0` for the
    // section whose only block is this one — there is nothing above to clear.
    <section className="mt-10 max-w-[68ch] first:mt-0">
      <h2 className="mb-4 text-xl font-bold text-ink-900">Frequently asked questions</h2>

      <FaqList
        items={faqs.map((faq) => ({
          key: String(faq.id),
          question: faq.title,
          answer: (
            // RichText closes on its last block's margin, which is the gap an
            // open panel needs anyway — padding here would double it.
            <RichText content={faq.description} idPrefix={`faq-${faq.id}`} />
          ),
        }))}
      />
    </section>
  );
}
