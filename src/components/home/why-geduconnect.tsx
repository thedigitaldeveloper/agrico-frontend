'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Users,
  Scale,
  FileText,
  CheckCircle2,
  ArrowRight,
  XCircle,
  Sparkles,
  Lock,
  Award,
  LucideIcon,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { WhyGeduCard, ComparisonRow, WhyGeduSectionConfig } from '@/lib/cms/repositories/home';

const ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  Users,
  Scale,
  FileText,
  Lock,
  Award,
  Sparkles,
};

const CARD_STYLES = [
  { iconColor: 'text-emerald-300 bg-emerald-400/15' },
  { iconColor: 'text-gold-300 bg-gold-400/15' },
  { iconColor: 'text-brand-300 bg-brand-400/15' },
  { iconColor: 'text-purple-300 bg-purple-400/15' },
];

export function WhyGeduConnect({
  cards,
  comparison,
  config,
}: {
  cards?: WhyGeduCard[];
  comparison?: ComparisonRow[];
  config?: WhyGeduSectionConfig | null;
}) {
  const advantageCards = cards ?? [];
  const comparisonRows = comparison ?? [];
  const microBadges = config?.microBadges ?? [];
  const defaultIcons = [ShieldCheck, Users, Scale, FileText];

  const sliderRef = useRef<HTMLUListElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide on mobile for Advantage Cards
  useEffect(() => {
    if (advantageCards.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      const el = sliderRef.current;
      if (!el) return;
      if (el.scrollWidth > el.clientWidth) {
        setActiveCardIndex((prev) => {
          const nextIndex = (prev + 1) % advantageCards.length;
          const card = el.children[nextIndex] as HTMLElement;
          if (card) {
            el.scrollTo({
              left: card.offsetLeft - el.offsetLeft,
              behavior: 'smooth',
            });
          }
          return nextIndex;
        });
      }
    }, 3200);

    return () => clearInterval(timer);
  }, [advantageCards.length, isPaused]);

  // Sync activeCardIndex on manual scroll
  const handleScroll = () => {
    const el = sliderRef.current;
    if (!el || el.children.length === 0) return;
    const scrollLeft = el.scrollLeft;
    let closestIndex = 0;
    let minDiff = Infinity;
    Array.from(el.children).forEach((child, idx) => {
      const card = child as HTMLElement;
      const diff = Math.abs(card.offsetLeft - el.offsetLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });
    setActiveCardIndex(closestIndex);
  };

  if (advantageCards.length === 0 && comparisonRows.length === 0 && !config) {
    return null;
  }

  const eyebrow = config?.eyebrow ?? '';
  const heading = config?.heading ?? '';
  const description = config?.description;
  const comparisonHeading = config?.comparisonHeading;
  const comparisonBadge = config?.comparisonBadge;
  const primaryCtaLabel = config?.primaryCtaLabel ?? '';
  const primaryCtaLink = config?.primaryCtaLink ?? '';
  const secondaryCtaLabel = config?.secondaryCtaLabel ?? '';
  const secondaryCtaLink = config?.secondaryCtaLink ?? '';

  return (
    <section className="relative surface-inverse overflow-hidden bg-gradient-to-br from-brand-900 via-brand-950 to-ink-950 py-6 text-white sm:py-8 lg:py-12">
      {/* Decorative Ambient Glowing Orbs */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-20 size-96 rounded-full bg-gold-400/15 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-brand-500/20 blur-3xl"
      />

      <div className="container-page relative z-10">
        {/* Compact Centered Section Header */}
        <div className="relative mx-auto mb-4 max-w-2xl text-center sm:mb-6 lg:mb-8">
          <div className="mb-2 flex items-center justify-center gap-2 sm:gap-3">
            <span className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent via-gold-400/40 to-gold-400" />
            <div className="inline-flex items-center gap-1 rounded-full bg-gold-400/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-gold-300 uppercase ring-1 ring-gold-400/30 ring-inset shadow-2xs sm:text-2xs sm:px-3.5 sm:py-1">
              <CheckCircle2 className="size-2.5 text-gold-300 sm:size-3" />
              {eyebrow}
            </div>
            <span className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent via-gold-400/40 to-gold-400" />
          </div>

          <h2 className="font-display text-lg font-extrabold tracking-tight text-white text-balance sm:text-2xl lg:text-3xl">
            {heading}
          </h2>
          {description ? (
            <p className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-white/80 sm:mt-2 sm:text-sm">
              {description}
            </p>
          ) : null}

          {/* Micro-Advantage Chips (Horizontal Compact) */}
          {microBadges.length > 0 ? (
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-semibold text-white/90 sm:mt-3 sm:gap-2.5 sm:text-2xs">
              {microBadges.map((badge, idx) => {
                const dotColor =
                  idx % 3 === 0
                    ? 'bg-gold-400'
                    : idx % 3 === 1
                      ? 'bg-emerald-400'
                      : 'bg-brand-300';
                return (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 backdrop-blur-xs sm:px-2.5 sm:py-1"
                  >
                    <span className={`size-1.5 rounded-full ${dotColor}`} />
                    {badge}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* 4 Feature Cards Grid - Mobile Horizontal Auto Slider */}
        <div
          className="relative mt-4 sm:mt-6 lg:mt-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <ul
            ref={sliderRef}
            onScroll={handleScroll}
            className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:grid sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
          >
            {advantageCards.map((item, index) => {
              const Icon = (item.iconName && ICONS[item.iconName]) || defaultIcons[index % defaultIcons.length];
              const style = CARD_STYLES[index % CARD_STYLES.length];
              return (
                <li
                  key={item.title}
                  className="group relative flex w-[85vw] max-w-[340px] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-400/50 hover:bg-white/10 hover:shadow-2xl md:w-auto md:max-w-none md:p-5.5"
                >
                  {/* Top Corner Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className={`flex size-10 items-center justify-center rounded-xl shadow-inner transition-transform duration-300 group-hover:scale-110 sm:size-11 ${style.iconColor}`}>
                      <Icon className="size-5 sm:size-5.5" />
                    </div>
                    {item.tag ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-2xs font-medium text-white/75">
                        {item.tag}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 sm:mt-4">
                    <h3 className="font-display text-sm sm:text-base font-bold text-white transition-colors group-hover:text-gold-300">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 sm:mt-2 text-xs leading-relaxed text-white/75">
                      {item.description}
                    </p>
                  </div>

                  {/* Key Points Checklist */}
                  {item.points && item.points.length > 0 ? (
                    <div className="mt-3 sm:mt-4 border-t border-white/10 pt-2.5 sm:pt-3.5 space-y-1.5 text-2xs font-medium text-white/80">
                      {item.points.map((point) => (
                        <div key={point} className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-3 text-gold-400 shrink-0" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {/* Mobile Auto-Slide Dots Indicator */}
          {advantageCards.length > 1 ? (
            <div className="mt-2.5 flex items-center justify-center gap-1.5 sm:hidden">
              {advantageCards.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => {
                    const el = sliderRef.current;
                    if (!el) return;
                    const card = el.children[idx] as HTMLElement;
                    if (card) {
                      el.scrollTo({
                        left: card.offsetLeft - el.offsetLeft,
                        behavior: 'smooth',
                      });
                    }
                    setActiveCardIndex(idx);
                  }}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    activeCardIndex === idx
                      ? 'w-6 bg-gold-400'
                      : 'w-1.5 bg-white/30 hover:bg-white/50'
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Modern Comparison Strip (Agrico vs Traditional Agents) - Mobile Horizontal Slider */}
        {comparisonRows.length > 0 ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md sm:p-5 sm:mt-8 lg:p-6 lg:mt-10">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5 sm:mb-4 sm:pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-gold-400 sm:size-4" />
                <h3 className="font-display text-xs font-bold text-white sm:text-sm md:text-base">
                  {comparisonHeading}
                </h3>
              </div>
              {comparisonBadge ? (
                <span className="hidden text-2xs text-gold-300/80 sm:inline">
                  {comparisonBadge}
                </span>
              ) : null}
            </div>

            <div
              ref={comparisonRef}
              className="scrollbar-none -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 snap-x snap-mandatory sm:mx-0 sm:px-0 sm:grid sm:gap-3 sm:overflow-visible sm:pb-0 sm:grid-cols-2 lg:grid-cols-3"
            >
              {comparisonRows.map((row) => (
                <div
                  key={row.factor}
                  className="w-[72vw] max-w-[240px] shrink-0 snap-center rounded-xl border border-white/10 bg-white/5 p-3 text-xs transition-colors hover:bg-white/10 sm:w-auto sm:max-w-none sm:p-3.5"
                >
                  <p className="font-bold text-gold-300">{row.factor}</p>
                  <div className="mt-1.5 space-y-1 text-2xs sm:mt-2 sm:space-y-1.5">
                    <div className="flex items-start gap-1.5 text-emerald-300">
                      <CheckCircle2 className="size-3 shrink-0 mt-0.5 text-emerald-400 sm:size-3.5" />
                      <span><strong>Agrico:</strong> {row.gedu}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-rose-300/80">
                      <XCircle className="size-3 shrink-0 mt-0.5 text-rose-400 sm:size-3.5" />
                      <span><strong>Others:</strong> {row.others}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Centered Bottom Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-3.5 lg:mt-10">
          {primaryCtaLink && primaryCtaLabel ? <ButtonLink
            href={primaryCtaLink}
            variant="accent"
            size="md"
            className="w-full sm:w-auto rounded-pill px-7 shadow-lg shadow-gold-400/10"
          >
            <span>{primaryCtaLabel}</span>
            <ArrowRight className="size-4" />
          </ButtonLink> : null}
          {secondaryCtaLink && secondaryCtaLabel ? <ButtonLink
            href={secondaryCtaLink}
            variant="inverse"
            size="md"
            className="w-full sm:w-auto rounded-pill px-7 border border-white/20 bg-white/10 hover:bg-white/20"
          >
            {secondaryCtaLabel}
          </ButtonLink> : null}
        </div>
      </div>
    </section>
  );
}
