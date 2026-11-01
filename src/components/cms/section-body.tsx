import Link from 'next/link';
import {
  BookOpen,
  Briefcase,
  Building2,
  CreditCard,
  GraduationCap,
  HelpCircle,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

import { getCardTheme } from '@/components/cms/card-theme';
import { FaqAccordion } from '@/components/cms/faq-accordion';
import { RichText } from '@/components/cms/rich-text';
import { CustomSection, isCustomSection } from '@/components/cms/custom-section';
import { HtmlSection, isHtmlSection } from '@/components/cms/html-section';
import { EmptyState } from '@/components/ui/empty-state';
import { blocksToText } from '@/lib/cms/blocks';
import {
  answeredFaqs,
  isBulletList,
  isFaqSection,
  isFeatured,
  isFeeStructure,
  isHighlightList,
  isNotification,
  isRichText,
  isStepsSection,
  sectionFaqs,
  type BulletListBlock,
  type ContentSection,
  type FeaturedBlock,
  type FeeStructureBlock,
  type HighlightListBlock,
  type NotificationBlock,
  type StepsSectionBlock,
} from '@/lib/cms/repositories/content';
import { JsonLdGraph } from '@/lib/seo/json-ld';
import { faqSchema } from '@/lib/seo/schemas';

/** Section badge metadata based on section_key or slug */
function getSectionBadge(section: ContentSection | null): { label: string; Icon: LucideIcon } {
  const key = (section?.secondary_slug || section?.slug || '').toLowerCase();
  if (key.includes('admission')) return { label: 'Admission Roadmap', Icon: GraduationCap };
  if (key.includes('fee') || key.includes('course')) return { label: 'Courses & Financials', Icon: CreditCard };
  if (key.includes('exam')) return { label: 'Examination Pattern', Icon: BookOpen };
  if (key.includes('placement')) return { label: 'Career & Placements', Icon: Briefcase };
  if (key.includes('approval')) return { label: 'Statutory Accreditations', Icon: ShieldCheck };
  if (key.includes('faq')) return { label: 'FAQs & Help', Icon: HelpCircle };
  return { label: 'Program Overview', Icon: Building2 };
}

/**
 * Renders one content section's dynamic zone with all CMS-managed template components.
 */
export function SectionBody({
  section,
  heading,
}: {
  section: ContentSection | null;
  heading?: string | null;
}) {
  const blocks = section?.content ?? [];

  if (blocks.length === 0) {
    return (
      <EmptyState
        title="Nothing published here yet"
        description="This section is still being written. The other tabs above may already have what you need."
      />
    );
  }

  const faqs = sectionFaqs(section)
    .map((faq) => ({ question: faq.title, answer: blocksToText(faq.description) }))
    .filter((faq) => faq.answer);

  const hasFaqSection = blocks.some(isFaqSection);
  const isFaqTab = (section?.secondary_slug || section?.slug || '').toLowerCase().includes('faq');
  const badge = getSectionBadge(section);

  return (
    <div className="w-full space-y-7">
      {/* 1. Category Pill Badge & Section Title Header */}
      <div className="space-y-2.5 pb-2 border-b border-ink-100/90">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200/90 bg-brand-50/90 px-3.5 py-1 text-xs font-bold text-brand-900 shadow-2xs">
          <badge.Icon className="size-3.5 text-brand-800 shrink-0" />
          <span>{badge.label}</span>
        </div>

        {/* 2. Main Section Heading */}
        {heading ? (
          <h2 className="w-full font-display text-lg sm:text-xl lg:text-2xl font-bold text-ink-950 tracking-tight leading-tight">
            {heading}
          </h2>
        ) : null}
      </div>

      <div className="w-full space-y-9">
        {blocks.map((block) => {
          if (isHtmlSection(block)) {
            return <HtmlSection key={`${block.__component}-${block.id}`} block={block} />;
          }
          if (isCustomSection(block)) {
            return <CustomSection key={`${block.__component}-${block.id}`} block={block} />;
          }
          if (isRichText(block)) {
            // When an interactive FAQ accordion is present on the FAQs tab, skip redundant raw Q&A rich text
            if (hasFaqSection && isFaqTab) return null;

            return (
              <section key={`${block.__component}-${block.id}`} className="space-y-4">
                {block.heading ? (
                  <h3 className="font-display text-base sm:text-lg font-bold text-ink-900 border-l-4 border-brand-700 pl-3">
                    {block.heading}
                  </h3>
                ) : null}
                <RichText content={block.body} />
              </section>
            );
          }

          if (isStepsSection(block)) {
            return <StepsSectionRenderer key={`${block.__component}-${block.id}`} block={block} />;
          }

          if (isHighlightList(block)) {
            return <HighlightListRenderer key={`${block.__component}-${block.id}`} block={block} />;
          }

          if (isBulletList(block)) {
            return <BulletListRenderer key={`${block.__component}-${block.id}`} block={block} />;
          }

          if (isNotification(block)) {
            return <NotificationRenderer key={`${block.__component}-${block.id}`} block={block} />;
          }

          if (isFeeStructure(block)) {
            return <FeeStructureRenderer key={`${block.__component}-${block.id}`} block={block} />;
          }

          if (isFeatured(block)) {
            return <FeaturedRenderer key={`${block.__component}-${block.id}`} block={block} />;
          }

          if (isFaqSection(block)) {
            return <FaqAccordion key={`${block.__component}-${block.id}`} faqs={answeredFaqs(block)} />;
          }

          return null;
        })}
      </div>

      <JsonLdGraph items={[faqSchema(faqs)]} />
    </div>
  );
}

/** 1. CMS Template: Step-by-Step Roadmap Component (college.steps-section) */
function StepsSectionRenderer({ block }: { block: StepsSectionBlock }) {
  const steps = block.steps ?? [];
  if (steps.length === 0) return null;

  return (
    <section className="space-y-4">
      {block.name ? (
        <h3 className="font-display text-base sm:text-lg font-bold text-ink-900 border-l-4 border-brand-700 pl-3">
          {block.name}
        </h3>
      ) : null}
      <div className="space-y-3.5">
        {steps.map((step, idx) => {
          const stepNum = String(step.position || idx + 1).padStart(2, '0');
          return (
            <div
              key={step.id || idx}
              className="group relative flex items-start gap-4 sm:gap-5 rounded-2xl border border-ink-200/90 bg-white p-4.5 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md hover:shadow-brand-900/5"
            >
              {/* Step Number Badge */}
              <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-800 to-brand-950 font-display text-sm font-semibold text-white shadow-sm ring-4 ring-brand-100">
                {stepNum}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 pt-0.5">
                {step.title ? (
                  <h4 className="font-display text-sm sm:text-base font-semibold text-ink-950 mb-1">
                    {step.title}
                  </h4>
                ) : null}
                {step.description ? (
                  <p className="text-sm sm:text-base leading-relaxed text-ink-700 font-normal">
                    {step.description}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** 2. CMS Template: Key Highlights Grid Component (common.highlight-list) */
function HighlightListRenderer({ block }: { block: HighlightListBlock }) {
  const items = block.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      {block.name ? (
        <h3 className="font-display text-base sm:text-lg font-bold text-ink-900 border-l-4 border-brand-700 pl-3">
          {block.name}
        </h3>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const theme = getCardTheme(item.key || '');

          return (
            <div
              key={item.id}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-ink-200/90 bg-gradient-to-br ${theme.cardBg} p-5 sm:p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${theme.accentBorder}`}
            >
              {/* Top Row: Contextual Icon + Category Pill Badge */}
              <div className="flex items-center justify-between gap-3">
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ring-1 border shadow-2xs transition-transform duration-200 group-hover:scale-105`}
                >
                  {theme.icon}
                </div>
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-2xs font-medium uppercase tracking-wider ${theme.badgeStyle} border shadow-2xs`}
                >
                  {theme.badgeLabel}
                </span>
              </div>

              {/* Title (Key) & Description (Value) */}
              <div className="mt-4 flex-1">
                <h4 className="font-display text-sm sm:text-base font-semibold uppercase tracking-tight text-ink-950">
                  {item.key}
                </h4>
                <p className="mt-2 text-sm sm:text-[0.95rem] font-normal leading-relaxed text-ink-700">
                  {item.value}
                </p>
              </div>

              {/* Subtle Decorative Ambient Flare */}
              <div className="pointer-events-none absolute -bottom-6 -right-6 size-24 rounded-full bg-brand-500/5 blur-xl transition-opacity duration-300 group-hover:opacity-100 opacity-0" />
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** 3. CMS Template: Bullet / Feature Checklist Component (common.bullet-list) */
function BulletListRenderer({ block }: { block: BulletListBlock }) {
  const items = block.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      {block.name ? (
        <h3 className="font-display text-base sm:text-lg font-bold text-ink-900 border-l-4 border-brand-700 pl-3">
          {block.name}
        </h3>
      ) : null}
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="group flex items-start gap-3.5 rounded-2xl border border-ink-200/90 bg-white p-4 sm:p-4.5 shadow-xs transition-all duration-200 hover:border-brand-300 hover:bg-brand-50/20 hover:shadow-xs"
          >
            <span
              className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300/80 shadow-2xs"
              aria-hidden="true"
            >
              <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 8.5l3 3 6-6" />
              </svg>
            </span>
            <span className="min-w-0 flex-1 text-sm sm:text-base leading-relaxed text-ink-800 font-medium">
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 4. CMS Template: Notification / Alert Callout (common.notification) */
function NotificationRenderer({ block }: { block: NotificationBlock }) {
  return (
    <div className="relative my-6 overflow-hidden rounded-2xl border border-brand-300/80 bg-gradient-to-r from-brand-50/95 via-white to-brand-50/40 p-5 sm:p-6 shadow-xs">
      <div className="absolute top-0 left-0 h-full w-1.5 bg-brand-700" />
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800 shadow-2xs" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-5.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          {block.heading ? (
            <h4 className="font-display text-sm sm:text-base font-semibold text-ink-950">
              {block.heading}
            </h4>
          ) : null}
          {block.description ? (
            <div className="text-sm sm:text-base leading-relaxed text-ink-800 font-medium">
              <RichText content={block.description} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** 5. CMS Template: Fee Structure Section (college.fee-structure) */
function FeeStructureRenderer({ block }: { block: FeeStructureBlock }) {
  return (
    <section className="space-y-4">
      {block.name ? (
        <h3 className="font-display text-base sm:text-lg font-bold text-ink-900 border-l-4 border-brand-700 pl-3">
          {block.name}
        </h3>
      ) : null}
      {block.description ? <RichText content={block.description} /> : null}
    </section>
  );
}

/** 6. CMS Template: Featured Cards Grid (college.featured) */
function FeaturedRenderer({ block }: { block: FeaturedBlock }) {
  const cards = block.cards ?? [];

  return (
    <section className="space-y-4">
      {block.name ? (
        <h3 className="font-display text-base sm:text-lg font-bold text-ink-900 border-l-4 border-brand-700 pl-3">
          {block.name}
        </h3>
      ) : null}
      {block.description ? <RichText content={block.description} /> : null}
      {cards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const theme = getCardTheme(card.name || '');

            return (
              <div
                key={card.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-ink-200/90 bg-gradient-to-br ${theme.cardBg} p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${theme.accentBorder}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ring-1 border shadow-2xs`}
                    >
                      {theme.icon}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-2xs font-medium uppercase tracking-wider ${theme.badgeStyle} border shadow-2xs`}
                    >
                      {theme.badgeLabel}
                    </span>
                  </div>
                  <h4 className="mt-3.5 font-display text-sm sm:text-base font-semibold text-ink-950">
                    {card.name}
                  </h4>
                  {card.description ? (
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-700 font-normal">
                      {card.description}
                    </p>
                  ) : null}
                </div>
                {card.link ? (
                  <Link
                    href={card.link}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brand-800 hover:text-brand-950 hover:underline"
                  >
                    <span>Learn more</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
